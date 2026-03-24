<script setup lang="ts">
import { AppBadge } from '@/components/base/badge';
import { AppButton } from '@/components/base/button';
import AppRoundIndicator from '@/components/base/round-indicator/AppRoundIndicator.vue';
import { AppTooltipWrapper } from '@/components/base/tooltip';
import KeyValueParametersBuilder from '@/components/common/KeyValueParameters/KeyValueParameters.vue';
import PanelSubHeader from '@/components/layout/PanelSubHeader/PanelSubHeader.vue';
import { useConfirmationAction } from '@/composables/ui/useConfirmationAction';
import { useEnvironmentVariablesStore } from '@/stores';
import type { EnvironmentVariable } from '@/stores/core/useEnvironmentVariablesStore';
import { templateRef } from '@vueuse/core';
import { LucideFolderPen, PlusIcon, Trash2Icon } from 'lucide-vue-next';
import { EditableInput, EditablePreview, EditableRoot } from 'reka-ui';
import { type ComponentPublicInstance, computed, nextTick, onMounted, ref, watch } from 'vue';

const environmentVariablesStore = useEnvironmentVariablesStore();

const collections = computed(() => environmentVariablesStore.collections);
const activeCollection = computed(() => environmentVariablesStore.activeCollection);
const isPickingCollectionName = computed(
    () => environmentVariablesStore.isPickingCollectionName,
);
const activeCollectionId = computed({
    get: () => environmentVariablesStore.activeCollectionId,
    set: (value: string | null) => environmentVariablesStore.setActiveCollection(value),
});

const hasCollections = computed(() => collections.value.length > 0);

const activeCollectionVariables = computed(() => activeCollection.value?.variables ?? []);

const isEditingCollectionName = ref(false);
const editingCollectionName = ref('');

const collectionNamePreviewInput = templateRef<ComponentPublicInstance>('collection-name-preview');

const {
    isConfirming: isConfirmingRemoval,
    trigger: triggerRemovalConfirmation,
    cancel: cancelRemovalConfirmation,
} = useConfirmationAction({
    duration: 3000, // 3 seconds
});

const handleVariablesUpdate = (variables: EnvironmentVariable[]) => {
    environmentVariablesStore.updateActiveCollectionVariables(variables);
};

const handleCollectionSelect = (collectionId: string) => {
    activeCollectionId.value = collectionId;
    cancelRemovalConfirmation();
};

const triggerCollectionNameEdit = async () => {
    if (!activeCollection.value) {
        return;
    }

    editingCollectionName.value = isPickingCollectionName.value
        ? ''
        : activeCollection.value.name;

    isEditingCollectionName.value = true;

    if (collectionNamePreviewInput.value?.$el instanceof HTMLElement) {
        collectionNamePreviewInput.value.$el.focus();
    }
};

const submitCollectionName = () => {
    if (editingCollectionName.value.trim()) {
        environmentVariablesStore.updateActiveCollectionName(editingCollectionName.value);
    }

    isEditingCollectionName.value = false;

    environmentVariablesStore.sealNewCollectionName();
};

const handleCollectionRemoval = () => {
    const collectionId = activeCollection.value?.id;

    if (!collectionId) {
        return;
    }

    triggerRemovalConfirmation(() => {
        environmentVariablesStore.removeCollection(collectionId);
    });
};

watch(
    [activeCollectionId, isPickingCollectionName],
    ([newId, picking], [oldId]) => {
        if (newId !== oldId) {
            isEditingCollectionName.value = false;
            editingCollectionName.value = activeCollection.value?.name ?? '';
        }

        if (picking) {
            nextTick(() => triggerCollectionNameEdit());
        }
    },
    { immediate: true },
);

onMounted(() => {
    if (activeCollection.value?.name === null) {
        triggerCollectionNameEdit();
    }
});
</script>

