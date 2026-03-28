import type { ResolvableString } from '@/interfaces/http';
import { rawResolvableString } from '@/utils/request';
import { computed, type ComputedRef, type Ref } from 'vue';

/**
 * Composable for detecting dynamic placeholders in a route endpoint URL.
 */
export function useRoutePlaceholderDetection(
    endpoint: Ref<ResolvableString> | ComputedRef<ResolvableString>,
): {
    placeholders: ComputedRef<string[]>;
    hasPlaceholders: ComputedRef<boolean>;
} {
    const placeholders = computed(() => {
        const url = rawResolvableString(endpoint.value);

        if (!url) {
            return [];
        }

        const matches = Array.from(url.matchAll(/(?<!\{)\{([a-zA-Z0-9_-]+)\}(?!\})/g));

        return matches.map(match => match[1]);
    });

    const hasPlaceholders = computed(() => placeholders.value.length > 0);

    return {
        placeholders,
        hasPlaceholders,
    };
}
