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

  Optional. A configuration object containing several optional properties.

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
