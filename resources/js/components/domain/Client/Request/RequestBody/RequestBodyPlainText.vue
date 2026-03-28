<script setup lang="ts">
/**
 * @component RequestBodyPlainText
 * @description Plain text editor for request bodies.
 */
import CodeEditor from '@/components/domain/CodeEditor/CodeEditor.vue';
import { envVariablesCheck } from '@/components/domain/CodeEditor/extensions';
import type { ResolvableString } from '@/interfaces/common/resolvable';
import { useEnvironmentVariablesStore } from '@/stores';
import {
    checkEnvVariable,
    replaceEnvVariablesInString,
} from '@/utils/request/environment-variable-resolver';
import { computed } from 'vue';

/*
 * Types & Interfaces.
 */

export interface AppRequestBodyPlainTextProps {}

/*
 * Component Setup.
 */

defineProps<AppRequestBodyPlainTextProps>();

const model = defineModel<ResolvableString>({
    default: () => ({ raw: '', resolved: '' }),
});

const environmentVariablesStore = useEnvironmentVariablesStore();

const envVariablesMap = computed(() => {
    return environmentVariablesStore.variables;
});

const modelProxy = computed({
    get: () => model.value.raw,
    set: value => {
        model.value = {
            raw: value,
            resolved: replaceEnvVariablesInString(value, envVariablesMap.value),
        };
    },
});

const customExtensions = computed(() => {
    return [envVariablesCheck(match => checkEnvVariable(match, envVariablesMap.value))];
});
</script>

<template>
    <CodeEditor
        v-model="modelProxy"
        language="plain"
        :readonly="false"
        placeholder="Your Plain Text Content"
        :custom-extensions="customExtensions"
    />
</template>
