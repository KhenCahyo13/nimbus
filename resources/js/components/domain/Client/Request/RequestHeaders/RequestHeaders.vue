<script setup lang="ts">
/**
 * @component RequestHeaders
 * @description Manages HTTP headers for the current request, initializing from global config as needed.
 */
import KeyValueParametersBuilder from '@/components/common/KeyValueParameters/KeyValueParameters.vue';
import PanelSubHeader from '@/components/layout/PanelSubHeader/PanelSubHeader.vue';
import type { GeneratorType } from '@/interfaces/http';
import { type SourceGlobalHeaders } from '@/interfaces/http';
import { type ParameterContract } from '@/interfaces/ui';
import { ParameterType } from '@/interfaces/ui/key-value-parameters';
import { useConfigStore, useEnvironmentVariablesStore, useRequestStore, useValueGeneratorStore } from '@/stores';
import {
    createEnvironmentVariablesMap,
    EnvironmentPlaceholderStatus,
    getEnvironmentPlaceholderStatus,
} from '@/utils/request';
import { generateValueFromType } from '@/utils/value-generator/generateValueFromType';
import { computed, onBeforeMount, type Ref, ref } from 'vue';

/*
 * Types & Interfaces.
 */

export interface AppRequestHeadersProps {}

/*
 * Component Setup.
 */

defineProps<AppRequestHeadersProps>();

/*
 * Stores.
 */

const requestStore = useRequestStore();
const configStore = useConfigStore();
const valueGeneratorStore = useValueGeneratorStore();
const environmentVariablesStore = useEnvironmentVariablesStore();

/*
 * State.
 */

const globalHeaders: Ref<ParameterContract[]> = ref([]);

/*
 * Computed & Methods.
 */

const pendingRequestData = computed(() => requestStore.pendingRequestData);

const syncHeadersWithPendingRequest = (headers: ParameterContract[]) => {
    requestStore.updateRequestHeaders(headers);
};

const currentRequestHeaders = computed<ParameterContract[]>(
    () => pendingRequestData.value?.headers ?? [],
);

const effectiveHeaders = computed<ParameterContract[]>(() => {
    const currentHeaders = currentRequestHeaders.value;

    if (currentHeaders.length === 0) {
        return globalHeaders.value;
    }

    // Don't mess up with the current headers if the pending request have them already.
    // They can be coming from history re-wind or persisted state.
    return currentHeaders;
});

const handleHeadersUpdate = (parameters: ParameterContract[]) => {
    syncHeadersWithPendingRequest(parameters);
};

const activeVariables = computed(
    () => environmentVariablesStore.activeCollection?.variables ?? [],
);
const activeVariablesMap = computed(() =>
    createEnvironmentVariablesMap(activeVariables.value),
);
const getValueInputClass = (parameter: ParameterContract) => {
    const status = getEnvironmentPlaceholderStatus(
        parameter.value,
        activeVariables.value,
        activeVariablesMap.value,
    );

    return {
        'text-destructive': status === EnvironmentPlaceholderStatus.Missing,
        'text-warning': status === EnvironmentPlaceholderStatus.Empty,
        'text-primary': status === EnvironmentPlaceholderStatus.Resolved,
    };
};

/*
 * Lifecycle.
 */

onBeforeMount(() => {
    globalHeaders.value = configStore.headers.map(
        (globalHeader: SourceGlobalHeaders): ParameterContract => ({
            type: ParameterType.Text,
            key: globalHeader.header,
            value:
                globalHeader.type === 'generator'
                    ? generateValueFromType(
                          globalHeader.value as GeneratorType,
                          valueGeneratorStore,
                      )
                    : String(globalHeader.value),
            enabled: true,
        }),
    );
});
</script>

<template>
    <PanelSubHeader class="border-b">Request Headers</PanelSubHeader>
    <KeyValueParametersBuilder
        ref="parametersBuilder"
        :model-value="effectiveHeaders"
        :get-value-input-class="getValueInputClass"
        @update:parameters="handleHeadersUpdate"
    />
</template>
