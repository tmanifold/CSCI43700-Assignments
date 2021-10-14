# Game Engine Outline

## Scene
Creates and manages the canvas

### Attributes
- size
- position
- sprites[]
- bgColor
- bgImage
- delay
- timer
- keyState[]

### Methods
- setSize(x, y)
- setPosition(x, y)
- start()
- end()
- clear()
- update()
- setBgColor(color)
- setBgImage(image)
- setDelay()
- show/hide cursor()
- getMousePosition()

## Sprite
Represents a sprite in the scene.

### Attributes
- size
- position
- scene
- image
- imageAngle
- moveAngle
- speed
- dx,dy
- ddx,ddy
- visible
- boundAction

### Methods
- setImage(img_path)
- setPosition(x,y)
- translate(x,y)
- rotate(angle)
- addForce(Vector2)
- collidesWith(Sprite)
- draw()
- update() <abstract>
- hide()
- show()
- checkBounds()
- distanceTo(Sprite)
- angleTo(Sprite)

# Outline for utility classes

## Vector2
A vector2 is a 2-dimensional vector consisting of the components x and y

### Attributes
- x
- y

### Methods
- add(Vector2)
- scale(Vector2)
- dotProduct(Vector2)
- crossProduct(Vector2)
- projection(Vector2)
