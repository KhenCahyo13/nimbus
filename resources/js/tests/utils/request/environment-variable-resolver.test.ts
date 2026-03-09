import { ParameterType } from '@/interfaces/ui';
import {
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
});
