import type { ParameterContract } from '@/interfaces';
import { ParameterType } from '@/interfaces';
import {
    checkEnvVariable,
    EnvVariableCheckStatus,
    getEnvKeyValue,
    getStringSegments,
    replaceEnvVariablesInString,
} from '@/utils/request/environment-variable-resolver';
import { resolveResolvableString } from '@/utils/common/resolvable';
import { describe, expect, it } from 'vitest';

const createEnvVariablesMap = (variables: ParameterContract[]) => {
    const entries: [string, string][] = variables
        .filter(parameter => parameter.enabled)
        .map(parameter => [parameter.key, resolveResolvableString(parameter.value)]);

    return new Map(entries);
};

describe('environment-variable-resolver', () => {
    const variables = [
        {
            type: ParameterType.Text,
            key: 'host',
            value: { raw: 'localhost', resolved: 'localhost' },
            enabled: true,
        },
        {
            type: ParameterType.Text,
            key: 'token',
            value: { raw: 'abc123', resolved: 'abc123' },
            enabled: true,
        },
        {
            type: ParameterType.Text,
            key: 'disabled',
            value: { raw: 'x', resolved: 'x' },
            enabled: false,
        },
    ];

    const variablesMap = createEnvVariablesMap(variables);

    it('resolves string placeholders from enabled variables', () => {
        const resolved = replaceEnvVariablesInString(
            '/api/{{host}}?token={{ token }}',
            variablesMap,
        );

        expect(resolved).toBe('/api/localhost?token=abc123');
    });

    it('keeps unknown placeholders unchanged', () => {
        const resolved = replaceEnvVariablesInString('/api/{{missing}}', variablesMap);

        expect(resolved).toBe('/api/{{missing}}');
    });

    it('returns missing status when placeholder key does not exist', () => {
        const status = checkEnvVariable('/api/{{missing}}', variablesMap);

        expect(status).toBe(EnvVariableCheckStatus.Missing);
    });

    it('returns empty status when placeholder exists but value is empty', () => {
        const status = checkEnvVariable(
            '/api/{{empty}}',
            createEnvVariablesMap([
                ...variables,
                {
                    type: ParameterType.Text,
                    key: 'empty',
                    value: { raw: '', resolved: '' },
                    enabled: true,
                },
            ]),
        );

        expect(status).toBe(EnvVariableCheckStatus.Empty);
    });

    it('returns resolved status when all placeholders are available and non-empty', () => {
        const status = checkEnvVariable('/api/{{host}}?token={{token}}', variablesMap);

        expect(status).toBe(EnvVariableCheckStatus.Resolved);
    });

    describe('getStringSegments', () => {
        it('parses plain text as a single segment', () => {
            const segments = getStringSegments('/api/users');

            expect(segments).toEqual([{ text: '/api/users', isEnvVariable: false }]);
        });

        it('parses single placeholder', () => {
            const segments = getStringSegments('{{host}}');

            expect(segments).toEqual([{ text: '{{host}}', isEnvVariable: true }]);
        });

        it('parses mixed text and placeholders', () => {
            const segments = getStringSegments('https://{{host}}/api/{{version}}');

            expect(segments).toEqual([
                { text: 'https://', isEnvVariable: false },
                { text: '{{host}}', isEnvVariable: true },
                { text: '/api/', isEnvVariable: false },
                { text: '{{version}}', isEnvVariable: true },
            ]);
        });

        it('parses empty string as empty segments array', () => {
            const segments = getStringSegments('');

            expect(segments).toEqual([]);
        });
    });

    describe('getResolvedPlaceholder', () => {
        it('extracts value for a placeholder', () => {
            const result = getEnvKeyValue('{{token}}', variablesMap);

            expect(result).toBe('abc123');
        });

        it('returns null if no placeholder is present', () => {
            const result = getEnvKeyValue('/api/users', variablesMap);

            expect(result).toBeNull();
        });
    });
});
