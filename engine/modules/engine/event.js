
/** @module event */
/**
    The global EventManager object. This should never be called directly and should
    instead be interacted with through the {@link Base} class and it's subclasses.
    Based heavily on [this pubsub model]{@link https://stackoverflow.com/a/5528243}.
*/
export const EventManager = (() => {
    /**
        Object containing the events and their handlers
        @private
    */
    let _events = {};

    return {
        /**
            Registers an event handler
            @prop {number} objId - the id for the object registering the event
            @prop {string} ev - event name
            @prop {function} callback - function to handle the event
        */
        on: function (objId, ev, callback) {
            if (!_events.hasOwnProperty(ev)) {
                _events[ev] = new Map();
            }
            _events[ev].set(objId, callback);
        },
        /**
            Removes an event handler
            @prop {number} object ID
            @prop {string} ev - event name
        */
        off: function(objId, ev) {
            if (_events.hasOwnProperty(ev)) {
                _events[ev].delete(objId);
            }
        },
        /**
            Fires an event
            @prop {number} obId - object ID
            @prop {string} ev - event name
            @prop {...any} args - additional arguments
        */
        emit: function (objId, ev, ...args) {
            if (_events.hasOwnProperty(ev)) {
                try {
                    _events[ev].forEach((fn, id) => {
                        fn.call(null, ...args);
                    });
                } catch (e) {
                    console.log(e);
                } finally {

                }
            }
        }
    }
})(); // end EventManager
