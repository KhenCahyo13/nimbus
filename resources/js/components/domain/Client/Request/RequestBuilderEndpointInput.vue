<script setup lang="ts">
/**
 * @component RequestBuilderEndpointInput
 * @description The endpoint input field and send button for the request builder.
 */
import { AppButton } from '@/components/base/button';
import { AppInput } from '@/components/base/input';
import {
    AppPopover,
    AppPopoverAnchor,
    AppPopoverContent,
} from '@/components/base/popover';
import { useRoutePlaceholderDetection } from '@/composables/request/useRoutePlaceholderDetection';
import { useRouteSegmentSelection } from '@/composables/request/useRouteSegmentSelection';
import { useEnvironmentVariablesStore, useRequestStore } from '@/stores';
import {
    createEnvironmentVariablesMap,
    EnvironmentPlaceholderStatus,
    getEnvironmentPlaceholderStatus,
} from '@/utils/request';
import { CornerDownLeftIcon } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import RequestBuilderEndpointPlaceholderWarningContent from './RequestBuilderEndpointPlaceholderWarningContent.vue';

/*
 * Stores.
 */

const requestStore = useRequestStore();
const environmentVariablesStore = useEnvironmentVariablesStore();

/*
 * State.
 */

const showPlaceholderWarning = ref(false);

/*
 * Computed & Methods.
 */

const pendingRequestData = computed(() => requestStore.pendingRequestData);

const endpoint = computed({
    get: () => pendingRequestData.value?.endpoint ?? '',
    set: (value: string) => requestStore.updateRequestEndpoint(value),
});

const { placeholders, hasPlaceholders } = useRoutePlaceholderDetection(endpoint);
const activeVariablesMap = computed(() =>
    createEnvironmentVariablesMap(
        environmentVariablesStore.activeCollection?.variables ?? [],
    ),
);
const endpointPlaceholderStatus = computed(() => {
    const activeVariables = environmentVariablesStore.activeCollection?.variables ?? [];

    return getEnvironmentPlaceholderStatus(
        endpoint.value,
        activeVariables,
        activeVariablesMap.value,
    );
});

const { handleClick: autoSelectRouteVariableSegmentWhenApplicable } =
    useRouteSegmentSelection({ endpoint });

const executeCurrentRequest = async function () {
    if (!requestStore.pendingRequestData) {
        return;
    }

    if (hasPlaceholders.value) {
        showPlaceholderWarning.value = true;

        return;
    }

    showPlaceholderWarning.value = false;

    await requestStore.executeCurrentRequest();
};

const executeCurrentRequestWhenEnterIsPressed = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') {
        return;
    }

    event.preventDefault();
    executeCurrentRequest();
};
</script>

<template>
    <div class="flex flex-1 items-center">
        <AppInput
            v-model="endpoint"
            variant="toolbar"
            class="h-full flex-1 text-xs"
            :class="{
                'text-destructive': endpointPlaceholderStatus === EnvironmentPlaceholderStatus.Missing,
                'text-warning': endpointPlaceholderStatus === EnvironmentPlaceholderStatus.Empty,
                'text-primary': endpointPlaceholderStatus === EnvironmentPlaceholderStatus.Resolved,
            }"
            placeholder="<endpoint>"
            data-testid="endpoint-input"
            @click="autoSelectRouteVariableSegmentWhenApplicable"
            @keydown="executeCurrentRequestWhenEnterIsPressed"
        />
        <div class="flex gap-2 pr-2">
            <AppPopover v-model:open="showPlaceholderWarning">
                <AppPopoverAnchor as-child>
                    <AppButton
                        size="xs"
                        :disabled="
                            !pendingRequestData || pendingRequestData?.isProcessing
                        "
                        class="gap-0"
                        @click="executeCurrentRequest"
                    >
                        Send (
                        <CornerDownLeftIcon class="size-3 px-0" />
                        )
                    </AppButton>
                </AppPopoverAnchor>

                <AppPopoverContent align="start" class="w-80 p-1">
                    <RequestBuilderEndpointPlaceholderWarningContent
                        :placeholders="placeholders"
                    />
                </AppPopoverContent>
            </AppPopover>

            <slot name="options-menu" />
        </div>
    </div>
</template>
