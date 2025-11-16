import { createInterface } from "readline";
import { commands, customCommands } from "./data.ts";
import { spawn } from "child_process";
import { findExecutable } from "./utils.ts";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask() {
    rl.question("$ ", async (input) => {

        function parseArgs(input: string): string[] {
            const args: string[] = [];
            let currentArg = "";
            let inSingleQuote = false;
            let inDoubleQuote = false;

            for (let i = 0; i < input.length; i++) {
                const ch = input[i];

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
        const commandText = parsedArgs[0] || "";
        const commandArgs = parsedArgs.slice(1);

        if (customCommands.includes(commandText)) {
            const builtin = commands.find(c => c.command === commandText);
            if (builtin) {
                try {
                    await builtin.run(commandArgs);
                } catch (err) {
                    console.log("Command error:", err);
                }
            } else {
                console.log(`${commandText}: not found`);
            }
            ask();
            return;
        }

        const builtin = commands.find(c => c.command === commandText);
        if (builtin) {
            try {
                await builtin.run(commandArgs);
            } catch (err) {
                console.log("Command error:", err);
            }
            ask();
            return;
        }

        const executable = await findExecutable(commandText);
        if (executable) {
            const child = spawn(executable, commandArgs, {
                stdio: "inherit",
                argv0: commandText
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
