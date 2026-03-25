<script setup lang="ts">
/**
 * @component RequestBuilderEndpointInput
 * @description The endpoint input field and send button for the request builder.
 *
 * This component utilizes a "Dual-Layer Mirrored Input" pattern:
 * - Layer 1 (Top): A standard <input> (AppInput) with transparent text. It handles all
 *   native interactions like typing, caret placement, selection, and scrolling.
 * - Layer 2 (Bottom): A mirrored <div> that renders the text with rich styling,
 *   including syntax highlighting for path segments and environment variable placeholders.
 * - Layer 3 (Overlays): Gradient masks for horizontal scrolling and popover indicators.
 */
import { AppButton } from '@/components/base/button';
import { AppInput } from '@/components/base/input';
import {
    AppPopover,
    AppPopoverAnchor,
    AppPopoverContent,
} from '@/components/base/popover';
import { EnvironmentVariablePlaceholderIndicator } from '@/components/common/EnvironmentVariablePlaceholderIndicator';
import { useRoutePlaceholderDetection } from '@/composables/request/useRoutePlaceholderDetection';
import { useRouteSegmentSelection } from '@/composables/request/useRouteSegmentSelection';
import { useTabHorizontalScroll } from '@/composables/ui/useTabHorizontalScroll';
import { useRequestStore } from '@/stores';
import {
    EnvironmentPlaceholderStatus,
    getEndpointSegments,
    getPlaceholderStatus,
    getResolvedPlaceholder,
} from '@/utils/request';
import { activeVariables, activeVariablesMap } from '@/utils/ui/environment-variable';
import { CornerDownLeftIcon } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import RequestBuilderEndpointPlaceholderWarningContent from './RequestBuilderEndpointPlaceholderWarningContent.vue';

/*
 * Stores.
 */

const requestStore = useRequestStore();

/*
 * State.
 */

const showPlaceholderWarning = ref(false);

/**
 * The index of the segment currently being hovered.
 * Used to trigger tooltips on the mirrored layer behind the input.
 */
const activeIndicatorIndex = ref<number | null>(null);

/*
 * Computed & Methods.
 */

const pendingRequestData = computed(() => requestStore.pendingRequestData);

const endpoint = computed({
    get: () => pendingRequestData.value?.endpoint ?? '',
    set: (value: string) => requestStore.updateRequestEndpoint(value),
});

const segments = computed(() => {
    return getEndpointSegments(endpoint.value).map(segment => ({
        ...segment,
        status: segment.isPlaceholder
            ? getPlaceholderStatus(
                  segment.text,
                  activeVariables.value,
                  activeVariablesMap.value,
              )
            : EnvironmentPlaceholderStatus.None,
        resolved: segment.isPlaceholder
            ? getResolvedPlaceholder(
                  segment.text,
                  activeVariables.value,
                  activeVariablesMap.value,
              )
            : null,
    }));
});

const { placeholders, hasPlaceholders } = useRoutePlaceholderDetection(endpoint);

const { handleClick: autoSelectRouteVariableSegmentWhenApplicable } =
    useRouteSegmentSelection({ endpoint });

const {
    scrollContainer,
    showLeftMask,
    showRightMask,
    updateScrollMasks: updateHorizontalScrollMasks,
} = useTabHorizontalScroll({
    SCROLL_THRESHOLD: 2,
});

/*
 * Refs.
 */

const inputRef = ref<typeof AppInput | null>(null);
const mirrorRef = ref<HTMLDivElement | null>(null);

/*
 * Syncing logic for horizontal scrolling.
 */

const handleScroll = (event: Event) => {
    // Keep the gradient masks in sync with the current scroll position.
    updateHorizontalScrollMasks();

    // Sync the mirrored background's horizontal scroll with the actual input.
    if (mirrorRef.value && event.target instanceof HTMLInputElement) {
        mirrorRef.value.scrollLeft = event.target.scrollLeft;
    }
};

