import { useEnvironmentVariablesStore } from '@/stores';
import {
    checkEnvVariable,
    EnvVariableCheckStatus,
    getEnvKeyValue,
    getStringSegments,
    replaceEnvVariablesInString,
    type StringSegment,
} from '@/utils/request/environment-variable-resolver';
import { computed, type Ref, ref, watch } from 'vue';

import type { ResolvableString } from '@/interfaces/http';

export interface EnvVariablesAwareStringResult {
    raw: Ref<string>;
    resolved: Ref<string>;
    segments: Ref<StringSegment[]>;
}

/**
 * Composable that manages the resolution of environment variables within a string.
 * Supports both primitive strings and ResolvableObjects for backward compatibility.
 *
 * @param source - The reactive source (string or { raw: string, resolved: string }) to resolve.
 * @returns Reactive resolution state and utilities.
 */
export function useEnvVariablesAwareString(
    source: Ref<ResolvableString>,
): EnvVariablesAwareStringResult {
    const environmentVariablesStore = useEnvironmentVariablesStore();

    /*
     * State.
     */

    const rawValue: Ref<string> = ref('');

    /*
     * Computed.
     */

    const variables = computed(() => {
        return environmentVariablesStore.variables;
    });

    const fullyResolvedString = computed(() => {
        return replaceEnvVariablesInString(rawValue.value, variables.value);
    });

    const segments = computed(() => {
        return getStringSegments(rawValue.value).map(segment => {
            if (!segment.isEnvVariable) {
                return {
                    ...segment,
                    status: EnvVariableCheckStatus.None,
                    resolved: null,
                };
            }

            return {
                ...segment,
                status: checkEnvVariable(segment.text, variables.value),
                resolvedValue: getEnvKeyValue(segment.text, variables.value),
            };
        });
    });

    /*
     * Watchers.
     */

    /**
     * Sync the local raw state with the source.
     */
    watch(
        source,
        (newSource: ResolvableString) => {
            const newRaw = typeof newSource === 'object' ? newSource.raw : newSource;

            if (newRaw !== rawValue.value) {
                rawValue.value = newRaw;
            }
        },
        { immediate: true },
    );

    /**
     * Update the source when the local raw state or resolved state changes.
     */
    watch([rawValue, fullyResolvedString], ([newRaw, newResolved]) => {
        const currentSource = source.value;
        const currentRaw =
            typeof currentSource === 'object' ? currentSource.raw : currentSource;

        if (newRaw !== currentRaw) {
            source.value = { raw: newRaw, resolved: newResolved } as ResolvableString;
        }
    });

    return {
        raw: rawValue,
        resolved: fullyResolvedString,
        segments,
    };
}
