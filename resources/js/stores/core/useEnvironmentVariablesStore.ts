import { type ParameterContract, ParameterType } from '@/interfaces/ui';
import { defineStore } from 'pinia';
import type { ComputedRef, Ref } from 'vue';
import { computed, onMounted, ref } from 'vue';

/*
 * Types & Interfaces.
 */

export type EnvironmentCollection = {
    id: string;
    name: string;
    variables: ParameterContract[];
};

/*
 * Helpers.
 */

function createDefaultCollection(index: number): EnvironmentCollection {
    return {
        id: crypto.randomUUID(),
        name: `Collection ${index}`,
        variables: [],
    };
}

/*
 * Store Definition.
 */

export const useEnvironmentVariablesStore = defineStore(
    'environmentVariables',
    () => {
        /*
         * State.
         */
        const collections: Ref<EnvironmentCollection[]> = ref<EnvironmentCollection[]>(
            [],
        );
        const activeCollectionId = ref<string | null>(null);
        const nextVariableId = ref(0);
        const isRenamingActiveCollection = ref<boolean>(false);

        /*
         * Private Methods.
         */

        const generateVariableId = () => {
            nextVariableId.value += 1;

            return nextVariableId.value;
        };

        const createEmptyCollectionVariable = (): ParameterContract => ({
            id: generateVariableId(),
            type: ParameterType.Text,
            key: '',
            value: { raw: '', resolved: '' },
            enabled: true,
        });

        /*
         * Getters (Computed).
         */

        const activeCollection = computed(() => {
            return (
                collections.value.find(
                    collection => collection.id === activeCollectionId.value,
                ) ?? null
            );
        });

        const editableVariables = computed(() => activeCollection.value?.variables ?? []);

        const variables: ComputedRef<Map<string, string>> = computed(() => {
            const variables: [string, string][] = editableVariables.value
                .filter(variable => variable.enabled && variable.key.trim() !== '')
                .map((parameter: ParameterContract) => [
                    parameter.key.trim(),
                    parameter.value.resolved,
                ]);

            return new Map(variables);
        });

        const hasCollections = computed(() => collections.value.length > 0);

        /*
         * Actions.
         */

        const select = (collectionId: string | null) => {
            activeCollectionId.value = collectionId;
        };

        const addCollection = () => {
            const collection = createDefaultCollection(collections.value.length + 1);
            collection.variables = [createEmptyCollectionVariable()];

            collections.value.push(collection);
            activeCollectionId.value = collection.id;

            isRenamingActiveCollection.value = true;
        };

        const removeCollection = (collectionId: string) => {
            collections.value = collections.value.filter(
                collection => collection.id !== collectionId,
            );

            if (collections.value.length === 0) {
                activeCollectionId.value = null;

                return;
            }

            if (activeCollectionId.value === collectionId) {
                activeCollectionId.value = collections.value[0]?.id ?? null;
            }
        };

        const renameActive = (name: string) => {
            if (!activeCollection.value) {
                return;
            }

            collections.value = collections.value.map(collection => {
                if (collection.id !== activeCollection.value!.id) {
                    return collection;
                }

                return {
                    ...collection,
                    name,
                };
            });

            completeRenaming();
        };

        const updateVariables = (variables: ParameterContract[]) => {
            if (!activeCollection.value) {
                return;
            }

            const normalizedVariables = variables.length
                ? variables
                : [createEmptyCollectionVariable()];

            collections.value = collections.value.map(collection => {
                if (collection.id !== activeCollection.value!.id) {
                    return collection;
                }

                return {
                    ...collection,
                    variables: normalizedVariables,
                };
            });
        };

        const completeRenaming = () => {
            isRenamingActiveCollection.value = false;
        };

        onMounted(() => (isRenamingActiveCollection.value = false));

        return {
            // State
            collections,
            activeCollectionId,
            isRenamingActiveCollection,

            // Getters
            activeCollection,
            editableVariables,
            variables,
            hasCollections,

            // Actions
            select,
            addCollection,
            removeCollection,
            renameActive,
            updateVariables,
            completeRenaming,
        };
    },
    {
        persist: true,
    },
);
