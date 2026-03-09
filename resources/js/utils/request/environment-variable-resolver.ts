import type { ParameterContract } from '@/interfaces/ui';

export interface EnvironmentSubstitutionVariable {
    key: string;
    value: string;
    enabled: boolean;
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
