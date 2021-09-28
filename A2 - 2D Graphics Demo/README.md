# 2D Graphics Demo
## CSCI 43700
### Tyler Manifold

This demonstration utilizes the HTML5 canvas element and JavaScript to render
circular objects and simulate some simple physics. The objects are affected by gravity,
and will lose momentum when colliding with the canvas boundary.

To the right of the canvas, there is a box containing the controls that allow you to modify the following values:

| value | description |
| --- | --- |
| r | the circle radius |
| G | gravity |
| f | friction |

Note that these values do not have any bearing in reality, and are meant purely for simulation purposes.

When the "Spawn circle" button is clicked, a circle object with the specified radius will be created. It will be initialized with a random
velocity vector. By default, the direction and magnitude of the velocity vector is shown as a green line extending from the center a circle.
This can be disabled using the controls on the right of the canvas. 
