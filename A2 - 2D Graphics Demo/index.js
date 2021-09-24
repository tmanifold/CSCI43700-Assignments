'use strict';

// references for jsdoc style-guide:
// https://devhints.io/jsdoc
// https://gist.github.com/customcommander/5206dcb44670e34f6923b62c1781e1d2
// https://docs.w3cub.com/jsdoc/

/**
    Width of the canvas
    @type {number}
    @const
*/
const CANVASX = 640;

/**
    Height of the canvas
    @type {number}
    @const
*/
const CANVASY = 480;

/**
    The maximum number of objects on the canvas at one time
    @type {number}
    @const
*/
const MAX_OBJ = 10;

/**
    The minimum allowed value for the components of Circle.dV

    When the minimum is reached, the components if Circle.dV will be set to 0.
    @type {number}
    @const
*/
const MIN_DELTA = 0.5; // minimum allowed dx or dy value

/**
    The amount of gravity to apply to objects
    @type {number}
*/
var G = 1;

/**
    The amount of friction to apply to objects.

    Friction is applied to Circle.dV when collisions are detected, reducing
    the object's velocity until it comes to rest.
    @type {number}
*/
var friction = 0.95;

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
        Compute the dot product of this vector and another vector.

        @param {Vector2} v - The vector to dot with this one.
        @return {number|null} The dot product or null if an error occurs.
    */
    dotProduct(v) {

        try {
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
    validate(v) {
        // Perform a sanity check to ensure
        if (!(v instanceof Vector2)) {
            throw new TypeError('Parameter must be a Vector2.');
        }
    }
}

/**
    Constructs a circle object.
    @class
*/
class Circle {
    /**
        @constructs Circle
        @param {number} posx - x-coordinate of the center point
        @param {number} posy - y-coordinate of the center point
        @param {number} radius
        @param {number} deltax - change in velocity along x-axis
        @param {number} deltay - change in velocity along y-axis
    */
    constructor(posx, posy, radius, deltax, deltay) {
        /**
            center point x-coordinate
            @prop {number} x
        */
        this.x = posx;
        /**
            center point y-coordinate
            @prop {number} y
        */
        this.y = posy;
        /**
            radius
            @prop {number} r
        */
        this.r = radius;

        /**
            A velocity vector
            @prop {Vector2} dV contains (dx, dy)
        */
        this.dV = new Vector2(deltax, deltay);
    }

    /**
        Check collisions and apply bounce affect and friction.
    */
    bounce() {
        // right boundary check
        if (this.x > CANVASX - this.r) {
            //this.dx *= -1;
            this.dV.x *= -friction;
        }
        // left boundary check
        if (this.x < 0 + this.r) {
            //this.dx *= -1;
            this.dV.x *= -friction;
        }
        // bottom boundary check
        if (this.y >= CANVASY - this.r) {
            this.dV.y *= -friction;
            //this.dy *= -1 * friction;
            this.dV.x *= friction;
            //this.dx -=  friction * this.r * G;
            this.y = CANVASY - this.r;
        }
        // top boundary check
        if (this.y < 0 + this.r) {
            //this.dy *= -1;
            this.dV.y *= -friction;
        }

        // if change in x or y directions drops below
        if (Math.abs(this.dV.y) < 1) this.dy = 0
        if (Math.abs(this.dV.x) < 1) this.dx = 0;
    }
}

/**
    Stores objects to be rendered each frame.
    @type {Array|Circle}
*/
var objects = [];

/**
    Initialize the rendering environment

    Sets the draw interval for the canvas and initializes the values
    of G and friction
*/
function init() {
    // initialize the draw interval
    setInterval(draw, 50);

    let g = document.getElementById("rngGravity");
    let gravLabel = document.getElementById("gravityValue");

    g.addEventListener("input", function(e) {
            gravLabel.innerHTML = g.value;
    });

    G = parseInt(g.value);
    gravLabel.innerHTML = G;

    let f = document.getElementById("rngFriction");
    let fricLabel = document.getElementById("frictionValue");

    f.addEventListener("input", function(e) {
            fricLabel.innerHTML = f.value;
            friction = 1 - parseFloat(f.value);
            //console.log(friction);
    });

    friction = 1 - parseFloat(f.value);
    fricLabel.innerHTML = f.value;
}

/**
    Draws a frame
*/
function draw() {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");

    var grav = document.getElementById("rngGravity");
    var fric = document.getElementById("rngFriction");

    G = parseInt(grav.value);
    friction = 1 - parseFloat(fric.value);

    grav.innerHTML = grav.value;
    fric.innerHTML = fric.value;

    // clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0, 640, 480);

    // redraw each circle
    objects.forEach(item => {
        //item.dy += (item.r / 100) * G;
        item.dV.y += G;

        item.x += item.dV.x;
        item.y += item.dV.y;

        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI);
        ctx.stroke();

        item.bounce();
    });

    // var d = document.getElementById('stats');
    // d.innerHTML = "x: " + x + "<br />y: " + y + "<br />dx: " + dx + "<br />dy: " + dy;
}

/**
    Generates a random circle object and adds it to the objects list.
*/
function spawn() {

    let r = randomIntRange(5, 50);

    objects.push(
        new Circle(randomIntRange(0 + r, CANVASX - r), // x position
                   randomIntRange(0 + r, CANVASY - 100), // y position
                   r,      // radius
                   randomIntRange(-15, 15),        // delta-x
                   randomIntRange(-15,15))                  // delta-y
    );

    console.log(objects);
}

/**
    Clears the objects list
*/
function clearScreen() {
    objects.length = 0;
}

/**
    Get a random integer between 0 and max. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    @param {number} max - The maximum value
    @return {number}
*/
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
    Get a random integer between min and max. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    @param {number} min - the minimum value
    @param {number} max - The maximum value
    @return {number}
*/
function randomIntRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
