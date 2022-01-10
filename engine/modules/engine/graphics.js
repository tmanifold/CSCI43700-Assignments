
/** @module graphics */

import { Base } from './base.js';
import * as Util from '../utility.js';

// TODO: make async versions
// TODO: https://cs.iupui.edu/~ajharris/437/transform.html

/**
    Handles rendering of images to a canvas object
    @class
*/
class Graphics extends Base {

    static cache = new Map();

    static clear(ctx, x, y, width, height, translation, rotation) {
        ctx.save();
        ctx.clearRect(x, y, width, height);
        ctx.restore();
    }

    // /**
    //     Draws objects in the given 2d context
    //
    // */
    // static draw(ctx, ...things) {
    //     this.clear(ctx);
    //
    //     ctx.save();
    //
    //     ctx.translate(this._pos.x, this._pos.y);
    //     ctx.rotate(this._heading.rad);
    //
    //     ctx.drawImage(this._image, -this.halfWidth, -this.halfHeight, this._width, this._height);
    //
    //     ctx.restore();
    // }

    /**
        Pre-render images offscreen.
        @param {function} render - rendering operation to perform
        @param {number} width - width of the output object
        @param {number} height - height of the output object
        @return {HTMLCanvasElement} a canvas element containing the pre-rendered image.
    */
    static prerender(render, width, height) {
        Util.assert(render instanceof Function)
        const _pre = document.createElement('canvas');
        _pre.width = width;
        _pre.height = height;

        const ctx = _pre.getContext('2d');

        const ret = render.call(null, ctx);

        return _pre;
    }

    /**
        Preload an HTMLImageElement.
        @param {string} src - the image source
        @return {HTMLImageElement}
    */
    static preloadImage(src, width=1, height=1) {

// TODO: CACHING

        // let i;
        //
        // if(this.cache.has(src)) {
        //     i = this.cache.get(src);
        //     console.log(i);
        // } else {
        //
        //     var img = new Image();
        //     img.src = src;
        //     img.onload = (cb instanceof Function) ? cb : () => {
        //         console.log(`loaded ${img.src}`);
        //         return img;
        //     };
        //
        //     this.cache.set(src, img);
        //
        //     i = img;
        //
        // }
        // console.log(this.cache);
        // return i;

        var img = new Image(width, height);
        img.decoding = 'sync';
        img.src = src;

        img.onload = () => {
            //console.log(`loaded ${img.src}`);
            return img;
        };
        // img.onload = (cb instanceof Function) ? cb : () => {
        //     console.log(`loaded ${img.src}`);
        //     return img;
        // };

        return img;
    }

    /**
        Pre-render images offscreen.
        @param {number} width - width of the output object
        @param {number} height - height of the output object
        @param {function} render - rendering operation to perform
        @return {HTMLCanvasElement} a canvas element containing the pre-rendered image.
    */
    static prerender(width, height, render) {
        Util.assert(render instanceof Function)
        const _pre = document.createElement('canvas');
        _pre.width = width;
        _pre.height = height;

        const ctx = _pre.getContext('2d');

        const ret = render.call(null, ctx);

        return _pre;
    }

    /**
        Blits an image by directly manipulating image data
        Based on code from [this post]{@link https://stackoverflow.com/a/58485681)
        @private
    */
    static blit(r_ctx, s_ctx, x=0, y=0) {

        let r_width  = r_ctx.canvas.width;
        let r_height = r_ctx.canvas.height;
        let r_data   = r_ctx.createImageData(r_width, r_height);
        let r_buf    = new Uint32Array(r_data.data.buffer);

        if (s_ctx instanceof HTMLCanvasElement) s_ctx = s_ctx.getContext('2d');
        Util.assert(s_ctx instanceof CanvasRenderingContext2D, new TypeError(`[Graphics.blit] Invalid rendering context.`));
        let s_width  = s_ctx.canvas.width;
        let s_height = s_ctx.canvas.height;
        let s_data   = s_ctx.getImageData(0, 0, s_width, s_height).data;
        Util.assert(s_data.length === 4 * s_width * s_height, new RangeError(`[Graphics.blit] Error obtaining source data.`));

        let start = x * y;

        // for (let i = 0; i < r_buf.length; i++) {
        //     r_buf[start + i * ] = 0xFF000000;
        // }

        for (let i = 0; i < s_data.length; i++) {
            r_buf[i + start] = 0xFF000000;
        }

        r_ctx.putImageData(r_data, 0, 0);
    }

    /**
        Render an image in the given context
        @param {CanvasRenderingContext2D} ctx
        @param {CanvasImageSource} img - see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource}
        @param {number} - x position
        @param {number} - y position
        @param {number} - width dimensions
        @param {number} - height dimensions
    */
    static render(ctx, img, x, y, w, h) {

        ctx.save();

        ctx.drawImage(img, x, y, w, h);

        ctx.restore();
    }

