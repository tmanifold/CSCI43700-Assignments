// matrix.js

import * as Util from '../utility.js';

/*
    REMEMBER
    YOU ARE WRITING A MATRIX LIBRARY SO YOU CAN EFFICIENTLY CALCULATE
    MATRIX TRANSFORMATIONS AND INFORM COLLISION DETECTION
*/
// /**
//     Constructs a matrix of arbitrary size
// */

// TODO: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web
class Matrix extends Array {
    // /**
    //     @param {...number} dim - dimensions
    // */
    constructor(m, n, fill=0) {
        super();

        Util.assert(m > 0 && n > 0, RangeError(`Error creating Matrix: dimensions must be greater than 0`));

        this._m = m;
        this._n = n;

        this._mat = this.fill(fill);
    }

    fill(n) {
        for (let w = 0; w < this._n; w++) {
            for (let h = 0; h < this._m; h++) {
                this._mat[w][h] = n;
            }
        }
    }

    appendRow() {

    }

    appendCol() {

    }

    add(mat) {

    }

    // perform matrix multiplication
    mul(mat) {

    }

    // scalar multiplication
    scale(val) {

    }

    // transpose the matrix by the specified coordinates
    transpose(dx, ...duhh) {

    }

    // apply the given matrix transformation
    transform() {

    }

    // identity matrix for this rows and cols
    ident() {

    }

    static zeros(m, n, ...dim) {

    }

    static ones(m, n, ...dim) {

    }

    // identity matrix for m x n
    static ident (m, n) {

    }

    static add (m0, m1) {

    }

    static mul (m0, m1) {

    }

    static of(m, n, val) {

    }

    static test() {
        var t_matrix = new Matrix(10, 10);
        Util.validateType(Matrix, t_matrix);
        console.log('Matrix instantiation: ok');
    }
}

// (function () {
//     'use strict';
//
//     Util.benchmark(Matrix.test, Matrix).then((res) => {
//         console.log(res);
//     }).catch((e) => {
//         console.log(e);}
//     );
// })();

export { Matrix };
