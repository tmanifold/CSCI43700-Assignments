
/** @module game */

import { Base, Time } from './base.js';
import {Keyboard, Mouse } from './input.js';
import { Graphics } from './graphics.js';
import { Entity } from './entity.js';
import { Scene } from './scene.js';
import { SpriteBoundary, Sprite } from './sprite.js';
import * as Collision from './collision.js';
import * as Math_ from '../math.js';
import * as Util from '../utility.js';
import { DebugConsole } from './debugConsole.js';

/** DEBUG
    @enum {number}
    @readonly*/
export const DEBUG = {
    OFF: 0,
    ON: 1
};

// /** Flag for debug mode */
export var g_DEBUG_MODE = DEBUG.OFF;

// /** Sets g_DEBUG_MODE to the specifed debug mode */
export function setDebugMode(mode) { g_DEBUG_MODE = mode; }

/**
    Manages game components and game logic.
    Game should hold an array of scenes and have methods and
    properties to manage and control high level game logic.
    @class
*/
class Game extends Base {
    /**
        @param {number} width - width of the game area
        @param {number} height- height of the game area
    */
    constructor(width=640, height=480) {
        super();
        this._width = width;
        this._height = height;

        this._keyboard = new Keyboard();
        this._mouse = new Mouse();
        this._scenes = [];

        this._flags = {
            paused: false,
            stopped: true
        };

        this.on('EntityCreated', (entity) => {
            console.log('EntityCreated', entity);
        });

        this.on('EntityCreationFailed', (...ev) => {
            console.log('EntityCreationFailed', ...ev);
        });

        this.on('GamePause', (ev) => {
            this.pause();
            console.log('GamePause');
        });

        this.on('GameUnpause', (ev) => {
            this.unpause();
            console.log('GameUnpause');
        });

        this.on('HALT', (...ev) => {
            console.log('HALT:', ...ev);
            this.stop();
        });
    }

    /** @prop {number} */
    get width() { return this._width; }
    /** @prop {number} */
    get height() { return this._height; }


    get flags () { return this._flags; }

    // /** hide the system mouse pointer in the canvas */
    // hideSystemCursor() { this._canvas.style.cursor = "none"; }
    //
    // /** show the system mouse pointer in the canvas */
    // showSystemCursor() { this._canvas.style.cursor = "auto"; }

    /** @prop {Keyboard}
        @readonly */
    get kb() { return this._keyboard; }

    /** @prop {Mouse} */
    get mouse() { return this._mouse; }
    set mouse(m) { this.setMouse(m); }

    /**
        Set the mouse configuration.
        @param {Mouse} m - The mouse object to apply to the scene.
        @param {Scene=} scene - specify a scene for the mouse
    */
    setMouse(m, scene) {
        try {
            Util.validateType(Mouse, m);
            this._mouse = m;

            if (scene !== 'undefined') {
                scene.mouseStyle = m.style;
            }

        } catch (e) {
            console.log(e);
        }
    }

    /** @prop {Array.<Scene>} */
    get scenes() { return this._scenes; }

    /**
        Construct a new scene object
        @param {string} name
        @param {number=} width
        @param {number=} height
        @return {Scene}
    */
    makeScene(name, width = this._width, height = this._height) {
        let scene = new Scene(name, width, height);
        this._scenes.push(scene);
        return scene;
    }

    /**
        @prop {boolean}
    */
    get isPaused() { return this._flags.paused; }

    /**
        start the game loop
    */
    start() {
        this.init(); // user defined init function
        this._flags.stopped = false;
        this._renderId = window.requestAnimationFrame(() => { this._updateLocal(); });
    }

    /** pause */
    pause(scene) {
        //this._scenes.get(scene.id).pause();
        this._flags.paused = true;
    }

    /** unpause */
    unpause() {
        this._flags.paused = false;
    }

    /** stop game loop */
    stop(scene) {
        //this._scenes.get(scene.id).stop();
        this._flags.stopped = true;
    }

    /**
        local update. never call this directly. calls the user-defined update function
        @private
    */
    _updateLocal() {
        // still process inputs so unpausing is possible
        //this.kb.processKeys();

        if (!this.flags.paused) {
            Time.update();

            this.update();

            // update scenes. sprites will be updated within the scene they belong to
            for (const scene of this._scenes) {
                scene.update(this);
            }

        }

        if (this.flags.stopped) {
            window.cancelAnimationFrame(this._renderId);
        } else {
            window.requestAnimationFrame(() => { this._updateLocal(); });
        }
    }

} // end Game

class Sound {
    constructor() {
        this._player = new Audio();
        this._source = source;
    }

} // end Sound


export { Time, Game, Sound };
