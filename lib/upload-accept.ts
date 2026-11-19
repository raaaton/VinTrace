/** Browser accept rules are case-insensitive, including camera file extensions. */
export function acceptsUpload(file: {name: string; type: string}, rules: string[]): boolean {
    const mime = file.type.toLowerCase();
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    return rules.some(rule => {
        const normalized = rule.trim().toLowerCase();
        return normalized === mime || normalized === extension ||
            (normalized.endsWith('/*') && mime.startsWith(normalized.slice(0, -1)));
    });
}
