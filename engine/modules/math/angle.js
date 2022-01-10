///** @module angle */
/**
    Constructs an angle.
    @class
*/
class Angle {

    /** @static {number} TWOPI - Pi multipled by 2 */
    static TWOPI = Math.PI * 2;
    /** @static {number} HALF_PI - Pi divided by 2 */
    static HALF_PI = Math.PI / 2;

    constructor() {
        this._degrees = 0;
        this._radians = 0;
    }

    /** @prop {number} degrees */
    set deg(d) { this.setDegrees(d); }
    get deg() { return this._degrees; }

    /** sets degrees
        @param {number} deg
    */
    setDegrees(deg) {

        if (deg > 360) deg -= 360;

        this._degrees = deg;
        this._radians = Angle.toRadians(deg);

        return this;
    }

    /**
        add degrees
        @param {number} deg
    */
    addDegrees(deg) { return this.setDegrees(this._degrees + deg); }

    /** @prop {number} radians */
    set rad(r) { this.setRadians(r); }
    get rad() { return this._radians; }

    /**
        set degrees
        @param {number} rad
    */
    setRadians(rad) {

        if (rad > Angle.TWOPI) rad -= Angle.TWOPI;

        this._radians = rad;
        this._degrees = Angle.toDegrees(rad);

        return this;
    }

    /**
        add radians
        @param {number} rad
    */
    addRadians(rad) { return this.setRadians(this._radians + rad); }

    /* STATIC METHODS */

    /** @prop {number} */
    static degrees(deg) { return new Angle().setDegrees(deg); }
    /** @prop {number} */
    static radians(rad) { return new Angle().setRadians(rad); }

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

export { Angle };
