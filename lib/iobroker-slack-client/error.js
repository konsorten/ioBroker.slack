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
Object.defineProperty(exports, "__esModule", { value: true });
class IoBrokerSlackClientError extends Error {
    constructor(message, logger = console) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        logger.error(message);
    }
}
exports.IoBrokerSlackClientError = IoBrokerSlackClientError;
