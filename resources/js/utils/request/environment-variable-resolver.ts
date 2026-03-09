import type { ParameterContract } from '@/interfaces/ui';

export interface EnvironmentSubstitutionVariable {
    key: string;
    value: string;
    enabled: boolean;
}

export type EnvironmentVariablesMap = Map<string, string>;

export enum EnvironmentPlaceholderStatus {
    None = 'none',
    Missing = 'missing',
    Empty = 'empty',
    Resolved = 'resolved',
}

const PLACEHOLDER_PATTERN = /{{\s*([^{}]+?)\s*}}/g;

export const createEnvironmentVariablesMap = (
    variables: EnvironmentSubstitutionVariable[],
): EnvironmentVariablesMap => {
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
    variablesMap: EnvironmentVariablesMap | null = null,
): EnvironmentPlaceholderStatus => {
    const keys = extractPlaceholderKeys(value);

    if (keys.length === 0) {
        return EnvironmentPlaceholderStatus.None;
    }

    const currentVariablesMap = variablesMap ?? createEnvironmentVariablesMap(variables);

    for (const key of keys) {
        if (!currentVariablesMap.has(key)) {
            return EnvironmentPlaceholderStatus.Missing;
        }
    }

    for (const key of keys) {
        if ((currentVariablesMap.get(key) ?? '') === '') {
            return EnvironmentPlaceholderStatus.Empty;
        }
    }

    return EnvironmentPlaceholderStatus.Resolved;
};

export const resolveEnvironmentVariables = (
    value: string,
    variables: EnvironmentSubstitutionVariable[],
    variablesMap: EnvironmentVariablesMap | null = null,
): string => {
    if (!value.includes('{{')) {
        return value;
    }

    const currentVariablesMap = variablesMap ?? createEnvironmentVariablesMap(variables);

    return value.replace(PLACEHOLDER_PATTERN, (match, key) => {
        const normalizedKey = String(key).trim();

        return currentVariablesMap.get(normalizedKey) ?? match;
    });
};

export const resolveEnvironmentVariablesInParameters = (
    parameters: ParameterContract[],
    variables: EnvironmentSubstitutionVariable[],
): ParameterContract[] => {
    const variablesMap = createEnvironmentVariablesMap(variables);

    return parameters.map(parameter => ({
        ...parameter,
        value: resolveEnvironmentVariables(parameter.value, variables, variablesMap),
    }));
};

export const resolveEnvironmentVariablesInBody = (
    body: FormData | string | null,
    variables: EnvironmentSubstitutionVariable[],
): FormData | string | null => {
    const variablesMap = createEnvironmentVariablesMap(variables);

    if (typeof body === 'string') {
        return resolveEnvironmentVariables(body, variables, variablesMap);
    }

    if (!(body instanceof FormData)) {
        return body;
    }

    const resolved = new FormData();

    body.forEach((value, key) => {
        if (typeof value === 'string') {
            resolved.append(
                key,
                resolveEnvironmentVariables(value, variables, variablesMap),
            );

            return;
        }

        resolved.append(key, value);
    });

    return resolved;
};
