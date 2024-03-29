'use strict';

/** DEBUG
    @enum {number}
    @readonly*/
const DEBUG = {
    OFF: 0,
    ON: 1
};

/** Flag for debug mode */
var g_DEBUG_MODE = DEBUG.OFF;

/** Sets g_DEBUG_MODE to the specifed debug mode */
function setDebugMode(mode) { g_DEBUG_MODE = mode; }

/**
    A utility function to validate the type of objects.
    @param {Type} type - the type to check
    @param {...Object} args - the objects to check
    @throws {TypeError} Throws TypeError if an argument is not of the specified `type`.
 */
const validateType = (type, ...args) => {
    for (const arg of args) {
        if (!(arg instanceof type)) {
            throw new TypeError(`${arg} must be of type: ${type}`);
        }
    }
}

/**
    Mouse
    @class
*/
class Mouse {
    constructor(scene) {
        this._x = 0;
        this._y = 0;
        this._buttons = {};
        this._visible = true;
        this._scene = scene;
        this._ctx = scene._context;
        this._pos = this.getPos();
        this._image = '';

        document.onmousemove = this.updatePosition.bind(this);
        document.onmousedown = this.updateButtonState.bind(this);
        document.onmouseup   = this.updateButtonState.bind(this);
    }

    /** @prop {number} */
    get x() { return this._x; }
    /** @prop {number} */
    get y() { return this._y; }

    /** @return {Vector2} the x,y mouse position */
    getPos() { return new Vector2(this._x, this._y); }

    /** @listens {MouseEvent} */
    updatePosition(e) {
        // this._x = e.pageX;
        // this._y = e.pageY;
        this._x = e.offsetX;
        this._y = e.offsetY;
    }

    /** @listens {MouseEvent} */
    updateButtonState(e) { this._buttons = e.buttons; }

    /** set visible flag to falseS */
    hide() { this._visible = false; }

    /** set visible flag to true */
    show() { this._visible = true; }

    /** Run each frame to draw custom mouse cursor if needed **/
    update() {
        if (this._visible) { this.draw(); }
    }

    /** Draw custom cursor or debug info */
    draw() {
        if (g_DEBUG_MODE == DEBUG.ON) {

            this._ctx.font = '8pt sans-serif';
            this._ctx.fillStyle = 'black';
            this._ctx.fillText(`x: ${this._x} | y: ${this._y}`, this._x, this.y);
        }

        if (this._visible) {
            this.drawCrosshair();
        }
    }

    drawCrosshair(color = "red", radius = 20) {

        this._ctx.strokeStyle = color;

        this._ctx.beginPath();
        this._ctx.arc(this._x, this._y, radius, 0, 2 * Math.PI);
        this._ctx.stroke();

        this._ctx.fillStyle = color;
        this._ctx.beginPath();
        this._ctx.arc(this._x, this._y, 2, 0, 2 * Math.PI);
        this._ctx.fill();
    }

} // end Mouse

/**
    keyboard
    @class
*/
class Keyboard {
    constructor(scene) {
        /** @prop {Object.<string, boolean>} _keyState - dictionary of keystates indicating if a key is pressed */
        this._keyState = {};
        this._scene = scene;
        document.onkeydown = this.updateKeyState.bind(this);
        document.onkeyup = this.resetKeyState.bind(this);
    }

    /** @prop {Array.<string, boolean>} */
    get keys() { return this._keyState; }

    /**
        Record a keypress
        @param {Event} e - Triggering keydown event
    */
    updateKeyState(e) { this._keyState[e.key] = true; }
    /**
        Reset a key to unpressed
        @param {Event} e - Triggering keyup event
    */
    resetKeyState(e) { this._keyState[e.key] = false; }
} // end Keyboard

class Stopwatch {
    constructor() { this._elapsed = 0; }

    start() { this._start = Date.now(); }

    stop() { this._elapsed += Date.now() - this._start; }

    clear() { this._elapsed = 0; }

    get time() { return this._elapsed; }
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
        this._canvas.oncontextmenu = (e) => { e.preventDefault(); }

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
        this._sprites = [];

        /** @prop {number} delay=50 - update interval delay for the scene. */
        this._delay = 50;

