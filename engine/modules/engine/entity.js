
/** @module entity */

import { Angle, Vector2, Matrix } from '../math.js';
import * as Util from '../utility.js';

import { Base } from './base.js';
import { Collider, BoxCollider } from './collision.js';
import { Graphics } from './graphics.js';
// CSSImageValue,
// HTMLImageElement,
// SVGImageElement,
// HTMLVideoElement,
// HTMLCanvasElement,
// ImageBitmap,
// OffscreenCanvas
/**
    Constructs an entity to be used in a scene.
    @description An entity is object within the space.
    For example, the player, enemies, items, and bullets are entities. An entity is meant to serve as
    a primitive representation of objects. For objects requiring more complexity, such as motion forces,
    see {@link Sprite}
    @class
*/
class Entity extends Base {
    constructor(img = new Image(), width, height, x=0, y=0) {
        super();
        try {
            //Util.validateType(CanvasImageSource, img);
            if (typeof img === 'string') {
                // let src = img;
                // img = new Image(width, height);
                // console.log(img);
                // img.src = src;
                // img.onload = () => {
                //     return img;
                //     console.log('loaded image', this._image);
                // };

                this._image = Graphics.preloadImage(img);
            } else {

                this._image = img;
            }

            Util.assert(width >= 0 && height >= 0, new RangeError(`Width and height must be >= 0`));
            this._width = width;
            this._height = height;

            this._halfWidth = width / 2;
            this._halfHeight = height / 2;

            this._image.width = width;
            this._image.height = height;

            this._pos = new Vector2(x, y);
            this._heading = new Angle().setRadians(0);
            //this._redraw = this._pos;
            this._redraw = new Vector2(this._pos.x, this._pos.y);
            this._redrawAngle = new Angle();

            this._visible = true;

            // this._collider = new BoxCollider(this._pos, this._width, this._height);
            this._collider = new BoxCollider(this);

            this._flags = {
                deleted: false,
                colliding: false,
                respawn: false,
                visible: true
            }

            this._deleteFlag = false;

            this.emit('EntityCreated', this);
        } catch (e) {
            this.emit('EntityCreationFailed', this, e);
            //console.log(e);
        }
    }

    /* PROPERTIES */

    /**
        @prop {CanvasImageSource}
        @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource
    */
    get image() { return this._image; }
    set image(i) { this.setImage(i); }

    /**
        Set the image source
        @param {string} img - Path to source image.
    */
    setImage(img) {
        try {
            //Util.validateType(CanvasImageSource, img);
            this._image = img;
            this._image.width = this.width;
            this._image.height = this.height;
            return this;
        } catch (e) {
            console.log(e);
        }
    }

    /** @prop {boolean} visible - if the sprite is set to visible. Opposite of `hidden`*/
    get visible() { return this._visible; }
    /** @prop {boolean} hidden - if the sprite is hidden. Opposite of `visible`*/
    get hidden() { return !this._visible; }

    /** Make the sprite invisible */
    hide() {
        this._visible = false;
        this._collider.disable();
    }
    /** Show the sprite */
    show() {
        this._visible = true;
        this._collider.enable();
    }

    /** @prop {number} */
    get width() { return this._width; }
    set width(w) {
        this._width = w;
        this._halfWidth = w / 2;
    }

    /** @prop {number} */
    get halfWidth() { return this._halfWidth; }
    get halfHeight() { return this._halfHeight; }

    /** @prop {number} */
    get height() { return this._height; }
    set height(h) {
        this._height = h;
        this._halfHeight = h / 2;
    }

    /** @prop {Collider} */
    get collider() { return this._collider; }

    // /**
    //     bitwise AND this._flags
    //     @param {number} n - number to AND
    //     @return {number}
    // */
    // mask(n) { return this._flags.value & n; }

    /* END PROPERTIES */

    /* POSITION AND ROTATION */

    /** @prop {number} x - sprite x-coordinate. */
    set x(x) {
        //this._redraw.x = this._pos.x;
        this.pos.x = x;
    }
    get x() { return this._pos.x; }

    /** @prop {number} y - sprite y-coordinate */
    set y(y) {
        //this._redraw.y = this._pos.y;
        this.pos.y = y;
    }
    get y() { return this._pos.y; }

    /**
        Change position to the givent x/y coordinates
        @param {number} x
        @param {number} y
    */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
        Shift by relative to current position.
        @param {number} x - amount to shift first component
        @param {number} y - amount to shift second component
    */
    translate(x, y) {
        this.x += x;
        this.y += y;
    }

    /** @prop {Vector2} pos - Position vector */
    get pos() { return this._pos; }
    set pos(p) {
        try {
            Vector2.validate(p);
            this.setPosition(p.x, p.y);
        } catch (e) {
            console.log(e);
        }
    }

    /** {number} angle of the redraw region, in radians */
    get redrawAngle() { return this._redrawAngle; }
    set redrawAngle(a) {
        try {
            Util.validateType(Angle, a);
            this._redrawAngle.rad = a.rad;
        } catch (e) {
            console.log(e);
        }
    }