/**
 * Handles mouse movement over the transparent input field to detect if the user
 * is hovering over a rich-text segment (like an environment variable) in the layer behind.
 *
 * This uses a "Hover-through" technique:
 * 1. Temporarily disable pointers on the top layer (Input).
 * 2. Temporarily enable pointers on the background layer (Mirror).
 * 3. Identify the element under the cursor.
 * 4. Restore the original pointer-event states.
 */
const handleMouseMove = (event: MouseEvent) => {
    const el = inputRef.value?.$el || inputRef.value;
    if (!el) {
        return;
    }

    // Temporarily disable pointer events on the input and enable them on the mirror to detect segments
    el.style.pointerEvents = 'none';
    if (mirrorRef.value) {
        mirrorRef.value.style.pointerEvents = 'auto';
    }

    const underneath = document.elementFromPoint(event.clientX, event.clientY);

    el.style.pointerEvents = 'auto';
    if (mirrorRef.value) {
        mirrorRef.value.style.pointerEvents = 'none';
    }

    const segmentSpan = underneath?.closest('[data-segment-index]');

    if (segmentSpan) {
        activeIndicatorIndex.value = parseInt(
            segmentSpan.getAttribute('data-segment-index') || '-1',
        );
    } else {
        activeIndicatorIndex.value = null;
    }
};

const handleMouseLeave = () => {
    activeIndicatorIndex.value = null;
};

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

onMounted(() => {
    if (inputRef.value) {
        scrollContainer.value = inputRef.value.$el || inputRef.value;
        updateHorizontalScrollMasks();
    }
});

watch(endpoint, () => {
    updateHorizontalScrollMasks();
});
</script>

<template>
    <div class="flex min-w-0 flex-1 items-center">
        <div class="relative flex h-full min-w-0 flex-1 items-center">
            <!-- Actual Input (Transparent text) - TOP LAYER -->
            <AppInput
                ref="inputRef"
                v-model="endpoint"
                variant="toolbar"
                class="caret-foreground relative z-10 h-full flex-1 bg-transparent font-mono text-xs text-transparent"
                placeholder="<endpoint>"
                data-testid="endpoint-input"
                @scroll="handleScroll"
                @mousemove="handleMouseMove"
                @mouseleave="handleMouseLeave"
                @click="autoSelectRouteVariableSegmentWhenApplicable"
                @keydown="executeCurrentRequestWhenEnterIsPressed"
                @input="handleScroll"
            />

            <!-- Mirrored Background for Rich Display - BOTTOM LAYER -->
            <div
                ref="mirrorRef"
                class="pointer-events-none absolute inset-x-0 inset-y-0 z-0 flex items-center overflow-hidden bg-transparent px-3 font-mono text-xs whitespace-nowrap"
            >
                <template v-for="(segment, index) in segments" :key="index">
                    <EnvironmentVariablePlaceholderIndicator
                        v-if="segment.isPlaceholder"
                        :status="segment.status"
                        :variable-key="segment.resolved?.key"
                        :variable-value="segment.resolved?.value"
                        :external-open="activeIndicatorIndex === index"
                    >
                        <span
                            :data-segment-index="index"
                            class="pointer-events-auto font-medium transition-colors"
                            :class="{
                                'bg-destructive/20 text-destructive':
                                    segment.status ===
                                    EnvironmentPlaceholderStatus.Missing,
                                'bg-warning/20 text-warning':
                                    segment.status === EnvironmentPlaceholderStatus.Empty,
                                'bg-primary/10 text-primary':
                                    segment.status ===
                                    EnvironmentPlaceholderStatus.Resolved,
                            }"
                        >
                            {{ segment.text }}
                        </span>
                    </EnvironmentVariablePlaceholderIndicator>
                    <span v-else class="text-foreground" :data-segment-index="index">
                        {{ segment.text }}
                    </span>
                </template>

                <!-- Extra space to prevent truncation jump -->
                <span class="inline-block w-4" />
            </div>

            <!-- Scroll Gradient Masks -->
            <div
                v-show="showLeftMask"
                class="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-20 w-8 bg-gradient-to-r to-transparent transition-opacity duration-200"
            />
            <div
                v-show="showRightMask"
                class="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-20 w-8 bg-gradient-to-l to-transparent transition-opacity duration-200"
            />
        </div>

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
