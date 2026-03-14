import { computed } from "vue";
import { createEnvironmentVariablesMap, EnvironmentPlaceholderStatus, getEnvironmentPlaceholderStatus } from "../request";
import { ParameterContract } from "@/interfaces";
import { useEnvironmentVariablesStore } from "@/stores";

export const activeVariables = computed(
    () => useEnvironmentVariablesStore().activeCollection?.variables ?? [],
);

export const activeVariablesMap = computed(() =>
    createEnvironmentVariablesMap(activeVariables.value),
);

export const getValueInputStatus = (parameter: ParameterContract): EnvironmentPlaceholderStatus => {
    return getEnvironmentPlaceholderStatus(
        parameter.value,
        activeVariables.value,
        activeVariablesMap.value,
    );
};