    /** @prop {Vector2} redraw - the redraw region. */
    get redraw() { return this._redraw; }
    set redraw(r) {
        try {
            Vector2.validate(r);
            this._redraw.setCoords(r.x, r.y);
            //this._redrawAngle.rad = this._heading.rad;
        } catch (e) {
            console.log(e);
        }
    }
    /** @prop {Angle} heading - the heading of the sprite image. */
    get heading() { return this._heading; }
    set heading(a) {
        try {
            Util.validateType(Angle, a);
            //this.redrawAngle = this.heading;
            this._heading = a;
        } catch (e) {
            console.log(e);
        }
    }

    /**
        Adjust heading by the specifed amount.
        @param {number} degrees - amount to change by
    */
    rotateHeading(degrees) {
        //this.redrawAngle = this.heading;
        this.heading.addDegrees(degrees);
    }

    /* END POSITION AND ROTATION */

    /** @prop {boolean} delete - indicates if flagged for deletion */
    get delete() { return this._flags.deleted; }
    set delete(d) {
        Util.assert(d == true || d == false);
        this._flags.deleted = d;
        this.hide();
        this.emit('EntityMarkedForDelete', this);
    }

    /** destroy this entity.
        @see delete
    */
    destroy() { this.delete = true; }

    /**
        Get angle to the specified vector
        @param {Vector2} vec
        @return {Angle} angle to the specified vector
    */
    angleTo(vec) { return Angle.radians(this.pos.angleTo(vec)); }

    /**
        Get distance to the specified vector
        @param {Vector2} vec
        @return {number} distance between vectors.
    */
    distanceTo(vec) { return this.pos.distanceTo(vec); }

    /**
        apply a collider to this entity
        @param {Collider}
    */
    applyCollider (collider) { this._collider = collider; }

    predictCollisions(scene) {
        for (const other of scene.entities) {
            if (this !== other) {

            }
        }
    }
    /**
        Determine if colliding with the given entity via AABB
        @param {Entity} other - collider to check collision with.
        @fires Entity#EntityCollision
        @return {boolean}
    */
    /*
    collidesWith(other) {
        let colliding = false;

        // do not detect collision with self
        if (other !== this) {
            // only detect collisions between visible others.
            if (this.visible && other.visible) {

                let myLeft = this.x - this.halfWidth;
                let myRight = this.x + this.halfWidth;
                let myTop = this.y - this.halfHeight;
                let myBottom = this.y + this.halfHeight;
                let otherLeft = other.x - other.halfWidth;
                let otherRight = other.x + other.halfWidth;
                let otherTop = other.y - other.halfHeight;
                let otherBottom = other.y + other.halfHeight;


                // assume we are colliding
                colliding = true;
                // test non-colliding states
                if (myLeft > otherRight ||
                    myRight < otherLeft || // this to left of other
                    myTop > otherBottom || // this below other
                    myBottom < otherTop) { // this above other

                    colliding = false;
                }
            }
            // if (g_DEBUG_MODE == DEBUG.ON && colliding) {
            //     console.log(`${this.id} collides with ${other.id}`);
            // }
        }

        if (colliding) this.emit('EntityCollision', this, other);

        return colliding;
    }
*/
    // update(scene) {
    //     //this.redraw = this.pos;
    //     //this.pos.x = Math.floor(this.pos.x);
    //     //this.pos.y = Math.floor(this.pos.y);
    //
    // }

    collidesWith(other) {
        //this.collider.update(this);
        let c = this.collider.collidesWith(other.collider);
        if (c) this.emit('EntityCollision', this, other);
        return c;
    }


    update(scene) {
        this._collider.update(this);
        //this.redraw = this.pos;
        //this.pos.x = Math.floor(this.pos.x);
        //this.pos.y = Math.floor(this.pos.y);

    }

    /**
        clear the space occupided by this entity
        @param {CanvasRenderingContext2D}
    */
    clear(ctx) {
        ctx.save();
        ctx.translate(this.redraw.x, this.redraw.y);
        ctx.rotate(this.redrawAngle.rad);

        //console.log(this.redrawAngle, this.heading);
        // ctx.clearRect(-this.width/2, -this.height/2, this.width, this.height);
        ctx.clearRect(-this.halfWidth, -this.halfHeight, this.width + 1, this.height + 1);
        ctx.restore();
    }

    /**
        Draw self in the given context.
        This should probably never be called by the user.
        @param {CanvasRenderingContext2D}
    */
    draw(ctx) {
        //this.clear(ctx);
        try {
            ctx.save();

            ctx.translate(this.x, this.y);
            ctx.rotate(this.heading.rad);

            // ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
            // ctx.drawImage(this.image, -this.halfWidth, -this.halfHeight);
            ctx.drawImage(this.image, -this.halfWidth, -this.halfHeight, this.image.width, this.image.height);
            // ctx.drawImage(this.image, 1, 1, this.image.width, this.image.height, -this.halfWidth, -this.halfHeight, this.image.width, this.image.height);

            this.redraw = this.pos;
            this.redrawAngle = this.heading;

        } catch (e) {

            console.error(e);

            console.dir(this.image);
            this.emit('HALT', e, this);

        } finally {
            ctx.restore();
        }
    }

    /* END RENDERING */
}

export { Entity };
