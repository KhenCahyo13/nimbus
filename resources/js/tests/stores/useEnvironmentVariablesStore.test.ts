import { ParameterType } from '@/interfaces/ui';
import { useEnvironmentVariablesStore } from '@/stores/core/useEnvironmentVariablesStore';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useEnvironmentVariablesStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('creates a collection with one empty variable and sets it active', () => {
        const store = useEnvironmentVariablesStore();

        store.addCollection();

        expect(store.collections).toHaveLength(1);
        expect(store.activeCollectionId).toBe(store.collections[0].id);
        expect(store.collections[0].variables).toHaveLength(1);
        expect(store.collections[0].variables[0]).toMatchObject({
            type: ParameterType.Text,
            key: '',
            value: '',
            enabled: true,
        });
    });

    it('updates active collection name through action', () => {
        const store = useEnvironmentVariablesStore();
        store.addCollection();

        store.updateActiveCollectionName('Local API');

        expect(store.activeCollection?.name).toBe('Local API');
    });

    it('keeps at least one variable when active collection receives empty variables', () => {
        const store = useEnvironmentVariablesStore();
        store.addCollection();

        store.updateActiveCollectionVariables([]);

        expect(store.activeCollection?.variables.length).toBe(1);
        expect(store.activeCollection?.variables[0].type).toBe(ParameterType.Text);
    });

    it('clears active collection when all collections are removed', () => {
        const store = useEnvironmentVariablesStore();
        store.addCollection();
        const id = store.collections[0].id;

        store.removeCollection(id);

        expect(store.collections).toHaveLength(0);
        expect(store.activeCollection).toBeNull();
        expect(store.activeCollectionId).toBeNull();
    });
});
