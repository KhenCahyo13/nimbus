import type { PendingRequest, Request } from '@/interfaces/http';
import { useEnvironmentVariablesStore } from '@/stores';
import {
    resolveEnvironmentVariables,
    resolveEnvironmentVariablesInBody,
    resolveEnvironmentVariablesInParameters,
} from '@/utils/request';

/**
 * Resolves environment placeholders from a pending request and exposes
 * primitive request values for execution and preview.
 */
export function useResolvedRequest() {
    const environmentVariablesStore = useEnvironmentVariablesStore();

    const getActiveVariables = () =>
        environmentVariablesStore.activeCollection?.variables ?? [];

    const getMemoizedBody = (request: PendingRequest) => {
        const body = request.body[request.method] ?? null;

        return body ? (body[request.payloadType] ?? null) : null;
    };

    const resolveRequest = (request: PendingRequest): Request => {
        const activeVariables = getActiveVariables();

        return {
            method: request.method,
            endpoint: resolveEnvironmentVariables(request.endpoint, activeVariables),
            headers: resolveEnvironmentVariablesInParameters(
                request.headers,
                activeVariables,
            ),
            body: resolveEnvironmentVariablesInBody(
                getMemoizedBody(request),
                activeVariables,
            ),
            queryParameters: resolveEnvironmentVariablesInParameters(
                request.queryParameters,
                activeVariables,
            ),
            payloadType: request.payloadType,
            authorization: request.authorization,
            routeDefinition: request.routeDefinition,
            transactionMode: request.transactionMode,
        };
    };

    return {
        resolveRequest,
    };
}
