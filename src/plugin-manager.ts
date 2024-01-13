/*
   Copyright 2024 Thomas Bonk

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import { Plugin } from './index'

/**
 * Options for the plugin manager.
 */
export interface PluginManagerOptions {
    /**
     * Regular expression that package names must adhere to in order to load
     * them.
     */
    pluginPackageNamePattern: RegExp

    /**
     * Local directories where plugins shall be looked up.
     */
    localPluginDirectory?: string
}

export class PluginManager<PluginType extends Plugin> {
    private _pluginPackageNamePattern: RegExp
    private _localPluginDirectory?: string

    public constructor(options: PluginManagerOptions) {
        this._pluginPackageNamePattern = options.pluginPackageNamePattern
        this._localPluginDirectory = options.localPluginDirectory
    }

    public async loadPlugins(): Promise<Set<PluginType>> {
        let pluginNames = await this._loadPluginNames()
        let plugins: Set<PluginType> = new Set()

        pluginNames.forEach(name => {
            let npm = require('arg')
            let pluginEntry = require(name)
            let plugin: PluginType = pluginEntry.default()

            plugins.add(plugin)
        })

        return plugins
    }

    private _require(name: string): any {
        let data = fs.readFileSync(name)

        return eval(data.toString())
    }

    private async _loadPluginNames(): Promise<Set<string>> {
        let globalPluginNames = await this._loadGlobalPluginNames()
        let localPluginNames = await this._loadLocalPluginNames()

        return new Set([...globalPluginNames, ...localPluginNames])
    }

    private async _loadLocalPluginNames(): Promise<Set<string>> {
        let result: Set<string> = new Set()

        if (!this._localPluginDirectory) {
            // no local plugin directories set
            return result
        }

        let localPluginNames = await this._loadLocalPluginNamesFromDirectory(this._localPluginDirectory!)

        localPluginNames.forEach(pluginName => {
            result.add(pluginName)
        })

        return result
    }

    private async _loadLocalPluginNamesFromDirectory(directory: string): Promise<Set<string>> {
        let result: Set<string> = new Set()

        if (!fs.existsSync(directory)) {
            return result
        }

        const filenames = fs.readdirSync(directory).filter((fn) => this._pluginPackageNamePattern.test(fn))

        for (let i = 0; i < filenames.length; i++) {
            const filename = filenames[i]
            const qualifiedFilename = path.join(directory, filename)

            if (this._isDirectory(qualifiedFilename)) {
                const mainfile = await this._retrieveMainFile(qualifiedFilename)

                if (mainfile) {
                    result.add(qualifiedFilename)
                }
            }
        }

        return result
    }

    private async _retrieveMainFile(packageDirectory: string): Promise<string | null> {
        var result: string | null = null
        const packageJs = path.join(packageDirectory, 'package.json')

        if (!fs.existsSync(packageJs)) {
            return result
        }

        const pkg = await this._loadPackageJson(packageJs)

        if (pkg['main']) {
            const mainFile: string = path.normalize(path.join(packageDirectory, pkg['main']))

            if (fs.existsSync(mainFile)) {
                result = mainFile
            }
        }

        return result
    }

    private async _loadPackageJson(packageJs: string): Promise<any> {
        let data = fs.readFileSync(packageJs)

        return JSON.parse(data.toString())
    }

    private _isDirectory(filename: string): boolean {
        return fs.statSync(filename).isDirectory()
    }

    private async _loadGlobalPluginNames(): Promise<Set<string>> {
        const globalModulesPath = execSync('/bin/echo -n "$(npm -g prefix)/lib/node_modules"', {
            env: Object.assign({
                npm_config_loglevel: "silent",
                npm_update_notifier: "false",
            }, process.env),
        }).toString("utf8")

        let data = execSync(
            '/bin/echo -n "$(npm -g list --json --depth 0)"',
            {
                env: Object.assign({
                    npm_config_loglevel: 'silent',
                    npm_update_notifier: 'false',
                }, process.env),
            })
        let list = JSON.parse(data.toString())
        let packages = list['dependencies']
        let packageNames: Set<string> = new Set()

        if (packages) {
            for (var pkg in packages) {
                if (this._pluginPackageNamePattern.test(pkg)) {
                    packageNames.add(path.join(globalModulesPath, pkg))
                }
            }
        }

        return packageNames
    }
}
