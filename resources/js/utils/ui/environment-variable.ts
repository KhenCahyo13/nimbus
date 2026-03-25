import type { ParameterContract } from '@/interfaces';
import { useEnvironmentVariablesStore } from '@/stores';
import { computed } from 'vue';
import type { EnvironmentPlaceholderStatus } from '../request';
import {
    createEnvironmentVariablesMap,
    getEnvironmentPlaceholderStatus,
    getResolvedPlaceholder,
} from '../request';

export const activeVariables = computed(
    () => useEnvironmentVariablesStore().activeCollection?.variables ?? [],
);

export const activeVariablesMap = computed(() =>
    createEnvironmentVariablesMap(activeVariables.value),
);

export const getValueInputStatus = (
    parameter: ParameterContract,
): EnvironmentPlaceholderStatus => {
    return getEnvironmentPlaceholderStatus(
        parameter.value,
        activeVariables.value,
        activeVariablesMap.value,
    );
};

export const getValueInputPlaceholder = (
    parameter: ParameterContract,
): { key: string; value: string } | null => {
    return getResolvedPlaceholder(
        parameter.value,
        activeVariables.value,
        activeVariablesMap.value,
    );
};
