import type { ResolvableString } from '@/interfaces/http/request';

export interface ParameterContract {
    id?: number;
    type: ParameterType;
    key: string;
    value: ResolvableString;
    enabled: boolean;
}

export enum ParameterType {
    Text = 'text',
    File = 'file',
}
