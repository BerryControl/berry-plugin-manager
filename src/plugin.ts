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

/**
 * This interface must be implemented by all plugin types.
 */
export interface Plugin {
    /**
     * The ID of the plugin.
     *
     * @remark
     * The ID must remain constant, even accross versions. Best practise is to
     * generate a V1 UUID once and always return it.
     */
    readonly pluginId: Guid

    /**
     * The plugin name that can be displayed by the host application.
     */
    readonly displayName: string

    /**
     * Description for the plugin that can be displayed by the host application.
     *
     * @remark
     * The description shall be plain text.
     */
    readonly description: string
}