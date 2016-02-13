# Class AbChess

The AbChess class contructs an object to manage chess data as well as render a board.

```Javascript
var abChess = new AbChess(containerId[, config]);
```

## Constructor

| Name | Description |
| :--- | :--- |
| [new AbChess(containerId\[, config\])](#constructor-details) | The FEN string of the starting position in a classical chess game. |

## Constants

| Name | Description |
| :--- | :--- |
| <`String`> DEFAULT_FEN | The FEN string of the starting position in a classical chess game. |

## Methods

| Name | Return type | Description |
| :--- | :--- | :--- |
| [draw()](#draw) | `undefined` | Draw the chessboard in the HTML container element. |
| [flip()](#flip) | `undefined` | Change the orientation of the chessboard. |
| [getActiveColor(n)](#getactivecolor) | `String` | Return the active color of the nth position. |
| [getFEN(n)](#getfen) | `String` | Return the Forsyth-Edwards notation of the nth position. |
| [getGameInfo(info)](#getgameinfo) | `String` | Return the desired information of the game. |
| [getMoves(pgnStyled)](#getmoves) | `String[]` | Return an array containing the moves of the game. |
| [getPGN(noTag)](#getpgn) | `String` | Return the portable game notation. |
| [isCheckmated(n)](#ischeckmated) | `Boolean` | Check if the king of the active color is checkmated in the nth position. |
| [isInCheck(n)](#isincheck) | `Boolean` | Check if the king of the active color is in check in the nth position. |
| [isLegal(n, move)](#islegal) | `Boolean` | Check if a move is legal in the nth position. |
| [isStalemate(n)](#isstalemate) | `Boolean` | Check if the king of the active color is stalemated in the nth position. |
| [play(move, promotion)](#play) | `String` | Play a move and return the resulting FEN string. |
| [setFEN(fen)](#setfen) | `undefined` | Load the FEN position on the chessboard. |
| [setPGN(pgn)](#setpgn) | `undefined` | Load the PGN notation of the game. |

### Constructor details

#### new AbChess(containerId[, config])

The AbChess class contructs an object to manage chess data as well as render a board.

__Parameters :__

| Name |     | Description | Default |
| :--- | :--- | :--- | :--- |
| <`String`> containerId | Required | The id of the HTML element to contain the chess board. |
| <`Object`> config | Optional | A configuration object containing the following optional properties. |
| __*config* properties__
| <`String`> circleColor | Optional | The CSS color value of circles drawn on the squares. | `"steelblue"`
| <`Boolean`> clickable | Optional | A value to set if the pieces should be clickable or not. | `true`
| <`Boolean`> draggable | Optional | A value to set if the pieces should be draggable or not. | `true`
| <`Boolean`> flipped | Optional | A value to set if the board should be flipped or not. | `false`
| <`Boolean`> hasBorder | Optional | A value to set if the board should have notation borders or not. | `true`
| <`Boolean`> showKingInCheck | Optional | A value to set if the king in check should be marked. | `true`
| <`Boolean`> showLastMove | Optional | A value to set if the last played move should be marked. | `true`
| <`Boolean`> showLegalSquares | Optional | A value to set if the legal squares should be marked. | `true`
| <`Number`> width | Optional | A number representing the width in pixels of the board. | `360`

__Sample :__

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

### Methods details

---

#### draw()

Draw the chess board in the container element.

__Return type :__ `undefined`

---

#### flip()

Change the orientation of the chess board.

__Return type :__ `undefined`

---

#### getActiveColor(n)

Return 'w' or 'b' to indicate if it is white or black to play a move.

__Return type :__ `String`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>The index of the position to check.</td>
  </tr>
</table>

---

#### getFEN()

Get the FEN string notation of the current position.

__Return type :__ `String`

---

#### isCheckmated()

Check if the king of the active color is checkmated.

__Return type :__ `Boolean`

---
  
#### isInCheck()

Check if the king of the active color is currently in check.

__Return type :__ `Boolean`

---

#### isLegal(move)

Check if a move is legal.

__Return type :__ `Boolean`

__Parameters :__
<table>
  <tr>
    <td><<code>String</code>> move</td><td>Required</td><td>The move to play in format : [a-h][1-8]-[a-h][1-8].</td>
  </tr>
</table>

__Sample :__
```Javascript
var isLegal = abChess.isLegal("g1-f3");
```

---

#### play(move)

Play a move.

__Return type :__ `undefined`

__Parameters :__
<table>
  <tr>
    <td><<code>String</code>> move</td><td>Required</td><td>The move to play in format : [a-h][1-8]-[a-h][1-8].</td>
  </tr>
</table>

__Sample :__
```Javascript
abChess.play("g1-f3");
```

---
  
#### setFEN(fen)

Set the FEN string notation of the current position.

__Return type :__ `undefined`

__Parameters :__
<table>
  <tr>
    <td><<code>String</code>> fen</td><td>Required</td><td>The FEN string to set.</td>
  </tr>
</table>

__Sample :__
```Javascript
abChess.setFEN("8/8/8/8/8/8/8/8");
```
