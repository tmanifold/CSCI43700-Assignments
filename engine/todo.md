# TODO


https://standardjs.com/

- write tests

- more async stuff maybe?

- SOUND!

- rewrite collision.
    - https://en.wikipedia.org/wiki/Spatial_database#Spatial_index
    - https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
    - figure out how to handle different colliders and propagate collision events while using the collision object.

- performance enhancements
    - ~~entity based clear rect *working for Entity but not for Sprite????*~~
        - implement dirty rectangle clearing for near or colliding objects
    - collision prediction
    - use bitwise ops where possible

## engine.js

- ~~implement EventManager.off()/GameObject.off();
    - will require object ID~~
~~fix image angle.~~
~~adjust vector2 to clamp floating points~~
~~convert sprite angles to use Angle class~~

flesh out entity and collider classes
~~Refactor scene to render entities in it~
~~use events to fire entity destruction so other objects know when an entity dies.
probably need to extend EventTarget and imeplenet addEventListener~~

### General
- rename and cleanup stuff. add variable prefixes and whatnot.
- ~~"modularize" (import/export)~~
- flesh out docs
- Add classes
    - Tile
    - TileMap https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps/Square_tilemaps_implementation:_Static_maps
    - Camera
    - Animation
    - ~~Game or GameManager
        - abstract out many functions currently handled by Scene~~

### Time
- make pausing work
- ~~add deltaTime~~

### Scene
- performance optimizations
    - smarter clear: https://developer.ibm.com/tutorials/wa-canvashtml5layering/#composite-game-view
- ~~prerendering~~ this is handles by the Game class
 - multiple canvases

### Sprite
- ~~general AngleTo and distanceTo~~
- ~~destruction and garbage collection~~

### Sound
- start implementation

## utility.js

### DebugConsole
- make writable and output stuff
- add object for debug layer as top-level canvas

### Vector2
- ~~extend for Polar coords~~
- ~~lerp~~
