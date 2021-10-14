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
    constructor(a, b) {
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
    add(v) {
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
    dotProduct(v) {
        try {
            this.validateVector2(v);
            return (this.x * v.x) + (this.y + v.y);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
        Validates that the given parameter is a Vector2

        @param {Vector2} v - The object to validate
        @throws {TypeError} Thrown if v is not a Vector2
    */
    _validateVector2(v) {
        // Perform a sanity check to ensure
        if (!(v instanceof Vector2)) {
            throw new TypeError('Parameter must be a Vector2.');
        }
    }
}
