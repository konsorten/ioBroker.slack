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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@slack/client");
const rxjs_1 = require("rxjs");
const constants_1 = require("./constants");
const error_1 = require("./error");
var StatusMessageType;
(function (StatusMessageType) {
    StatusMessageType["GREEN"] = "good";
    StatusMessageType["YELLOW"] = "warning";
    StatusMessageType["RED"] = "danger";
    StatusMessageType["DEFAULT"] = "";
})(StatusMessageType || (StatusMessageType = {}));
class IoBrokerSlackClient {
    constructor(config, logger = console) {
        this.config = config;
        this.logger = logger;
        this.isConnected = false;
        this.__messages = new rxjs_1.Subject();
        this.latestMessage = {};
        this.messages$ = this.__messages.asObservable().debounceTime(100);
        if (!this.validateApiTokenFormat(config.slackApiToken))
            throw new error_1.IoBrokerSlackClientError("Slack api token format is invalid", this.logger);
        if (!this.validateChannelFormat(config.defaultChannel))
            throw new error_1.IoBrokerSlackClientError("Default channel format is invalid", this.logger);
        this.slackWebClient = new client_1.WebClient(config.slackApiToken);
        this.slackRtmClient = new client_1.RtmClient(config.slackApiToken);
        this.initConnection();
    }
    initConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.slackRtmClient.on(client_1.CLIENT_EVENTS.RTM.AUTHENTICATED, opts => this.onRtmClientConnected(opts));
            this.slackRtmClient.on(client_1.CLIENT_EVENTS.RTM.WS_ERROR, err => this.onRtmClientErr(err));
            this.slackRtmClient.on(client_1.RTM_EVENTS.MESSAGE, msg => this.onRtmClientMessage(msg));
            try {
                yield this.slackWebClient.auth.test();
                this.logger.info("Slack web client successful initiated");
            }
            catch (ex) {
                this.logger.error("The slack web api could not be initiated. This is usually due to an incorrect API token. Please check the configured API token and try again.");
                throw ex;
            }
            yield this.getDefaultChannel();
            try {
                this.slackRtmClient.autoReconnect = true;
                yield this.slackRtmClient.start();
                this.logger.info("Slack rtm client successful initiated");
            }
            catch (ex) {
                throw new error_1.IoBrokerSlackClientError("Unable to open a slack rtm session", this.logger);
            }
        });
    }
    getDefaultChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            let defaultChannel = yield this.getChannel(this.config.defaultChannel);
            if (!defaultChannel)
                throw new error_1.IoBrokerSlackClientError("Cannot get default channel", this.logger);
            this.defaultChannel = defaultChannel;
            this.logger.info(`Set the channel #${this.defaultChannel.name} (${this.defaultChannel.id}) as the default channel for the Slack bot.`);
        });
    }
    getChannel(channelNameOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.validateChannelFormat(channelNameOrId))
                throw new error_1.IoBrokerSlackClientError(`"${channelNameOrId}" is not a valid channel name or id`, this.logger);
            let allChannels = yield this.slackWebClient.channels.list();
            let channel = allChannels.channels.find((value) => value.name === channelNameOrId.replace("#", "") ||
                value.id === channelNameOrId);
            if (!channel)
                return null;
            return channel;
        });
    }
    validateApiTokenFormat(slackApiToken) {
        if (typeof slackApiToken !== "string")
            return false;
        return /^xoxb-[0-9]{12}-[A-z0-9]{24}$/.test(slackApiToken);
    }
    validateChannelFormat(nameOrId) {
        if (typeof nameOrId !== "string")
            return false;
        if (/^[a-z0-9]{9}$/i.test(nameOrId))
            return true;
        if (/^#\w+$/i.test(nameOrId))
            return true;
        return false;
    }
    onRtmClientConnected(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Slack real time message service successful connected. Waiting for messages...");
            this.isConnected = true;
            this.sendStatusMessage("ioBroker Slack bot started 🚀", StatusMessageType.GREEN);
        });
    }
    onRtmClientErr(err) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isConnected = false;
            throw new error_1.IoBrokerSlackClientError("Lost websocket connection to slack", this.logger);
        });
    }
    onRtmClientMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let sender = yield this.slackWebClient.users.info(message.user);
            this.latestMessage = {
                text: message.text,
                ts: message.ts,
                channel: message.channel,
                user: {
                    id: sender.user.id,
                    name: sender.user.name,
                    fullName: sender.user.real_name
                }
            };
            this.__messages.next(this.latestMessage);
        });
    }
    sendStatusMessage(text, type, channel, image, ts = +new Date()) {
        return __awaiter(this, void 0, void 0, function* () {
            let unixTs = this.toUnixTimestamp(ts);
            if (!channel && (!this.defaultChannel || !this.defaultChannel.id))
                throw new error_1.IoBrokerSlackClientError("Need default channel to send state", this.logger);
            let channelObj = (channel ? ((yield this.getChannel(channel)) || this.defaultChannel) : this.defaultChannel);
            let messageOptions = {};
            messageOptions.channel = channelObj.id;
            messageOptions.username = this.config.slackBotName;
            let attachment = {
                fallback: text,
                text,
                color: type.toString(),
                thumb_url: image || undefined,
                footer: constants_1.IoBrokerSlackClientConstants.MESSAGE_FOOTER_TEXT,
                footer_icon: constants_1.IoBrokerSlackClientConstants.MESSAGE_FOOTER_ICON,
                ts: unixTs,
            };
            messageOptions.attachments = [attachment];
            return yield this.slackWebClient.chat.postMessage(channelObj.id, "", messageOptions);
        });
    }
    toUnixTimestamp(ts) {
        if (typeof ts === "number")
            return ts > 1000000000000 ? Math.floor(ts / 1000) : ts;
        if (typeof ts === "string")
            return this.toUnixTimestamp(+Date.parse(ts));
        if (typeof ts === "object")
            return this.toUnixTimestamp(ts.getTime());
        throw new error_1.IoBrokerSlackClientError("unknown timestamp type", this.logger);
    }
}
IoBrokerSlackClient.StatusMessageType = StatusMessageType;
exports.IoBrokerSlackClient = IoBrokerSlackClient;
