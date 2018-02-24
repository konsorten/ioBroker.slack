/// <reference path="./index.d.ts" />
import {
    ChannelsListResult,
    ChatPostMessageParams,
    CLIENT_EVENTS,
    MessageAttachment,
    PartialChannelResult,
    RTM_EVENTS,
    RtmClient,
    WebClient,
    MessageEvent,
    UsersInfoResult
} from '@slack/client';

import { Subject, Observable } from "rxjs";

import { AdapterConfig } from '../../typings/Adapter/config';
import { IoBrokerSlackClientConstants } from './constants';
import { IoBrokerSlackClientError } from './error';
import { AdapterLog } from '../../typings/Adapter';

enum StatusMessageType {
    "GREEN" = "good",
    "YELLOW" = "warning",
    "RED" = "danger",
    "DEFAULT" = ""
}

export class IoBrokerSlackClient {

    public isConnected: boolean = false;

    private slackWebClient: WebClient;
    private slackRtmClient: RtmClient;

    private defaultChannel: PartialChannelResult | undefined;

    // observable IoBrokerSlackClientReceivedMessage "messages"
    private __messages: Subject<IoBrokerSlackClientReceivedMessage> = new Subject<IoBrokerSlackClientReceivedMessage>();
    public latestMessage: IoBrokerSlackClientReceivedMessage = <IoBrokerSlackClientReceivedMessage>{};

    /**
     * This is an observable of received messages from slack. Use .subscribe() to subscribe to these messages.
     * 
     * @type {Observable<IoBrokerSlackClientReceivedMessage>}
     * @memberof IoBrokerSlackClient
     * 
     * @example
     * messages$.subscribe((message) => {
     *     console.log("Got Message", message);
     * });
     */
    public messages$: Observable<IoBrokerSlackClientReceivedMessage> = this.__messages.asObservable().debounceTime(100);
    

    constructor(private config: AdapterConfig, private logger: IoBrokerSlackClientLogger | AdapterLog = console) {

        if (!this.validateApiTokenFormat(config.slackApiToken))
            throw new IoBrokerSlackClientError("Slack api token format is invalid", this.logger);

        if (!this.validateChannelFormat(config.defaultChannel))
            throw new IoBrokerSlackClientError("Default channel format is invalid", this.logger);

        // init slack api clients
        this.slackWebClient = new WebClient(config.slackApiToken);
        this.slackRtmClient = new RtmClient(config.slackApiToken);

        this.initConnection();

    }

    /**
     * Initiates connections at startup.
     * 
     * @private
     * @memberof IoBrokerSlackClient
     */
    private async initConnection() {

        // register slack events
        this.slackRtmClient.on(CLIENT_EVENTS.RTM.AUTHENTICATED, opts => this.onRtmClientConnected(opts));
        this.slackRtmClient.on(CLIENT_EVENTS.RTM.WS_ERROR, err => this.onRtmClientErr(err));
        this.slackRtmClient.on(RTM_EVENTS.MESSAGE, msg => this.onRtmClientMessage(msg));

        // test the connection to the slack api
        try {

            await this.slackWebClient.auth.test();
            this.logger.info("Slack web client successful initiated");

        } catch (ex) {

            this.logger.error("The slack web api could not be initiated. This is usually due to an incorrect API token. Please check the configured API token and try again.");
            throw <Error>ex;

        }

        await this.getDefaultChannel();

        // connect to the slack rtm api
        try {

            this.slackRtmClient.autoReconnect = true;
            await this.slackRtmClient.start();

            this.logger.info("Slack rtm client successful initiated");

        } catch (ex) {
            throw new IoBrokerSlackClientError("Unable to open a slack rtm session", this.logger);
        }

    }

    /**
     * This function reads the default channel from the iobroker configuration. Afterwards it will be checked if the
     * channel exists in Slack. If the channel exists, a pointer to the channel object is stored in the property
     * "defaultChannel".
     *
     * @private
     * @memberof IoBrokerSlackClient
     */
    private async getDefaultChannel() {

        // load channel data from slack api
        let defaultChannel = await this.getChannel(this.config.defaultChannel);

        if (!defaultChannel)
            throw new IoBrokerSlackClientError("Cannot get default channel", this.logger);

        this.defaultChannel = defaultChannel;
        this.logger.info(`Set the channel #${this.defaultChannel.name} (${this.defaultChannel.id}) as the default channel for the Slack bot.`);

    }

    /**
     * This function gets a channel from the Slack api by its name or id
     * 
     * @private
     * @param {string} channelNameOrId - Name (with #) or id of the channel
     * @returns {(Promise<PartialChannelResult | null>)} 
     * @memberof IoBrokerSlackClient
     */
    private async getChannel(channelNameOrId: string): Promise<PartialChannelResult | null> {

        if(!this.validateChannelFormat(channelNameOrId)) 
            throw new IoBrokerSlackClientError(`"${channelNameOrId}" is not a valid channel name or id`, this.logger);

        // load channel data from slack api
        let allChannels: ChannelsListResult = await this.slackWebClient.channels.list();
        let channel: PartialChannelResult | undefined = allChannels.channels.find(
            (value: PartialChannelResult) =>
                value.name === channelNameOrId.replace("#", "") ||
                value.id === channelNameOrId);

        if (!channel) return null;
        return channel;
        
    }

