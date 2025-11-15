function NumberValidator(value: number | string): number {
    if (value === null || value === undefined) throw new Error("Value is required");
    if (typeof value === "number") {
        if (Number.isNaN(value)) throw new Error("Invalid number");
        return value;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) throw new Error(`Invalid number: "${value}"`);
    return parsed;
}

function StringValidator(value: string | number | boolean): string {
    if (value === null || value === undefined) throw new Error("Value is required");
    if (typeof value !== "string") return String(value);
    return value;
}

function BooleanValidator(value: boolean | string | number): boolean {
    if (value === null || value === undefined) throw new Error("Value is required");
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    const lower = String(value).toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
    throw new Error(`Invalid boolean: "${value}"`);
}

export {
    NumberValidator,
    StringValidator,
    BooleanValidator,
}