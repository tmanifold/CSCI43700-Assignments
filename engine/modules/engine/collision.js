
/** @module collision */

import { Angle , Point, Vector2, Matrix } from '../math.js';
import { Base } from './base.js';
import * as Util from '../utility.js';

const COLLISION_MODEL = {
    AABB: 0,
    CIRCLE: 1,
    SAT: 2
};

//class CollisionMatrix extends Array {
    // constructor() {
    //     super();
    // }
//}

/**
    Represents a collision between objects
    Maybe actually make this a collision manager and handle phases and stuff
*/
class Collision extends Base {
    /** @param {...Entity} obj - entities involved in the collision */
    constructor(...obj) {
        super();
        this.objects = [...obj];
    }

    propagate() { this.emit('Collision', this); }
}

/**
    Represents the edge of a Collider polygon given by two points.
    @class
 */
class Edge {
    /**
        @param {Vector2} p1
        @param {Vector2} p2
    */
    constructor(p1, p2) {
        this._p1 = p1;
        this._p2 = p2;
    }

    /** @prop {Array} pts - an ordered pair containing the start and end points of this edge*/
    get pts() { return [this._p1, this._p2]; }

    /** @prop {Edge} perp - and edge perpendicular to this one */
    get perp() {
        return new Edge(this._p1.normal, this._p2.normal);
    }
}

/**
    Represents a collider. Handles collision detection
    @class
*/
class Collider extends Base {
    /**
        @param {Vector2} pos - centerpoint
        @param {Array} vx - array of points representing the collider
    */
    constructor(pos, vx) {
        super();
        //console.log('Collider ...vx', ...vx);
        this._pos = new Vector2(pos.x, pos.y);
        this._angle = new Angle();
        this._vertices = this._makeVertsFromPairs(vx);
        // this._vertices = vx.map(v => new Vector2(v[0], v[1]));
        //console.log('collider verts', this._vertices);
        this._edges = this._makeEdges(this._vertices);
        this._enabled = true;

        this._flags = {
            enabled: true
        };
    }
    // create point objects from array of arrays representing points
    // ex. [ [1,1], [2,2], [4,5] ]
    /**
        Converts a set of points given by an array of ordered pairs to a set of Points
        @param {Array}
        @return {Array.<Point>}
        @private
    */
    _makePoints(points) {
        return points.map( p => new Point(p[0], p[1]) );
    }

    /**
        Converts a set of points given by an array of ordered pairs to an array of Vector2
        @param {Array}
        @return {Array.<Vector2>}
        @private
    */
    _makeVertsFromPairs(pairs) {
        //console.log('pairs', pairs);
        return pairs.map( p => new Vector2(p[0], p[1]) );
    }

    /**
        Converts a set of points to a component Vector2
        @param {Array}
        @return {Array.<Vector>}
        @private
    */
    _makeEdges(vx) {
        return vx.map((item, i, arr) => {
            if (arr[i + 1]) {
                let a = arr[i+1];
                return new Vector2(item.x - a.x, item.y - a.y);
            } else {
                return new Vector2(item.x - arr[0].x, item.y - arr[0].y);
            }
        });
    }
    // _makeEdges(vx) {
    //     return vx.map((item, i, arr) => {
    //         if (arr[i + 1]) return new Edge(item, arr[i+1]);
    //         else return new Edge(item, arr[0]);
    //     });
    // }

    /**
        Calculates the normal vector of a given edge
        @param {Vector2}
        @return {Vector2}
        @private
    */
    _getEdgeNormal(edge) {

        // console.log('edge', edge);

        //let edgeVec = Vector2.diff(edge._p2, edge._p1);
        let normal = edge.normal;

        // console.log('normal',normal);
        // console.log('edgeVec', edgeVec);
        let dot =  Vector2.dotProduct(normal, edge);
        //console.log('dot', dot);
        Util.assert(0 == dot, RangeError(`Error obtaining normal for edge. ${dot}`));

        return normal;
    }

