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

/**
 * Pattern used to identify environment variable placeholders in strings.
 * Matches double-brace syntax: {{variable_name}}
 */
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

/**
 * Gets the resolved placeholder data (key and value) for a given placeholder string.
 */
export const getResolvedPlaceholder = (
    value: string,
    variables: EnvironmentSubstitutionVariable[],
    variablesMap: EnvironmentVariablesMap | null = null,
): { key: string; value: string } | null => {
    const keys = extractPlaceholderKeys(value);

    if (keys.length === 0) {
        return null;
    }

    const currentVariablesMap = variablesMap ?? createEnvironmentVariablesMap(variables);

    return {
        key: keys[0],
        value: currentVariablesMap.get(keys[0]) ?? '',
    };
};

/**
 * Represents a segment of an endpoint URL, identifying
 * whether it is a reactive environment placeholder or static text.
 */
export interface EndpointSegment {
    text: string;
    isPlaceholder: boolean;
}

/**
 * Parses an endpoint URL into logical segments for rich-text rendering.
 *
 * It extracts all environment variable placeholders ({{...}}) and returns
 * them as distinct segments interleaved with standard text segments.
 */
export const getEndpointSegments = (value: string): EndpointSegment[] => {
    const segments: EndpointSegment[] = [];
    let lastIndex = 0;

    const matches = Array.from(value.matchAll(PLACEHOLDER_PATTERN));

    for (const match of matches) {
        const index = match.index!;

        if (index > lastIndex) {
            segments.push({
                text: value.substring(lastIndex, index),
                isPlaceholder: false,
            });
        }

        segments.push({
            text: match[0],
            isPlaceholder: true,
        });

        lastIndex = index + match[0].length;
    }

    if (lastIndex < value.length) {
        segments.push({
            text: value.substring(lastIndex),
            isPlaceholder: false,
        });
    }

    return segments;
};

export const getPlaceholderStatus = (
    key: string,
    variables: EnvironmentSubstitutionVariable[],
    variablesMap: EnvironmentVariablesMap | null = null,
): EnvironmentPlaceholderStatus => {
    const currentVariablesMap = variablesMap ?? createEnvironmentVariablesMap(variables);
    const normalizedKey = key.replace(/[{}]/g, '').trim();

    if (!currentVariablesMap.has(normalizedKey)) {
        return EnvironmentPlaceholderStatus.Missing;
    }

    if ((currentVariablesMap.get(normalizedKey) ?? '') === '') {
        return EnvironmentPlaceholderStatus.Empty;
    }

    return EnvironmentPlaceholderStatus.Resolved;
};
