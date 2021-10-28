
/**
    A utility class to handle conversions between degrees and radians.
    @class
*/
class Angle {
    static toRadians(degrees) { return degrees * Math.PI / 180; }
    static toDegrees(radians) { return radians * 180 / Math.PI; }
}

/**
    Constructs a Vector2.

    A vector2 is a 2-dimensional vector consisting of the components x and y

    @class
*/
class Vector2 {
    /**
        @constructs Vector2
        @param {number} a - the component corresponding to x-value
        @param {number} b - the component corresponding to y-value
    */
    constructor(a=0, b=0) {
        /** @prop {number} */
        this.x = a;
        /** @prop {number} */
        this.y = b;
    }

    /**
        Adds the components of another vector to this vector.

        @param {Vector2} v - The vector to add to this one.
    */
    addWith(v) {
        try {
            Vector2.validate(v);
            // component add
            this.x += v.x;
            this.y += v.y;

        } catch (e) {
            console.log(e);
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

    /**
        @prop {number} angle - Vector angle to x-axis in radians
    */
    get angle() { return Math.atan2(this.y, this.x); }
    set angle(a) { this.setAngle(a); }

    /**
        Set the vector angle. Recalculate x and y based on the given angle.
        @param {number} theta - the angle in radians
    */
    setAngle(theta) {
        if (theta > 2 * Math.PI) theta = theta - 2 * Math.PI;

        this.x = this.norm * Math.cos(theta);
        this.y = this.norm * Math.sin(theta);

        // sanity check to make sure we did math right
        // if (!(this.angle === theta)) {
        //     console.log(`VECTOR ERROR: ${this.angle} =/= ${theta}`)
        // }
    }

    /**
        Rotate this vector by the given amount.
        @param {number} amt - number of radians to rotate.
    */
    rotate(amt) { this.setAngle(this.angle + amt); }

    /**
        @prop {number} magnitude - The length of the vector
    */
    get magnitude() { return Math.hypot(this.x, this.y); }
    set magnitude(m) { this.setMagnitude(m); }

    /**
        Set the vector magnitude. Recalculate x and y based on the given value.
        @param {number} r - the new magnitude.
    */
    setMagnitude(r) {
        let vx = r * Math.cos(this.angle);
        let vy = r * Math.sin(this.angle);
        this.x = vx;
        this.y = vy;

        // if (!(this.magnitude === r)) {
        //     console.log(`VECTOR ERROR: ${this.magnitude} =/= ${r}`);
        // }
    }

    /**
        @prop {number} norm - The length of the vector
    */
    get norm() { return this.magnitude; }
    set norm(r) { this.magnitude = this.setNorm(r); }
    /**
        Set the vector normal. same as setMagnitude()
        @param {number} r - the new magnitude
    */
    setNorm(r) { this.magnitude = r; }

    /**
        @prop {Vector2} unit - A unit vector representation of this Vector2
    */
    get unit() { return new Vector2(this.x / this.norm, this.y / this.norm); }

    /**
        Add the components of the specified vectors
        @param {Vector2} v1
        @param {Vector2} v2
        @param {...Vector2} vx - additional vectors
        @return {Vector2} the resulting vector sum
    */
    static add(v1, v2, ...vx) {
        Vector2.validate(v1, v2, ...vx);

        let temp = v1.addWith(v2);

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
        Validates that the given parameter is a Vector2

        @param {...Vector2} vx - vectors to validate
        @throws {TypeError} Thrown if v is not a Vector2
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
