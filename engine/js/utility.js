
/**
    A utility class to handle angles.
    @class
*/

class Angle {

    /** @static {number} TWOPI - Pi multipled by 2 */
    static TWOPI = Math.PI * 2;

    constructor() {
        this._degrees = 0;
        this._radians = 0;
    }

    /** @prop {number} degrees */
    set deg(d) { this.setDegrees(d); }
    get deg() { return this._degrees; }

    setDegrees(deg) {

        if (deg > 360) deg -= 360;

        this._degrees = deg;
        this._radians = Angle.toRadians(deg);
    }

    /** @prop {number} radians */
    set rad(r) { this.setRadians(r); }
    get rad() { return this._radians; }

    setRadians(rad) {

        if (rad > Angle.TWOPI) rad -= Angle.TWOPI;

        this._radians = rad;
        this._degrees = Angle.toDegrees(rad);
    }

    /* STATIC METHODS */

    /**
        @param {number} degrees
        @return {number} radians
        @static
    */
    static toRadians(degrees) { return degrees * Math.PI / 180; }
    /**
        @param {number} radians
        @return {number} degrees
        @static
    */
    static toDegrees(radians) { return radians * 180 / Math.PI; }
} // end Angle

/**
    Represents a debug console in the page. Appends the console as a child of the specified
     target_element or the document body if none is provided.
    @class
*/
class DebugConsole {
    /** @param {Element} target_element - an HTML element in which to construct the debug console. This should probably be a div or some similar element. */
    constructor(target_element) {

        this._eTarget = document.getElementById(target_element);

        this._eContainer = document.createElement('div');
        this._sBorder = '1px solid grey';

        this._eContainer.style.border = this._sBorder;

        this._bVisible = false;
        this._bWriteToSystemConsole = true;

        this._eOutputArea = document.createElement('div');

        this._eOutputArea.style = 'overflow-y: scroll;';

        this._eContainer.appendChild(this._eOutputArea);

        if (!this._eTarget) {
            document.body.appendChild(this._eContainer);
        } else {
            this._eTarget.appendChild(this._eContainer);
        }
    }

    set visible(v) { this._bVisible = true; }
    get visible() { return this._bVisible; }

    log(...args) {

        for (const arg of args) {
            this._eOutputArea.innerHTML += arg;
        }

        if (this._bWriteToSystemConsole) { console.log(...args); }
    }
} // end DebugConsole

/**
    Constructs a Vector2.

    A vector2 is a 2-dimensional vector consisting of the components x and y

    @class
*/
class Vector2 {

    /**
        @constructs Vector2
        @param {number} a - Corresponds to the x-component if isPolar=false. Otherwise corresponds to polar coordinate r.
        @param {number} b - Corresponds to the y-component if isPolar=false. Otherwise corresponds to polar coordinate angle theta.
        @param {boolean} isPolar - if the vector is expressed in polar coordinates. regardless of this flag's value, cartesian and polar coordinates will be calculated and stored. This flag is only for initialization.
    */
    constructor(a=0, b=0, isPolar = false) {

        if (isPolar === true) {
            this._r = a;
            this._angle = b;

            this._recalcFromPolar();

            // this._x = r * Math.cos(this.theta);
            // this._y = r * Math.sin(this.theta);
        } else {
            this._x = a;
            this._y = b;

            this._recalcFromCart();
            // this._r = Math.hypot(x, y);
            // this._angle = Math.atan2(y, x);
        }
    }

    /* BEGIN ATTRIBUTES */

    /** @prop {number} x - x-coordinate */
    get x() { return this._x; }
    set x(val) {
        this._x = val;
        this._recalcFromCart();
    }

    /** @prop {number} y - y-coordinate */
    get y() { return this._y; }
    set y(val) {
        this._y = val;
        this._recalcFromCart();
    }

    /** @prop {number} r - The vector length */
    get r() { return this._r; }
    set r(val) {
        this._r = r;
        this._recalcFromPolar();
    }

    /** @prop {number} mag - The magnitude (length) of the vector */
    get mag() { return this._r; }
    set mag(val) { this.r = val; }

    /** @prop {number} angle - Vector angle in radians */
    get angle() { return this._angle; }
    set angle(a) { this.setAngle(a); }

    /**
        Set the vector angle. Recalculate x and y based on the given angle.
        @param {number} theta - the angle in radians
    */
    setAngle(theta) {
        (theta > Angle.TWOPI) ? this._angle = theta - Angle.TWOPI : this._angle = theta;
        this._recalcFromPolar();
        return this;
    }

