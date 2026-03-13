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

export const getValueInputClass = (parameter: ParameterContract) => {
    const status = getEnvironmentPlaceholderStatus(
        parameter.value,
        activeVariables.value,
        activeVariablesMap.value,
    );

    return {
        'text-destructive': status === EnvironmentPlaceholderStatus.Missing,
        'text-warning': status === EnvironmentPlaceholderStatus.Empty,
        'text-primary': status === EnvironmentPlaceholderStatus.Resolved,
    };
};