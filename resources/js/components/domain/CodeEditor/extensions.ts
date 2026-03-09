import { jsonLinter } from '@/components/domain/CodeEditor/jsonLinter';
import {
    EnvironmentPlaceholderStatus,
    type EnvironmentSubstitutionVariable,
    getEnvironmentPlaceholderStatus,
} from '@/utils/request';
import { json } from '@codemirror/lang-json';
import { type Diagnostic, lintGutter, linter } from '@codemirror/lint';
import { type Extension, EditorState } from '@codemirror/state';
import { jsonSchema } from 'codemirror-json-schema';
import type { JSONSchema7 } from 'json-schema';

export const jsonExtensions = (
    readonly: boolean,
    schema: JSONSchema7 | undefined,
): Extension[] => {
    const extensions = commonExtensions(readonly);

    extensions.push(json());

    if (schema !== undefined) {
        extensions.push(jsonSchema(schema));
    }

    if (!readonly) {
        extensions.push(jsonLinter);
    }

    return extensions;
};

export const commonExtensions = (readonly: boolean): Extension[] => {
    const extensions = [lintGutter()];

    if (readonly) {
        extensions.push(EditorState.readOnly.of(true));
    }

    return extensions;
};

export const fallbackExtensions = (readonly: boolean): Extension[] =>
    commonExtensions(readonly);

const placeholderPattern = /{{\s*([^{}]+?)\s*}}/g;

export const environmentPlaceholderHighlightExtension = (
    variables: EnvironmentSubstitutionVariable[],
): Extension => {
    return linter(view => {
        const diagnostics: Diagnostic[] = [];
        const text = view.state.doc.toString();

        for (const match of text.matchAll(placeholderPattern)) {
            const from = match.index;
            const value = match[0];

            if (from === undefined) {
                continue;
            }

            const status = getEnvironmentPlaceholderStatus(value, variables);

            if (status === EnvironmentPlaceholderStatus.None) {
                continue;
            }

            if (status === EnvironmentPlaceholderStatus.Resolved) {
                diagnostics.push({
                    from,
                    to: from + value.length,
                    severity: 'info',
                    message: 'Environment variable resolved.',
                });

                continue;
            }

            if (status === EnvironmentPlaceholderStatus.Empty) {
                diagnostics.push({
                    from,
                    to: from + value.length,
                    severity: 'warning',
                    message: 'Environment variable exists but value is empty.',
                });

                continue;
            }

            diagnostics.push({
                from,
                to: from + value.length,
                severity: 'error',
                message: 'Environment variable was not found in active collection.',
            });
        }

        return diagnostics;
    });
};
