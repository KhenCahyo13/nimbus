<script setup lang="ts">
import {
    AppPopover,
    AppPopoverAnchor,
    AppPopoverContent,
} from '@/components/base/popover';
import { EnvironmentPlaceholderStatus } from '@/utils/request';
import { computed, ref } from 'vue';

/*
 * Types & Interfaces.
 */

export interface AppEnvironmentVariablePlaceholderIndicatorProps {
    status: EnvironmentPlaceholderStatus;
    alignOffset?: number;
    variableKey?: string;
    variableValue?: string;
    externalOpen?: boolean;
}

/*
 * Component Setup.
 */

const props = withDefaults(
    defineProps<AppEnvironmentVariablePlaceholderIndicatorProps>(),
    {
        variableKey: undefined,
        variableValue: undefined,
        alignOffset: 0,
        externalOpen: undefined,
    },
);

/*
 * State.
 */

const internalOpen = ref(false);

const isOpen = computed({
    get: () => props.externalOpen ?? internalOpen.value,
    set: value => {
        internalOpen.value = value;
    },
});

/*
 * Computed & Methods.
 */

const handleMouseEnter = () => {
    if (props.status !== EnvironmentPlaceholderStatus.None) {
        internalOpen.value = true;
    }
};

const handleMouseLeave = () => {
    internalOpen.value = false;
};
</script>

<template>
    <AppPopover v-model:open="isOpen">
        <AppPopoverAnchor as-child>
            <slot :on-mouseenter="handleMouseEnter" :on-mouseleave="handleMouseLeave" />
        </AppPopoverAnchor>

        <AppPopoverContent
            v-if="status !== EnvironmentPlaceholderStatus.None"
            side="bottom"
            align="start"
            class="w-fit p-0 text-xs font-medium"
            :align-offset="alignOffset"
            :class="{
                'max-w-64': status !== EnvironmentPlaceholderStatus.Resolved,
            }"
        >
            <div
                :class="{
                    'p-panel': status !== EnvironmentPlaceholderStatus.Resolved,
                    'bg-gradient-to-tr from-blue-500/5 to-transparent to-50% p-1 py-0.5 dark:from-blue-700/30':
                        status === EnvironmentPlaceholderStatus.Resolved,
                    'bg-gradient-to-tr from-yellow-500/5 to-transparent to-50% py-0.5 dark:from-yellow-700/30':
                        status === EnvironmentPlaceholderStatus.Empty,
                    'bg-gradient-to-tr from-rose-500/5 to-transparent to-50% py-0.5 dark:from-rose-700/30':
                        status === EnvironmentPlaceholderStatus.Missing,
                }"
            >
                <p
                    v-if="status === EnvironmentPlaceholderStatus.Missing"
                    class="text-muted-foreground leading-tight"
                >
                    The referenced variable cannot be found in the selected collection.
                </p>
                <p
                    v-else-if="status === EnvironmentPlaceholderStatus.Empty"
                    class="text-muted-foreground leading-tight"
                >
                    The referenced variable is found, but its value is empty.
                </p>
                <span v-else>&lt;{{ variableValue }}&gt;</span>
            </div>
        </AppPopoverContent>
    </AppPopover>
</template>
