// main.js

// import * as _ from './modules/engine.js';
import('./modules/engine.js')
.then( _ => {

    'use strict';

    const _Game = new _.Game();
    const mouse = _Game.mouse;
    const kb = _Game.kb;
    var burg, burg2, burg3;
    var cow, cow2;
    var sheep, sheep2;


    var centerpoint;

    const debugConsole = document.createElement("div");
    debugConsole.style.zIndex = 1000;

    // stop arrow/space default behavior https://stackoverflow.com/a/8916697
    document.addEventListener("keydown", function(e) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);


    // user defined init function
    _Game.init =  function () {

        document.body.appendChild(debugConsole);

        centerpoint = new _.Vector2(_Game.width/2, _Game.height/2);


        var scene_bg = _Game.makeScene('bg').attach('demo');

        // const grass1 = _.Graphics.preloadImage('img/Grass1.jpg', 64, 64);
        const grass1 = new Image(64,64);
        grass1.src = 'img/Grass1.jpg';

        // scene_bg.bgImage = _.Graphics.prerender(scene_bg.width, scene_bg.height, (con) => {
        //     grass1.onload = () => {
        //         con.fillStyle = con.createPattern(grass1, 'repeat');
        //         con.fillRect(0,0,scene_bg.width, scene_bg.height);
        //     }
        // });

        var scene_fg = _Game.makeScene('fg').attach('demo')
        scene_fg.setZIndex(1);
        scene_fg.precision = 2;
        //scene_fg.hide();

        scene_fg.on('CursorChanged', (cur) => {
            scene_fg.mouseStyle = cur;
        });

        mouse.setStyle('url(img/cursor.png), auto');

        let b = new Image(48,40);
        b.src = 'img/burger2.png';

        burg = new _.Sprite('img/burger3.bmp', 48, 40, scene_fg.width / 2, scene_fg.height / 2);
        burg.setBoundAction(2);

        cow = new _.Sprite('img/livestock/cowside.bmp', 44, 36, burg.pos.x, burg.pos.y - 100);
        cow.applyCollider(new _.BoxCollider(cow));

        sheep = new _.Entity('img/livestock/sheepside.bmp', 32, 22, cow.pos.x, cow.pos.y);
        sheep.applyCollider(new _.BoxCollider(sheep));

        sheep2 = new _.Sprite('img/livestock/sheepside.bmp', 32, 22, cow.pos.x, cow.pos.y);
        sheep2.applyCollider(new _.BoxCollider(sheep2));
        sheep2.setBoundAction(2);
        sheep2.addForce(new _.Vector2(5, 0));

        //cow.setBoundAction(1);
        //cow.addForce(new _.Vector2(1,1));

        scene_fg.addEntity(burg, cow, sheep, sheep2);

        this.on('Collision', (...ev) => {
            console.log(ev);
        });

        this.on('KeyPressed', (...key) => {

            console.log(key);
        });

        this.on('MouseButton', (...btn) => {
            console.log(btn);
        });

        this.on('EntityMarkedForDelete', (...e) => {
            console.log(e);
        });
    }; // end init

    // user defined update function. main game loop
    _Game.update = function() {

        if (this.isPaused) {

        } else {

            let c = burg.angleTo(cow.pos).rad + (_.Time.delta / 1000);
            let burgOrbit = 5;
            // let burgOrbit = -30;
            //burg.pos.rotateAround(centerpoint, c, 10);
            burg.rotateHeading(.5);
            //burg.heading.deg = burg.angleTo(cow).deg + 90;
            burg.setPosition(
                centerpoint.x + (burgOrbit * Math.cos(c)),
                centerpoint.y + (burgOrbit * Math.sin(c))
            );

            let cowAngleToBurg = cow.angleTo(burg.pos).rad + (_.Time.delta / 1000);
            let cowOrbit = cow.width * 2.5;
            // cow.heading = cow.angleTo(centerpoint);
            cow.rotateHeading(2);
            cow.setPosition(
                burg.x + (cowOrbit * Math.cos(cowAngleToBurg)),
                burg.y + (cowOrbit * Math.sin(cowAngleToBurg))
            );

            let b = sheep.angleTo(cow.pos).rad + (_.Time.delta / 500);
            let sheepOrbit = sheep.width * 1.5;
            // sheep.heading = sheep.angleTo(cow);
            // sheep.heading = sheep.angleTo(cow.pos);
            // sheep.heading = sheep.angleTo(cow.pos).addDegrees(-90);
            // sheep.pos.rotateAround(cow.pos, b, sheep.width * 2);
            // sheep.setPosition(
            //     cow.x + (sheepOrbit * Math.cos(b)),
            //     cow.y + (sheepOrbit * Math.sin(b))
            // );

            sheep.pos = mouse.pos;

            //sheep.setPosition(this.width / 2 + 100 * Math.cos(_.Time.time / 750), 100);

            if (sheep.collidesWith(cow)) {
                sheep.flags.colliding = true;
                cow.flags.colliding = true;
            } else {
                sheep.flags.colliding = false;
                cow.flags.colliding = false;
            }

            if (sheep.collidesWith(sheep2)) {
                sheep.flags.colliding = true;
                sheep2.flags.colliding = true;

            } else {
                sheep.flags.colliding = false;
                sheep2.flags.colliding = false;
            }

        }

        // debugConsole.innerText = `frametime: ${_.Time.delta} ms\n`;
        // debugConsole.innerText += `FPS: ${parseInt(1000 / _.Time.delta)}`;
    }

    // call Game.start() to begin
    _Game.start();  // <-------------------- Don't forget to call start!
    //_Game.stop();
})
.catch((err) => {
    console.log(err);
});