        this._useDefaultCursor = true;
    }

    /** @prop {boolean} Flag to use the default mouse cursor. */
    get useDefaultCursor() { return this._useDefaultCursor; }
    set useDefaultCursor(d) { this._useDefaultCursor = d; }

    /** @prop {Keyboard}
        @readonly */
    get kb() { return this._keyboard; }

    /** @prop {Mouse}
        @readonly */
    get mouse() { return this._mouse; }

    /** Sets the update delate for the scene.
        @prop {number} d - integer specifying the clock update delate.
    */
    setDelay(d) { this._delay = d; }

    /** @prop {number} */
    set width(w) { this.setWidth(w); }
    get width() { return this.getWidth(); }

    setWidth(w) { this._canvas.width = w; }
    getWidth() { return this._canvas.width; }

    /** @prop {number} */
    set height(h) { this.setHeight(h); }
    get height() { return this.getHeight(); }

    setHeight(h) { this._canvas.height = h; }
    getHeight() { return this._canvas.height; }

    /** @prop {Object.<number, number>} */
    set size(sz) { this.setSize(sz.width, sz.height); }
    get size() { return this.getSize(); }

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

    /** @return {Object.<number, number>} */
    getSize() { return {width: this._canvas.width, height: this._canvas.height}; }

    /** Andy's setposition function for managing top and left offset */
    setPosition(top, left) {
        //set the left and top position of the canvas
        //offset from the page
        this._left = left;
        this._top = top;

        //CSS3 transform to move elements.
        //Cross-browser compatibility would be awesome, guys...
        this._canvas.style.MozTransform = "translate(" + left + "px, " + top + "px)";
        this._canvas.style.WebkitTransform = "translate(" + left + "px, " + top + "px)";
        this._canvas.style.OTransform = "translate(" + left + "px, " + top + "px)";
    }

    /** @prop {string} sets background color */
    set backColor(color) { this.setBgColor(color); }

    /**
        Set the background color for the canvas
        @param {string} color
    */
    setBgColor(color) { this._canvas.style.backgroundColor = color; }

    /** set border color
        @param {string} border - border style
    */
    setBorder(border) { this._canvas.style.border = border; }

    /** @prop {Array.<Sprite>} */
    get sprites() { return this._sprites; }
    set sprites(sp) { this.setSprites(sp); }

    /** Set the sprites array
        @param {Array.<Sprite>} sp
    */
    setSprites(sp) {
        try {
            validateType(Sprite, ...sp);
            this._sprites = sp;
        } catch (e) {
            console.log(e);
        }
    }

    /** Append sprites to the sprites array
        @param {Sprite} s1
        @param {...Sprite} sargs - additional sprites
        @throws {TypeError} if a sprite isnt valid.
    */
    addSprite(s1, ...sargs) {
        try {
            validateType(Sprite, s1, ...sargs);
            this._sprites.push(s1,...sargs);
        } catch (e) {
            console.log(e);
        }
    }

    /**
        Starts a scene. Initializes the keyboard and mouse, then calls setInterval
         using this.updateLocal and this._delay
    */
    start() {
        this._keyboard = new Keyboard(this);
        this._mouse = new Mouse(this);

        this._stopwatch = new Stopwatch();
        this._stopwatch.start();

        // start frames
        this._intervalId = setInterval(this.updateLocal, this._delay);
    }

    /** Stop the scene. */
    end() { clearInterval(this._intervalId); }

    /** Clear the canvas by overwriting it with white */
    clear() { this._context.clearRect(0, 0, this._canvas.width, this._canvas.height); }

    /** Run once per frame. Calls a user defined update() function. */
    updateLocal() {
        update();
    }
} // end Scene

/**
    Represents the axis aligned bounding box of a sprite.
    All boundary coordinates are relative to the sprite center.
    @class
*/
class SpriteBoundary {
    /**
        Constructs a SpriteBoundary
        @param {Sprite} sprite - the sprite this boundary belongs to.
    */
    constructor(sprite) {
        this._sprite = sprite;
        this._offsetLeft = sprite.width / 2;
        this._offsetRight = sprite.width / 2;
        this._offsetTop = sprite.height / 2;
        this._offsetBottom = sprite.height / 2;
    }

    /** @prop {number} */
    get left() { return this._sprite.x - this._offsetLeft; }
    set left(l) { this._offsetLeft = l; }

