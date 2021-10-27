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
    clear() { this._context.clearRect(0, 0, this._width, this._height); }

    /** Sets the update delate for the scene.
        @prop {number} d - integer specifying the clock update delate.
    */
    setDelay(d) { this._delay = d; }

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
    setBgColor(color) { this._canvas.style.backgroundColor = color; }

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

    addSprite(sprite) { this._sprites.append(sprite); }
} // end Scene

/**
    Represents a sprite on the canvas.
    @class
*/
class Sprite {

    /**
        @typedef BOUND_ACTION
        @type {Object}
        @prop WRAP
        @prop BOUNCE
        @prop DESTROY
        @static
    */
    static BOUND_ACTION = {
        WRAP: 0,
        BOUNCE: 1,
        DESTROY: 2
    };

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
        this._hidden = false;
        this._boundAction = Sprite.BOUND_ACTION.WRAP;

        this._scene.addSprite(this);
    }

    /**
        Set the image source
        @param {string} img - Path to source image.
    */
    setImage(img) {
        this._image.src = img;
    }

    /** @prop {number} x - sprite x-coordinate. */
    set X(x) { this._pos.x = x }
    get X() { return this._pos.x; }

    /** @prop {number} y - sprite y-coordinate */
    set Y(y) { this._pos.y = y; }
    get Y() { return this._pos.y; }

    /**
        Change position to the givent x/y coordinates
        @param {number} x
        @param {number} y
        @return {Vector2} The new position vector
    */
    setPosition(x, y) {
        this._pos.x = x;
        this._pox.y = y;

        return this._pos;
    }

    /**
        Draw self on the canvas.
        This should probably never be called by the user. This should only be
        called from the Sprite's update() function.
    */
    draw() {
        this._ctx.save();
        this._ctx.translate(this.X, this.Y);
        this._ctx.rotate(this._imageAngle);
        this._ctx.drawImage(this._image, -(this._width / 2), -(this._height / 2), this._width, this._height);
        this._ctx.restore();
    }

    /**
        Shift by x and y pixels relative to current position.
        @param {number} x - amount in x direction
        @param {number} y - amount in y direction.
        @return {Vector2} The new positon vector
    */
    translate(x, y) {
        this._pos.addWith(new Vector2(x,y));

        return this._pos;
    }

    get speed() { return this._velocity.magnitude; }
    set speed(s) { this.setSpeed(s); }

    /**
        Set speed in the current direction.
        @param {number} speed
    */
    setSpeed(speed) { this._velocity.magnitude = speed; }

    get vel() { return this._velocity; }
    set vel(v) { this.setVelocity(v); }

    setVelocity(vel) {
        try {
            if (Vector2.validate(v)) this._velocity = v;
        } catch (e) {
            console.log(e);
        }
    }

    /**
        @prop {Vector2} accel - The acceleration vector.
    */
    get accel() { return this._accel.magnitude; }
    set accel(a) { this.setAccel(a); }
    /**
        Set the acceleration in the current direction
        @param {number} accel
    */
    setAccel(accel) { this._accel.magnitude = accel; }

    get moveAngle() { return Angle.toDegrees(this._velocity.angle); }
    set moveAngle(a) { this.setMoveAngle(a); }

    setMoveAngle(degrees) {
        let rad = Angle.toRadians(degrees);
        this._moveAngle = rad;
        this._velocity.angle = rad;
    }

    rotateMoveAngle(degrees) { this.setMoveAngle(this.moveAngle + degrees); }

    get imageAngle() { return Angle.toDegrees(this._imageAngle); }
    set imageAngle(a) { this.setImageAngle(a); }

    setImageAngle(degrees) { this._imageAngle = Angle.toRadians(degrees); }

    rotateImageAngle(degrees) { this.setImageAngle(this.imageAngle + degrees); }

    /**
        Modify moveAngle and imageAngle simultaneously.
        @prop {number} degrees - number of degrees to rotate.
    */
    rotate(degrees) {
        this.rotateMoveAngle(degrees);
        this.rotateImageAngle(degrees);
    }

    /**
        Add the given force to the sprite
        @param {vector2} f - the force vector to add
    */
    addForce(f) { this._velocity.addWith(f); }

    get visible() { return !this._hidden; }
    get hidden() { return this._hidden; }

    hide() { this._hidden = true; }
    show() { this._hidden = false; }

    get boundAction() { return this._boundAction; }
    set boundAction(a) { this.setBoundAction(a); }

    setBoundAction(action) {

    }

    update() {
        this.translate(this._velocity.x, this._velocity.y);
        this.checkBounds();
        if (this.visible) { this.draw(); }
    }

} // end Sprite

class Sound {
    constructor() {

    }

} // end Sound
