import { defineStore } from 'pinia';
import { type ParameterContract, ParameterType } from '@/interfaces/ui';
import { computed, ref } from 'vue';

export type EnvironmentVariable = ParameterContract;

export type EnvironmentCollection = {
    id: string;
    name: string;
    variables: EnvironmentVariable[];
};

function createId(prefix: string) {
    const randomPart =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return `${prefix}-${randomPart}`;
}

function createDefaultCollection(index: number): EnvironmentCollection {
    return {
        id: createId('env-col'),
        name: `Collection ${index}`,
        variables: [],
    };
}

export const useEnvironmentVariablesStore = defineStore(
    'environment-variables',
    () => {
        const collections = ref<EnvironmentCollection[]>([]);
        const activeCollectionId = ref<string | null>(null);
        const nextVariableId = ref(0);

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

        const activeCollection = computed(() => {
            return (
                collections.value.find(
                    collection => collection.id === activeCollectionId.value,
                ) ?? null
            );
        });

        const setActiveCollection = (collectionId: string | null) => {
            activeCollectionId.value = collectionId;
        };

        const addCollection = () => {
            const collection = createDefaultCollection(collections.value.length + 1);
            collection.variables = [createEmptyVariable()];

            collections.value.push(collection);
            activeCollectionId.value = collection.id;
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

        const updateCollectionName = (collectionId: string, name: string) => {
            collections.value = collections.value.map(collection => {
                if (collection.id !== collectionId) {
                    return collection;
                }

                return {
                    ...collection,
                    name,
                };
            });
        };

        const updateCollectionVariables = (
            collectionId: string,
            variables: EnvironmentVariable[],
        ) => {
            const normalizedVariables = variables.length
                ? variables
                : [createEmptyVariable()];

            collections.value = collections.value.map(collection => {
                if (collection.id !== collectionId) {
                    return collection;
                }

                return {
                    ...collection,
                    variables: normalizedVariables,
                };
            });
        };

        const updateActiveCollectionName = (name: string) => {
            if (!activeCollection.value) {
                return;
            }

            updateCollectionName(activeCollection.value.id, name);
        };

        const updateActiveCollectionVariables = (
            variables: EnvironmentVariable[],
        ) => {
            if (!activeCollection.value) {
                return;
            }

            updateCollectionVariables(activeCollection.value.id, variables);
        };

        return {
            collections,
            activeCollectionId,
            nextVariableId,
            activeCollection,
            setActiveCollection,
            addCollection,
            removeCollection,
            updateCollectionName,
            updateCollectionVariables,
            updateActiveCollectionName,
            updateActiveCollectionVariables,
        };
    },
    {
        persist: true,
    },
);
