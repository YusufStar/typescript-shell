import { createInterface } from "readline";
import { commands } from "./data.ts";
import { spawn } from "child_process";
import { findExecutable } from "./utils.ts";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

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
