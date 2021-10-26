'use strict';

class Mouse {
    constructor() {
        this._x = 0;
        this._y = 0;
        this._clicked = false;
        this._down = false;
        this._buttons = {};

        document.onmousemove = this.updatePosition.bind(this);
        document.onmousedown = this.updateButtonState.bind(this);
        document.onmouseup   = this.updateButtonState.bind(this);
    }

    x() {
        return this._x;
    }

    y() {
        return this._y;
    }

    getPos() {
        return new Vector2(this._x, this._y);
    }

    updatePosition(e) {
        this._x = e.pageX;
        this._y = e.pageY;
    }

    updateButtonState(e) {
        this._buttons = e.buttons;
        console.log(this._buttons);
    }
} // end Mouse

class Keyboard {
    constructor() {
        /** @prop {Object.<string, boolean>} _keyState - dictionary of keystates indicating if a key is pressed */
        this._keyState = {};
        document.onkeydown = this.updateKeyState.bind(this);
        document.onkeyup = this.resetKeyState.bind(this);
    }

    /**
        Record a keypress
        @param {Event} e - Triggering keydown event
    */
    updateKeyState(e) {
        this._keyState[e.key] = true;
        console.log(e.key, this._keyState[e.key]);
    }
    /**
        Reset a key to unpressed
        @param {Event} e - Triggering keyup event
    */
    resetKeyState(e) {
        this._keyState[e.key] = false;
        console.log(e.key, this._keyState[e.key]);
    }
} // end Keyboard

class Stopwatch {
    constructor() {
        this._elapsed = 0;
    }

    start() {
        this._start = Date.now();
    }

    stop() {
        this._elapsed += Date.now() - this._start;
    }

    clear() {
        this._elapsed = 0;
    }

    get time() {
        return this._elapsed;
    }
}

/**
    Executes the specified callback after the delay in ms.
    @class
*/
class Timer {
    /**
        Constructs a Timer.
        @param callback
        @param {number} delay - how long to wait in ms before executing callback
    */
    constructor(callback, delay) {
        /** @callback _callback - callback function */
        this._callback = callback;
        /** @prop {boolean} _isPaused - Flag indicating if the timer is paused. */
        this._isPaused = false;
        /** @prop {number} _delay - how long to wait in ms */
        this._delay = delay;
    }

    // TODO: Make this work properly

    /**
        @prop {number} time - the remaining time
    */
    get time() {
        if (!this._isPaused) {
            let t = this._endTime - Date.now();
            return (t > 0) ? t : 0;
        } else {
            return this._delay;
        }
    }

    /**
        Start the timer
    */
    start() {
        if (this._isPaused) this._isPaused = false;

        this._startTime = Date.now();
        this._endTime = this._startTime + this._delay;
        this._id = setTimeout(this._callback, this._delay);
    }

    /**
        Stop the timer and cancel scheduled callback
    */
    stop() {
        clearTimeout(this._id);
    }

    /**
        Pause the Timer, maintaining remaining time.
    */
    pause() {
        this.stop();
        this._delay -= this._endTime - Date.now();
        this._isPaused = true;
    }

} // end Timer

/**
    Constructs a Scene.

    A scene manages the canvas element and handles timing and user input.
    @class
*/
class Scene {
    /**
        @constructs Scene
        @param {string} target - id of the target element in which to create the canvas. If target is not specified or doesn't exist, the canvas will be appended to the document body.
        @param {number} width=640
        @param {number} height=480
    */
    constructor(target, width = 640, height = 480) {
        // initialize and create a canvas element in the page and get 2d context
        /** @prop {object} _canvas - the canvas element in the page */
        this._canvas = document.createElement('canvas');
        this._canvas.style.border = "1px solid grey";

        // stop context menu on canvas
        this._canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }

        this.setSize(width, height);

        /** @prop {object} _target - reference to the element the canvas should be created in. */
        this._target = document.getElementById(target);

        if (!this._target) {
            document.body.appendChild(this._canvas);
        } else {
            this._target.appendChild(this._canvas);
        }

        /** @prop {object} _context - the 2d context for the canvas object */
        this._context = this._canvas.getContext('2d');

        /** @prop {Sprite[]} sprites - list of sprites in the scene */
        this.sprites = [];

        /** @prop {number} delay=50 - update interval delay for the scene. */
        this._delay = 50;
    }

    /**
        Clear the canvas by overwriting it with white
    */
    clear() {
        this._context.clearRect(0, 0, this._width, this._height);
    }

    /** Sets the update delate for the scene.
        @prop {number} d - integer specifying the clock update delate.
    */
    setDelay(d) {
        this._delay = d;
    }

    /**
        Sets the size of the canvas object.

        @param {number} width - width in pixels
        @param {number} height - height in pixels
    */
    setSize(width, height) {
        /** @prop {number} width - canvas width in pixels*/
        this._canvas.width = width;
        /** @prop {number} height - canvas height in pixels*/
        this._canvas.height = height;
    }

    /**
        Set the background color for the canvas

        @param {string} color
    */
    setBgColor(color) {
        this._canvas.style.backgroundColor = color;
    }

    /**
        Starts a scene. Initializes the keyboard and mouse, then calls setInterval
         using this.updateLocal and this._delay
    */
    start() {
        // initialize keyboard
        this._keyboard = new Keyboard();

        // initialize mouse
        this._mouse = new Mouse();

        // testing Timer
        this._timer = new Timer(() => {
            console.log("timer complete");
        }, 10 * 1000);

        this._timer.start();

        // start frames
        this._intervalId = setInterval(this.updateLocal, this._delay);
    }

    /**
        Stop the scene.
    */
    end() {
        clearInterval(this._intervalId);
    }

    /**
        Run once per frame. Calls a user defined update() function.
    */
    updateLocal() {
        update();
    }

} // end Scene

class Sprite {

    static BOUND_ACTION = {
        WRAP,
        BOUNCE,
        DESTROY
    }

    constructor(img, scene, width=10, height=10, x=0, y=0) {
        this._scene = scene;
        this._canvas = scene._canvas;
        this._ctx = this._canvas.getContext('2d');

        this._image = new Image();
        this._image.src = img;
        this._width = width;
        this._height = height;

        this._pos = new Vector2(x, y);
        this._velocity = new Vector2();
        this._accel = new Vector2();

        this._imageAngle = 0;
        this._moveAngle  = 0;
        this._visible = true;
        this._boundAction = Sprite.BOUND_ACTION.WRAP;
    }

    setImage(img) {
        this._image.src = img;
    }

    set X(x) { this._pos.x = x }
    get X() { return this._pos.x; }
    set Y(y) { this._pos.y = y; }
    get Y() { return this._pos.y; }

    setPosition(x, y) {
        this._pos.x = x;
        this._pox.y = y;
    }

    /**
        Shift by x and y pixels relative to current position.
        @param {number} x - amount in x direction
        @param {number} y - amount in y direction.
        @return {Vector2} the new positon
    */
    translate(x, y) {

        this.setX(x)
    }




} // end Sprite

class Sound {
    constructor() {

    }

} // end Sound
