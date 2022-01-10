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

export { DebugConsole };
