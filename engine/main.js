// main.js

import * as _ from './modules/engine.js';

(function() {
    'use strict';
/*
    // (async () => {
    //
    //     var log = _.makeAsync(console.log);
    //     await log(log);
    //     await log('My log does not judge.');
    //
    //     let runs = 100000;
    //     let avg = [0,0,0,0];
    //
    //     //var benchAsync = _.makeAsync(_.benchmark);
    //     //await log(benchAsync);
    //
    //     await _.benchmark(async () => {
    //
    //             await _.isOdd();
    //     });
    //
    //     await log(avg);
    //
    //
    //     // avg[2] += even;
    //     // avg[3] += evenMod;
    //     //
    //     // for (var val of res) {
    //     //     val /= runs;
    //     // }
    //
    //     await console.log('end bench');
    //
    //
    //
    // })();
*/

    const _Game = new _.Game();
    const mouse = _Game.mouse;
    const kb = _Game.kb;
    var burg, burg2, burg3;
    var cow, cow2;
    var sheep;

    var flip = false;
    var last = Date.now();

    var centerpoint;

    const debugConsole = document.createElement("div");

    // user defined init function
    _Game.init = async function () {

        document.body.appendChild(debugConsole);

        centerpoint = new _.Vector2(_Game.width/2, _Game.height/2);

        _.setDebugMode(_.DEBUG.ON);

        // stop arrow/space default behavior https://stackoverflow.com/a/8916697
        document.addEventListener("keydown", function(e) {
            if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);

        // this.kb.bindKey('Space', () => {
        //     (this.isPaused)
        //         ? this.emit('GameUnpause', this)
        //         : this.emit('GamePause', this);
        // });
        // this.on('KeyPress', (...ev) => {
        //
        //     (this.isPaused)
        //         ? this.emit('GameUnpause', this)
        //         : this.emit('GamePause', this);
        // });
        //
        // this.on('KeyPressed', (...ev) => {
        //     if (this.kb.keys['ArrowUp']) burg.translate(0, -1);
        //     if (this.kb.keys['ArrowDown']) burg.translate(0, 1);
        //     if (this.kb.keys['ArrowLeft']) burg.translate(-1, 0);
        //     if (this.kb.keys['ArrowRight']) burg.translate(1, 0);
        //
        //     console.log(...ev);
        // });

        var scene_bg = _Game.makeScene('bg').attach('demo');

        // var grass1 = _.Graphics.preloadImage('img/Grass1.jpg')
        // .then((res) => {
        //     console.log(res);
        //     return res;
        // });
        //
        // console.log(grass1);
        //
        // scene_bg.bgImage = _.Graphics.prerender((con) => {
        //     con.fillStyle = con.createPattern(grass1, 'repeat');
        //     con.fillRect(0,0,scene_bg.width, scene_bg.height);
        // }).then((im) => {
        //
        // });

        var scene_fg = _Game.makeScene('fg').attach('demo')
        scene_fg.setZIndex(1);
        scene_fg.precision = 2;
        //scene_fg.hide();

        scene_fg.on('CursorChanged', (cur) => {
            scene_fg.mouseStyle = cur;
        });

        // this.kb.bindKey('Space', (scene) => {
        //     if (scene)
        // });

        mouse.setStyle('url(img/cursor.png), auto');

        let b = new Image(48,40);
        b.src = 'img/burger2.png';

        //var pre_burg = await _.Graphics.preloadImage('img/burger3.png');

        burg = new _.Sprite('img/burger3.bmp', 48, 40, scene_fg.width / 2, scene_fg.height / 2);
        //burg2 = new _.Entity('img/burger3.bmp', 24, 16, scene_fg.width / 2, scene_fg.height / 2 + 100);
        burg.setBoundAction(2);
        //burg.addForce(new _.Vector2(2,0));
        //burg.setAccel(new _.Vector2(0, 0.25)); // GRAVITY


        cow = new _.Entity('img/livestock/cowside.bmp', 44, 36, burg.pos.x, burg.pos.y - 100);
        cow.applyCollider(new _.BoxCollider(cow));
        //sheep = new _.Sprite('img/livestock/sheep\ side.png', 24, 24, cow.pos.x, cow.pos.y + (40));
        sheep = new _.Entity('img/livestock/sheep\ side.png', 40, 20, cow.pos.x, cow.pos.y - 100);
        sheep.applyCollider(new _.BoxCollider(cow));
        //sheep.setBoundAction(1);
        //sheep.addForce(new _.Vector2(1, 0));
        //cow.setBoundAction(1);
        //cow.addForce(new _.Vector2(10,5));


        scene_fg.addEntity(burg, cow, sheep);

        this.on('EntityCollision', (...ev) => {
            console.log(...ev);
        });



        //console.log(cow.pos.distanceTo(burg.pos));
        //console.log(_.Angle.toDegrees(cow.pos.angleTo(burg.pos)));
        //scene_fg.addEntity(cow);

    }; // end init

    // user defined update function. main game loop
    _Game.update = function() {

        if (this.isPaused) {

        } else {

            // let speed = 2;
            // if (this.kb.keys['ArrowUp']) burg.translate(0, -speed);
            // if (this.kb.keys['ArrowDown']) burg.translate(0, speed);
            // if (this.kb.keys['ArrowLeft']) burg.translate(-speed, 0);
            // if (this.kb.keys['ArrowRight']) burg.translate(speed, 0);
            // if (this.kb.keys['KeyA']) burg.rotateHeading(-speed);
            // if (this.kb.keys['KeyD']) burg.rotateHeading(speed);
            //
            // burg.collidesWith(cow);

            let c = burg.angleTo(cow.pos).rad + (_.Time.delta / 1000);
            let burgOrbit = -30;
            //burg.redraw.setCartesian(burg.x,burg.y);
            //burg.pos.rotateAround(centerpoint, c, 10);
            burg.rotateHeading(1);
            //burg.heading.deg = burg.angleTo(cow).deg + 90;
            burg.setPosition(
                centerpoint.x + (burgOrbit * Math.cos(c)),
                centerpoint.y + (burgOrbit * Math.sin(c))
            );

            //cow.redraw.setCartesian(cow.x, cow.y);
            let cowAngleToBurg = cow.angleTo(burg.pos).rad + (_.Time.delta / 1000);
            let cowOrbit = cow.width * 2.5;
            cow.heading = cow.angleTo(centerpoint);
            cow.setPosition(
                burg.x + (cowOrbit * Math.cos(cowAngleToBurg)),
                burg.y + (cowOrbit * Math.sin(cowAngleToBurg))
            );

            let b = sheep.angleTo(cow.pos).rad + (_.Time.delta / 500);
            let sheepOrbit = sheep.width * 2;
            sheep.rotateHeading(1);
            // sheep.heading = sheep.angleTo(cow.pos).addDegrees(-90);
            //sheep.pos.rotateAround(cow.pos, b, sheep.width * 2);
            sheep.setPosition(
                cow.x + (sheepOrbit * Math.cos(b)),
                cow.y + (sheepOrbit * Math.sin(b))
            );

            if (sheep.collidesWith(cow)) {
                sheep.flags.colliding = true;
                cow.flags.colliding = true;
            } else {
                sheep.flags.colliding = false;
                cow.flags.colliding = false;
            }

        }

        // cow.x = burg.x + (d * Math.cos(a));
        // cow.y = burg.y + (d * Math.sin(a));

        //console.log(cow.pos);

        //scene.mouse.update();
        //console.log(Timer.delta());

        debugConsole.innerText = `${_.Time.delta} ms`;
    }

    // call Game.start() to begin
    _Game.start();
    //_Game.stop();
})();
