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
    resolvedEndpoint: ComputedRef<string>;
    resolvedHeaders: ComputedRef<
        ReturnType<typeof resolveEnvironmentVariablesInParameters>
    >;
    resolvedBody: ComputedRef<ReturnType<typeof resolveEnvironmentVariablesInBody>>;
    resolvedQueryParameters: ComputedRef<
        ReturnType<typeof resolveEnvironmentVariablesInParameters>
    >;
}

/**
 * Resolves environment placeholders from a pending request and exposes
 * reactive granular computed properties for individual request components.
 *
 * Pass a reactive `request` ref to enable per-field computed values that
 * automatically update when either the request or active environment
 * variables change — allowing decoupled, granular consumption.
 *
 * `resolveRequest` is also available for imperative resolution (e.g. in stores).
 */
export function useResolvedRequest(
    request?: ComputedRef<PendingRequest | null>,
): UseResolvedRequestResult {
    const environmentVariablesStore = useEnvironmentVariablesStore();

    const getMemoizedBody = (req: PendingRequest) => {
        const body = req.body[req.method] ?? null;

        return body ? (body[req.payloadType] ?? null) : null;
    };

    const resolvedEndpoint = computed(() => {
        if (!request?.value) {
            return '';
        }

        return resolveEnvironmentVariables(
            request.value.endpoint,
            environmentVariablesStore.variables,
        );
    });

    const resolvedHeaders = computed(() => {
        if (!request?.value) {
            return [];
        }

        return resolveEnvironmentVariablesInParameters(
            request.value.headers,
            environmentVariablesStore.variables,
        );
    });

    const resolvedBody = computed(() => {
        if (!request?.value) {
            return null;
        }

        return resolveEnvironmentVariablesInBody(
            getMemoizedBody(request.value),
            environmentVariablesStore.variables,
        );
    });

    const resolvedQueryParameters = computed(() => {
        if (!request?.value) {
            return [];
        }

        return resolveEnvironmentVariablesInParameters(
            request.value.queryParameters,
            environmentVariablesStore.variables,
        );
    });

    const resolveRequest = (req: PendingRequest): Request => {
        const activeVariables = environmentVariablesStore.variables;

        return {
            method: req.method,
            endpoint: resolveEnvironmentVariables(req.endpoint, activeVariables),
            headers: resolveEnvironmentVariablesInParameters(
                req.headers,
                activeVariables,
            ),
            body: resolveEnvironmentVariablesInBody(
                getMemoizedBody(req),
                activeVariables,
            ),
            queryParameters: resolveEnvironmentVariablesInParameters(
                req.queryParameters,
                activeVariables,
            ),
            payloadType: req.payloadType,
            authorization: req.authorization,
            routeDefinition: req.routeDefinition,
            transactionMode: req.transactionMode,
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
