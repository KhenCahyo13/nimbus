import { useRoutePlaceholderDetection } from '@/composables/request/useRoutePlaceholderDetection';
import { describe, expect, it } from 'vitest';
import { computed, ref } from 'vue';

describe('useRoutePlaceholderDetection', () => {
    it('detects route placeholders correctly', () => {
        const endpoint = ref('/api/users/{id}/posts/{postId}');
        const { placeholders } = useRoutePlaceholderDetection(endpoint);

        expect(placeholders.value).toEqual(['id', 'postId']);
    });

    it('ignores environment variables with double braces', () => {
        const endpoint = ref('/api/{{collection}}/users/{id}');
        const { placeholders } = useRoutePlaceholderDetection(endpoint);

        expect(placeholders.value).toEqual(['id']);
    });

    it('returns empty array when no placeholders are present', () => {
        const endpoint = ref('/api/users/123');
        const { placeholders } = useRoutePlaceholderDetection(endpoint);

        expect(placeholders.value).toEqual([]);
    });

    it('works with computed endpoint', () => {
        const raw = ref('/api/{resource}');
        const endpoint = computed(() => raw.value);
        const { placeholders } = useRoutePlaceholderDetection(endpoint);

        expect(placeholders.value).toEqual(['resource']);
    });

    it('updates when endpoint changes', async () => {
        const endpoint = ref('/api/{old}');
        const { placeholders } = useRoutePlaceholderDetection(endpoint);

        expect(placeholders.value).toEqual(['old']);

        endpoint.value = '/api/{new}';
        expect(placeholders.value).toEqual(['new']);
    });
});
