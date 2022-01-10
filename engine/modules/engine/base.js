
/**
    @module base
*/

import { EventManager } from './event.js';
import * as Util from '../utility.js';

const objectId = Util.idGenerator();

export class GameEvent {
    constructor(name, data) {
        this._name = name;
        this._data = data;
    }
}

//
/**
    Base class for game objects.
    @class
*/
class Base {

    constructor() {
        this._objId = objectId.next().value;
        this._flags = {};
    }

    get flags() { return this._flags; }

    /** @prop {number} objId - object ID */
    get objId() { return this._objId; }

    /** Registers an event handler
        @prop {string} e - event name
        @prop {function} cb - callback function to handle event
    */
    on(e, cb) { EventManager.on(this._objId, e, cb); }

    /** Disable event handler
        @prop {string} e - event name
    */
    off(e) { EventManager.off(this._objId, e); }

    /** Fire an event
        @param {string} e - event name
        @param {...any} args - additional arguments
    */
    emit(e, ...args) { EventManager.emit(this._objId, e, ...args); }
}



/**
    Manages timekeeping.
    @class
*/
class Time extends Base {

    /**
        @prop {number} time - the current time
        @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
    */
    static time = Date.now();
    /** @prp {number}  delta - change in time since last frame */
    static delta = 0;

    /**
     * Update current time and time delta
     */
    static update() {
        this.delta = Date.now() - this.time;
        this.time = Date.now();
    }

    // TODO: REWRITE THESE TO USE GAMETIME

    /**
        Schedule a task to run after a delay. Refer to {@link https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#the_this_problem}
            to ensure proper binding of 'this'
        @param {function} fn - the function to run
        @param {number} delay - how long to wait in milliseconds
        @param {...any=} args - additional arguments to pass to fn
        @return {number} id of the task. can be used with Time.cancel() to cancel execution
        @static
    */
    static schedule(fn, delay, ...args) { return setTimeout(fn, delay, ...args); }

    /**
        Schedule a task to run repeatedly. Refer to {@link https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#the_this_problem}
            to ensure proper binding of 'this'
        @param {function} fn - the function to run
        @param {number} delay - how long to wait between executions in milliseconds
        @paran {...*=} args - additional arguments to pass to fn
        @return {number} id of the task. can be used with Time.cancel() to cancel execution
        @static
    */
    static repeat(fn, delay, ...args) { return setInterval(fn, delay, ...args); }

    /** Unschedule the task from running. This will not interrupt already running tasks. */
    static cancel(id) { clearTimeout(id); }

} // end Time

export { Base, Time };
