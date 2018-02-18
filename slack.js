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
const SlackBot = require("slackbots");
const utils = new utils_1.Utils();
const adapter = new utils.Adapter("slack");
let bot;
let isConnected = false;
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
        if (!/^xoxb-[0-9]{12}-[A-z0-9]{24}$/.test(token))
            return adapter.log.error(`"${token}" is not a valid Slack api token`);
        bot = yield new SlackBot({ name: adapter.config.slackBotName, token: adapter.config.slackApiToken });
        bot.on("error", onBotError);
        bot.on("start", onBotStart);
    });
}
function onAdapterUnload(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sendMessage("ioBroker Slack bot stopped");
            isConnected = false;
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
                        yield sendMessage(obj.message);
                    }
                    else if (typeof obj.message === "object") {
                        if (typeof obj.message.text !== "string" || obj.message.text === "")
                            return adapter.log.error(`The message object must contain a "text" property`);
                        yield sendMessage(obj.message.text, obj.message.channel);
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
function onBotStart() {
    return __awaiter(this, void 0, void 0, function* () {
        isConnected = true;
        adapter.setState("info.connection", true, true);
        adapter.log.info("Successful connected to Slack.");
        sendMessage("ioBroker Slack bot started 🚀");
    });
}
function onBotError() {
    isConnected = false;
    adapter.setState("info.connection", false, true);
    adapter.log.error("Cannot connect to Slack. Please check your api token and try again");
    return;
}
function sendMessage(text, channel = adapter.config.defaultChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isConnected === false)
            return adapter.log.error("Cannot send message because the adapter is not connected to Slack.");
        if (!channel)
            return adapter.log.error("Cannot send message without a channel. Please specify a channel or configure a default channel at the adapter config");
        try {
            yield bot.postMessageToChannel(channel, text);
            adapter.log.info(`Message send to channel "${channel}"`);
            return null;
        }
        catch (ex) {
            adapter.log.error(`Unable to send message to channel "${channel}"`);
            throw ex;
        }
    });
}
