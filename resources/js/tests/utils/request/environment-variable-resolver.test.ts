import { ParameterType } from '@/interfaces/ui';
import {
    EnvironmentPlaceholderStatus,
    getEndpointSegments,
    getEnvironmentPlaceholderStatus,
    getPlaceholderStatus,
    getResolvedPlaceholder,
    resolveEnvironmentVariables,
    resolveEnvironmentVariablesInBody,
    resolveEnvironmentVariablesInParameters,
} from '@/utils/request/environment-variable-resolver';
import { describe, expect, it } from 'vitest';

describe('environment-variable-resolver', () => {
    const variables = [
        { key: 'host', value: 'localhost', enabled: true },
        { key: 'token', value: 'abc123', enabled: true },
        { key: 'disabled', value: 'x', enabled: false },
    ];

    it('resolves string placeholders from enabled variables', () => {
        const resolved = resolveEnvironmentVariables(
            '/api/{{host}}?token={{ token }}',
            variables,
        );

        expect(resolved).toBe('/api/localhost?token=abc123');
    });

    it('keeps unknown placeholders unchanged', () => {
        const resolved = resolveEnvironmentVariables('/api/{{missing}}', variables);

        expect(resolved).toBe('/api/{{missing}}');
    });

    it('resolves parameter values without mutating parameter metadata', () => {
        const parameters = [
            {
                id: 1,
                type: ParameterType.Text,
                key: 'Authorization',
                value: 'Bearer {{token}}',
                enabled: true,
            },
        ];

        const resolved = resolveEnvironmentVariablesInParameters(parameters, variables);

        expect(resolved[0]).toMatchObject({
            id: 1,
            key: 'Authorization',
            value: 'Bearer abc123',
            enabled: true,
        });
    });

    it('resolves placeholders in string form-data values', () => {
        const formData = new FormData();
        formData.append('url', 'https://{{host}}/ping');
        formData.append('plain', 'keep');

        const resolved = resolveEnvironmentVariablesInBody(formData, variables);
        const urlValue = (resolved as FormData).get('url');
        const plainValue = (resolved as FormData).get('plain');

        expect(urlValue).toBe('https://localhost/ping');
        expect(plainValue).toBe('keep');
    });

    it('returns missing status when placeholder key does not exist', () => {
        const status = getEnvironmentPlaceholderStatus('/api/{{missing}}', variables);

        expect(status).toBe(EnvironmentPlaceholderStatus.Missing);
    });

    it('returns empty status when placeholder exists but value is empty', () => {
        const status = getEnvironmentPlaceholderStatus('/api/{{empty}}', [
            ...variables,
            { key: 'empty', value: '', enabled: true },
        ]);

        expect(status).toBe(EnvironmentPlaceholderStatus.Empty);
    });

    it('returns resolved status when all placeholders are available and non-empty', () => {
        const status = getEnvironmentPlaceholderStatus(
            '/api/{{host}}?token={{token}}',
            variables,
        );

        expect(status).toBe(EnvironmentPlaceholderStatus.Resolved);
    });

    describe('getEndpointSegments', () => {
        it('parses plain text as a single segment', () => {
            const segments = getEndpointSegments('/api/users');

            expect(segments).toEqual([{ text: '/api/users', isPlaceholder: false }]);
        });

        it('parses single placeholder', () => {
            const segments = getEndpointSegments('{{host}}');

            expect(segments).toEqual([{ text: '{{host}}', isPlaceholder: true }]);
        });

        it('parses mixed text and placeholders', () => {
            const segments = getEndpointSegments('https://{{host}}/api/{{version}}');

            expect(segments).toEqual([
                { text: 'https://', isPlaceholder: false },
                { text: '{{host}}', isPlaceholder: true },
                { text: '/api/', isPlaceholder: false },
                { text: '{{version}}', isPlaceholder: true },
            ]);
        });

        it('parses empty string as empty segments array', () => {
            const segments = getEndpointSegments('');

            expect(segments).toEqual([]);
        });
    });

    describe('getResolvedPlaceholder', () => {
        it('extracts key and value for a placeholder', () => {
            const result = getResolvedPlaceholder('{{token}}', variables);

            expect(result).toEqual({ key: 'token', value: 'abc123' });
        });

        it('returns null if no placeholder is present', () => {
            const result = getResolvedPlaceholder('/api/users', variables);

            expect(result).toBeNull();
        });
    });

    describe('getPlaceholderStatus', () => {
        it('returns missing status when key does not exist', () => {
            const status = getPlaceholderStatus('{{missing}}', variables);

            expect(status).toBe(EnvironmentPlaceholderStatus.Missing);
        });

        it('returns empty status when value is empty', () => {
            const status = getPlaceholderStatus('{{empty}}', [
                ...variables,
                { key: 'empty', value: '', enabled: true },
            ]);

            expect(status).toBe(EnvironmentPlaceholderStatus.Empty);
        });

        it('returns resolved status when value is non-empty', () => {
            const status = getPlaceholderStatus('{{host}}', variables);

            expect(status).toBe(EnvironmentPlaceholderStatus.Resolved);
        });

        it('normalizes keys with braces', () => {
            const status = getPlaceholderStatus('{{ host }}', variables);

            expect(status).toBe(EnvironmentPlaceholderStatus.Resolved);
        });
    });
});
