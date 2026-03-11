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
    <PageLayout title="Variables" :icon="Layers3Icon">
        <template #subheader-left>
            <p class="text-subtle-foreground text-xs">
                Manage environment collections for request variable substitution.
            </p>
        </template>

        <template #subheader-right>
            <AppButton size="xs" @click="environmentVariablesStore.addCollection">
                <PlusIcon />
                New Collection
            </AppButton>
        </template>

        <template #content>
            <EnvironmentCollectionsManager />
        </template>
    </PageLayout>
</template>
