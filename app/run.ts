import { access } from "fs/promises";
import { constants } from "fs";
import { isAbsolute, join } from "path";
import { commands, customCommands } from "./data";
import os from "os";

// exit
export async function runExit(args: string[]) {
    const code = args.length > 0 ? Number(args[0]) : 0;
    const exitCode = Number.isNaN(code) ? 1 : code;
    process.exit(exitCode);
}

// echo (echo 'hello' 'world')
export async function runEcho(args: string[]) {
    console.log(args.join(' '));
}

// type
export async function runType(args: string[]) {
    const argCommand = args[0];
    if (typeof argCommand !== 'string') return;

    const builtin = commands.find(c => c.command === argCommand);
    if (builtin && !customCommands.includes(argCommand)) {
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

// pwd
export async function runPwd(args: string[]) {
    console.log(process.cwd());
}

// cd
export async function runCd(args: string[]) {
    let path = args[0] || '';

    if (path.startsWith('~')) {
        path = join(os.homedir(), path.slice(1));
    } else if (!isAbsolute(path)) {
        path = join(process.cwd(), path);
    }

    try {
        await access(path, constants.F_OK);
        process.chdir(path);
    } catch {
        console.log(`cd: ${args[0]}: No such file or directory`);
    }
}

// cat
export async function runCat(args: string[]) {
    const fs = await import('fs/promises');

    for (const filePath of args) {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            process.stdout.write(data);
        } catch {
            console.error(`cat: ${filePath}: No such file or directory`);
        }
    }
}