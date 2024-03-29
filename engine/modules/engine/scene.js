
/** @module scene */

import { Base } from './base.js';
import { Entity } from './entity.js';
import { Sprite, SpriteBoundary } from './sprite.js';
import { Time } from './game.js';
import { Vector2 } from '../math/vector2.js';
import * as Util from '../utility.js';

const sceneId = Util.idGenerator();
const layerId = Util.idGenerator();

// /**
//     Represents a layer in a Scene.
// */
// class Layer extends Base {
//     constructor(name, width, height, z_index=1) {
//         this._id = layerId.next().val;
//
//         Util.assert(width >= 0 && height >= 0, RangeError('width or height not greater than 0'));
//         this._width = width;
//         this._height = height;
//     }
// }

/**
    Constructs a Scene.

    A scene manages the canvas element and handles timing and user input.
    @class
*/
class Scene extends Base {
    /**
        @param {string} target - id of the target element in which to create the canvas. If target is not specified or doesn't exist, the canvas will be appended to the document body.
        @param {number} width=640
        @param {number} height=480
    */
    constructor(name, width = 640, height = 480) {
        super();

        this._name = name;

        this._layers = []; // implement this so it actually works

        // initialize and create a canvas element in the page and get 2d context
        /** @prop {object} _canvas - the canvas element in the page */
        this._canvas = document.createElement('canvas');
        this._canvas.style.border = "1px solid grey";
        this._canvas.style.position = "absolute";
        this._canvas.id = this._name;

        // stop context menu on canvas
        this._canvas.oncontextmenu = (e) => { e.preventDefault(); }

        this.setSize(width, height);

        /** @prop {object} _context - the 2d context for the canvas object */
        this._context = this._canvas.getContext('2d');

        // /** @prop {Sprite[]} sprites - list of sprites in the scene */
        // this._sprites = [];

        this._entities = [];

        /** @prop {number} delay=50 - update interval delay for the scene. */
        this._delay = 50;

        this._isPaused = false;

        this._id = sceneId.next();
        this._name = `Scene${this._id}`;

        this._zindex = 0;

        this._visible = true;

        this._bgImage = null;

        this._precision = 5;

        this.on('EntityMarkedForDelete', (e) => {
            console.log(e);
            this.deleteEntity(e);
        });
    }


    /** @prop {number} id - integer identifier
        @readonly */
    get id() { return this._id; }

    /** @prop {string} */
    get name() { return this._name; }
    set name(n) { this.setName(n); }

    /** set the scene name
        @param {string}
    */
    setName(n) {
        this._name = n;
        this._canvas.id = m;
    }

    /** @param {boolean} */
    get visible() { return this._visible; }

    /** set visible to false */
    hide() {
        this._visible = false;
        this._canvas.style.visibility = 'hidden';
    }
    /** set visible to true */
    show() {
        this._visible = true;
        this._canvas.style.visibility = 'visible';
    }

    // /** Sets the update delate for the scene.
    //     @prop {number} d - integer specifying the clock update delate.
    // */
    // setDelay(d) { this._delay = d; }

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

    /** @prop {number} coordinate decimal precision */
    set precision(p) { this._precision = p; }
    get precision() { return this._precision; }

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

    /** Andy's setposition function for managing top and left offset
        @param {number} top
        @param {number} left
    */
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

    /** @prop {number} - z-index in page */
    set zindex(n) { this.setZIndex(n); }
    get zindex() { return this._zindex; }

    /** set the z index
        @param {number}
    */
    setZIndex(z) { this._canvas.style.zIndex = `${z}`; }

    /**
        attach this scene and it's canvases as children of the target
        @param {HTMLElement}
        @return {Scene} this
    */
    attach(target) {
        /** @prop {object} _target - reference to the element the canvas should be created in. */
        this._target = document.getElementById(target);

        if (!this._target) {
            document.body.appendChild(this._canvas);
        } else {
            this._target.appendChild(this._canvas);
        }

        return this;
    }

    /* END POSITION */

    /* CANVAS STYLE */

    /** set mouse style
    @param {string}
    */
    set mouseStyle(s) { this._canvas.style.cursor = s; }

    /** @prop {string} sets background color */
    set bgColor(color) { this.setBgColor(color); }

