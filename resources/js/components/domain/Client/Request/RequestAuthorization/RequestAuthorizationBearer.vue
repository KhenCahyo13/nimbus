<script setup lang="ts">
/**
 * @component RequestAuthorizationBearer
 * @description Input field for Bearer Token authentication.
 */
import { AppInput } from '@/components/base/input';
import { EnvironmentVariablePlaceholderIndicator } from '@/components/common/EnvironmentVariablePlaceholderIndicator';
import {
    EnvironmentPlaceholderStatus,
    getEnvironmentPlaceholderStatus,
} from '@/utils/request';
import { activeVariables, activeVariablesMap } from '@/utils/ui/environment-variable';
import { computed, type ModelRef } from 'vue';

/*
 * Types & Interfaces.
 */

export interface AppRequestAuthorizationBearerProps {}

/*
 * Component Setup.
 */

defineProps<AppRequestAuthorizationBearerProps>();

const model: ModelRef<string> = defineModel<string>({
    default: () => '',
});

const modelPlaceholderStatus = computed(() =>
    getEnvironmentPlaceholderStatus(
        model.value,
        activeVariables.value,
        activeVariablesMap.value,
    ),
);
</script>

<template>
    <div class="grid h-8 grid-cols-3 border-b">
        <label class="px-panel flex h-8 items-center border-r py-1 text-xs" for="bearer">
            Bearer Token
        </label>
        <EnvironmentVariablePlaceholderIndicator
            v-slot="{ onMouseenter, onMouseleave }"
            :status="modelPlaceholderStatus"
        >
            <AppInput
                id="bearer"
                v-model="model"
                placeholder="Token"
                class="col-span-2 h-full rounded-none border-0 text-xs shadow-none focus:ring-0 focus-visible:ring-0"
                :class="{
                    'text-destructive':
                        modelPlaceholderStatus === EnvironmentPlaceholderStatus.Missing,
                    'text-warning':
                        modelPlaceholderStatus === EnvironmentPlaceholderStatus.Empty,
                    'text-primary':
                        modelPlaceholderStatus === EnvironmentPlaceholderStatus.Resolved,
                }"
                @mouseenter="onMouseenter"
                @mouseleave="onMouseleave"
            />
        </EnvironmentVariablePlaceholderIndicator>
    </div>
</template>