    /** @prop {number} */
    get right() { return this._sprite.x + this._offsetRight; }
    set right(r) { this._offestRight = r; }

    /** @prop {number} */
    get top() { return this._sprite.y - this._offsetTop; }
    set top(t) { this._offsetTop = t; }

    /** @prop {number} */
    get bottom() { return this._sprite.y + this._offsetBottom; }
    set bottom(b) { this._offsetBottom = b; }
}

/**
    Represents a sprite on the canvas.
    @class
*/
class Sprite {
    /**
        How to handle interaction with the scene boundary.
        @enum {number}
        @static
        @readonly
    */
    static BOUND_ACTION = {
        WRAP: 0,
        BOUNCE: 1,
        DESTROY: 2
    };

    /**
        @param {string} img - path to source image.
        @param {Scene} scene - the scene to which the sprite should belong.
        @param {number} width=10 - width of the sprite in pixels.
        @param {number} height=10 - height of the sprite in pixels.
        @param {number} x=0 - x coordinate
        @param {number} y=0 - y coordinate
    */
    constructor(img, scene, width=10, height=10, x=0, y=0) {
        this._scene = scene;
        this._canvas = scene._canvas;
        this._ctx = this._canvas.getContext('2d');

        this._image = new Image();
        this._image.src = img;
        this._width = width;
        this._height = height;

        this._id = Date.now();
        // get baseName from path
        // https://stackoverflow.com/questions/3820381/need-a-basename-function-in-javascript#comment29942319_15270931
        this._name = `sprite-${img.replace(/\s/g, '').split(/[\\/]/).pop()}`;

        this._pos = new Vector2(x, y);
        this._velocity = new Vector2();
        this._accel = new Vector2();

        this._imageAngle = 0;
        this._moveAngle  = 0;
        this._hidden = false;
        this._boundAction = Sprite.BOUND_ACTION.WRAP;
        this._bounds = new SpriteBoundary(this);

        this._scene.addSprite(this);

        this._deleted = false;
    }

    /* PROPERTIES */

    /**
        Set the image source
        @param {string} img - Path to source image.
    */
    setImage(img) { this._image.src = img; }

    /** @prop {boolean} visible - if the sprite is set to visible. Opposite of `hidden`*/
    get visible() { return !this._hidden; }
    /** @prop {boolean} hidden - if the sprite is hidden. Opposite of `visible`*/
    get hidden() { return this._hidden; }

    /** Make the sprite invisible */
    hide() { this._hidden = true; }
    /** Show the sprite */
    show() { this._hidden = false; }

    /** @prop {number} id
        @readonly */
    get id() { return this._id; }

    /** @prop {string} name */
    get name() { return this._name; }
    set name(n) { this._name = n; }

    /** @prop {SpriteBoundary} bounds */
    get bounds() { return this._bounds; };

    /** @prop {number} */
    get width() { return this._width; }
    set width(w) { this._width = w; }

    /** @prop {number} */
    get height() { return this._height; }
    set height(h) { this._height = h; }

    /* END PROPERTIES */

    /* POSITION & ROTATION */

    /** @prop {number} x - sprite x-coordinate. */
    set x(x) { this._pos.x = x }
    get x() { return this._pos.x; }

    /** @prop {number} y - sprite y-coordinate */
    set y(y) { this._pos.y = y; }
    get y() { return this._pos.y; }

    /**
        Change position to the givent x/y coordinates
        @param {number} x
        @param {number} y
    */
    setPosition(x, y) { this._pos = new Vector2(x, y); }

    /**
        Shift by x and y pixels relative to current position.
        @param {number} x - amount in x direction
        @param {number} y - amount in y direction.
    */
    translate(x, y) { this._pos.addWith(new Vector2(x,y)); }

    /** @prop {number} moveAngle - the direction of motion. */
    get moveAngle() { return Angle.toDegrees(this._velocity.angle); }
    set moveAngle(a) { this.setMoveAngle(a); }

    /**
        Set the direction of motion.
        @param {number} degreees - angle in degrees.
    */
    setMoveAngle(degrees) {
        let rad = Angle.toRadians(degrees);
        this._velocity.angle = rad;
        this._moveAngle = this._velocity.angle;
    }

    /**
        Adjust the direction of movement by the specified amount.
        @param {number} degrees - amount to change by
    */
    rotateMoveAngle(degrees) { this.setMoveAngle(this.moveAngle + degrees); }

