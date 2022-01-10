/** @module utility */

/**
Throws an error if the given expression is not true.
@param {boolean} expr - the expression to evaluate
@param {Error=} err=Error() - the error to throw
@throws {Error} Throws err if expr is not true
@function
*/
export const assert = (expr, err = new Error(`Assertion failed`)) => {
    if (expr !== true) throw err;
};

export const logObj = (obj) => console.log(JSON.parse(JSON.stringify(obj)));

/**
    A utility function to validate the type of objects.
    @param {Type} type - the type to check
    @param {...Object} args - the objects to check
    @throws {TypeError} Throws TypeError if an argument is not of the specified `type`.
    @function
 */
export const validateType = (type, ...args) => {
    for (const arg of args) {
        assert(
            arg instanceof type,
            new TypeError(`${arg}[${arg.constructor.name}]: must be ${type}`)
        );
        //if (!(arg instanceof type)) throw new TypeError(`${arg}[${arg.constructor.name}]: must be ${type}`);
    }
};

export const copyObject = (dest, ...src) => Object.assign(dest, ...src);

/**
    Sequentially generate ID numbers for objects
    @yields {number} the next id number
*/
export function* idGenerator() {
    let i = 0;
    while (true) yield i++;
};

/**
    No operation. It is probably bad practice to use this. If you are using this,
    you should probably just restructure your code. Or don't.
    This is gross and javascript is gross. Do whatever you want.
    @function
*/
export const noop = () => {};

/**
    Get the given number with the specified number of digits after the decimal point.
    @param {number} num
    @param {number} digits - the number of digits after the decimal
    @return {number}
    @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    @function
*/
export const setPrecision = (num, digits) => parseFloat(num.toFixed(digits));

/**
    Get a random integer in the range. Supports negatives.
    @param {number} min
    @param {number} max
    @return {number}
    @function
*/
// https://kadimi.com/negative-random/
export const randRange = (min, max) => {
    assert(min < max, `Assertion failed: ${min} < ${max}`);
    let n = Math.floor(Math.random() * (max - min + 1)) + min;
    assert(n >= min && n <= max, new RangeError(`Assertion failed: ${n} >= ${min} && ${n} <= ${max}`));
    return n;
};

/**
    Test the performance of a function
    @param {function} fn - the function to measure
    @param {Object=} thisArg=null - see [Function.prototype.call()]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call}
    @param {number=} iter=10000 - number of iterations to  run
    @return {number}
    @function
*/
export const benchmark = async (fn, thisArg=null, ...args) => {
    console.log(`[benchmark]: Starting ${fn.name}()`);
    let start = performance.now();
    let ret = (fn instanceof Object.getPrototypeOf(async function(){}).constructor)
        ? await fn.call(thisArg, ...args)
        : fn.call(thisArg, ...args);
    let end = performance.now() - start;
    console.log(`[benchmark]: ${fn.name}() Completed in ${end} ms`);
    return {time: end, ret: ret};
};

/**
    Get an asynchronous copy of a function.
    @param {Function} fn
    @param {Object} thisArg - value to use as 'this' when calling fn
    @return {AsyncFunction}
*/
export const makeAsync = (fn, thisArg=null) => {
    return (async function (...args) {
        fn.call(thisArg, ...args);
    });
};

export const isOdd = n => n & 1;
export const isEven = n => !(n & 1);

export const isOddMod = n => n % 2 != 0;
export const isEvenMod = n => n % 2 == 0;
