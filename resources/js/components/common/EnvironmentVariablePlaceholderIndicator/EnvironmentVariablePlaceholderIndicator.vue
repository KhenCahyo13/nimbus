<script setup lang="ts">
/**
 * @component EnvironmentVariablePlaceholderIndicator
 * @description Wraps an element with a hover popover showing environment variable placeholder status.
 */
import {
    AppPopover,
    AppPopoverAnchor,
    AppPopoverContent,
} from '@/components/base/popover';
import { EnvironmentPlaceholderStatus } from '@/utils/request';
import { ref } from 'vue';

/*
 * Types & Interfaces.
 */

export interface AppEnvironmentVariablePlaceholderIndicatorProps {
    status: EnvironmentPlaceholderStatus;
}

/*
 * Component Setup.
 */

const props = defineProps<AppEnvironmentVariablePlaceholderIndicatorProps>();

/*
 * State.
 */

const isOpen = ref(false);

/*
 * Computed & Methods.
 */

const handleMouseEnter = () => {
    if (props.status !== EnvironmentPlaceholderStatus.None) {
        isOpen.value = true;
    }
};

const handleMouseLeave = () => {
    isOpen.value = false;
};
</script>

<template>
    <AppPopover v-model:open="isOpen">
        <AppPopoverAnchor as-child>
            <slot :on-mouseenter="handleMouseEnter" :on-mouseleave="handleMouseLeave" />
        </AppPopoverAnchor>

        <AppPopoverContent
            v-if="status !== EnvironmentPlaceholderStatus.None"
            side="top"
            class="w-60 space-y-1"
        >
            <template v-if="status === EnvironmentPlaceholderStatus.Missing">
                <p class="text-destructive text-sm font-medium">Variable not found</p>
                <p class="text-muted-foreground text-xs">
                    This field contains a placeholder referencing a variable that is not
                    defined in the active environment collection.
                </p>
            </template>

            <template v-else-if="status === EnvironmentPlaceholderStatus.Empty">
                <p class="text-warning text-sm font-medium">Variable is empty</p>
                <p class="text-muted-foreground text-xs">
                    This field contains a placeholder referencing a variable that exists
                    but has no value set.
                </p>
            </template>

            <template v-else-if="status === EnvironmentPlaceholderStatus.Resolved">
                <p class="text-primary text-sm font-medium">Variable resolved</p>
                <p class="text-muted-foreground text-xs">
                    All placeholders in this field have been resolved from the active
                    environment collection.
                </p>
            </template>
        </AppPopoverContent>
    </AppPopover>
</template>
