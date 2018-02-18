import { AdapterMessage } from './message.d';
import { AdapterConfig } from './config.d';

interface AdapterLog {
    debug: Function;
    info: Function;
    warn: Function;
    error: Function;
}

export declare class Adapter {

    Adapter: NodeJS.EventEmitter;

    constructor(name: string, dirname?: string, instance?: number, objects?: boolean);

    readonly name: string;
    readonly namespace: string;
    readonly users: Array<any>;
    readonly instance: string;

    config: AdapterConfig;

    log: AdapterLog;

    on(event: string, listener: Function): this;
    
    /**
     * Send message to other adapter instance or all instances of adapter.
     *
     * This function sends a message to specific instance or all instances of some specific adapter.
     * If no instance given (e.g. "pushover"), the callback argument will be ignored. Because normally many responses will come.
     *
     * @alias sendTo
     * @memberof Adapter
     * @param {string} instanceName name of the instance where the message must be send to. E.g. "pushover.0" or "system.adapter.pushover.0".
     * @param {string} command command name, like "send", "browse", "list". Command is depend on target adapter implementation.
     * @param {object} message object that will be given as argument for request
     * @param {function} callback optional return result
     *        <pre><code>
     *            function (result) {
     *              // result is target adapter specific and can vary from adapter to adapter
     *              if (!result) adapter.log.error('No response received');
     *            }
     *        </code></pre>
     */
    sendTo(instanceName: string, command: string, message: object | string, callback: Function): void;

    /**
     * Subscribe for changes on all states of this instance, that pass the pattern
     *
     * Allows to Subscribe on changes all states of current adapter according to pattern. To read all states of current adapter use:
     * <pre><code>
     *     adapter.subscribeStates('*'); // subscribe for all states of this adapter
     * </code></pre>
     *
     * @alias subscribeStates
     * @memberof Adapter
     * @param {string} pattern string in form 'adapter.0.*' or like this. It can be array of IDs too.
     * @param {object} options optional argument to describe the user context
     * @param {function} callback return result function (err) {}
     */
    subscribeStates(pattern: string, options?: object, callback?: Function): void;

    /**
     * Writes value into states DB.
     *
     * This function can write values into states DB for this adapter.
     * Only Ids that belong to this adapter can be modified. So the function automatically adds "adapter.X." to ID.
     * ack, options and callback are optional
     *
     * @alias setState
     * @memberof Adapter
     * @param {string} id object ID of the state.
     * @param {object|string|number|boolean} state simple value or object with attribues.
     *  If state is object and ack exists too as function argument, function argument has priority.
     *  <pre><code>
     *      {
     *          val:    value,
     *          ack:    true|false,       // default - false; is command(false) or status(true)
     *          ts:     timestampMS,      // default - now
     *          q:      qualityAsNumber,  // default - 0 (ok)
     *          from:   origin,           // default - this adapter
     *          c:      comment,          // default - empty
     *          expire: expireInSeconds   // default - 0
     *      }
     *  </code></pre>
     * @param {boolean} ack optional is command(false) or status(true)
     * @param {object} options optional user context
     * @param {function} callback optional return error and id
     *        <pre><code>
     *            function (err, id) {
     *              if (err) adapter.log.error('Cannot set value for "' + id + '": ' + err);
     *            }
     *        </code></pre>
     */
    setState(id: string, state:object|string|number|boolean, ack?: boolean, options?: object, callback?: Function): void;

}