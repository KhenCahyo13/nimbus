import type { ParameterContract } from '@/interfaces/ui';

export interface EnvironmentSubstitutionVariable {
    key: string;
    value: string;
    enabled: boolean;
}

export enum EnvironmentPlaceholderStatus {
    None = 'none',
    Missing = 'missing',
    Empty = 'empty',
    Resolved = 'resolved',
}

const PLACEHOLDER_PATTERN = /{{\s*([^{}]+?)\s*}}/g;

const buildVariablesMap = (
    variables: EnvironmentSubstitutionVariable[],
): Map<string, string> => {
    return new Map(
        variables
            .filter(variable => variable.enabled && variable.key.trim() !== '')
            .map(variable => [variable.key.trim(), variable.value]),
    );
};

const extractPlaceholderKeys = (value: string): string[] => {
    return Array.from(value.matchAll(PLACEHOLDER_PATTERN)).map(match =>
        String(match[1]).trim(),
    );
};

export const getEnvironmentPlaceholderStatus = (
    value: string,
    variables: EnvironmentSubstitutionVariable[],
): EnvironmentPlaceholderStatus => {
    const keys = extractPlaceholderKeys(value);

    if (keys.length === 0) {
        return EnvironmentPlaceholderStatus.None;
    }

    const variablesMap = buildVariablesMap(variables);

    for (const key of keys) {
        if (!variablesMap.has(key)) {
            return EnvironmentPlaceholderStatus.Missing;
        }
    }

    for (const key of keys) {
        if ((variablesMap.get(key) ?? '') === '') {
            return EnvironmentPlaceholderStatus.Empty;
        }
    }

    return EnvironmentPlaceholderStatus.Resolved;
};

export const resolveEnvironmentVariables = (
    value: string,
    variables: EnvironmentSubstitutionVariable[],
): string => {
    if (!value.includes('{{')) {
        return value;
    }

    const variablesMap = buildVariablesMap(variables);

    return value.replace(PLACEHOLDER_PATTERN, (match, key) => {
        const normalizedKey = String(key).trim();

        return variablesMap.get(normalizedKey) ?? match;
    });
};

export const resolveEnvironmentVariablesInParameters = (
    parameters: ParameterContract[],
    variables: EnvironmentSubstitutionVariable[],
): ParameterContract[] => {
    return parameters.map(parameter => ({
        ...parameter,
        value: resolveEnvironmentVariables(parameter.value, variables),
    }));
};

export const resolveEnvironmentVariablesInBody = (
    body: FormData | string | null,
    variables: EnvironmentSubstitutionVariable[],
): FormData | string | null => {
    if (typeof body === 'string') {
        return resolveEnvironmentVariables(body, variables);
    }

    if (!(body instanceof FormData)) {
        return body;
    }

    const resolved = new FormData();

    body.forEach((value, key) => {
        if (typeof value === 'string') {
            resolved.append(key, resolveEnvironmentVariables(value, variables));

            return;
        }

        resolved.append(key, value);
    });

    return resolved;
};
