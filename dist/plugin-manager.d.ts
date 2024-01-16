import { Plugin } from './index';
export interface PluginManagerOptions {
    pluginPackageNamePattern: RegExp;
    localPluginDirectory?: string;
}
export declare class PluginManager<PluginType extends Plugin> {
    private _pluginPackageNamePattern;
    private _localPluginDirectory?;
    constructor(options: PluginManagerOptions);
    loadPlugins(): Promise<Set<PluginType>>;
    private _require;
    private _loadPluginNames;
    private _loadLocalPluginNames;
    private _loadLocalPluginNamesFromDirectory;
    private _retrieveMainFile;
    private _loadPackageJson;
    private _isDirectory;
    private _loadGlobalPluginNames;
}
