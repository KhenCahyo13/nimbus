<script setup lang="ts">
import { AppButton } from '@/components/base/button';
import EnvironmentCollectionsManager from '@/components/domain/Environment/EnvironmentCollectionsManager.vue';
import PageLayout from '@/components/layout/PageLayout.vue';
import { useEnvironmentVariablesStore } from '@/stores';
import { Layers3Icon, PlusIcon } from 'lucide-vue-next';

defineOptions({
    name: 'EnvironmentPage',
});

const environmentVariablesStore = useEnvironmentVariablesStore();
</script>

<template>
    <PageLayout title="Environments" :icon="Layers3Icon">
        <template #subheader-left>
            <div>
                <span class="text-sm">Global application variables</span>
            </div>
        </template>

        <template #subheader-right>
            <AppButton
                variant="ghost"
                size="xs"
                @click="environmentVariablesStore.addCollection"
            >
                <PlusIcon />
                New Collection
            </AppButton>
        </template>

        <template #content>
            <div class="p-panel h-full overflow-auto">
                <div class="max-w-6xl">
                    <EnvironmentCollectionsManager />
                </div>
            </div>
        </template>
    </PageLayout>
</template>
