declare interface IoBrokerSlackClientLogger {
    log: Function;
    info: Function;
    warn: Function;
    error: Function
}

declare interface IoBrokerSlackClientMessageButton {
    text: string,
    type:  'default' | 'primary' | 'danger'
    url: string
}

declare interface IoBrokerSlackClientReceivedMessage {
    channel: string;
    text: string;
    ts: string;
    user: {
        id: string;
        name: string;
        fullName: string;
    };
}