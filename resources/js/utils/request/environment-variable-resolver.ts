export type EnvironmentVariablesMap = Map<string, string>;

export enum EnvVariableCheckStatus {
    None = 'none',
    Missing = 'missing',
    Empty = 'empty',
    Resolved = 'resolved',
}

/**
 * Pattern used to identify environment variable placeholders in strings.
 * Matches double-brace syntax: {{variable_name}}
 */
export const PLACEHOLDER_PATTERN = /{{\s*([^{}]+?)\s*}}/g;

const extractPlaceholderKeys = (value: string): string[] => {
    return Array.from(value.matchAll(PLACEHOLDER_PATTERN)).map(match =>
        String(match[1]).trim(),
    );
};

/**
 * Check the state of a particular value within the active variables.
 */
export const checkEnvVariable = (
    value: string,
    variablesMap: EnvironmentVariablesMap,
): EnvVariableCheckStatus => {
    const keys = extractPlaceholderKeys(value);

    if (keys.length === 0) {
        return EnvVariableCheckStatus.None;
    }

    for (const key of keys) {
        if (!variablesMap.has(key)) {
            return EnvVariableCheckStatus.Missing;
        }
    }

    for (const key of keys) {
        if ((variablesMap.get(key) ?? '') === '') {
            return EnvVariableCheckStatus.Empty;
        }
    }

    return EnvVariableCheckStatus.Resolved;
};

/**
 * Replaces all env variable keys in a string with their corresponding values from the map.
 */
export const replaceEnvVariablesInString = (
    value: string,
    variablesMap: EnvironmentVariablesMap,
): string => {
    if (!value.includes('{{')) {
        return value;
    }

    return value.replace(PLACEHOLDER_PATTERN, (match, key) => {
        const normalizedKey = String(key).trim();

        return variablesMap.get(normalizedKey) ?? match;
    });
};

/**
 * Gets the metadata (key and current value) for the first placeholder found in a string.
 */
export const getEnvKeyValue = (
    value: string,
    variablesMap: EnvironmentVariablesMap,
): string | null => {
    const keys = extractPlaceholderKeys(value);

    if (keys.length === 0) {
        return null;
    }

    return variablesMap.get(keys[0]) ?? '';
};

/**
 * Represents a segment of a string, identifying
 * whether it is a reactive environment placeholder or static text.
 */
export interface StringSegment {
    text: string;
    isEnvVariable: boolean;
    status?: EnvVariableCheckStatus;
    resolvedValue?: string | null;
}

/**
 * Parses a string into logical segments (text or placeholder).
 */
export const getStringSegments = (value: string): StringSegment[] => {
    const segments: StringSegment[] = [];

    let lastIndex = 0;

    const matches = Array.from(value.matchAll(PLACEHOLDER_PATTERN));

    for (const match of matches) {
        const index = match.index!;

        if (index > lastIndex) {
            segments.push({
                text: value.substring(lastIndex, index),
                isEnvVariable: false,
            });
        }

        segments.push({
            text: match[0],
            isEnvVariable: true,
        });

        lastIndex = index + match[0].length;
    }

    if (lastIndex < value.length) {
        segments.push({
            text: value.substring(lastIndex),
            isEnvVariable: false,
        });
    }

    return segments;
};
