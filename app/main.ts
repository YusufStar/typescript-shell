import { createInterface } from "readline";
import { commands, customCommands } from "./data.ts";
import { spawn } from "child_process";
import { findExecutable } from "./utils.ts";
import { createWriteStream } from "fs";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function withStdoutRedirection(path: string, handler: () => Promise<void>) {
    return new Promise<void>((resolve, reject) => {
        let stream;
        try {
            stream = createWriteStream(path, { flags: "w" });
        } catch (err) {
            reject(err);
            return;
        }

        const originalWrite = process.stdout.write;

        const restore = () => {
            process.stdout.write = originalWrite;
        };

        const finalize = (cb: () => void) => {
            stream.end(() => {
                cb();
            });
        };

        const handleStreamError = (err: unknown) => {
            restore();
            stream.destroy();
            reject(err);
        };

        stream.on("error", handleStreamError);

        process.stdout.write = ((chunk: any, encoding?: any, callback?: any) => {
            return stream.write(chunk, encoding as any, callback);
        }) as typeof process.stdout.write;

        handler()
            .then(() => {
                restore();
                finalize(resolve);
            })
            .catch((err) => {
                restore();
                finalize(() => reject(err));
            });
    });
}

function ask() {
    rl.question("$ ", async (input) => {

        function parseArgs(input: string): string[] {
            const args: string[] = [];
            let currentArg = "";
            let inSingleQuote = false;
            let inDoubleQuote = false;
            let escaping = false;

            for (let i = 0; i < input.length; i++) {
                const ch = input[i];

                if (escaping) {
                    currentArg += ch;
                    escaping = false;
                    continue;
                }

                if (ch === "\\") {
                    if (inSingleQuote) {
                        currentArg += ch;
                    } else if (inDoubleQuote) {
                        const nextChar = input[i + 1];
                        if (nextChar && (nextChar === "\\" || nextChar === '"' || nextChar === "$" || nextChar === "`" || nextChar === "\n")) {
                            currentArg += nextChar === "\n" ? "" : nextChar;
                            if (nextChar !== "\n") {
                                i++;
                            } else {
                                while (i + 1 < input.length && (input[i + 1] === "\n" || input[i + 1] === "\r")) {
                                    i++;
                                }
                            }
                        } else {
                            currentArg += ch;
                        }
                    } else {
                        escaping = true;
                    }
                    continue;
                }

                if (ch === "'" && !inDoubleQuote) {
                    inSingleQuote = !inSingleQuote;
                    continue;
                }

                if (ch === '"' && !inSingleQuote) {
                    inDoubleQuote = !inDoubleQuote;
                    continue;
                }

                if (ch === " " && !inSingleQuote && !inDoubleQuote) {
                    if (currentArg.length > 0) {
                        args.push(currentArg);
                        currentArg = "";
                    }
                    continue;
                }

                currentArg += ch;
            }

            if (currentArg.length > 0) {
                args.push(currentArg);
            }

            return args.filter(a => a.length > 0);
        }

        const parsedArgs = parseArgs(input);

        let outputRedirectPath: string | null = null;
        const cleanedArgs: string[] = [];

        for (let i = 0; i < parsedArgs.length; i++) {
            const token = parsedArgs[i];

            if (token === ">" || token === "1>") {
                const target = parsedArgs[i + 1];
                if (target) {
                    outputRedirectPath = target;
                    i++; // skip filename
                }
                continue;
            }

            const inlineRedirectMatch = token.match(/^([0-9]*)>(.+)$/);
            if (inlineRedirectMatch) {
                const fd = inlineRedirectMatch[1];
                if (fd === "" || fd === "1") {
                    outputRedirectPath = inlineRedirectMatch[2];
                    continue;
                }
            }

            cleanedArgs.push(token);
        }

        const commandText = cleanedArgs[0] || "";
        const commandArgs = cleanedArgs.slice(1);

        if (!commandText) {
            ask();
            return;
        }

        const runBuiltinWithOptionalRedirect = async (fn: (args: string[]) => Promise<void>) => {
            try {
                if (outputRedirectPath) {
                    await withStdoutRedirection(outputRedirectPath, () => fn(commandArgs));
                } else {
                    await fn(commandArgs);
                }
            } catch (err) {
                console.log("Command error:", err);
            }
            ask();
        };

        if (customCommands.includes(commandText)) {
            const builtin = commands.find(c => c.command === commandText);
            if (builtin) {
                await runBuiltinWithOptionalRedirect(builtin.run);
            } else {
                console.log(`${commandText}: not found`);
                ask();
            }
            return;
        }

        const builtin = commands.find(c => c.command === commandText);
        if (builtin) {
            await runBuiltinWithOptionalRedirect(builtin.run);
            return;
        }

        const executable = await findExecutable(commandText);
        if (executable) {
            if (outputRedirectPath) {
                let stdoutStream;
                try {
                    stdoutStream = createWriteStream(outputRedirectPath, { flags: "w" });
                } catch (err) {
                    console.log("Command error:", err);
                    ask();
                    return;
                }

                const child = spawn(executable, commandArgs, {
                    stdio: ["inherit", "pipe", "inherit"],
                    argv0: commandText
                });

                if (child.stdout) {
                    child.stdout.pipe(stdoutStream);
                    child.stdout.on("error", (err) => {
                        console.log("Command error:", err);
                    });
                }

                let finished = false;
                const finish = () => {
                    if (finished) return;
                    finished = true;
                    stdoutStream.end(() => {
                        ask();
                    });
                };

                child.on("error", (err) => {
                    console.log("Command error:", err);
                    finish();
                });

                child.on("exit", () => {
                    finish();
                });

                stdoutStream.on("error", (err) => {
                    console.log("Command error:", err);
                    child.kill();
                    finish();
                });

                return;
            }

            const child = spawn(executable, commandArgs, {
                stdio: "inherit",
                argv0: commandText
            });

            child.on("error", (err) => {
                console.log("Command error:", err);
                ask();
            });

            child.on("exit", () => {
                ask();
            });
        } else {
            console.log(`${commandText}: not found`);
            ask();
        }
    });
}

ask();
