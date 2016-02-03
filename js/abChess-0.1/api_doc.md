#### Class AbChess

The AbChess class contructs an object to manage chess data as well as render a board.

###### Syntax

```Javascript
var abChess = new AbChess(containerId, [config]);
```

###### Parameters

__`containerId`__

  The id of the HTML element to contain the chess board.

__`config`__

  Optional. A configuration object containing the following optional properties :
  
  - __`clickable`__
  
    A boolean value to set if the pieces should be clickable or not. Set to `true` by default.

  - __`draggable`__
  
    A boolean value to set if the pieces should be draggable or not. Set to `true` by default.

  - __`flipped`__
  
    A boolean value to set if the board should be flipped or not. Set to `false` by default.

  - __`hasBorder`__
  
    A boolean value to set if the board should have notation borders or not. Set to `true` by default.

  - __`onDragEndFunction`__
  
    A function to execute on a dragend event.
  
  - __`onDragStartFunction`__
  
    A function to execute on a dragstart event.

  - __`onDropFunction`__
  
    A function to execute on a drop event.

  - __`width`__
  
    A number representing the width of the board. Set to 360 by default.

###### Methods

- __`draw()`__

  Draw the chess board in the container element.
  
- __`fen`__

  Get or set the FEN string notation of the current position.

- __`flip()`__

  Change the orientation of the chess board.

- __`getActiveColor()`__

  Return 'w' or 'b' to indicate if it is white or black to play a move.
  
- __`getLegalSquares(start)`__

  Return an array of string representations of the legal squares from the desired start square.
  
  The `start` string should be in the format `[a-h][1-8]`.

- __`isInCheck()`__

  Check if the king of the active color is currently in check.

- __`isLegal(move)`__

  Check if a move is legal.
  
  The __`move`__ string should be in the format `[a-h][1-8]-[a-h][1-8]`.

- __`play(move)`__

  Play a move.
  
  The __`move`__ string should be in the format `[a-h][1-8]-[a-h][1-8]`.
