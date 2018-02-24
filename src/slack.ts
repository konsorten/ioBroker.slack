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
import { IoBrokerSlackClient } from "./lib/slack";
import { AdapterMessage } from './typings/Adapter/message.d';

// init the adapter lib
const utils = new Utils();
const adapter = new utils.Adapter("slack");

let slackClient: IoBrokerSlackClient;

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

    try {

        slackClient = new IoBrokerSlackClient(adapter.config, adapter.log);
        adapter.setState("info.connection", true, true);

    } catch (ex) {

        adapter.log.error("The slack web api could not be initiated. This is usually due to an incorrect API token. Please check the configured API token and try again.");
        throw <Error>ex;

    }

}

async function onAdapterUnload(callback: Function) {

    try {

        await slackClient.sendStatusMessage("ioBroker Slack bot stopped", IoBrokerSlackClient.StatusMessageType.RED);

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
                    await slackClient.sendStatusMessage(obj.message, IoBrokerSlackClient.StatusMessageType.DEFAULT);
                }

                // called sendTo("slack.0", { text: "lorem ipsum", type: "danger" });
                else if (typeof obj.message === "object") {

                    // check if obj.message has a "text" property
                    if (typeof obj.message.text !== "string" || obj.message.text === "")
                        return adapter.log.error(`The message object must contain a "text" property`);

                    await slackClient.sendStatusMessage(obj.message.text, (obj.message.type || IoBrokerSlackClient.StatusMessageType.DEFAULT), obj.message.channel, obj.message.image);
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

