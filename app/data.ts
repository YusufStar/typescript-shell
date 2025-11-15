import {access} from "fs/promises";
import {constants} from "fs";
import {join} from "path";

export const commands = [
    {
        description: 'Terminates the shell with an optional exit code.',
        command: 'exit',
        args: [
            {type: 'number', name: 'exit_code', size: 'one'}
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
            {type: 'string', name: 'text', size: 'all'}
        ],
        run: async (args: string[]) => {
            console.log(args.join(" "));
        }
    },
    {
        description: 'Displays whether a command is a shell builtin or an executable in PATH.',
        command: 'type',
        args: [
            {type: 'string', name: 'type', size: 'one'}
        ],
        run: async (args: string[]) => {
            const argCommand = args[0];
            if (typeof argCommand !== 'string') return;

            const builtin = commands.find(c => c.command === argCommand);
            if (builtin) {
                console.log(`${argCommand} is a shell builtin`);
                return;
            }

            const pathDirs = (process.env.PATH || "").split(process.platform === "win32" ? ";" : ":");

            for (const dir of pathDirs) {
                const fullPath = join(dir, argCommand);
                try {
                    await access(fullPath, constants.X_OK);
                    console.log(`${argCommand} is ${fullPath}`);
                    return;
                } catch {
                    continue;
                }
            }

            console.log(`${argCommand}: not found`);
        }
    },
    {
        description: 'Print current working directory',
        command: 'pwd',
        args: [],
        run: async (args: string[]) => {
            console.log(process.cwd())
        }
    }
];