<template>
    <div class="mb-3">
        <h2 class="text-xl font-semibold">Collections</h2>
        <p class="text-subtle-foreground mb-1.5 text-sm leading-tight">
            These are namespaces and group of global variables that can be re-used across
            the application.
        </p>

        <p class="text-subtle-foreground text-xs leading-tight italic">
            Note: environment configuration is not shared between nimbus installations.
        </p>
    </div>
    <div class="flex flex-col items-start gap-2 md:flex-row">
        <div class="flex w-full max-w-xs flex-col space-y-2">
            <div
                v-if="!hasCollections"
                type="button"
                class="hover:bg-subtle w-full cursor-pointer rounded border text-left text-sm"
                @click="environmentVariablesStore.addCollection"
            >
                <div class="p-panel h-toolbar flex items-center gap-1.5">
                    <PlusIcon class="size-3" />
                    Add your first Collection
                </div>
            </div>

            <div
                v-for="collection in collections"
                :key="collection.id"
                type="button"
                class="p-panel hover:bg-subtle w-full cursor-pointer rounded border text-left text-sm"
                :class="{
                    'bg-subtle': activeCollectionId === collection.id,
                }"
                @click="handleCollectionSelect(collection.id)"
            >
                <div class="flex items-center gap-1.5">
                    <div class="flex-1 gap-1 leading-tight">
                        <div class="mb-0 font-medium">{{ collection.name }}</div>
                        <span class="text-xs">
                            {{ collection.variables.length }} variables
                        </span>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <AppBadge
                            v-if="activeCollectionId === collection.id"
                            variant="outline"
                            class="text-emerald-600"
                        >
                            Active
                        </AppBadge>
                        <AppRoundIndicator
                            v-if="activeCollectionId === collection.id"
                            class="text-emerald-600"
                        />
                        <AppRoundIndicator v-else class="text-subtle-foreground" />
                    </div>
                </div>
            </div>
        </div>
        <div class="relative flex-1 overflow-hidden rounded border border-b-0">
            <div
                v-if="!hasCollections"
                class="absolute top-0 left-0 z-10 h-full w-full bg-white/40"
            ></div>
            <div
                class="h-toolbar bg-subtle px-panel relative flex w-full items-center justify-between gap-1"
            >
                <div class="flex min-w-0 flex-1 items-center">
                    <EditableRoot
                        v-if="activeCollection"
                        v-model:edit-mode="isEditingCollectionName"
                        v-model="editingCollectionName"
                        placeholder="Collection name..."
                        class="flex w-full min-w-0 items-center"
                        @submit="submitCollectionName"
                    >
                        <EditablePreview
                            v-if="activeCollection"
                            ref="collection-name-preview"
                            class="-ml-1 cursor-text rounded px-1 text-sm font-medium transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                        >
                            {{ activeCollection.name }}
                        </EditablePreview>
                        <EditableInput
                            class="bg-info/5 w-full border-none p-0 text-sm font-medium focus:ring-0 focus:outline-none"
                        />
                    </EditableRoot>
                    <span v-else class="text-subtle-foreground text-xs">
                        [Collection name]
                    </span>
                </div>

                <div class="flex items-center gap-1">
                    <AppTooltipWrapper
                        value="Rename"
                        :on-click="triggerCollectionNameEdit"
                    >
                        <AppButton
                            size="xs"
                            class="size-7 shadow-none [&_svg]:size-3.5"
                            variant="outline"
                            :disabled="!activeCollection"
                        >
                            <LucideFolderPen />
                        </AppButton>
                    </AppTooltipWrapper>

                    <AppTooltipWrapper value="Delete" :on-click="handleCollectionRemoval">
                        <AppButton
                            size="xs"
                            class="group relative size-7 overflow-hidden shadow-none [&_svg]:size-3.5"
                            variant="outline"
                            :class="{
                                'text-rose-500 hover:text-rose-500':
                                    isConfirmingRemoval(),
                            }"
                            :disabled="!activeCollection"
                        >
                            <Trash2Icon class="relative z-10" />
                        </AppButton>
                    </AppTooltipWrapper>
                </div>
            </div>

            <PanelSubHeader class="border-y py-1.5">
                Variables defined below can be referenced with
                <span v-pre class="whitespace-nowrap text-violet-600">
                    {{ variable_key }}
                </span>
            </PanelSubHeader>

            <KeyValueParametersBuilder
                ref="parametersBuilder"
                :model-value="activeCollectionVariables"
                @update:parameters="handleVariablesUpdate"
            />
        </div>
    </div>
</template>
