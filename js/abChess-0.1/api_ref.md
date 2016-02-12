#### Class AbChess

The AbChess class contructs an object to manage chess data as well as render a board.

```Javascript
var abChess = new AbChess(containerId[, config]);
```

#### Constructor

| Name | Description |
| :--- | :--- |
| [new AbChess(containerId\[, config\])](#constructor-details) | The FEN string of the starting position in a classical chess game. |

#### Constants

| Name | Type | Description |
| :--- | :--- | :--- |
| DEFAULT_FEN | String | The FEN string of the starting position in a classical chess game. |

#### Methods

| Name | Return type | Description |
| :--- | :--- | :--- |
| [draw()](#draw) | `undefined` | Draw the chess board in the container element. |
| [flip()](#flip) | `undefined` | Change the orientation of the chess board. |
| [getActiveColor()](#getactivecolor) | `String` | Return 'w' or 'b' to indicate if it is white or black to play a move. |
| [getFEN()](#getfen) | `String` | Get the FEN string notation of the current position. |
| [getLegalSquares(start)](#getlegalsquares) | `String[]` | Return an array of string representations of the legal squares from the desired start square. |
| [isCheckmated()](#ischeckmated) | `Boolean` | Check if the king of the active color is checkmated. |
| [isInCheck()](#isincheck) | `Boolean` | Check if the king of the active color is currently in check. |
| [isLegal(move)](#islegal) | `Boolean` | Check if a move is legal. The move string should be in the format [a-h][1-8]-[a-h][1-8]. |
| [play(move)](#play) | `undefined` | Play a move. The move string should be in the format [a-h][1-8]-[a-h][1-8]. |
| [setFEN(fen)](#setfen) | `undefined` | Set the FEN string notation of the current position. |


#### Constructor details

new AbChess(containerId[, config])

The AbChess class contructs an object to manage chess data as well as render a board.

Parameters :

| Name | | Description | Default |
| :--- | :--- | :--- | --- |
| <`String`> __containerId__ | Required | The id of the HTML element to contain the chess board. |
| <`Object`> __config__ | Optional | **. A configuration object containing the following optional properties. |
| __config__ properties :
| <`String`> circleColor | Optional | The CSS color value of circles drawn on the squares. | steelblue
| <`Boolean`> clickable | Optional | A value to set if the pieces should be clickable or not. | true
| <`Boolean`> draggable | Optional | A value to set if the pieces should be draggable or not. | true
| <`Boolean`> flipped | Optional | A value to set if the board should be flipped or not. | false
| <`Boolean`> hasBorder | Optional | A value to set if the board should have notation borders or not. | true
| <`Function`> onPieceDragEnd | Optional | *Experimental*. A function to run when a piece ends a drag operation. | null
| <`Function`> onPieceDragStart | Optional | *Experimental*. A function to run when a piece starts a drag operation. | null
| <`Function`> onPromotionChose | Optional | *Experimental*. A function to run when a promotion choice has been done. | null
| <`Function`> onSquareClick | Optional | *Experimental*. A function to run when a click is performed on a square. | null
| <`Function`> onSquareDrop | Optional | *Experimental*. A function to run when a drop is performed on a square. | null
| <`Boolean`> showKingInCheck | Optional | A value to set if the king in check should be marked. | true
| <`Boolean`> showLastMove | Optional | A value to set if the last played move should be marked. | true
| <`Boolean`> showLegalSquares | Optional | A value to set if the legal squares should be marked. | true
| <`Number`> width | Optional | A number representing the width in pixels of the board. | 360

#### Methods details

###### draw()

Draw the chess board in the container element.

Return type : undefined

###### flip()

Change the orientation of the chess board.

Return type : undefined

###### getActiveColor()

  Return 'w' or 'b' to indicate if it is white or black to play a move.
  ---

###### getFEN()

  Get the FEN string notation of the current position.
  ---

###### getLegalSquares(start)

  Return an array of string representations of the legal squares from the desired start square.

  The `start` string should be in the format `[a-h][1-8]`.
  ---

###### isCheckmated()

  Check if the king of the active color is checkmated.
  ---
  
###### isInCheck()

  Check if the king of the active color is currently in check.
  ---

###### isLegal(move)

  Check if a move is legal.

  The __`move`__ string should be in the format `[a-h][1-8]-[a-h][1-8]`.
  ---

###### play(move)

  Play a move.

  The __`move`__ string should be in the format `[a-h][1-8]-[a-h][1-8]`.
  ---
  
###### setFEN(fen)

  Set the FEN string notation of the current position.
  ---





#### Sample

Create an AbChess object.

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