    /**
        Rotate this vector by the given amount.
        @param {number} rad - number of radians to rotate.
    */
    rotate(rad) {
        this.setAngle(this.angle + rad);
        return this;
    }

    /** Convenience function to recalculate x and y values based on change in r or angle */
    _recalcFromPolar() {
        this._x = this._r * Math.cos(this._angle);
        this._y = this._r * Math.sin(this._angle);
    }
    /** Convenience function to recalculate r and angle values based on a change in x or y */
    _recalcFromCart() {
        this._r = Math.hypot(this._x, this._y);
        this._angle = Math.atan2(this._y, this._x);
    }

    /* END ATTRIBUTES */

    /* VECTOR OPERATIONS */

    /**
        Adds the components of another vector to this vector.

        @param {Vector2} v - The vector to add to this one.
        @return {Vector2|null}
    */
    addWith(v) {
        try {
            Vector2.validate(v);
            this.x += v.x;
            this.y += v.y;

            return this;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
        Multiplies vector components by the given scalar.
        @param {number} n - A scalar to be applied to the vector.
        @return {Vector2} The scaled vector
    */
    scaleBy(n) {
        this.x *= n;
        this.y *= n;

        return this;
    }

    /**
        Compute the dot product of this vector and another vector.

        @param {Vector2} v - The vector to dot with this one.
        @return {number|null} The dot product or null if an error occurs.
    */
    dotWith(v) {
        Vector2.dotProduct(this, v);
        try {
            Vector2.validate(v);
            return (this.x * v.x) + (this.y + v.y);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /** @prop {Vector2} unit - A unit vector representation of this Vector2 */
    get unit() { return new Vector2(this.x / this.mag, this.y / this.mag); }

    /**
        Add the components of the specified vectors
        @param {Vector2} v1
        @param {Vector2} v2
        @param {...Vector2} vx - additional vectors
        @return {Vector2} the resulting vector sum
    */
    static add(v1, v2, ...vx) {
        //Vector2.validate(v1, v2, ...vx);

        let temp = new Vector2().addWith(v1).addWith(v2);

        for (const v of vx) temp.addWith(v);

        return temp;
    }

    /**
        Compute the dot product of the two given vectors

        @param {Vector2} v1
        @param {Vector2} v2
        @return {number|null} The dot product or null if an error occurs.
    */
    static dotProduct(v1, v2) {
        try {
            Vector2.validate(v1, v2);
            return (v1.x * v2.x) + (v1.y * v2.y);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
        Scale the magnitude of the vector v by scalar m.
        @param {Vector2} v - The Vector2 to be scaled.
        @param {number} m - the scalar
        @return {Vector2|null} Returns the scaled Vector2 or null if an exception occurs.
    */
    static scale(v, m) {
        try {
            Vector2.validate(v);
            return new Vector2(v.x * m, v.y * m);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
        Get a vector2 from polar coordinates.
        @param {number} r - radius
        @param {number} theta - angle
        @return {Vector2}
        @static
    */
    static fromPolar(r, theta) { return new Vector2(r, theta, true); }

    /**
        Calculates the linear interpolation between two Vector2 objects
        @param {Vector2} v0
        @param {Vector2} v1
        @param {number} t
        @return {Vector2|null} Returns a Vector2 of the linear interpolation or null if an error occurs.
        @static
    */
    static lerp(v0, v1, t) {
        try {
            Vector2.validate(v0, v1);

            // Lerp is given by ((1 - t) * v0) + (t * v1);
            return Vector2.add(Vector2.scale(v0, 1 - t), (Vector2.scale(v1, t)));

        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
        Validates that the given parameter is a Vector2

        @param {...Vector2} vx - vectors to validate
        @throws {TypeError} Throws TypeError if v is not a Vector2
    */
    static validate(...vx) {
        for (const v of vx) {
            if (!(v instanceof Vector2)) {
                throw new TypeError(`${v} must be a Vector2.`);
            }
        }
    }

    /**
        @prop {Vector2} I_HAT - The vector <1, 0>
    */
    static get I_HAT() {
        return new Vector2(1, 0);
    }

    /**
        @prop {Vector2} K_HAT - The vector <0, 1>
    */
    static get K_HAT() {
        return new Vector2(0, 1);
    }
}
