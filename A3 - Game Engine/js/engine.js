'use strict';

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
        /** @prop {Object.<string, boolean>} _keyState - dictionary of keystates indicating if a key is pressed */
        this._keyState = {};

        document.onkeydown = this.updateKeyState.bind(this);
        document.onkeyup = this.resetKeyState.bind(this);

        // initialize mouse

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

    /**
        Run once per frame. Calls a user defined update() function.
    */
    updateLocal() {
        update();
    }

} // end Scene

class Sprite {
    constructor() {

    }

} // end Sprite

class Sound {
    constructor() {

    }

} // end Sound

class Timer {
    constructor() {

    }

} // end Timer