    static validateImageData(src, test, msg='') {
        for (let i = 0; i < src.width * src.height; i++) {
            Util.assert(src.data[i] === test.data[i], new Error(msg));
        }
    }

    static test(canvas) {

        Util.assert(canvas && canvas instanceof HTMLCanvasElement, new TypeError(`Error obtaining reference to canvas: ${canvas}`));
        console.log('Canvas object: ok.');

        const t_width = canvas.width;
        const t_height = canvas.height;

        Util.assert(t_width == canvas.width && t_height == canvas.height, new RangeError('Provided canvas has invalid height or width'));
        console.log('Canvas dimensions: ok');

        // attempt to get 2d rendering context
        const t_ctx = canvas.getContext('2d');

        Util.assert(t_ctx && t_ctx instanceof CanvasRenderingContext2D, new TypeError(`Error obtaining rendering context: ${canvas}`));
        console.log('Rendering context: ok.');


        // initially clear canvas
        // let t_start = performance.now();
        // this.clear(t_ctx, 0, 0, t_width, t_height);
        // let t_end = performance.now() - t_start;
        let t_result = Util.benchmark(this.clear, this, t_ctx, 0, 0, t_width, t_height);

        // test image data after clearing
        const firstClearData = t_ctx.getImageData(0, 0, t_width, t_height);
        const testImageData = new ImageData(t_width, t_height);

        this.validateImageData(firstClearData, testImageData, `Canvas ImageData does not match blank ImageData after clear.`);
        console.log('clear: ok.');

        // test prerender
        const t_pre = this.prerender((ctx) => {
            ctx.fillStyle = 'black';

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
            ctx.lineTo(0, ctx.canvas.height);
            ctx.fill();

        }, t_width / 20, t_height / 20);

        // var t_pre = null;
        // Util.benchmark(
        //     this.prerender,
        //     null,
        //     (ctx) => {
        //         ctx.fillStyle = 'black';
        //
        //         ctx.beginPath();
        //         ctx.moveTo(0, 0);
        //         ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
        //         ctx.lineTo(0, ctx.canvas.height);
        //         ctx.fill();
        //
        //     },
        //     t_width / 20,
        //     t_height / 20)
        // .then((result) => {
        //     t_pre = result.ret;
        // });

        Util.assert(t_pre && t_pre instanceof HTMLCanvasElement, new TypeError(`Error obtaining reference to prerendered canvas: ${t_pre}`));
        console.log('prerender: ok.');

        this.clear(t_ctx, 0, 0, t_width, t_height);

        const t_prePattern = this.prerender((ctx) => {
            for (let i = 0; i < t_width; i += t_pre.width) {
                for (let j = 0; j < t_height; j += t_pre.height) {
                    ctx.drawImage(t_pre, i, j, t_pre.width, t_pre.height);
                }
            }
        }, t_width, t_height);
        Util.assert(t_prePattern && t_prePattern instanceof HTMLCanvasElement, new TypeError(`Error obtaining reference to prerendered pattern: ${t_prePattern}`));

        //test rendering the prerendered image to the display
        for (let i = 0; i < t_width; i += t_pre.width) {
            for (let j = 0; j < t_height; j += t_pre.height) {
                this.render(t_ctx, t_pre, i, j, t_pre.width, t_pre.height);
            }
        }

        this.validateImageData(t_ctx.getImageData(0, 0, t_width,t_height), t_prePattern.getContext('2d').getImageData(0, 0, t_prePattern.width, t_prePattern.height), `Error matching patterns.`);
        console.log('render: ok.');

        // this.clear(t_ctx, 0, 0, t_width, t_height);

        this.blit(t_ctx, t_pre, t_width/2, t_height/2);

        //this.validateImageData(t_ctx.getImageData(0, 0, t_width,t_height), t_prePattern.getContext('2d').getImageData(0, 0, t_prePattern.width, t_prePattern.height), `Error matching patterns.`);
        console.log('blit: ok.')

        // t_ctx.save();
        // t_ctx.translate(t_width/2, t_height/2);
        // t_ctx.rotate(Math.PI / 4);
        // t_ctx.clearRect(-50, -50, 100, 100);

        t_ctx.restore();

        return 1;
    }
}

export { Graphics };

//
// (function () {
//     'use strict';
//
//     var t_canvas = document.getElementById('test');
//
//     Util.benchmark(Graphics.test, Graphics, t_canvas).then((res) => {
//         console.log(res);
//     }).catch((e) => {
//         console.log(e);}
//     );
//
// })();
