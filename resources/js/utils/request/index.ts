/**
 * Request building and execution utilities
 */

export { generateCurlCommand } from './curl-generator';
export {
    EnvironmentPlaceholderStatus,
    createEnvironmentVariablesMap,
    getEndpointSegments,
    getEnvironmentPlaceholderStatus,
    getPlaceholderStatus,
    getResolvedPlaceholder,
    resolveEnvironmentVariables,
    resolveEnvironmentVariablesInBody,
    resolveEnvironmentVariablesInParameters,
    type EndpointSegment,
    type EnvironmentSubstitutionVariable,
} from './environment-variable-resolver';
export { buildRequestUrl } from './request-url-builder';
export {
    createRequestTimer,
    generateErrorRequestLog,
    generateSuccessRequestLog,
    getDefaultPayloadTypeForRoute,
} from './request-utils';
