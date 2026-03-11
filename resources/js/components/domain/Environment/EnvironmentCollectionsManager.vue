<script setup lang="ts">
import { AppButton } from '@/components/base/button';
import { AppBadge } from '@/components/base/badge';
import {
    AppCard,
    AppCardContent,
    AppCardDescription,
    AppCardHeader,
    AppCardTitle,
} from '@/components/base/card';
import { AppInput } from '@/components/base/input';
import KeyValueParameters from '@/components/common/KeyValueParameters/KeyValueParameters.vue';
import {
    createEnvironmentVariablesMap,
    EnvironmentPlaceholderStatus,
    getEnvironmentPlaceholderStatus,
} from '@/utils/request';
import type { ParameterContract } from '@/interfaces/ui';
import type { EnvironmentVariable } from '@/stores/core/useEnvironmentVariablesStore';
import { useEnvironmentVariablesStore } from '@/stores';
import { Trash2Icon } from 'lucide-vue-next';
import { computed } from 'vue';

const environmentVariablesStore = useEnvironmentVariablesStore();

const collections = computed(() => environmentVariablesStore.collections);
const activeCollection = computed(() => environmentVariablesStore.activeCollection);
const activeCollectionId = computed({
    get: () => environmentVariablesStore.activeCollectionId,
    set: (value: string | null) => environmentVariablesStore.setActiveCollection(value),
});

const hasCollections = computed(() => collections.value.length > 0);

const activeCollectionVariables = computed(() => activeCollection.value?.variables ?? []);
const activeVariablesMap = computed(() =>
    createEnvironmentVariablesMap(activeCollectionVariables.value),
);

const handleCollectionNameUpdate = (name: string | number) => {
    environmentVariablesStore.updateActiveCollectionName(String(name));
};

const handleVariablesUpdate = (variables: EnvironmentVariable[]) => {
    environmentVariablesStore.updateActiveCollectionVariables(variables);
};

const handleCollectionSelect = (collectionId: string) => {
    activeCollectionId.value = collectionId;
};

const getValueInputClass = (parameter: ParameterContract) => {
    const status = getEnvironmentPlaceholderStatus(
        parameter.value,
        activeCollectionVariables.value,
        activeVariablesMap.value,
    );

    return {
        'text-destructive': status === EnvironmentPlaceholderStatus.Missing,
        'text-warning': status === EnvironmentPlaceholderStatus.Empty,
        'text-primary': status === EnvironmentPlaceholderStatus.Resolved,
    };
};
</script>

<template>
    <div class="h-full overflow-auto p-panel">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AppCard class="h-fit lg:col-span-1">
                <AppCardHeader>
                    <AppCardTitle>Collections</AppCardTitle>
                    <AppCardDescription>
                        Select an active environment collection.
                    </AppCardDescription>
                </AppCardHeader>
                <AppCardContent class="space-y-2">
                    <p
                        v-if="!hasCollections"
                        class="text-subtle-foreground text-center text-sm"
                    >
                        No collections yet. Create one to start managing variables.
                    </p>

                    <button
                        v-for="collection in collections"
                        :key="collection.id"
                        type="button"
                        class="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors"
                        :class="
                            activeCollectionId === collection.id
                                ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-200 dark:bg-zinc-800'
                                : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                        "
                        @click="handleCollectionSelect(collection.id)"
                    >
                        <div class="flex items-center justify-between gap-2">
                            <div class="font-medium">{{ collection.name }}</div>
                            <AppBadge
                                v-if="activeCollectionId === collection.id"
                                variant="secondary"
                            >
                                Used
                            </AppBadge>
                        </div>
                        <div class="text-subtle-foreground text-xs">
                            {{ collection.variables.length }} variables
                        </div>
                    </button>
                </AppCardContent>
            </AppCard>

            <AppCard class="h-fit lg:col-span-2">
                <AppCardHeader>
                    <AppCardTitle>Environment Details</AppCardTitle>
                    <AppCardDescription>
                        Edit collection and variables. Changes are persisted
                        automatically.
                    </AppCardDescription>
                </AppCardHeader>
                <AppCardContent>
                    <p
                        v-if="!activeCollection"
                        class="text-subtle-foreground py-6 text-center text-sm"
                    >
                        No collection selected. Add or select a collection first.
                    </p>

                    <template v-else>
                        <div class="mb-4 flex items-center gap-2">
                            <AppInput
                                :model-value="activeCollection.name"
                                placeholder="Collection name"
                                class="flex-1"
                                @update:model-value="handleCollectionNameUpdate"
                            />

                            <AppButton
                                size="default"
                                variant="outline"
                                @click="
                                    environmentVariablesStore.removeCollection(
                                        activeCollection.id,
                                    )
                                "
                            >
                                <Trash2Icon />
                                Delete
                            </AppButton>
                        </div>

                        <KeyValueParameters
                            :model-value="activeCollectionVariables"
                            :get-value-input-class="getValueInputClass"
                            @update:parameters="handleVariablesUpdate"
                        />
                    </template>
                </AppCardContent>
            </AppCard>
        </div>
    </div>
</template>
