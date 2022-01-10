
/** @module sprite */

import { Angle } from '../math/angle.js';
import { Vector2 } from '../math/vector2.js';
import { Base } from './base.js';
import { Entity } from './entity.js';
import { Collider, BoxCollider } from './collision.js';
import * as Util from '../utility.js';

const spriteId = Util.idGenerator();

/**
    Represents the axis aligned bounding box of a sprite.
    All boundary coordinates are relative to the sprite center.
    @class
*/
class SpriteBoundary extends BoxCollider {
    /**
        Constructs a SpriteBoundary
        @param {Sprite} sprite - the sprite this boundary belongs to.
    */
    constructor(sprite) {
        super(sprite);
        //this._sprite = sprite;
        this._offsetLeft = sprite.width / 2;
        this._offsetRight = sprite.width / 2;
        this._offsetTop = sprite.height / 2;
        this._offsetBottom = sprite.height / 2;
    }

    // resize bounding box as a function of image angle
    resize() {

        let alpha = (90 - this._sprite.heading);
        let w1 = this._sprite.height * Math.cos(alpha);
        let h1 = this._sprite.height * Math.sin(alpha);

        let w2 = this._sprite.width * Math.cos(this._sprite.heading);
        let h2 = this._sprite.width * Math.sin(this._sprite.heading);

        this._width = w1 + w2;
        this._height = h1 + h2;

        // FIGURE OUT IF THIS WORKS AND LOOK AT LAW OF COSINE

        // look at this for headingal bbs https://stackoverflow.com/a/622172

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
class Sprite extends Entity {
    /**
        How to handle interaction with the scene boundary.
        @enum {number}
        @static
        @readonly
    */
    static BOUND_ACTION = {
        NONE: 0,
        WRAP: 1,
        BOUNCE: 2,
        DESTROY: 3
    };

    /**
        @param {CanvasImageSource} img - [see]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage}
        @param {number} width=10 - width of the sprite in pixels.
        @param {number} height=10 - height of the sprite in pixels.
        @param {number} x=0 - x coordinate
        @param {number} y=0 - y coordinate
        @emits Sprite#SpriteCreated
    */
    constructor(img, width = 10, height = 10, x=0, y=0) {
        super(img, width, height, x, y);

        this._spriteId = spriteId.next().value;

        // get baseName from path
        // https://stackoverflow.com/questions/3820381/need-a-basename-function-in-javascript#comment29942319_15270931
        //this._name = `sprite-${img.replace(/\s/g, '').split(/[\\/]/).pop()}`;
        this._name = `sprite${this._spriteId}`;

        this._velocity = new Vector2();
        this._accel = new Vector2();

        this._moveAngle  = new Angle();

        this._boundAction = Sprite.BOUND_ACTION.NONE;
        this._bounds = new SpriteBoundary(this);
        // this._collider = new BoxCollider(this);

        this._deleted = false;

        /**
            SpriteCreated event.

            @event Sprite#SpriteCreated
            @type {Sprite} - the sprite created
        */
        this.emit('SpriteCreated', this);
    }

    /* PROPERTIES */

    /** @prop {number} id
        @readonly */
    get spriteId() { return this._id; }

    /** @prop {string} name */
    get name() { return this._name; }
    set name(n) { this._name = n; }

    /** @prop {SpriteBoundary} bounds */
    get bounds() { return this._bounds; };

    /* END PROPERTIES */

    /* MOVEMENT, ROTATION */

    /** @prop {number} moveAngle - the direction of motion expressed as an angle from the x-axis */
    get moveAngle() { return Angle.radians(this._velocity.angle); }
    set moveAngle(a) { this.setMoveAngle(a); }

    /**
        Set the direction of motion.
        @param {number} degreees - angle in degrees.
    */
    setMoveAngle(degrees) {
        this._velocity.angle = Angle.toRadians(degrees);
        //this._moveAngle.rad = this._velocity.angle;
    }

    /**
        set moveAngle and heading simultaneously.
        @param {number} degrees - new heading in degrees
    */
    setAngle(degrees) {
        this.setMoveAngle(degrees);
        this.heading.deg = degrees;
    }

    /**
        Adjust the direction of movement by the specified amount.
        @param {number} degrees - amount to change by
    */
    rotateMoveAngle(degrees) { this.setMoveAngle(this.moveAngle.deg + degrees); }

    /**
        rotate heading and moveAngle by the same amount
        @param {number} degrees - number of degrees to rotate
    */
    rotate(degrees) {
        this.rotateMoveAngle(degrees);
        this.rotateHeading(degrees);
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

    /* BOUNDARY BEHAVIOR */

    /** @prop {BOUND_ACTION} boundAction - The action to perform when encountering a boundary. */
    get boundAction() { return this._boundAction; }
    set boundAction(a) { this.setBoundAction(a); }

    /**
        Set the boundAction.
        @param {BOUND_ACTION} action
    */
    setBoundAction(action) { this._boundAction = action; }

    /**
        Check if sprite is out of bounds. Has different behavior based on the
        value of {@link Sprite#boundAction}.
        @see BOUND_ACTION
    */
    checkBounds(scene) {
        //console.log(this._pos);
        switch (this.boundAction) {
            case Sprite.BOUND_ACTION.WRAP:
                // check right and left
                if (this._pos.x > scene.width) {
                    this._pos.x = 0;
                } else if (this._pos.x < 0) {
                    this._pos.x = scene.width;
                }
                // check top and botton
                if (this._pos.y > scene.height) {
                    this._pos.y = 0;

                } else if (this._pos.y < 0) {
                    this._pos.y = scene.height;
                }
                break;
            case Sprite.BOUND_ACTION.BOUNCE:
                // check right
                if (this._pos.x > scene.width) {
                    this._pos.x = scene.width;
                    this._velocity.x *= -1;
                }
                // check left
                if (this._pos.x < 0) {
                    this._pos.x = 0;
                    this._velocity.x *= -1;
                }
                // check bottom
                if (this._pos.y > scene.height) {
                    this._pos.y = scene.height;
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
                if (this._pos.x > scene.width + this._width || this._pos.x < 0 - this._width ) {
                    destroy = true;
                }
                // check top and botton
                if (this._pos.y > scene.height + this._height || this._pos.y < 0 - this._height) {
                    destroy = true;
                }

                if (destroy) { this.destroy(); }
                break;
            default:
                break;
        }
    }

    /* RENDERING */

    /** Default method to update sprite state. call each frame.
        Can be overridden for custom behavior */
    update(scene) {

        this.addForce(this.accel);
        this.translate(this.vel.x, this.vel.y);
        this.checkBounds(scene);
        super.update(scene);
        //if (this.visible) { this.draw(scene.ctx); }
    }
} // end Sprite

export { Sprite, SpriteBoundary };
