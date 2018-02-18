/**
 * ioBroker Adapter for Slack
 * 
 * Filename:   slack.ts
 * 
 * @file       ioBroker Adapter for Slack
 * @version    0.1
 * @author     Michael Müller <mm@konsorten.de>
 * @copyright  2018 marvin + konsorten GmbH
 * @link       https://konsorten.de
 * 
 * --- 
 * 
 *  /\_/\ 
 * ( o.o )  This file is part of a project mastered with ❤️ and expertise by the guys at marvin + konsorten GmbH,
 *  > ^ <   a cheeky digital agency based in düsseldorf, germany
 * 
 */

import { Utils } from "./lib/utils";
import { AdapterMessage } from './typings/Adapter/message.d';
import SlackBot = require("slackbots");

// init the adapter lib
const utils = new Utils();
const adapter = new utils.Adapter("slack");

let bot: SlackBot
let isConnected: boolean = false;

// handle adapter events
adapter.on("ready", onAdapterReady);
adapter.on("message", onAdapterMessage);
adapter.on("unload", onAdapterUnload);


/**
 * This ist the "main" function, called when the adapter is ready.
 * 
 * @returns {Promise<void>} 
 */
async function onAdapterReady(): Promise<void> {

    // reset iobroker connection state
    adapter.setState("info.connection", false, true);
    adapter.subscribeStates('*');

    const token = adapter.config.slackApiToken;

    // check for required settings
    if (!token || !adapter.config.slackBotName || !adapter.config.defaultChannel)
        return adapter.log.error("You must set api token, bot name and default channel in the adapter configuration");

    // validate the token
    if (!/^xoxb-[0-9]{12}-[A-z0-9]{24}$/.test(token))
        return adapter.log.error(`"${token}" is not a valid Slack api token`);

    bot = await new SlackBot({ name: <string>adapter.config.slackBotName, token: <string>adapter.config.slackApiToken });

    // handle bot events
    bot.on("error", onBotError);
    bot.on("start", onBotStart);
}

async function onAdapterUnload(callback: Function) {

    try {

        await sendMessage("ioBroker Slack bot stopped");

        isConnected = false;

        // inform ioBroker that the adapter is connected
        adapter.setState("info.connection", false, true);
        adapter.log.info("Stopping adapter");

        callback();

    } catch (e) {
        callback();
    }

}

async function onAdapterMessage(obj: AdapterMessage) {
    if (typeof obj === 'object' && obj.message && obj.command) {
        if (obj.command === 'send') {

            try {

                // called sendTo("slack.0", "lorem ipsum");
                if (typeof obj.message === "string") {
                    await sendMessage(obj.message);
                } 
                
                // called sendTo("slack.0", { text: "lorem ipsum", channel: "mychannel" });
                else if (typeof obj.message === "object") {

                    // check if obj.message has a "text" property
                    if (typeof obj.message.text !== "string" || obj.message.text === "")
                        return adapter.log.error(`The message object must contain a "text" property`);

                    await sendMessage(obj.message.text, obj.message.channel);
                } else {
                    adapter.log.error("Message is of unknown type");
                }

            } catch (ex) {
                // TODO: better error handling
                adapter.log.error("Unable to send message");
            }

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
}

/**
 * This function is executed automatically as soon as the slack bot api triggers the "start" event. The "start" event is
 * triggered as soon as the connection has been established for the first time, or it has been restored after a
 * connection error. 
 *
 */
async function onBotStart() {

    isConnected = true;

    // inform ioBroker that the adapter is connected
    adapter.setState("info.connection", true, true);
    adapter.log.info("Successful connected to Slack.");

    sendMessage("ioBroker Slack bot started 🚀");
}

/**
 * This function will be called if the adapter is unable to connect to slack.
 * 
 * @returns {void} 
 */
function onBotError(): void {
    isConnected = false;
    adapter.setState("info.connection", false, true);
    adapter.log.error("Cannot connect to Slack. Please check your api token and try again");
    return;
}

/**
 * This function sends a message to a slack channel. If no channel has been specified, the default channel defined in
 * the configuration is used.
 *
 * @param {string} text                                     - Text to send to the channel
 * @param {string} [channel=adapter.config.defaultChannel]  - Target channel
 * @returns {Promise<null | Error>}                         - Returns a promise that will resolve with null on success, 
 *                                                            otherwise it will reject with an error object
 */
async function sendMessage(text: string, channel: string = adapter.config.defaultChannel): Promise<null | Error> {

    // require an active slack connection
    if (isConnected === false)
        return adapter.log.error("Cannot send message because the adapter is not connected to Slack.");

    // require an target channel
    if (!channel)
        return adapter.log.error("Cannot send message without a channel. Please specify a channel or configure a default channel at the adapter config");

    try {

        // perform message send
        await bot.postMessageToChannel(channel, text);

        // success
        adapter.log.info(`Message send to channel "${channel}"`);
        return null;

    }
    catch (ex) {

        //An error occurred during message sending
        adapter.log.error(`Unable to send message to channel "${channel}"`);
        throw <Error>ex;

    }
}