import { type ParameterContract, ParameterType } from '@/interfaces/ui';
import { defineStore } from 'pinia';
import { computed, onMounted, ref } from 'vue';

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
        const nextVariableId = ref(0); // todo use usevue counter here
        const isPickingCollectionName = ref<boolean>(false);

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

        const variables = computed(() => {
            return activeCollection.value?.variables ?? [];
        });

        const setActiveCollection = (collectionId: string | null) => {
            activeCollectionId.value = collectionId;
        };

        const addCollection = () => {
            const collection = createDefaultCollection(collections.value.length + 1);
            collection.variables = [createEmptyVariable()];

            collections.value.push(collection);
            activeCollectionId.value = collection.id;

            isPickingCollectionName.value = true;
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

            sealNewCollectionName();
        };

        const updateActiveCollectionVariables = (variables: EnvironmentVariable[]) => {
            if (!activeCollection.value) {
                return;
            }

            updateCollectionVariables(activeCollection.value.id, variables);
        };

        const sealNewCollectionName = () => {
            isPickingCollectionName.value = false;
        };

        onMounted(() => (isPickingCollectionName.value = false));

        return {
            collections,
            activeCollectionId,
            nextVariableId,
            activeCollection,
            variables,
            isPickingCollectionName,
            setActiveCollection,
            sealNewCollectionName,
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
