/**
 * Represents a string that can exist either as a raw value (with potential placeholders)
 * or as its final resolved version after environment variables are processed.
 */
export type ResolvableString = string | { raw: string; resolved: string };
