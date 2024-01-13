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

import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { PluginManager as LivePluginManager } from 'live-plugin-manager'

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
    localPluginDirectories?: string[]
}

export class PluginManager<PluginType extends Plugin> {
    private _pluginPackageNamePattern: RegExp
    private _localPluginDirectories?: string[]

    public constructor(options: PluginManagerOptions) {
        this._pluginPackageNamePattern = options.pluginPackageNamePattern
        this._localPluginDirectories = options.localPluginDirectories
    }

    public async loadPlugins(): Promise<Set<PluginType>> {
        let pluginNames = await this._loadPluginNames()
        let plugins: Set<PluginType> = new Set()
        const manager = new LivePluginManager()

        pluginNames.forEach(name => {
            let pluginEntry = manager.require(name)
            let plugin: PluginType = pluginEntry()

            plugins.add(plugin)
        })

        return plugins
    }

    private async _loadPluginNames(): Promise<Set<string>> {
        let globalPluginNames = await this._loadGlobalPluginNames()
        let localPluginNames = await this._loadLocalPluginNames()

        return new Set([...globalPluginNames, ...localPluginNames])
    }

    private async _loadLocalPluginNames(): Promise<Set<string>> {
        return new Promise<Set<string>>(async (resolve, reject) => {
            let result: Set<string> = new Set()

            try {
                if (!this._localPluginDirectories || this._localPluginDirectories!.length == 0) {
                    // no local plugin directories set
                    resolve(result)
                    return
                }

                for (var directory in this._localPluginDirectories!) {
                    let localPluginNames = await this._loadLocalPluginNamesFromDirectory(directory)

                    localPluginNames.forEach(pluginName => {
                        result.add(pluginName)
                    })
                }

                resolve(result)
            } catch (err) {
                reject(err)
            }
        })
    }

    private async _loadLocalPluginNamesFromDirectory(directory: string): Promise<Set<string>> {
        return new Promise<Set<string>>(async (resolve, reject) => {
            let result: Set<string> = new Set()

            try {
                if (!fs.existsSync(directory)) {
                    resolve(result)
                    return
                }

                const filenames = fs.readdirSync(directory).filter((fn) => this._pluginPackageNamePattern.test(fn))

                for (var filename in filenames) {
                    const qualifiedFilename = path.join(directory, filename)

                    if (await this._isDirectory(qualifiedFilename)) {
                        const mainfile = await this._retrieveMainFile(qualifiedFilename)

                        if (mainfile) {
                            result.add(mainfile)
                        }
                    }
                }

                resolve(result)
            } catch (err) {
                reject(err)
            }
        })
    }

    private async _retrieveMainFile(packageDirectory: string): Promise<string | null> {
        return new Promise<string | null>(async (resolve, reject) => {
            try {
                var result: string | null = null
                const packageJs = path.join(packageDirectory, 'package.json')

                if (!fs.existsSync(packageJs)) {
                    resolve(result)
                    return
                }

                const pkg = await this._loadPackageJson(packageJs)

                if (pkg['main']) {
                    const mainFile: string = path.normalize(path.join(packageDirectory, pkg['main']))

                    if (fs.existsSync(mainFile)) {
                        result = mainFile
                    }
                }

                resolve(result)
            } catch (err) {
                reject(err)
            }
        })
    }

    private async _loadPackageJson(packageJs: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                fs.readFile(packageJs, { encoding: 'utf8' }, (err, data) => {
                    if (err) {
                        reject(err)
                        return
                    }

                    resolve(JSON.parse(data))
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    private async _isDirectory(filename: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.stat(filename, (err, stats) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(stats.isDirectory())
            })
        })
    }

    private async _loadGlobalPluginNames(): Promise<Set<string>> {
        return new Promise<Set<string>>((resolve, reject) => {
            exec(
                '/bin/echo -n "$(npm -g list --json --depth 0)"',
                {
                    env: Object.assign({
                        npm_config_loglevel: 'silent',
                        npm_update_notifier: 'false',
                    }, process.env),
                },
                (err, stdout, stderr) => {
                    if (err) {
                        reject(err)
                        return
                    }

                    try {
                        let list = JSON.parse(stdout)
                        let packages = list['dependencies']
                        let packageNames: Set<string> = new Set()

                        if (packages) {
                            for (var pkg in packages) {
                                if (this._pluginPackageNamePattern.test(pkg)) {
                                    packageNames.add(pkg)
                                }
                            }
                        }

                        resolve(packageNames)
                    } catch (ex) {
                        reject(ex)
                    }
                })
        })
    }
}
