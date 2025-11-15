import { access } from "fs/promises";
import { constants } from "fs";
import { join } from "path";

export async function findExecutable(command: string): Promise<string | null> {
    const pathDirs = (process.env.PATH || "").split(process.platform === "win32" ? ";" : ":");

    for (const dir of pathDirs) {
        const fullPath = join(dir, command);
        try {
            await access(fullPath, constants.X_OK);
            return fullPath;
        } catch {
            continue;
        }
    }

    return null;
}