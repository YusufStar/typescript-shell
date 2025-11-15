import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const commands: string[] = [
]

// TODO: Uncomment the code below to pass the first stage
rl.question("$ ", (command) => {
    const available_command = commands.find((v) => v === command);
    if (!available_command) {
        console.log(`${command}: command not found`)
    }

   rl.close();
});