import {runCd, runEcho, runExit, runPwd, runType} from "./run";

export const commands: {
    description: string;
    command: string;
    args: {type: string; name: string; size: 'one' | 'all'}[];
    run: (args: string[]) => Promise<void>;
}[] = [
    {
        description: 'Terminates the shell with an optional exit code.',
        command: 'exit',
        args: [
            {type: 'number', name: 'exit_code', size: 'one'}
        ],
        run: runExit
    },
    {
        description: 'Prints the provided text to the console.',
        command: 'echo',
        args: [
            {type: 'string', name: 'text', size: 'all'}
        ],
        run: runEcho
    },
    {
        description: 'Displays whether a command is a shell builtin or an executable in PATH.',
        command: 'type',
        args: [
            {type: 'string', name: 'type', size: 'one'}
        ],
        run: runType
    },
    {
        description: 'Print current working directory',
        command: 'pwd',
        args: [],
        run: runPwd
    },
    {
        description: '',
        command: 'cd',
        args: [
            {type: 'string', name: 'directory', size: 'one'}
        ],
        run: runCd
    }
];
