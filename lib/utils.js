/* 
 * ⚠️ !!! GENERATED FROM TYPESCRIPT !!! ⚠️
 *
 * ###########################################################
 * ###########################################################
 * ###########################################################
 * ###########################################################
 * ###########################################################
 * ###########################################################
 * ###########################################################
 * ###########################################################
 * ###########################################################
 * #############                     #####/          .########
 * ############(                     ####              /######
 * ####################.     ###########      ####,   ########
 * ####################.     ###########     /################
 * ####################.     ###########       ###############
 * ####################.     ############          /##########
 * ####################.     ##############           .#######
 * ####################.     #################,         (#####
 * ####################.     #####################/      (####
 * ####################.     #############.#########     .####
 * ####################.     ##########      ######.     /####
 * ####################.     ##########                 .#####
 * ####################.     ############,             #######
 * ##########################################(*.../###########
 * ###########################################################
 *
 * This Javascript file was automatically compiled by the Typescript compiler. Please use the original Typescript file
 * located at the "src" folder instead of editing this file directly
 * 
 */

/*
 * Slack - This adapter acts as a Slack Bot and allows sending and receiving Slack messages from within ioBroker.
 * @version v0.2.0
 * 
 * Made with ❤️ by marvin + konsorten, a cheeky digital agency from Düsseldorf, Germany.
 * Want to enjoy a 🚀 start of your Project? We are available for hire! Please visit our website at  https://konsorten.de
 * or join us on GitHub: https://github.com/konsorten.
 * 
 */
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class Utils {
    constructor() {
        this.appName = this.getAppName();
        this.controllerDir = this.getControllerDir(typeof process !== 'undefined' && process.argv && process.argv.indexOf('--install') !== -1);
        this.Adapter = require(this.controllerDir + '/lib/adapter.js');
    }
    getAppName() {
        var parts = __dirname.replace(/\\/g, '/').split('/');
        return parts[parts.length - 2].split('.')[0];
    }
    getControllerDir(isInstall) {
        var controllerDir = __dirname.replace(/\\/g, '/');
        let controllerDirParts = controllerDir.split('/');
        if (controllerDirParts[controllerDirParts.length - 3] === 'adapter') {
            controllerDirParts.splice(controllerDirParts.length - 3, 3);
            controllerDir = controllerDirParts.join('/');
        }
        else if (controllerDirParts[controllerDirParts.length - 3] === 'node_modules') {
            controllerDirParts.splice(controllerDirParts.length - 3, 3);
            controllerDir = controllerDirParts.join('/');
            if (fs.existsSync(controllerDir + '/node_modules/' + this.appName + '.js-controller')) {
                controllerDir += '/node_modules/' + this.appName + '.js-controller';
            }
            else if (fs.existsSync(controllerDir + '/node_modules/' + this.appName.toLowerCase() + '.js-controller')) {
                controllerDir += '/node_modules/' + this.appName.toLowerCase() + '.js-controller';
            }
            else if (!fs.existsSync(controllerDir + '/controller.js')) {
                if (!isInstall) {
                    console.log('Cannot find js-controller');
                    process.exit(10);
                }
                else {
                    process.exit();
                }
            }
        }
        else if (fs.existsSync(__dirname + '/../../node_modules/' + this.appName.toLowerCase() + '.js-controller')) {
            controllerDirParts.splice(controllerDirParts.length - 2, 2);
            return controllerDirParts.join('/') + '/node_modules/' + this.appName.toLowerCase() + '.js-controller';
        }
        else {
            if (!isInstall) {
                console.log('Cannot find js-controller');
                process.exit(10);
            }
            else {
                process.exit();
            }
        }
        return controllerDir;
    }
    getConfig() {
        let confFile = `${this.controllerDir}/conf/${this.appName}.json`;
        let confFileLC = `${this.controllerDir}/conf/${this.appName.toLowerCase()}.json`;
        if (fs.existsSync(confFile)) {
            return JSON.parse(confFile);
        }
        else if (fs.existsSync(confFileLC)) {
            return JSON.parse(confFileLC);
        }
        else {
            throw new Error(`Cannot find "${confFile}`);
        }
    }
}
exports.Utils = Utils;
