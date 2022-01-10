
/** @module input */

import { Vector2 } from '../math/vector2.js';
import { Base, Time } from './base.js';
import * as Util from '../utility.js';

/**
    Mouse
    @class
*/
class Mouse extends Base {
    constructor(style='auto') {
        super();
        this._x = 0;
        this._y = 0;
        this._buttons = {};
        this._visible = true;

        // this._scene = scene;
        // this._canvas = scene._canvas;
        // this._ctx = scene._context;

        this._pos = new Vector2();

        this._cursorStyle = style;
        //this.setStyle(style);

        document.onmousemove = this.updatePosition.bind(this);
        document.onmousedown = this.updateButtonState.bind(this);
        document.onmouseup   = this.updateButtonState.bind(this);
    }

    /** @prop {number} */
    get x() { return this._pos.x; }
    /** @prop {number} */
    get y() { return this._pos.y; }

    /** @prop {string} style string to use for the mouse cursor */
    get style() { return this._cursorStyle; }
    set style(s) { this.setStyle(s); }

    /**
        Set the mouse cursor style properties.
        @param {string} the cursor style
        @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
    */
    setStyle(s) {
        this._cursorStyle = s;
        this.emit('CursorChanged', this._cursorStyle);
        //this._canvas.style.cursor = this._cursorStyle;
    }

    /** @prop {Vector2} mouse position vector
        @readonly
    */
    get pos() { return this._pos; }

    /** @listens {MouseEvent} */
    updatePosition(e) {
        // this._x = e.pageX;
        // this._y = e.pageY;
        this._pos.x = e.offsetX;
        this._pos.y = e.offsetY;
    }

    get buttons() { return this._buttons; }

    /** @listens {MouseEvent} */
    updateButtonState(e) {
        this._buttons = e.buttons;
        this.emit('MouseButton', e, e.button, this);
    }

    get visible() { return this._visible; }

    /** hide the mouse cursor */
    hide() {
        this._visible = false;
        //this._canvas.style.cursor = 'none';
    }

    /** set cursor to visible */
    show() {
        this._visible = true;
        //this._canvas.style.cursor = this._cursorStyle;
    }

    // /** Run each frame to draw custom mouse cursor if needed **/
    // update() {
    //     if (g_DEBUG_MODE == DEBUG.ON) this.drawDebugInfo();
    // }

    // /** Draw custom cursor or debug info */
    // drawDebugInfo() {
    //     // this._ctx.save();
    //     //
    //     // this._ctx.font = '8pt sans-serif';
    //     // this._ctx.fillStyle = 'black';
    //     // this._ctx.fillText(`x: ${this._pos.x} | y: ${this._pos.y}`, this._pos.x, this._pos.y);
    //     //
    //     // this._ctx.restore();
    // }

} // end Mouse

/**
    Represents a keybaord. Listens for keyboard events.
    @class
*/
class Keyboard extends Base {
    constructor() {
        super();
        this._keyState = {};
        this._keyBindings = {};

        document.onkeydown = this.updateKeyState.bind(this);
        document.onkeyup = this.resetKeyState.bind(this);

        this.on('KeyPressed', (ev) => {
            //console.log(ev);
            //this.procKey(ev.code);
            //this.processKeys();
        });
        this.on('KeyReleased', (ev) => {
            //console.log(ev);
            //this.procKey(ev.code);
        });
    }

    /**
        @prop {Object.<string, boolean>} keys - dictionary of keystates indicating if a key is pressed
        @readonly
    */
    get keys() { return this._keyState; }

    /**
        Event handler to record a keypress.
        @param {KeyboardEvent} e - Triggering keydown event
        @listens {KeyboardEvent}
    */
    updateKeyState(e) {
        this._keyState[e.code] = true;
        this.emit('KeyPressed', e);
    }
    /**
        Event handler to reset a key to unpressed
        @param {KeyboardEvent} e - Triggering keyup event
        @listens {KeyboardEvent}
    */
    resetKeyState(e) {
        this._keyState[e.code] = false;
        this.emit('KeyReleased', e);
        //this.procKey(e.code);
    }

    /**
        @prop {Object} bindings - structure of key,value pairs mapping keyboard keys to functions
        @example myKeyboard.bindings = {'KeyA': doSomething(), 'Space': jump() };
        @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
    */
    get bindings() { return this._keyBindings; }
    set bindings(b) { this._keyBindings = b; }

    /**
        set the action to be performed when a key is pressed
        @param {string} key - the keycode
        @param {function} action - the function to call
        @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
    */
    bindKey(key, action) {
        Util.assert(typeof key === 'string' || key instanceof String);
        Util.validateType(Function, action);
        this._keyBindings[key] = action;
    }

    /**
        Process a binding for the given key
        @param {string} key
        @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
    */
    procKey(key) {
        if (this._keyBindings[key] && this._keyBindings[key] == true) {
            //console.log('triggered', this._keyBindings[key]);
            this._keyBindings[key]();
        }
    }

    /** Check the current keyboard state and, if applicable, trigger it's corresponding action
        @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
    */
    processKeys() {
        for (const [key, pressed] of Object.entries(this._keyState)) {
            if (this._keyBindings[key] && pressed) {
                this._keyBindings[key]();
            }
        }
    }

} // end Keyboard

export { Mouse, Keyboard };
