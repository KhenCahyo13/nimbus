<script setup lang="ts">
/**
 * @component RequestBodyJson
 * @description JSON content editor for request bodies, with schema validation support.
 */
import CodeEditor from '@/components/domain/CodeEditor/CodeEditor.vue';
import { envVariablesCheck } from '@/components/domain/CodeEditor/extensions';
import type { ResolvableString } from '@/interfaces/http';
import { useEnvironmentVariablesStore } from '@/stores';
import { rawResolvableString } from '@/utils/request';
import {
    checkEnvVariable,
    replaceEnvVariablesInString,
} from '@/utils/request/environment-variable-resolver';
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

const model = defineModel<ResolvableString>({
    default: () => '',
});

const environmentVariablesStore = useEnvironmentVariablesStore();

const envVariablesMap = computed(() => {
    return environmentVariablesStore.variables;
});

const modelProxy = computed({
    get: () => rawResolvableString(model.value),
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
        language="json"
        :readonly="false"
        placeholder="Your JSON Payload"
        :validation-schema="schema"
        :custom-extensions="customExtensions"
    />
</template>
