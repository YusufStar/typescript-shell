import {createInterface} from "readline";
import {commands} from "./data.ts";
import {access} from "fs/promises";
import {constants} from "fs";
import {join} from "path";
import {spawn} from "child_process";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function findExecutable(command: string): Promise<string | null> {
    const pathDirs = (process.env.PATH || "").split(process.platform === "win32" ? ";" : ":");

    for (const dir of pathDirs) {
        const fullPath = join(dir, command);
        try {
            await access(fullPath, constants.X_OK);
            return fullPath;
        } catch {
            continue;
        }
    }

    return null;
}

function ask() {
    rl.question("$ ", async (input) => {
        const [commandText, ...commandArgs] = input.split(" ").filter(Boolean);

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