    /**
        Set the background color for the canvas
        @param {string} color
    */
    setBgColor(color) { this._canvas.style.backgroundColor = color; }

    /** set border color
        @param {string} border - border style
    */
    setBorder(border) { this._canvas.style.border = border; }

    /** @prop {CanvasImageSource} */
    set bgImage(img) { this.setBgImage(img); }
    get bgImage() { return this._bgImage; }
    /** set the background image
        @param {CanvasImageSource}
    */
    setBgImage(img) { this._bgImage = img; }

    /* END STYLE */

    /** @prop {Array.<Entity>} */
    get entities() { return this._entities; }
    set entities(e) { this.setEntities(e); }

    /** Set the sprites array
        @param {Array.<Entity>} e
    */
    setEntities(e) {
        Util.validateType(Entity, ...e);
        this._entities = e;
    }

    /** Append entities to the entities array
        @param {Entity} s1
        @param {...Entity} sargs - additional entities
        @throws {TypeError} if not a valid entity
    */
    addEntity(e1, ...eargs) {
        Util.validateType(Entity, e1, ...eargs);
        this._entities.push(e1,...eargs);
    }

    /**
        Mark an entity for deletion
        @param {Entity}
    */
    deleteEntity(entity) {

        entity.clear(this.ctx);

        let index = this._entities.findIndex((e) => {
            return Object.is(entity, e);
        });

        if (index >= 0) {
            this._entities.splice(index, 1);
            entity = null;
        }
    }

    /**
        Starts a scene. Calls setInterval
         using this.updateLocal and this._delay
    */
    // start() {
    //     // start frames
    //     //this._intervalId = setInterval(this.updateLocal, this._delay);
    //     this._intervalId = window.requestAnimationFrame(() => { this.render(); });
    // }

    /** mark as paused */
    pause() { this._isPaused = true; }

    /** mark as not paused */
    resume() { this._isPaused = false; }

    /** Stop the scene. */
    //end() { window.cancelAnimationFrame(this._intervalId); } //clearInterval(this._intervalId); }

    /** Clear the canvas by overwriting it with white */
    clear(layer) { this._context.clearRect(0, 0, this._canvas.width, this._canvas.height); }

    /** @prop {CanvasRenderingContext2D} */
    get ctx() { return this._context; }

    /**
    Round the coordinates of the specified vector to this._precision.
    @param {Vector2} vec - vector to round; Mutated
    @return {Vector2}
    */
    roundCoordinates(vec) {
        vec.setCartesian(Util.setPrecision(vec.x, this.precision), Util.setPrecision(vec.y, this.precision));
    }

    predictCollisions() {
        for (const entity of this._entities) {

        }
    }

    prerender(renderFunc, width = this._width, height = this._height) {
        let offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;

        let offscreenCtx = offscreen.getContext('2d');
        renderFunc(offscreenCtx);

        return offscreen;
    }

    drawBg() {
        if (this._bgImage) {
            try {
                this._context.drawImage(this._bgImage, 0, 0);
            } catch (e) {
                console.log(e);
            }
        }
    }

