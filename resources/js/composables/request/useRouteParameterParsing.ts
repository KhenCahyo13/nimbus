import type { ResolvableString } from '@/interfaces/common/resolvable';
import { rawResolvableString } from '@/utils/request';
import { computed, type ComputedRef, type Ref } from 'vue';

/**
 * Composable for parsing dynamic parameters in a route endpoint URL.
 */
export function useRouteParameterParsing(
    endpoint: Ref<ResolvableString> | ComputedRef<ResolvableString>,
): {
    parameters: ComputedRef<string[]>;
    hasParameters: ComputedRef<boolean>;
} {
    const parameters = computed(() => {
        const url = rawResolvableString(endpoint.value);

        if (!url) {
            return [];
        }

        const matches = Array.from(url.matchAll(/(?<!\{)\{([a-zA-Z0-9_-]+)\}(?!\})/g));

        return matches.map(match => match[1]);
    });

    const hasParameters = computed(() => parameters.value.length > 0);

    return {
        parameters,
        hasParameters,
    };
}
