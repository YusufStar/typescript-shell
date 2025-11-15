import {createInterface} from "readline";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const commands: {
    command: string;
    description?: string;
    args?: string[];
    run: (args: string[]) => void | Promise<void>;
}[] = [
    {
        description: 'Exit the shell with optional exit code',
        command: 'exit',
        args: ['code'],
        run(args) {
            const code = args.length > 0 ? Number(args[0]) : 0;
            const exitCode = Number.isNaN(code) ? 1 : code;

            process.exit(exitCode);
        }
    }
]

function ask() {
    rl.question("$ ", (input) => {
        const [commandText, ...commandArgs] = input.split(" "); // exit 0 -> command = exit, commandArgs = [0]

        const find_result = commands.filter((data) => data.command === commandText)
        
        if (find_result.length === 0) {
            console.log(`${input}: command not found`)
        } else {
            const find_command = find_result[0];

            const {run, command, args, description} = find_command;
            run(commandArgs)
        }

        ask()
    });
}

ask();