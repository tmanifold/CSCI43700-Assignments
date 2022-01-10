// main.js
import('./modules/engine.js')
.then((_) => {
    'use strict';

    const _Game = new _.Game();

    function init() {

        _.setDebugMode(_.DEBUG.ON);

        // stop arrow default behavior https://stackoverflow.com/a/8916697
        document.addEventListener("keydown", function(e) {
            if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);

        var scene_bg = _Game.makeScene('demo');
        var scene_fg = _Game.makeScene('demo');

        //var mouse = _Game.mouse;

        //mouse.setStyle('url(img/cursor.png), auto');

        //var burg = new _.Sprite('img/burger2.png', scene, 48, 40, scene_fg.width / 2, scene_fg.height / 2);
        //burg.addForce(new _.Vector2(10,10));
        //
        // var debugConsole = document.createElement("div");
        // document.body.appendChild(debugConsole);

        _Game.start();
    } // end init

    // Main game loop
    function update() {
        /*
        burgerlyAccurateAngles   = burg.angleTo(mouse.pos);
        burgerlyAccurateDistance = burg.distanceTo(mouse.pos);

        burg.setAngle(burgerlyAccurateAngles);
        burg.accel = new _.Vector2(0, burg.imageAngle);
        burg.accel = _.Vector2.lerp(burg.accel, burg.accel.unit.scale(1-(1/burgerlyAccurateDistance)), _.Time.delta);
        //burg.pos = Vector2.lerp(burg.pos, mouse.pos, Time.delta / 1000);
        */

        //scene.mouse.update();
        //console.log(Timer.delta());

        //debugConsole.innerHTML = "Time.delta: " + Time.delta;
    }

    init();
})
.catch((err) => {
    console.log(err);
});
