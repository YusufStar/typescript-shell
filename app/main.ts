import {createInterface} from "readline";
import {commands} from "./data.ts";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask() {
    rl.question("$ ", async (input) => {
        const [commandText, ...commandArgs] = input.split(" ");

        const find_result = commands.filter((data) => data.command === commandText);

        if (find_result.length === 0) {
            console.log(`${commandText}: command not found`);
        } else {
            const find_command = find_result[0];

            try {
                await find_command.run(commandArgs);
            } catch (err) {
                console.log("Command error:", err);
            }
        }

        ask();
    });
}

ask();