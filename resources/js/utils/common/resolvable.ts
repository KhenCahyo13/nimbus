import type { ResolvableString } from '@/interfaces/common/resolvable';

/**
 * Safely extracts the raw string value from either a primitive or a ResolvableValue.
 */
export function rawResolvableString(value: ResolvableString): string {
    if (value === null || value === undefined) {
        return '';
    }

    return typeof value === 'object' && 'raw' in value ? value.raw : (value as string);
}

/**
 * Safely extracts the resolved string value from either a primitive or a ResolvableValue.
 */
export function resolveResolvableString(value: ResolvableString): string {
    if (value === null || value === undefined) {
        return '';
    }

    return typeof value === 'object' && 'resolved' in value
        ? value.resolved
        : (value as string);
}