    /** @prop {number} imageAngle - the rotation of the sprite image. */
    get imageAngle() { return Angle.toDegrees(this._imageAngle); }
    set imageAngle(a) { this.setImageAngle(a); }

    /**
        Set the sprite image rotation
        @param {number} degrees - rotation in degrees.
    */
    setImageAngle(degrees) { this._imageAngle = Angle.toRadians(degrees); }

    /**
        Adjust rotation by the specifed amount.
        @param {number} degrees - amount to change by
    */
    rotateImageAngle(degrees) { this.setImageAngle(this.imageAngle + degrees); }

    /**
        set moveAngle and imageAngle simultaneously.
        @param {number} degrees - number of degrees to rotate.
    */
    setAngle(degrees) {
        this.rotateMoveAngle(degrees);
        this.rotateImageAngle(degrees);
    }

    /* FORCES */

    /** @prop {number} speed - how fast the sprite is moving. */
    get speed() { return this._velocity.magnitude; }
    set speed(s) { this.setSpeed(s); }

    /**
        Set speed in the current direction.
        @param {number} speed
    */
    setSpeed(speed) { this._velocity.magnitude = speed; }

    /** @prop {Vector2} vel - the velocity vector */
    get vel() { return this._velocity; }
    set vel(v) { this.setVelocity(v); }

    /**
        Set the velocity vector for the sprite.
        @param {Vector2} vel - The new velocity vector.
        @throws {TypeError} Will throw TypeError if accel is not a valid {@link Vector2}
    */
    setVelocity(vel) {
        try {
            Vector2.validate(vel);
            this._velocity = vel;
        } catch (e) {
            console.log(e);
        }
    }

    /** @prop {Vector2} accel - The acceleration vector. */
    get accel() { return this._accel; }
    set accel(a) { this.setAccel(a); }

    /**
        Set the acceleration vector
        @param {Vector2} accel - The new acceleration vector
        @throws {TypeError} Will throw TypeError if accel is not a valid {@link Vector2}
    */
    setAccel(accel) {
        try {
            Vector2.validate(accel);
            this._accel = accel;
        } catch (e) {
            console.log(e);
        }
    }

    /**
        Add the given force to the sprite
        @param {Vector2} f - the force vector to add
    */
    addForce(f) { this._velocity.addWith(f); }

    /* END FORCES */

    /* SPRITE INTERACTIONS */

    /**
        Get the angle to the specified sprite.
        @param {Sprite} sprite - the target sprite.
        @return {number} angle in degrees
    */
    angleTo(sprite) { return Angle.toDegrees(Math.atan2(this.x - sprite.x, this.y - sprite.y)) + 90; }

    /**
        Get the distance to the specified sprite.
        @param {Sprite} sprite - the target sprite.
        @return {number} distance between the two sprites.
    */
    distanceTo(sprite) { return new Vector2(this.x - sprite.x, this.y - sprite.y).norm; }

    /**
        Determine if colliding with the given sprite.
        @param {Sprite} sprite - the sprite to check collision with.
        @return {boolean}
    */
    collidesWith(sprite) {
        let colliding = false;

        // do not detect collision with self
        if (!(Object.is(this, sprite))) {
            // only detect collisions between visible sprites.
            if (this.visible && sprite.visible) {
                // assume we are colliding
                colliding = true;
                // test non-colliding states
                if (this._bounds.left > sprite.bounds.right || // this to right of sprite
                    this._bounds.right < sprite.bounds.left || // this to left of sprite
                    this._bounds.top > sprite.bounds.bottom || // this below sprite
                    this._bounds.bottom < sprite.bounds.top) { // this above sprite

                    colliding = false;
                }
            }

            if (g_DEBUG_MODE == DEBUG.ON && colliding) {
                console.log(`${this.id} collides with ${sprite.id}`);
            }
        }

        return colliding;
    }

    /* BOUNDARY BEHAVIOR */

    /** @prop {BOUND_ACTION} boundAction - The action to perform when encountering a boundary. */
    get boundAction() { return this._boundAction; }
    set boundAction(a) { this.setBoundAction(a); }

    /**
        Set the boundAction.
        @param {BOUND_ACTION} action
    */
    setBoundAction(action) { this._boundAction = action; }

