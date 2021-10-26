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
        @return {vector2|null} The updated vector or null if an error occurs.
    */
    addWith(v) {
        try {
            this.validateVector2(v);

            // component add
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
    scale(n) {
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
        try {
            this.validateVector2(v);
            return (this.x * v.x) + (this.y + v.y);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
        @prop {number} magnitude - The length of the vector
    */
    get magnitude() {
        return Math.sqrt((this.x ** 2) + (this.y ** 2))
    }

    /**
        @prop {number} angle - Vector angle to x-axis in radians
    */
    get angle() {
        return Math.atan2(this.y, this.x);
    }

    /**
        Add the components of the specified vectors
        @param {Vector2} v1
        @param {Vector2} v2
        @param {...Vector2} vx - additional vectors
    */
    static add(v1, v2, ...vx) {
        Vector2.validateVector2(v1, v2, ...vx);

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
    static dotProduct(v1, v1) {
        try {
            Vector2.validateVector2(v1, v2);
            return (v1.x * v2.x) + (v1.y * v2.y);
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
    static validateVector2(...vx) {

        for (const v in vx) {
            if (!(v instanceof Vector2)) {
                throw new TypeError(`${v} must be a Vector2.`);
            }
        }

    }
}
