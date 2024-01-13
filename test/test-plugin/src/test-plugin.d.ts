import { Guid } from 'guid-typescript';
import { Plugin } from 'berry-plugin-manager';
export declare class TestPlugin implements Plugin {
    get pluginId(): Guid;
    get displayName(): string;
    get description(): string;
}
