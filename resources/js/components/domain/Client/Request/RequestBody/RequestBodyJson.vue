<script setup lang="ts">
/**
 * @component RequestBodyJson
 * @description JSON content editor for request bodies, with schema validation support.
 */
import CodeEditor from '@/components/domain/CodeEditor/CodeEditor.vue';
import { environmentPlaceholderHighlightExtension } from '@/components/domain/CodeEditor/extensions';
import { useEnvironmentVariablesStore } from '@/stores';
import type { JSONSchema7 } from 'json-schema';
import { computed } from 'vue';

/*
 * Types & Interfaces.
 */

export interface AppRequestBodyJsonProps {
    schema: JSONSchema7 | undefined;
}

/*
 * Component Setup.
 */

defineProps<AppRequestBodyJsonProps>();

const model = defineModel<string>({
    default: () => '',
});

const environmentVariablesStore = useEnvironmentVariablesStore();

const customExtensions = computed(() => {
    const variables = environmentVariablesStore.activeCollection?.variables ?? [];

    return [environmentPlaceholderHighlightExtension(variables)];
});
</script>

<template>
    <CodeEditor
        v-model="model"
        language="json"
        :readonly="false"
        placeholder="Your JSON Payload"
        :validation-schema="schema"
        :custom-extensions="customExtensions"
    />
</template>
