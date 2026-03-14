import { useResolvedRequest } from '@/composables/request/useResolvedRequest';
import { AuthorizationType } from '@/interfaces/generated';
import type { PendingRequest } from '@/interfaces/http';
import { RequestBodyTypeEnum } from '@/interfaces/http';
import { ParameterType } from '@/interfaces/ui';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, reactive, ref } from 'vue';

/*
 * Fixtures.
 */

const mockEnvironmentVariablesStore = reactive({
    variables: [] as { key: string; value: string; enabled: boolean }[],
});

vi.mock('@/stores', async importOriginal => {
    const actual = await importOriginal<object>();

    return {
        ...actual,
        useEnvironmentVariablesStore: () => mockEnvironmentVariablesStore,
    };
});

const makeVariable = (key: string, value: string) => ({ key, value, enabled: true });

const createPendingRequest = (overrides: Partial<PendingRequest> = {}): PendingRequest => ({
    method: 'GET',
    endpoint: 'api/users',
    headers: [],
    body: {},
    payloadType: RequestBodyTypeEnum.EMPTY,
    schema: { shape: {}, extractionErrors: null },
    queryParameters: [],
    authorization: { type: AuthorizationType.None },
    supportedRoutes: [],
    routeDefinition: {
        method: 'GET',
        endpoint: 'api/users',
        shortEndpoint: 'api/users',
        schema: { shape: {}, extractionErrors: null },
    },
    isProcessing: false,
    wasExecuted: false,
    durationInMs: 0,
    transactionMode: false,
    ...overrides,
});

describe('useResolvedRequest', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        mockEnvironmentVariablesStore.variables = [];
    });

    /*
     * Granular Reactive Properties tests.
     */

    describe('Reactive Properties', () => {
        it('returns empty string for resolvedEndpoint when no request is provided', () => {
            // Arrange

            const { resolvedEndpoint } = useResolvedRequest();

            // Assert

            expect(resolvedEndpoint.value).toBe('');
        });

        it('resolves endpoint placeholders reactively', () => {
            // Arrange

            mockEnvironmentVariablesStore.variables = [makeVariable('base_url', 'example.com')];
            const request = ref(createPendingRequest({ endpoint: '{{base_url}}/users' }));
            const { resolvedEndpoint } = useResolvedRequest(computed(() => request.value));

            // Assert

            expect(resolvedEndpoint.value).toBe('example.com/users');
        });

        it('updates resolvedEndpoint when environment variables change', () => {
            // Arrange

            mockEnvironmentVariablesStore.variables = [makeVariable('env', 'staging')];
            const request = ref(createPendingRequest({ endpoint: '{{env}}/users' }));
            const { resolvedEndpoint } = useResolvedRequest(computed(() => request.value));

            expect(resolvedEndpoint.value).toBe('staging/users');

            // Act — change the variable value

            mockEnvironmentVariablesStore.variables = [makeVariable('env', 'production')];

            // Assert

            expect(resolvedEndpoint.value).toBe('production/users');
        });

        it('updates resolvedEndpoint when the request changes', () => {
            // Arrange

            const request = ref(createPendingRequest({ endpoint: 'api/users' }));
            const { resolvedEndpoint } = useResolvedRequest(computed(() => request.value));

            expect(resolvedEndpoint.value).toBe('api/users');

            // Act

            request.value = createPendingRequest({ endpoint: 'api/posts' });

            // Assert

            expect(resolvedEndpoint.value).toBe('api/posts');
        });

        it('returns empty array for resolvedHeaders when no request is provided', () => {
            // Arrange

            const { resolvedHeaders } = useResolvedRequest();

            // Assert

            expect(resolvedHeaders.value).toEqual([]);
        });

        it('returns empty array for resolvedQueryParameters when no request is provided', () => {
            // Arrange

            const { resolvedQueryParameters } = useResolvedRequest();

            // Assert

            expect(resolvedQueryParameters.value).toEqual([]);
        });

        it('returns null for resolvedBody when no request is provided', () => {
            // Arrange

            const { resolvedBody } = useResolvedRequest();

            // Assert

            expect(resolvedBody.value).toBeNull();
        });
    });

    /*
     * Imperative Resolution tests.
     */

    describe('resolveRequest', () => {
        it('resolves environment variable placeholders in the endpoint', () => {
            // Arrange

            mockEnvironmentVariablesStore.variables = [makeVariable('host', 'example.com')];
            const { resolveRequest } = useResolvedRequest();
            const request = createPendingRequest({ endpoint: '{{host}}/users' });

            // Act

            const result = resolveRequest(request);

            // Assert

            expect(result.endpoint).toBe('example.com/users');
        });

        it('preserves request metadata unchanged', () => {
            // Arrange

            const { resolveRequest } = useResolvedRequest();
            const request = createPendingRequest({
                method: 'POST',
                payloadType: RequestBodyTypeEnum.JSON,
                transactionMode: true,
            });

            // Act

            const result = resolveRequest(request);

            // Assert

            expect(result.method).toBe('POST');
            expect(result.payloadType).toBe(RequestBodyTypeEnum.JSON);
            expect(result.transactionMode).toBe(true);
        });

        it('resolves placeholders in headers', () => {
            // Arrange

            mockEnvironmentVariablesStore.variables = [makeVariable('token', 'abc123')];
            const { resolveRequest } = useResolvedRequest();
            const request = createPendingRequest({
                headers: [
                    {
                        key: 'Authorization',
                        value: 'Bearer {{token}}',
                        enabled: true,
                        type: ParameterType.Text,
                    },
                ],
            });

            // Act

            const result = resolveRequest(request);

            // Assert

            expect(result.headers[0].value).toBe('Bearer abc123');
        });

        it('leaves placeholders unchanged when variable is not found', () => {
            // Arrange

            mockEnvironmentVariablesStore.variables = [];
            const { resolveRequest } = useResolvedRequest();
            const request = createPendingRequest({ endpoint: '{{unknown}}/users' });

            // Act

            const result = resolveRequest(request);

            // Assert

            expect(result.endpoint).toBe('{{unknown}}/users');
        });
    });
});
