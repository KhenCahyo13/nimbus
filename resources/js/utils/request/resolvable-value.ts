import type { ResolvableString } from '@/interfaces/http';

/**
 * Safely extracts the raw string value from either a primitive or a ResolvableValue.
 */
export function rawResolvableString(value: ResolvableString): string {
    return typeof value === 'object' ? value.raw : value;
}

/**
 * Safely extracts the resolved string value from either a primitive or a ResolvableValue.
 */
export function resolveResolvableString(value: ResolvableString): string {
    return typeof value === 'object' ? value.resolved : value;
}
