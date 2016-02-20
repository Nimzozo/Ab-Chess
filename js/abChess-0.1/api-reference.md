# Class AbChess

The AbChess class contructs an object to manage chess data as well as render a board.


| Constructor | Description |
| :--- | :--- |
| [new AbChess(containerId\[, config\])](#constructor-details) | The FEN string of the starting position in a classical chess game. |


| Constant | Description |
| :--- | :--- |
| <`String`> DEFAULT_FEN | The FEN string of the starting position in a classical chess game. |


| Method | Return type | Description |
| :--- | :--- | :--- |
| [draw()](#draw) | `undefined` | Draw the chessboard in the HTML container element. |
| [flip()](#flip) | `undefined` | Change the orientation of the chessboard. |
| [getActiveColor(n)](#getactivecolorn) | `String` | Return the active color of the nth position. |
| [getFEN(n)](#getfenn) | `String` | Return the Forsyth-Edwards notation of the nth position. |
| [getGameInfo(info)](#getgameinfoinfo) | `String` | Return the desired information of the game. |
| [getGameMoves(pgnStyled)](#getgamemovespgnstyled) | `String[]` | Return an array containing the moves of the game. |
| [getLegalMoves(n)](#getlegalmovesn) | `String[]` | Return an array containing the legal moves in a position. |
| [getPGN(noTag)](#getpgnnotag) | `String` | Return the portable game notation. |
| [isCheckmate(n)](#ischeckmaten) | `Boolean` | Check if the king of the active color is checkmated in the nth position. |
| [isInCheck(n)](#isincheckn) | `Boolean` | Check if the king of the active color is in check in the nth position. |
| [isLegal(n, move)](#islegaln-move) | `Boolean` | Check if a move is legal in the nth position. |
| [isStalemate(n)](#isstalematen) | `Boolean` | Check if the king of the active color is stalemated in the nth position. |
| [navigate(n)](#navigaten) | `undefined` | Update the board to the nth position of the game. |
| [play(move\[, promotion\])](#playmove-promotion) | `String` | Play a move and return the resulting FEN string. |
| [reset()](#reset) | `undefined` | Reset the game object and reload the board to the start position. |
| [setFEN(fen)](#setfenfen) | `undefined` | Load the FEN position on the chessboard. |
| [setGameInfo(info, value)](#setgameinfoinfo-value) | `undefined` | Set the desired information in the game. |
| [setPGN(pgn)](#setpgnpgn) | `undefined` | Load the PGN notation of the game. |


### Constructor details

The AbChess class contructs an object to manage chess data as well as render a board.

```Javascript
var abChess = new AbChess(containerId[, config]);
```

| Parameter |     | Description |
| :--- | :--- | :--- |
| <`String`> containerId | Required | The id of the HTML element to contain the chess board. |
| <`Object`> config | Optional | A configuration object containing the following optional properties. |

| __*config* properties__ |     | Description | Default |
| :--- | :--- | :--- | :--- |
| <`String`> circleColor | Optional | The CSS color value of circles drawn on the squares. | `"steelblue"`
| <`Boolean`> clickable | Optional | A value to set if the pieces should be clickable or not. | `true`
| <`Boolean`> draggable | Optional | A value to set if the pieces should be draggable or not. | `true`
| <`Boolean`> flipped | Optional | A value to set if the board should be flipped or not. | `false`
| <`Boolean`> hasBorder | Optional | A value to set if the board should have notation borders or not. | `true`
| <`String`> imagesExtension | Optional | The file extension of the chess pieces images. | `".png"`
| <`String`> imagesPath | Optional | The relative filepath of the chess pieces images. | `"../images/wikipedia/"`
| <`Boolean`> showKingInCheck | Optional | A value to set if the king in check should be marked. | `true`
| <`Function`> onMovePlayed | Optional | A function to call after a move has been played. | `null`
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

Draw the chessboard in the HTML container element.

__Return type :__ `undefined`

---

#### flip()

Change the orientation of the chessboard.

__Return type :__ `undefined`

---

#### getActiveColor(n)

Return the active color in the nth position. It will return 'w' is it's white to move, or 'b' for black.

__Return type :__ `String`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### getFEN(n)

Return the Forsyth-Edwards notation of the nth position.

__Return type :__ `String`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### getGameInfo(info)

Return the desired information stored in the PGN of the game.

__Return type :__ `String`

__Parameters :__
<table>
  <tr>
    <td><<code>String</code>> info</td><td>Required</td><td>The desired information.</td>
  </tr>
</table>

---

#### getGameMoves(pgnStyled)

Return an array of the moves stored in the game.

__Return type :__ `String[]`

__Parameters :__
<table>
  <tr>
    <td><<code>Boolean</code>> pgnStyled</td><td>Required</td><td>True to get moves styled like in a PGN.
    False to get simple notation.</td>
  </tr>
</table>

---

#### getLegalMoves(n)

Return an array of the legal moves for the nth position.

__Return type :__ `String[]`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>An integer number. The index of the desired position.</td>
  </tr>
</table>

---

#### getPGN(noTag)

Return the portable game notation.

__Return type :__ `String`

__Parameters :__
<table>
  <tr>
    <td><<code>Boolean</code>> noTag</td><td>Required</td><td>True to get a PGN with only the moves.
    False to get a complete PGN.</td>
  </tr>
</table>

---

#### isCheckmate(n)

Check if the king of the active color is checkmated in the nth position.

__Return type :__ `Boolean`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---
  
#### isInCheck(n)

Check if the king of the active color is in check in the nth position.

__Return type :__ `Boolean`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### isLegal(n, move)

Check if a move is legal in the nth position.

__Return type :__ `Boolean`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
  <tr>
    <td><<code>String</code>> move</td><td>Required</td><td>The move to play in format : [a-h][1-8]-[a-h][1-8].</td>
  </tr>
</table>

__Sample :__
```Javascript
var isLegal = abChess.isLegal(0, "g1-f3");
```

---

#### isStalemate(n)

Check if the king of the active color is stalemated in the nth position.

__Return type :__ `Boolean`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### navigate(n)

Update the board to the nth position of the game.

__Return type :__ `undefined`

__Parameters :__
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### play(move[, promotion])

Play a move and return the resulting FEN string.

__Return type :__ `String`

__Parameters :__
<table>
  <tr>
    <td><<code>String</code>> move</td><td>Required</td><td>The move to play in format : [a-h][1-8]-[a-h][1-8].</td>
  </tr>
  <tr>
    <td><<code>String</code>> promotion</td><td>Optional</td><td>The piece to choose if the move is a promotion.
    Accepted values are 'b', 'n', 'q', 'r'.</td>
  </tr>
</table>

__Sample :__
```Javascript
abChess.play("g1-f3");
abChess.play("a7-a8", "q");
```

---

#### reset()

Reset the game object and reload the board to the initial position.

__Return type :__ `undefined`

---
  
#### setFEN([fen])

Load the FEN position on the chessboard. 

__Return type :__ `undefined`

__Parameters :__
<table>
  <tr>
    <td><<code>String</code>> fen</td><td>Optional</td><td>The FEN string to set. The default value is the starting position.</td>
  </tr>
</table>

__Sample :__
```Javascript
abChess.setFEN("8/8/8/8/8/8/8/8");
```

---

#### setGameInfo(info, value)

Set an information and its value in the game object.

__Return type :__ `undefined`

__Parameters :__
<table>
  <tr>
    <td><<code>String</code>> info</td><td>Required</td><td>The name of the information to set.</td>
  </tr>
  <tr>
    <td><<code>String</code>> value</td><td>Required</td><td>The value of the information to set.</td>
  </tr>
</table>

__Sample :__
```Javascript
abChess.setGameInfo("White", "Kasparov, Gary");
```

---

#### setPGN(pgn)

Load the PGN notation of the game. 

__Return type :__ `undefined`

__Parameters :__
<table>
  <tr>
    <td><<code>String</code>> pgn</td><td>Required</td><td>The PGN string to set.</td>
  </tr>
</table>

---