    _getEdgeNormalAngle(edge) {
        let perp = edge.perp;
        let x = perp.pts[1].x - perp.pts[0].x;
        let y = perp.pts[1].y - perp.pts[0].y;
        let angle = Math.abs(Math.atan2(y, x));
        if (angle == Math.PI) angle = 0;
        // axes.add(angle);
        return angle;
        // return new Vector2(1, angle);
    }

    /**
        @prop {Object} flags
    */
    get flags() { return this._flags; }

    /** @prop {boolean} */
    get enabled() { return this.enabled(); }
    /** @prop {boolean} */
    get disabled() { return !this.enabled(); }

    /** enable the collider */
    enable() { this._flags.enabled = true; }
    /** disable the collider */
    disable() { this._flags.enabled = false; }

    /** @prop {Array.<Vector2>} */
    get vertices() { return this._vertices; }
    set vertices(v) { this._vertices = v; }
    /** @prop {Array.<Edge>} */
    get edges() { return this._edges; }

    /** @prop {Vector2} */
    get pos(){ return this._pos; }

    /**
        Get the projection of this polyhedron onto the given axis
        @private
        @param {Vector2}
        @return {Object} an object consiting of min and max values for this projection.
    */
    _projection(axis) {

        axis = axis.unit;

        Util.validateType(Vector2, axis);

        let p_max = axis.dotWith(this.vertices[0]);
        let p_min = p_max;

        for (let i = 1; i < this.vertices.length; i++) {

            let p = axis.dotWith(this.vertices[i]);

            if (p > p_max) {
                p_max = p;
            } else if (p < p_min) {
                p_min = p;
            }
        }

        // console.log([p_min, p_max]);
        return {min: p_min, max: p_max};
    }

    /**
        Determine collision via Separating Axis Theorem
        @param {Collider} other
        @returns {boolean}
    */
    //http://programmerart.weebly.com/separating-axis-theorem.html
    collidesWith(other) {
        // do not compare against self
        if (other !== this) {
            // only check enabled colliders
            if (this.flags.enabled && other.flags.enabled) {
                // if position is the same collision is implied
                if (this._pos.x == other.pos.x
                    && this._pos.y == other.pos.y) {
                        //console.log(`${other.pos} | ${this.flags.pos}`);
                        //console.log('same')
                        return true;
                }

                // do Separating Axis Theorem
                // http://programmerart.weebly.com/separating-axis-theorem.html#:~:text=%E2%80%8BThe%20Separating%20Axis%20Theorem,the%20Polyhedra%20are%20not%20colliding.
                // 0. get edges of boudnding polygon
                // 1. create a Set of the vector normals for each edge
                // 2. project all points from each polygon onto each axis

                // let axes = this.edges.map(this._getEdgeNormal);
                let axes = this.edges.map(this._getEdgeNormal);
                axes.push(...other.edges.map(other._getEdgeNormal));


                // 3. test for overlap along each axis
                for (const axis of axes) {

                    let p1 = this._projection(axis);
                    let p2 = other._projection(axis);

                    // check overlap conditions
                    // if both conditions are true, there is no gap, meaning
                    let cond1 = p1.min < p2.max && p1.min > p2.min;
                    let cond2 = p2.min < p1.max && p2.min > p1.min;
                    if (!(cond1 || cond2)) {

                           return false;
                    }
                }


                new Collision(this, other).propagate();
                return true;
            }
        }
    }

    /** @prop {number} heading in radians */
    get heading() { return this._heading; }

