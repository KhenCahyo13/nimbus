import { type ParameterContract, ParameterType } from '@/interfaces/ui';
import { defineStore } from 'pinia';
import {computed, onMounted, ref} from 'vue';
import {useId} from "reka-ui";

/*
 * Types & Interfaces.
 */

export type EnvironmentVariable = ParameterContract;

export type EnvironmentCollection = {
    id: string;
    name: string;
    variables: EnvironmentVariable[];
};

/*
 * Helpers.
 */

function createDefaultCollection(index: number): EnvironmentCollection {
    return {
        id: useId(),
        name: `Collection ${index}`,
        variables: [],
    };
}

/*
 * Store Definition.
 */

export const useEnvironmentVariablesStore = defineStore(
    'environment-variables',
    () => {
        /*
         * State.
         */
        const collections = ref<EnvironmentCollection[]>([]);
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

        const createEmptyVariable = (): EnvironmentVariable => ({
            id: generateVariableId(),
            type: ParameterType.Text,
            key: '',
            value: '',
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

        const variables = computed(() => {
            return activeCollection.value?.variables ?? [];
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
            collection.variables = [createEmptyVariable()];

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

        const updateVariables = (variables: EnvironmentVariable[]) => {
            if (!activeCollection.value) {
                return;
            }

            const normalizedVariables = variables.length
                ? variables
                : [createEmptyVariable()];

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

        /*
         * Public API.
         */

        return {
            // State (Exposed for reactivity in lists, but actions preferred for modification)
            collections,
            activeCollectionId,
            isRenamingActiveCollection,

            // Getters
            activeCollection,
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
