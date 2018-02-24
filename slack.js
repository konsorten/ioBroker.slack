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
 * @version v0.1.0
 * 
 * Made with ❤️ by marvin + konsorten, a cheeky digital agency from Düsseldorf, Germany.
 * Want to enjoy a 🚀 start of your Project? We are available for hire! Please visit our website at  https://konsorten.de
 * or join us on GitHub: https://github.com/konsorten.
 * 
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./lib/utils");
const slack_1 = require("./lib/slack");
const utils = new utils_1.Utils();
const adapter = new utils.Adapter("slack");
let slackClient;
adapter.on("ready", onAdapterReady);
adapter.on("message", onAdapterMessage);
adapter.on("unload", onAdapterUnload);
function onAdapterReady() {
    return __awaiter(this, void 0, void 0, function* () {
        adapter.setState("info.connection", false, true);
        adapter.subscribeStates('*');
        const token = adapter.config.slackApiToken;
        if (!token || !adapter.config.slackBotName || !adapter.config.defaultChannel)
            return adapter.log.error("You must set api token, bot name and default channel in the adapter configuration");
        try {
            slackClient = new slack_1.IoBrokerSlackClient(adapter.config, adapter.log);
            adapter.setState("info.connection", true, true);
        }
        catch (ex) {
            adapter.log.error("The slack web api could not be initiated. This is usually due to an incorrect API token. Please check the configured API token and try again.");
            throw ex;
        }
    });
}
function onAdapterUnload(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield slackClient.sendStatusMessage("ioBroker Slack bot stopped", slack_1.IoBrokerSlackClient.StatusMessageType.RED);
            adapter.setState("info.connection", false, true);
            adapter.log.info("Stopping adapter");
            callback();
        }
        catch (e) {
            callback();
        }
    });
}
function onAdapterMessage(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof obj === 'object' && obj.message && obj.command) {
            if (obj.command === 'send') {
                try {
                    if (typeof obj.message === "string") {
                        yield slackClient.sendStatusMessage(obj.message, slack_1.IoBrokerSlackClient.StatusMessageType.DEFAULT);
                    }
                    else if (typeof obj.message === "object") {
                        if (typeof obj.message.text !== "string" || obj.message.text === "")
                            return adapter.log.error(`The message object must contain a "text" property`);
                        yield slackClient.sendStatusMessage(obj.message.text, (obj.message.type || slack_1.IoBrokerSlackClient.StatusMessageType.DEFAULT), obj.message.channel, obj.message.image);
                    }
                    else {
                        adapter.log.error("Message is of unknown type");
                    }
                }
                catch (ex) {
                    adapter.log.error("Unable to send message");
                }
                if (obj.callback)
                    adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
            }
        }
    });
}
