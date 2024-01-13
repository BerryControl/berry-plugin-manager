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

import { Guid } from 'guid-typescript'
import path from 'path'

import { Plugin, PluginManager } from '../src/index'

describe('Testing PackageManager with local plugins', () => {
    test('Dummy test', () => {
        expect(0).toBe(0)
    })

    test('Loading local plugins', async () => {
        const manager = new PluginManager<Plugin>({
            pluginPackageNamePattern: /^(test-[\w-]*)$/,
            localPluginDirectory: __dirname
        })
        const plugins = Array.from((await manager.loadPlugins()).values())

        expect(plugins.length).toBe(1)
        expect(plugins[0].pluginId).toEqual(Guid.parse('eec72bee-b232-11ee-a506-0242ac120002'))
        expect(plugins[0].displayName).toEqual('Test-Plugin')
        expect(plugins[0].description).toEqual('This is a very simple test plugin')
    })
})