    drawDebugInfo(d_ctx, entity) {

        d_ctx.save();

        d_ctx.lineWidth = 1;

        // draw Bounding Box
        (entity.flags.colliding)
        ? d_ctx.strokeStyle = 'red'
        : d_ctx.strokeStyle = 'grey';
        if (entity.collider !== null) entity.collider._draw(d_ctx);
        // d_ctx.strokeStyle = 'grey';
        // d_ctx.translate(entity.x, entity.pos.y);
        // d_ctx.rotate(entity.heading.rad);
        // //d_ctx.strokeRect(entity.redraw.x - entity.halfWidth, entity.redraw.y - entity.halfHeight, entity.width, entity.height);
        // d_ctx.strokeRect(-entity.halfWidth, -entity.halfHeight, entity.width, entity.height);

        //d_ctx.restore();


        //d_ctx.save();

        // redraw region
        // d_ctx.save();
        // d_ctx.strokeStyle = 'orange';
        // d_ctx.translate(entity.redraw.x, entity.redraw.y);
        // d_ctx.rotate(entity.redrawAngle.rad);
        // //d_ctx.strokeRect(entity.redraw.x - entity.halfWidth, entity.redraw.y - entity.halfHeight, entity.width, entity.height);
        // d_ctx.strokeRect(-entity.halfWidth, -entity.halfHeight, entity.width, entity.height);
        // d_ctx.restore();

        //draw AABB
        // d_ctx.strokeRect(entity.pos.x - entity.halfWidth, entity.pos.y - entity.halfHeight, entity.width, entity.height);

        // write text data
        d_ctx.font = '8pt sans-serif';
        d_ctx.fillStyle = 'black';
        // // d_ctx.fillText(`${entity.x} | ${entity.y}`,entity.pos.x - entity.halfWidth, entity.pos.y + entity.halfHeight + 10);
        // // d_ctx.fillText(`${entity.x.toFixed(this.precision)} | ${entity.y.toFixed(this.precision)}`,entity.pos.x - entity.halfWidth, entity.pos.y + entity.halfHeight + 10);
        // (entity.pos.x == entity.redraw.x && entity.pos.y == entity.redraw.y)
        // ? d_ctx.fillStyle = 'blue'
        // : d_ctx.fillStyle = 'black';
        //
        // d_ctx.fillText(`pos: ${entity.x} | ${entity.y}`,entity.pos.x + entity.halfWidth + 5, entity.pos.y - 10);
        // d_ctx.fillText(`redraw: ${entity.redraw.x} | ${entity.redraw.y}`, entity.pos.x + entity.halfWidth + 5, entity.pos.y);
        //
        // (entity.heading.rad == entity.redrawAngle.rad && entity.heading.rad == entity.redrawAngle.rad)
        // ? d_ctx.fillStyle = 'blue'
        // : d_ctx.fillStyle = 'black';
        // d_ctx.fillText(`heading: ${entity.heading.rad}`, entity.pos.x + entity.halfWidth + 5, entity.pos.y + 20);
        // d_ctx.fillText(`redrawAngle: ${entity.redrawAngle.rad}`, entity.pos.x + entity.halfWidth + 5, entity.pos.y + 10);
        //
        d_ctx.fillText(`frametime: ${Time.delta} ms`, 0, 10);
        d_ctx.fillText(`FPS: ${parseInt(1000 / Time.delta)}`, 0, 20);
        d_ctx.restore();
    }

    /**
        Draw image to the canvas.
        @param {CanvasImageSource}
    */
    draw(im) {
        im.draw(this.ctx);
        //this.drawDebugInfo(im);
    }

    /** Runs once per frame. Called from Game update. Updates the Scene state*/
    update(game) {
        this._context.imageSmoothingEnabled = false;
        if (this._isPaused == false) {
            //for (const layer in this._layers) {
                //this.clear(); // clear the canvas
                this.drawBg(); // draw the background

                // DEBUG STUFF SETUP

                let d_canvas = document.getElementById('debugLayer');

                if (d_canvas === null) {
                    d_canvas = document.createElement('canvas');
                    d_canvas.id = 'debugLayer';
                    d_canvas.width = this.width;
                    d_canvas.height = this.height;
                    d_canvas.style.position = 'absolute';
                    d_canvas.style.zIndex = `${Number.MAX_SAFE_INTEGER}`;
                    d_canvas.oncontextmenu = (e) => { e.preventDefault(); }
                    this._target.appendChild(d_canvas);
                }

                let d_ctx = d_canvas.getContext('2d');
                d_ctx.clearRect(0, 0, d_canvas.width, d_canvas.height);

                // END DEBUG STUFF

                //this.predictCollisions();

                for (const entity of this._entities) {
                    //    this._context.clearRect(sprite._lastPos.x - sprite.width / 2, sprite._lastPos.y - sprite.height  / 2, sprite.width, sprite.height);
                    entity.update(this);
                    //this.roundCoordinates(entity.pos);
                    //this.roundCoordinates(entity.redraw);

                    if (entity.visible) {
                        entity.clear(this._context);
                        entity.draw(this._context);
                    }
                    this.drawDebugInfo(d_ctx, entity);

                    //this._context.drawImage(entity.image, entity.pos.x, entity.pos.y, entity.width, entity.height);
                }
                //window.requestAnimationFrame(() => { this.render(); });
            //}
        }
    }
} // end Scene

export { Scene };
