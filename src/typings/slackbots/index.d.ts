declare interface SlackBotConfig{
    token: string,
    name: string
}

declare class SlackBot {
    constructor(options: SlackBotConfig);

    on(event: string, listener: Function): this;

    postMessageToChannel(name: string, message: string, params?: object): Promise<object>;
}

declare module "slackbots" {
    export = SlackBot;
}
