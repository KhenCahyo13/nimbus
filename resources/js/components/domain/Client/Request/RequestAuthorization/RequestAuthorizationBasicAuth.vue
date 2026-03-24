<script setup lang="ts">
/**
 * @component RequestAuthorizationBasicAuth
 * @description Input fields for Basic Authentication (username/password).
 */
import { AppInput } from '@/components/base/input';
import { EnvironmentVariablePlaceholderIndicator } from '@/components/common/EnvironmentVariablePlaceholderIndicator';
import {
    EnvironmentPlaceholderStatus,
    getEnvironmentPlaceholderStatus,
} from '@/utils/request';
import { activeVariables, activeVariablesMap } from '@/utils/ui/environment-variable';
import { computed, ref, watch } from 'vue';

/*
 * Types & Interfaces.
 */

export type AppRequestAuthorizationBasicAuthModel = {
    username: string;
    password: string;
};

export interface AppRequestAuthorizationBasicAuthProps {}

export interface AppRequestAuthorizationBasicAuthEmits {
    (e: 'update:modelValue', value: AppRequestAuthorizationBasicAuthModel): void;
}

/*
 * Component Setup.
 */

defineProps<AppRequestAuthorizationBasicAuthProps>();
const emit = defineEmits<AppRequestAuthorizationBasicAuthEmits>();

const model = defineModel<AppRequestAuthorizationBasicAuthModel>({
    default: () => ({
        username: '',
        password: '',
    }),
});

/*
 * State.
 */

const username = ref(model.value.username);
const password = ref(model.value.password);

const usernamePlaceholderStatus = computed(() =>
    getEnvironmentPlaceholderStatus(
        username.value,
        activeVariables.value,
        activeVariablesMap.value,
    ),
);

const passwordPlaceholderStatus = computed(() =>
    getEnvironmentPlaceholderStatus(
        password.value,
        activeVariables.value,
        activeVariablesMap.value,
    ),
);

/*
 * Watchers.
 */

watch(username, newValue => {
    model.value.username = newValue;
    emit('update:modelValue', model.value);
});

watch(password, newValue => {
    model.value.password = newValue;
    emit('update:modelValue', model.value);
});
</script>

<template>
    <div class="grid h-8 grid-cols-3 border-b">
        <label
            class="px-panel flex h-8 items-center border-r py-1 text-xs"
            for="username"
        >
            Username
        </label>
        <EnvironmentVariablePlaceholderIndicator
            v-slot="{ onMouseenter, onMouseleave }"
            :status="usernamePlaceholderStatus"
        >
            <AppInput
                id="username"
                v-model="username"
                placeholder="-"
                class="col-span-2 h-full rounded-none border-0 text-xs shadow-none focus:ring-0 focus-visible:ring-0"
                :class="{
                    'text-destructive':
                        usernamePlaceholderStatus ===
                        EnvironmentPlaceholderStatus.Missing,
                    'text-warning':
                        usernamePlaceholderStatus === EnvironmentPlaceholderStatus.Empty,
                    'text-primary':
                        usernamePlaceholderStatus ===
                        EnvironmentPlaceholderStatus.Resolved,
                }"
                @mouseenter="onMouseenter"
                @mouseleave="onMouseleave"
            />
        </EnvironmentVariablePlaceholderIndicator>
    </div>
    <div class="grid h-8 grid-cols-3 border-b">
        <label
            class="px-panel flex h-8 items-center border-r py-1 text-xs"
            for="password"
        >
            Password
        </label>
        <EnvironmentVariablePlaceholderIndicator
            v-slot="{ onMouseenter, onMouseleave }"
            :status="passwordPlaceholderStatus"
        >
            <AppInput
                id="password"
                v-model="password"
                placeholder="-"
                class="col-span-2 h-full rounded-none border-0 text-xs shadow-none focus:ring-0 focus-visible:ring-0"
                :class="{
                    'text-destructive':
                        passwordPlaceholderStatus ===
                        EnvironmentPlaceholderStatus.Missing,
                    'text-warning':
                        passwordPlaceholderStatus === EnvironmentPlaceholderStatus.Empty,
                    'text-primary':
                        passwordPlaceholderStatus ===
                        EnvironmentPlaceholderStatus.Resolved,
                }"
                @mouseenter="onMouseenter"
                @mouseleave="onMouseleave"
            />
        </EnvironmentVariablePlaceholderIndicator>
    </div>
</template>
