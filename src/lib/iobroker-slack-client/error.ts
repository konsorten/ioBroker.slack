import { AdapterLog } from "../../typings/Adapter";

export class IoBrokerSlackClientError extends Error {
    constructor(message: string, logger: IoBrokerSlackClientLogger | AdapterLog = console ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); 

        logger.error(message);

    }
}