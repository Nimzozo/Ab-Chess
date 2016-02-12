#### Class AbChess

The AbChess class contructs an object to manage chess data as well as render a board.

```Javascript
var abChess = new AbChess(containerId[, config]);
```

#### Constructor
#### Constructor

| Name | Description |
| :--- | :--- |
| [new AbChess(containerId[, config])](#constructor-details) | The FEN string of the starting position in a classical chess game. |

#### Constants

| Name | Type | Description |
| :--- | :--- | :--- |
| DEFAULT_FEN | String | The FEN string of the starting position in a classical chess game. |

#### Methods

| Name | Return type | Description |
| :--- | :--- | :--- |
| [draw()](#draw) | `void` | Draw the chess board in the container element. |
| [flip()](#flip) | `void` | Change the orientation of the chess board. |
| [getActiveColor()](#getActiveColor) | `String` | Return 'w' or 'b' to indicate if it is white or black to play a move. |
| [getFEN()](#getFEN) | `String` | Get the FEN string notation of the current position. |
| [getLegalSquares(start)](#getLegalSquares) | `String[]` | Return an array of string representations of the legal squares from the desired start square. |
| [isCheckmated()](#isCheckmated) | `Boolean` | Check if the king of the active color is checkmated. |
| [isInCheck()](#isInCheck) | `Boolean` | Check if the king of the active color is currently in check. |
| [isLegal(move)](#isLegal) | `Boolean` | Check if a move is legal. The move string should be in the format [a-h][1-8]-[a-h][1-8]. |
| [play(move)](#play) | `void` | Play a move. The move string should be in the format [a-h][1-8]-[a-h][1-8]. |
| [setFEN(fen)](#setFEN) | `void` | Set the FEN string notation of the current position. |


#### Constructor details

new AbChess(containerId[, config])

The AbChess class contructs an object to manage chess data as well as render a board.

Parameters :

| Name | Description | Default |
| :--- | :--- | :--- |
| <`String`> __containerId__ | The id of the HTML element to contain the chess board. |
| <`Object`> __config__ | *Optional*. A configuration object containing the following optional properties. |
| config properties :
| <`String`> circleColor | The CSS color value of circles drawn on the squares. | steelblue
| <`Boolean`> clickable | A value to set if the pieces should be clickable or not. | true
| <`Boolean`> draggable | A value to set if the pieces should be draggable or not. | true
| <`Boolean`> flipped | A value to set if the board should be flipped or not. | false
| <`Boolean`> hasBorder | A value to set if the board should have notation borders or not. | true
| <`Function`> onPieceDragEnd | *Experimental*. A function to run when a piece ends a drag operation. | null
| <`Function`> onPieceDragStart | *Experimental*. A function to run when a piece starts a drag operation. | null
| <`Function`> onPromotionChose | *Experimental*. A function to run when a promotion choice has been done. | null
| <`Function`> onSquareClick | *Experimental*. A function to run when a click is performed on a square. | null
| <`Function`> onSquareDrop | *Experimental*. A function to run when a drop is performed on a square. | null
| <`Boolean`> showKingInCheck | A value to set if the king in check should be marked. | true
| <`Boolean`> showLastMove | A value to set if the last played move should be marked. | true
| <`Boolean`> showLegalSquares | A value to set if the legal squares should be marked. | true
| <`Number`> width | A number representing the width in pixels of the board. | 360

#### Methods details

###### draw()

Draw the chess board in the container element.

Return type : void

###### flip()

Change the orientation of the chess board.

Return type : void






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