    /**
        Update coordinates based on position of the given entity
        @prop {Entity}
    */
    update(entity) {
    // update(pos, angle, width, height) {

        let diff_x = entity.x - this._pos.x;
        let diff_y = entity.y - this._pos.y;

        let diff_vec = Vector2.diff(entity.pos, this._pos);

        let diff_angle = entity.heading.rad - this._angle;

        let pivot = new Point(this._pos.x, this._pos.y);

        for (const vertex of this._vertices) {

            if (this._angle != entity.heading.rad) {
                // start calculating rotation
                // rotate points https://stackoverflow.com/a/2259502
                let sin_theta = Math.sin(diff_angle);
                let cos_theta = Math.cos(diff_angle);

                // translate point back to origin:
                let px = vertex.x - pivot.x;
                let py = vertex.y - pivot.y;

                // rotate point and translate back to pivot
                let rx = (px * cos_theta) - (py * sin_theta) + pivot.x;
                let ry = (px * sin_theta) + (py * cos_theta) + pivot.y;

                vertex.setCoords(rx, ry);
            }

            if (this._pos.x != entity.x || this._pos.y != entity.y) {
                // shift vertex by amount moved
                vertex.addWith(diff_vec);
            }

        }

        this._pos.setCoords(entity.x, entity.y);
        this._angle = entity.heading.rad;

        //console.dir(this._vertices);

        this._edges = this._makeEdges(this._vertices);
    }

    _draw(ctx) {
        ctx.save();
        ctx.beginPath();

        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        //ctx.strokeRect(this.pos - 5, this.pos - 5, 10, 10);

        for (let v = 1; v < this.vertices.length; v++) {

            //ctx.moveTo(v.x, v.y);
            ctx.lineTo(this.vertices[v].x, this.vertices[v].y);
        }
        ctx.closePath();

        ctx.stroke();
        //ctx.closePath();

        ctx.restore();
    }

    static _test(t_ctx) {
        var t_col  = new Collider(new Vector2(100,100), [25,25], [50,25], [50,50], [25,50] );
        var t_col2 = new Collider(new Vector2(125,125), [50,50], [75,50], [75,75], [50,75] );
        Util.validateType(Collider, t_col);
        Util.validateType(Collider, t_col2);

        let colliders = [t_col, t_col2]

        console.log(t_col, t_col2);
        console.log('Collider instantiation: ok');

        t_ctx.clearRect(0,0,t_ctx.width, t_ctx.height);
        t_ctx.strokeStyle = 'blue';
        Util.validateType(CanvasRenderingContext2D, t_ctx);

        t_col.collidesWith(t_col2)
        ? t_ctx.strokeStyle = 'red'
        : t_ctx.strokeStyle = 'black';

        if (t_col.collidesWith(t_col2)) console.log(`collision: ${t_col} -> ${t_col2}`);

        for (const col of colliders) {
            col._draw(t_ctx);
        }


        // t_col2.collidesWith(t_col);
    }
}

/**
    A rectangular collider
*/
class BoxCollider extends Collider {
    // constructor(pos, width, height) {
    constructor(entity) {

        let vx0 = entity.pos.x - entity.halfWidth;
        let vy0 = entity.pos.y - entity.halfHeight;

        let top_left = [vx0, vy0];
        let top_right = [vx0 + entity.width, vy0];
        let bottom_left = [vx0, vy0 + entity.height];
        let bottom_right = [vx0 + entity.width, vy0 + entity.height];

        let v = [top_left, top_right, bottom_right, bottom_left];
        //console.log('BoxCollider', v);

        super(entity.pos, v);

        //console.log('boxcol ent rad',entity.heading.rad);
        this._angle = entity.heading.rad;

        // this.update(pos, width, height);
        //this.update(entity);
    }


}

class CircleCollider extends Collider {
    constructor(pos, r) {
        super(pos);
    }

    collidesWith(entity) {

    }
}

class SurfaceCollider extends Collider {
    constructor(pos = new Vector2(), pts = []) {
        // pts for surface collider do not need to result in a closed surface.
        // they can just be a collection of points forming a series of lines
    }
}

// (function () {
//     'use strict';
//
//     let t_ctx = document.getElementById('collidertest').getContext('2d');
//
//     Util.benchmark(Collider._test, Collider, t_ctx).then((res) => {
//         console.log(res);
//     }).catch((e) => {
//         console.log(e);}
//     );
// })();

export {
    //Collision,
    Collider,
    BoxCollider,
    CircleCollider,
    SurfaceCollider,
};
