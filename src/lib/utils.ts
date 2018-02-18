import * as fs from "fs";
import { Adapter } from "../typings/Adapter";

export class Utils {

    constructor() {}

    public readonly appName: string = this.getAppName();
    public readonly controllerDir: string = this.getControllerDir(typeof process !== 'undefined' && process.argv && process.argv.indexOf('--install') !== -1);
    public readonly Adapter: typeof Adapter = require(this.controllerDir + '/lib/adapter.js');

    public getAppName(): string {
        var parts = __dirname.replace(/\\/g, '/').split('/');
        return parts[parts.length - 2].split('.')[0];
    }

    // Get js-controller directory to load libs
    public getControllerDir(isInstall: boolean): string {
        // Find the js-controller location
        var controllerDir = __dirname.replace(/\\/g, '/');
        
        let controllerDirParts:string[] = controllerDir.split('/');

        if (controllerDirParts[controllerDirParts.length - 3] === 'adapter') {
            controllerDirParts.splice(controllerDirParts.length - 3, 3);
            controllerDir = controllerDirParts.join('/');
        } else if (controllerDirParts[controllerDirParts.length - 3] === 'node_modules') {
            controllerDirParts.splice(controllerDirParts.length - 3, 3);
            controllerDir = controllerDirParts.join('/');
            if (fs.existsSync(controllerDir + '/node_modules/' + this.appName + '.js-controller')) {
                controllerDir += '/node_modules/' + this.appName + '.js-controller';
            } else if (fs.existsSync(controllerDir + '/node_modules/' + this.appName.toLowerCase() + '.js-controller')) {
                controllerDir += '/node_modules/' + this.appName.toLowerCase() + '.js-controller';
            } else if (!fs.existsSync(controllerDir + '/controller.js')) {
                if (!isInstall) {
                    console.log('Cannot find js-controller');
                    process.exit(10);
                } else {
                    process.exit();
                }
            }
        } else if (fs.existsSync(__dirname + '/../../node_modules/' + this.appName.toLowerCase() + '.js-controller')) {
            controllerDirParts.splice(controllerDirParts.length - 2, 2);
            return controllerDirParts.join('/') + '/node_modules/' + this.appName.toLowerCase() + '.js-controller';
        } else {
            if (!isInstall) {
                console.log('Cannot find js-controller');
                process.exit(10);
            } else {
                process.exit();
            }
        }
        return controllerDir;
    }


    public getConfig() {

        let confFile: string = `${this.controllerDir}/conf/${this.appName}.json`;
        let confFileLC: string = `${this.controllerDir}/conf/${this.appName.toLowerCase()}.json`;

        if (fs.existsSync(confFile)) {
            return JSON.parse(confFile);
        } else if (fs.existsSync(confFileLC)) {
            return JSON.parse(confFileLC);
        } else {
            throw new Error(`Cannot find "${confFile}`);
        }

    }
}