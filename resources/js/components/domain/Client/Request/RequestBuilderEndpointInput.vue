<script setup lang="ts">
/**
 * @component RequestBuilderEndpointInput
 * @description The endpoint input field and send button for the request builder.
 *
 * This component utilizes Equation's EnvironmentAwareInput to provide rich text
 * highlighting for path segments and environment variables while maintaining
 * native input features like caret stability and scrolling.
 */
import { AppButton } from '@/components/base/button';
import {
    AppPopover,
    AppPopoverAnchor,
    AppPopoverContent,
} from '@/components/base/popover';
import EnvironmentAwareInput from '@/components/common/EnvironmentAwareInput.vue';

import { useRoutePlaceholderDetection } from '@/composables/request/useRoutePlaceholderDetection';
import { useRouteSegmentSelection } from '@/composables/request/useRouteSegmentSelection';
import type { ResolvableString } from '@/interfaces/http';
import { useRequestStore } from '@/stores';
import { CornerDownLeftIcon } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import RequestBuilderEndpointPlaceholderWarningContent from './RequestBuilderEndpointPlaceholderWarningContent.vue';

/*
 * Stores.
 */

const requestStore = useRequestStore();

/*
 * State.
 */

const showPlaceholderWarning = ref(false);
const pendingRequestData = computed(() => requestStore.pendingRequestData);

const endpoint = computed({
    get: () => pendingRequestData.value?.endpoint ?? { raw: '', resolved: '' },
    set: (value: ResolvableString) => requestStore.updateRequestEndpoint(value),
});

const { placeholders, hasPlaceholders } = useRoutePlaceholderDetection(endpoint);

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
    <div class="flex min-w-0 flex-1 items-center">
        <!-- Endpoint Input with Rich Env Variables Highlighting -->
        <EnvironmentAwareInput
            v-model="endpoint"
            variant="toolbar"
            class="h-full flex-1 text-xs"
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
