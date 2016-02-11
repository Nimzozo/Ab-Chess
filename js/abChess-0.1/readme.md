# AbChess-0.1.js

#### Class AbChess

The AbChess class contructs an object to manage chess data as well as render a board.

###### Syntax

```Javascript
var abChess = new AbChess(containerId[, config]);
```

| Parameters | Type | Description | Default
| :--- | :--- | :--- | :---
| __`containerId`__ | String | The id of the HTML element to contain the chess board. |
| __`config`__ | Object | *Optional*. A configuration object containing the following optional properties. |
| &nbsp;&nbsp;`circleColor` | String | The CSS color value of circles drawn on the squares. | `'steelblue'`
| &nbsp;&nbsp;`clickable` | Boolean | A value to set if the pieces should be clickable or not. | `true`
| &nbsp;&nbsp;`draggable` | Boolean | A value to set if the pieces should be draggable or not. | `true`
| &nbsp;&nbsp;`flipped` | Boolean | A value to set if the board should be flipped or not. | `false`
| &nbsp;&nbsp;`hasBorder` | Boolean | A value to set if the board should have notation borders or not. | `true`
| &nbsp;&nbsp;`onPieceDragEnd` | Function | *Experimental*. A function to run when a piece ends a drag operation. | `null`
| &nbsp;&nbsp;`onPieceDragStart` | Function | *Experimental*. A function to run when a piece starts a drag operation. | `null`
| &nbsp;&nbsp;`onPromotionChose` | Function | *Experimental*. A function to run when a promotion choice has been done. | `null`
| &nbsp;&nbsp;`onSquareClick` | Function | *Experimental*. A function to run when a click is performed on a square. | `null`
| &nbsp;&nbsp;`onSquareDrop` | Function | *Experimental*. A function to run when a drop is performed on a square. | `null`
| &nbsp;&nbsp;`showKingInCheck` | Boolean | A value to set if the king in check should be marked. | `true`
| &nbsp;&nbsp;`showLastMove` | Boolean | A value to set if the last played move should be marked. | `true`
| &nbsp;&nbsp;`showLegalMoves` | Boolean | A value to set if the legal squares should be marked. | `true`
| &nbsp;&nbsp;`width` | Number | A number representing the width in pixels of the board. | `360`

###### Example

```Javascript
var abChess;
var abConfig = {
    circleColor: '#123456',
    clickable: true,
    draggable: false,
    flipped: false,
    hasBorder: false,
    showKingInCheck: true,
    showLegalMoves: false,
    width: 180  
};
var containerId = 'abContainer';
abChess = new AbChess(containerId, abConfig);
```

###### Constants

__`DEFAULT_FEN`__
  
  The FEN string of the starting position in a classical chess game.

###### Methods

__`draw()`__

  Draw the chess board in the container element.
  ---

__`flip()`__

  Change the orientation of the chess board.
  ---

__`getActiveColor()`__

  Return 'w' or 'b' to indicate if it is white or black to play a move.
  ---

__`getFEN()`__

  Get the FEN string notation of the current position.
  ---

__`getLegalSquares(start)`__

  Return an array of string representations of the legal squares from the desired start square.

  The `start` string should be in the format `[a-h][1-8]`.
  ---

__`isCheckmated()`__

  Check if the king of the active color is checkmated.
  ---
  
__`isInCheck()`__

  Check if the king of the active color is currently in check.
  ---

__`isLegal(move)`__

  Check if a move is legal.

  The __`move`__ string should be in the format `[a-h][1-8]-[a-h][1-8]`.
  ---

__`play(move)`__

  Play a move.

  The __`move`__ string should be in the format `[a-h][1-8]-[a-h][1-8]`.
  ---
  
__`setFEN(fen)`__

  Set the FEN string notation of the current position.
  ---