    /**
     * Validates whether the specified Slack API token conforms to the correct format for Slack API tokens.
     * 
     * @private
     * @param {string} slackApiToken - Token to validate
     * @returns {boolean} - true if token is valid
     * @memberof IoBrokerSlackClient
     */
    private validateApiTokenFormat(slackApiToken: string): boolean {

        if (typeof slackApiToken !== "string")
            return false;

        return /^xoxb-[0-9]{12}-[A-z0-9]{24}$/.test(slackApiToken);

    }

    /**
     * Validates whether the format of the entered string corresponds to a slack channel ID or channel name.
     * 
     * @private
     * @param {string} nameOrId - name or id of the channel
     * @returns {boolean} - true if the string is valid
     * @memberof IoBrokerSlackClient
     */
    private validateChannelFormat(nameOrId: string): boolean {

        if (typeof nameOrId !== "string")
            return false;

        // is id
        if (/^[a-z0-9]{9}$/i.test(nameOrId))
            return true;

        // is name
        if (/^#\w+$/i.test(nameOrId))
            return true;

        return false;
    }

    /**
     * Handles an established connection to Slack RTM
     * 
     * @private
     * @param {*} opts 
     * @memberof IoBrokerSlackClient
     */
    private async onRtmClientConnected(opts: any) {

        this.logger.info("Slack real time message service successful connected. Waiting for messages...");
        this.isConnected = true;
        this.sendStatusMessage("ioBroker Slack bot started 🚀", StatusMessageType.GREEN);

    }

    private async onRtmClientErr(err: Error | undefined) {

        this.isConnected = false;
        throw new IoBrokerSlackClientError("Lost websocket connection to slack", this.logger);

    }

    /**
     * Handle incoming messages
     * 
     * @private
     * @param {MessageEvent} message 
     * @memberof IoBrokerSlackClient
     */
    private async onRtmClientMessage(message: MessageEvent) {

        let sender: UsersInfoResult = await this.slackWebClient.users.info(message.user)

        this.latestMessage = {
            text: message.text,
            ts: message.ts,
            channel: message.channel,
            user: {
                id: sender.user.id,
                name: sender.user.name,
                fullName: <string>sender.user.real_name
            }
        };
        this.__messages.next(this.latestMessage);

    }

    public static readonly StatusMessageType = StatusMessageType;

    /**
     * Send a status message to a Slack channel as a message attachment
     * 
     * @param {string} text - Text of the message
     * @param {StatusMessageType} type - Specifies the color of the message
     * @param {string} [image] - Public accessible URL of an image to send with the message
     * @param {(number | string | Date)} [ts=+ new Date()] 
     * @returns 
     * @memberof IoBrokerSlackClient
     */
    public async sendStatusMessage(text: string, type: StatusMessageType, channel?: string, image?: string, ts: number | string | Date = + new Date()) {

        let unixTs = this.toUnixTimestamp(ts);

        if (!channel && (!this.defaultChannel || !this.defaultChannel.id))
            throw new IoBrokerSlackClientError("Need default channel to send state", this.logger);

        let channelObj: PartialChannelResult = <PartialChannelResult>(channel ? (await this.getChannel(channel) || this.defaultChannel) : this.defaultChannel);

        // compose message
        let messageOptions: ChatPostMessageParams = <ChatPostMessageParams>{};
        messageOptions.channel = channelObj.id;
        messageOptions.username = this.config.slackBotName;

        // compose attachment
        let attachment: MessageAttachment = {
            fallback: text,
            text,
            color: type.toString(),
            thumb_url: image || undefined,
            footer: IoBrokerSlackClientConstants.MESSAGE_FOOTER_TEXT,
            footer_icon: IoBrokerSlackClientConstants.MESSAGE_FOOTER_ICON,
            ts: unixTs,
        };
        messageOptions.attachments = [attachment];

        // send message
        return await this.slackWebClient.chat.postMessage(channelObj.id, "", messageOptions);

    }

    /**
     * This function returns a unix-timestamp (seconds) from a js timestamp (milliseconds), a Date() object or a string
     * that will be parsed to Date().
     * 
     * @private
     * @param {(number | string | Date)} ts - input to convert to unix timestamp
     * @returns {number} - timestamp in seconds
     * @memberof IoBrokerSlackClient
     */
    private toUnixTimestamp(ts: number | string | Date): number {

        if (typeof ts === "number")
            return ts > 1000000000000 ? Math.floor(ts / 1000) : ts;

        if (typeof ts === "string")
            return this.toUnixTimestamp(+Date.parse(ts));

        if (typeof ts === "object")
            return this.toUnixTimestamp((<Date>ts).getTime());

        throw new IoBrokerSlackClientError("unknown timestamp type", this.logger);

    }

}

