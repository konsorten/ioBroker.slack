export interface AdapterMessage {
    command: string;
    from: string;
    callback: Function;
    message: any;
}