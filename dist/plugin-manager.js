"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PluginManager {
    constructor(options) {
        this._pluginPackageNamePattern = options.pluginPackageNamePattern;
        this._localPluginDirectory = options.localPluginDirectory;
    }
    loadPlugins() {
        return __awaiter(this, void 0, void 0, function* () {
            let pluginNames = yield this._loadPluginNames();
            let plugins = new Set();
            pluginNames.forEach(name => {
                let npm = require('arg');
                let pluginEntry = require(name);
                let plugin = pluginEntry.default();
                plugins.add(plugin);
            });
            return plugins;
        });
    }
    _require(name) {
        let data = fs_1.default.readFileSync(name);
        return eval(data.toString());
    }
    _loadPluginNames() {
        return __awaiter(this, void 0, void 0, function* () {
            let globalPluginNames = yield this._loadGlobalPluginNames();
            let localPluginNames = yield this._loadLocalPluginNames();
            return new Set([...globalPluginNames, ...localPluginNames]);
        });
    }
    _loadLocalPluginNames() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = new Set();
            if (!this._localPluginDirectory) {
                return result;
            }
            let localPluginNames = yield this._loadLocalPluginNamesFromDirectory(this._localPluginDirectory);
            localPluginNames.forEach(pluginName => {
                result.add(pluginName);
            });
            return result;
        });
    }
    _loadLocalPluginNamesFromDirectory(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = new Set();
            if (!fs_1.default.existsSync(directory)) {
                return result;
            }
            const filenames = fs_1.default.readdirSync(directory).filter((fn) => this._pluginPackageNamePattern.test(fn));
            for (let i = 0; i < filenames.length; i++) {
                const filename = filenames[i];
                const qualifiedFilename = path_1.default.join(directory, filename);
                if (this._isDirectory(qualifiedFilename)) {
                    const mainfile = yield this._retrieveMainFile(qualifiedFilename);
                    if (mainfile) {
                        result.add(qualifiedFilename);
                    }
                }
            }
            return result;
        });
    }
    _retrieveMainFile(packageDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            var result = null;
            const packageJs = path_1.default.join(packageDirectory, 'package.json');
            if (!fs_1.default.existsSync(packageJs)) {
                return result;
            }
            const pkg = yield this._loadPackageJson(packageJs);
            if (pkg['main']) {
                const mainFile = path_1.default.normalize(path_1.default.join(packageDirectory, pkg['main']));
                if (fs_1.default.existsSync(mainFile)) {
                    result = mainFile;
                }
            }
            return result;
        });
    }
    _loadPackageJson(packageJs) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = fs_1.default.readFileSync(packageJs);
            return JSON.parse(data.toString());
        });
    }
    _isDirectory(filename) {
        return fs_1.default.statSync(filename).isDirectory();
    }
    _loadGlobalPluginNames() {
        return __awaiter(this, void 0, void 0, function* () {
            const globalModulesPath = (0, child_process_1.execSync)('/bin/echo -n "$(npm -g prefix)/lib/node_modules"', {
                env: Object.assign({
                    npm_config_loglevel: "silent",
                    npm_update_notifier: "false",
                }, process.env),
            }).toString("utf8");
            let data = (0, child_process_1.execSync)('/bin/echo -n "$(npm -g list --json --depth 0)"', {
                env: Object.assign({
                    npm_config_loglevel: 'silent',
                    npm_update_notifier: 'false',
                }, process.env),
            });
            let list = JSON.parse(data.toString());
            let packages = list['dependencies'];
            let packageNames = new Set();
            if (packages) {
                for (var pkg in packages) {
                    if (this._pluginPackageNamePattern.test(pkg)) {
                        packageNames.add(path_1.default.join(globalModulesPath, pkg));
                    }
                }
            }
            return packageNames;
        });
    }
}
exports.PluginManager = PluginManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGx1Z2luLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLGlEQUF3QztBQUN4Qyw0Q0FBbUI7QUFDbkIsZ0RBQXVCO0FBb0J2QixNQUFhLGFBQWE7SUFJdEIsWUFBbUIsT0FBNkI7UUFDNUMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQTtRQUNqRSxJQUFJLENBQUMscUJBQXFCLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFBO0lBQzdELENBQUM7SUFFWSxXQUFXOztZQUNwQixJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1lBQy9DLElBQUksT0FBTyxHQUFvQixJQUFJLEdBQUcsRUFBRSxDQUFBO1lBRXhDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDeEIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUMvQixJQUFJLE1BQU0sR0FBZSxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBRTlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDdkIsQ0FBQyxDQUFDLENBQUE7WUFFRixPQUFPLE9BQU8sQ0FBQTtRQUNsQixDQUFDO0tBQUE7SUFFTyxRQUFRLENBQUMsSUFBWTtRQUN6QixJQUFJLElBQUksR0FBRyxZQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRWhDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQ2hDLENBQUM7SUFFYSxnQkFBZ0I7O1lBQzFCLElBQUksaUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNC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