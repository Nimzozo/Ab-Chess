#### Class AbChess

```Javascript
var abChess = new AbChess(containerId[, config]);
```
The AbChess class contructs an object to manage chess data as well as render a board.


###### Constants

| Name | Type | Description |
| :--- | :--- | :--- |
| DEFAULT_FEN | String | The FEN string of the starting position in a classical chess game. |

###### Methods

| Name | Return type | Description |
| :--- | :--- | :--- |
| draw() | void | Draw the chess board in the container element. |
| flip() | void | Change the orientation of the chess board. |
| getActiveColor() | String | Return 'w' or 'b' to indicate if it is white or black to play a move. |
| getFEN() | String | Get the FEN string notation of the current position. |
| getLegalSquares(start) | Array | Return an array of string representations of the legal squares from the desired start square. |
| isCheckmated() | Boolean | Check if the king of the active color is checkmated. |
| isInCheck() | Boolean | Check if the king of the active color is currently in check. |
| isLegal(move) | Boolean | Check if a move is legal. The move string should be in the format [a-h][1-8]-[a-h][1-8]. |
| play(move) | void | Play a move. The move string should be in the format [a-h][1-8]-[a-h][1-8]. |
| setFEN(fen) | void | Set the FEN string notation of the current position. |


###### Constructor details

new AbChess(containerId[, config])

The AbChess class contructs an object to manage chess data as well as render a board.

| Parameters | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| containerId | <String> | The id of the HTML element to contain the chess board. |
| config | <Object> | *Optional*. A configuration object containing the following optional properties. |

config properties :
| circleColor | <String> | The CSS color value of circles drawn on the squares. | steelblue
| clickable | <Boolean> | A value to set if the pieces should be clickable or not. | true
| draggable | <Boolean> | A value to set if the pieces should be draggable or not. | true
| flipped | <Boolean> | A value to set if the board should be flipped or not. | false
| hasBorder | <Boolean> | A value to set if the board should have notation borders or not. | true
| onPieceDragEnd | <Function> | *Experimental*. A function to run when a piece ends a drag operation. | null
| onPieceDragStart | <Function> | *Experimental*. A function to run when a piece starts a drag operation. | null
| onPromotionChose | <Function> | *Experimental*. A function to run when a promotion choice has been done. | null
| onSquareClick | <Function> | *Experimental*. A function to run when a click is performed on a square. | null
| onSquareDrop | <Function> | *Experimental*. A function to run when a drop is performed on a square. | null
| showKingInCheck | <Boolean> | A value to set if the king in check should be marked. | true
| showLastMove | <Boolean> | A value to set if the last played move should be marked. | true
| showLegalMoves | <Boolean> | A value to set if the legal squares should be marked. | true
| width | <Number> | A number representing the width in pixels of the board. | 360

###### Sample

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
