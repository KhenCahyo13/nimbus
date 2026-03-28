import type { ResolvableString } from '../common/resolvable';

export interface RequestHeader {
    key: string;
    value: ResolvableString | number | boolean | null;
}

export interface ResponseHeader {
    key: string;
    value: string | number | boolean | null;
}

export interface HttpHeaders {
    key: string;
    value: string | number | boolean | null;
}

export type HttpHeadersArray = HttpHeaders[];
