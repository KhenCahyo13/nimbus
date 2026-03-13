import type { PendingRequest, Request } from '@/interfaces/http';
import { useEnvironmentVariablesStore } from '@/stores';
import {
    resolveEnvironmentVariables,
    resolveEnvironmentVariablesInBody,
    resolveEnvironmentVariablesInParameters,
} from '@/utils/request';
import { computed, type ComputedRef } from 'vue';

export interface UseResolvedRequestResult {
    resolveRequest: (request: PendingRequest) => Request;
    resolvedEndpoint: ComputedRef<(request: PendingRequest) => string>;
    resolvedHeaders: ComputedRef<
        (request: PendingRequest) => ReturnType<typeof resolveEnvironmentVariablesInParameters>
    >;
    resolvedBody: ComputedRef<
        (request: PendingRequest) => ReturnType<typeof resolveEnvironmentVariablesInBody>
    >;
    resolvedQueryParameters: ComputedRef<
        (request: PendingRequest) => ReturnType<typeof resolveEnvironmentVariablesInParameters>
    >;
}

/**
 * Resolves environment placeholders from a pending request and exposes
 * primitive request values for execution and preview.
 *
 * Provides granular reactive computed properties for individual request
 * components, allowing decoupled consumption and automatic reactivity.
 */
export function useResolvedRequest(): UseResolvedRequestResult {
    const environmentVariablesStore = useEnvironmentVariablesStore();

    const getActiveVariables = () => environmentVariablesStore.variables;

    const getMemoizedBody = (request: PendingRequest) => {
        const body = request.body[request.method] ?? null;

        return body ? (body[request.payloadType] ?? null) : null;
    };

    const resolvedEndpoint = computed(() => {
        return (request: PendingRequest) => {
            return resolveEnvironmentVariables(request.endpoint, getActiveVariables());
        };
    });

    const resolvedHeaders = computed(() => {
        return (request: PendingRequest) => {
            return resolveEnvironmentVariablesInParameters(
                request.headers,
                getActiveVariables(),
            );
        };
    });

    const resolvedBody = computed(() => {
        return (request: PendingRequest) => {
            return resolveEnvironmentVariablesInBody(
                getMemoizedBody(request),
                getActiveVariables(),
            );
        };
    });

    const resolvedQueryParameters = computed(() => {
        return (request: PendingRequest) => {
            return resolveEnvironmentVariablesInParameters(
                request.queryParameters,
                getActiveVariables(),
            );
        };
    });

    const resolveRequest = (request: PendingRequest): Request => {
        const activeVariables = getActiveVariables();

        return {
            method: request.method,
            endpoint: resolvedEndpoint.value(request),
            headers: resolvedHeaders.value(request),
            body: resolvedBody.value(request),
            queryParameters: resolvedQueryParameters.value(request),
            payloadType: request.payloadType,
            authorization: request.authorization,
            routeDefinition: request.routeDefinition,
            transactionMode: request.transactionMode,
        };
    };

    return {
        resolveRequest,
        resolvedEndpoint,
        resolvedHeaders,
        resolvedBody,
        resolvedQueryParameters,
    };
}
