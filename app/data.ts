export const commands = [
    {
        description: 'Terminates the shell with an optional exit code.',
        command: 'exit',
        args: [
            {
                type: 'number',
                name: 'exit_code',
                size: 'one'
            }
        ],
        run: async (args: string[]) => {
            const code = args.length > 0 ? Number(args[0]) : 0;
            const exitCode = Number.isNaN(code) ? 1 : code;
            process.exit(exitCode);
        }
    },
    {
        description: 'Prints the provided text to the console.',
        command: 'echo',
        args: [
            {
                type: 'string',
                name: 'text',
                size: 'all'
            }
        ],
        run: async (args: string[]) => {
            console.log(args.join(" "));
        }
    },
    {
        description: 'Displays whether a command is a shell builtin or not.',
        command: 'type',
        args: [
            {
                type: 'string',
                name: 'type',
                size: 'one'
            }
        ],
        run: async (args: string[]) => {
            const argCommand = args[0]

            if (typeof argCommand === 'string') {
                const findCommand = commands.find(({command}) => command === argCommand);
                if (findCommand) {
                    console.log(`${argCommand} is a shell builtin`);
                } else {
                    console.log(`${argCommand}: not found`);
                }
            } else {
                return;
            }
        }
    }
];
