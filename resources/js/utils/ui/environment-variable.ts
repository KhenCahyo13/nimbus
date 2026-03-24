import type { ParameterContract } from '@/interfaces';
import { useEnvironmentVariablesStore } from '@/stores';
import { computed } from 'vue';
import type { EnvironmentPlaceholderStatus } from '../request';
import {
    createEnvironmentVariablesMap,
    getEnvironmentPlaceholderStatus,
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
