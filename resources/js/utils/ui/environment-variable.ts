import { computed } from "vue";
import { createEnvironmentVariablesMap, EnvironmentPlaceholderStatus, getEnvironmentPlaceholderStatus } from "../request";
import { ParameterContract } from "@/interfaces";
import { useEnvironmentVariablesStore } from "@/stores";

const environmentVariablesStore = useEnvironmentVariablesStore();

export const activeVariables = computed(
    () => environmentVariablesStore.activeCollection?.variables ?? [],
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