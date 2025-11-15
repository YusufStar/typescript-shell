export const commands = [
    {
        description: 'Exit the shell with optional exit code',
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
        description: 'Print text to output',
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
    }
];
