import { Guid } from 'guid-typescript';
export interface Plugin {
    readonly pluginId: Guid;
    readonly displayName: string;
    readonly description: string;
}
