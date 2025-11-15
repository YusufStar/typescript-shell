import {createInterface} from "readline";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const commands: {
    description: string;
    command: string;
}[] = []

function ask() {
    rl.question("$ ", (command) => {
        const available_command = commands.find((data) => data.command === command);
        if (!available_command) {
            console.log(`${command}: command not found`)
        }

        ask()
    });
}

ask();