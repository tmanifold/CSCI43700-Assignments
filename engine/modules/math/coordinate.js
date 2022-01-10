

import { Matrix } from  './matrix.js';


class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() { return this._x; }
    set x(x) { this._x = x; }

    get y() { return this._y; }
    set y(y) { this._y = y; }

    setPosition(x, y) {
        this._x = x;
        this._y = y;
    }

    translate(x, y) {
        this.x += x;
        this.y += y;
    }

    transform() {
        // Implement matrix eventually
        // for now just take transformation matrix as implicit 2x2 matrix
        // represented linearly as a 4 element array
    }
}

class PointPolar extends Point { }

export { Point, PointPolar };