    /** remove this sprite from the list of sprites in the scene */
    destroy() {
        let index = this._scene.sprites.findIndex((a) => {
            return Object.is(this, a);
        });
        this._scene.sprites.splice(index, 1);
        this.hide();
        if (g_DEBUG_MODE == DEBUG.ON) console.log(this._scene.sprites);
    }

    /**
        Check if sprite is out of bounds. Has different behavior based on the
        value of {@link Sprite#boundAction}.
        @see BOUND_ACTION
    */
    checkBounds() {
        //console.log(this._pos);
        switch (this.boundAction) {
            case Sprite.BOUND_ACTION.WRAP:
                // check right and left
                if (this._pos.x > this._scene.width) {
                    this._pos.x = 0;
                } else if (this._pos.x < 0) {
                    this._pos.x = this._scene.width;
                }
                // check top and botton
                if (this._pos.y > this._scene.height) {
                    this._pos.y = 0;

                } else if (this._pos.y < 0) {
                    this._pos.y = this._scene.height;
                }
                break;
            case Sprite.BOUND_ACTION.BOUNCE:
                // check right
                if (this._pos.x > this._scene.width) {
                    this._pos.x = this._scene.width;
                    this._velocity.x *= -1;
                }
                // check left
                if (this._pos.x < 0) {
                    this._pos.x = 0;
                    this._velocity.x *= -1;
                }
                // check bottom
                if (this._pos.y > this._scene.height) {
                    this._pos.y = this._scene.height;
                    this._velocity.y *= -1;
                }
                // check top
                if (this._pos.y < 0) {
                    this._pos.y = 0;
                    this._velocity.y *= -1;
                }
                break;
            case Sprite.BOUND_ACTION.DESTROY:
                // check left and right
                let destroy = false;
                if (this._pos.x > this._scene.width + this._width || this._pos.x < 0 - this._width ) {
                    destroy = true;
                }
                // check top and botton
                if (this._pos.y > this._scene.height + this._height || this._pos.y < 0 - this._height) {
                    destroy = true;
                }

                if (destroy) {
                    this.destroy();
                    this._deleted = true;
                }
                break;
            default:
                break;
        }
    }

    /**
        Draw self on the canvas.
        This should probably never be called by the user. This should only be
        called from {@link Sprite#update()}.
    */
    draw() {
        this._ctx.save();

        this._ctx.translate(this._pos.x, this._pos.y);
        this._ctx.rotate(this._imageAngle);

        let xx = -(this._width / 2);
        let yy = -(this._height / 2);

        this._ctx.drawImage(this._image, xx, yy, this._width, this._height);
        //this._ctx.drawImage(this._image, this.x, this.y, this._width, this._height);

        if (g_DEBUG_MODE == DEBUG.ON) {
            // draw box around image size
            this._ctx.strokeStyle = "red";
            this._ctx.strokeRect(xx, yy, this._width, this._height);
            //this._ctx.strokeRect(this.x, this.y, this._width, this._height);

            // draw centerpoint
            this._ctx.fillStyle = "blue";
            this._ctx.beginPath();
            //this._ctx.arc(this.center.x, this.center.y, 2, 0, 2 * Math.PI)
            this._ctx.arc(0, 0, 2, 0, 2 * Math.PI);
            this._ctx.fill();

            // draw velocity
            this._ctx.strokeStyle = "green";
            this._ctx.beginPath();
            this._ctx.moveTo(0, 0);
            this._ctx.lineTo(this.speed * Math.cos(this.vel.angle) * 2.5, this.speed * Math.sin(this.vel.angle) * 2.5);
            this._ctx.stroke();

            // draw image angle
            this._ctx.strokeStyle = "cyan";
            this._ctx.beginPath();
            this._ctx.moveTo(0, 0);
            this._ctx.lineTo(this.width * Math.cos(this._imageAngle), this.height * Math.sin(this._imageAngle));
            this._ctx.stroke();
        }

        this._ctx.restore();
    }

    /** update sprite state. call each frame */
    update() {
        this.addForce(this._accel);
        this.translate(this._velocity.x, this._velocity.y);
        this.checkBounds();
        if (this.visible) { this.draw(); }
    }

} // end Sprite

class Sound {
    constructor() {

    }

} // end Sound
