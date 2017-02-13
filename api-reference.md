# Class AbChess

The AbChess class provides functions to build chessboards linked to chessgames.

| Constructor | Description |
| :--- | :--- |
| [new AbChess(containerId\[, config\])](#constructor-details) | Create an AbChess instance. |


| Constant | Description |
| :--- | :--- |
| <`String`> DEFAULT_FEN | The FEN string of the starting position in a classical chess game. |


| Method | Return type | Description |
| :--- | :--- | :--- |
| [draw()](#draw) | `undefined` | Draw the chessboard in the HTML container element. |
| [flip()](#flip) | `undefined` | Change the orientation of the chessboard. |
| [getActiveColor(n)](#getactivecolorn) | `String` | Return a character indicating the active color in a position. |
| [getFEN(n)](#getfenn) | `String` | Return the Forsyth-Edwards notation of the nth position. |
| [getGameInfo(info)](#getgameinfoinfo) | `String` | Return an information stored in the game. |
| [getGameMoves()](#getgamemoves) | `String[]` | Return an array containing the moves of the game. |
| [getGameMovesPGN()](#getgamemovespgn) | `String[]` | Return an array of the moves stored in the game in PGN notation. |
| [getLastPositionIndex()](#getlastpositionindex) | `Number` | 	Return the index of the last position of the game. |
| [getLegalMoves(n)](#getlegalmovesn) | `String[]` | Return an array containing the legal moves in a position. |
| [getPGN()](#getpgn) | `String` | Return the portable game notation. |
| [is50MovesDraw(n)](#is50movesdrawn) | `Boolean` | Return true if a position is a draw by the 50 moves rule. |
| [isCheckmate(n)](#ischeckmaten) | `Boolean` | Check if the king of the active color is checkmated in the nth position. |
| [isInCheck(n)](#isincheckn) | `Boolean` | Check if the king of the active color is in check in the nth position. |
| [isInsufficientMaterialDraw(n)](#isinsufficientmaterialdrawn) | `Boolean` | Return true if a position cannot be won anymore. |
| [isLegal(n, move)](#islegaln-move) | `Boolean` | Check if a move is legal in the nth position. |
| [isStalemate(n)](#isstalematen) | `Boolean` | Check if the king of the active color is stalemated in the nth position. |
| [isValidFEN(fen, onlyCheckRows)](#isvalidfenfen-onlycheckrows) | `Boolean` | Return true if a FEN string is valid. |
| [isValidPGN(pgn)](#isvalidpgnpgn) | `Boolean` | Return true if a PGN string is valid. |
| [navigate(n)](#navigaten) | `undefined` | Update the board to the nth position of the game. |
| [onMovePlayed(callback)](#onmoveplayedcallback) | `undefined` | Set a function to call each time a move is played. |
| [play(move\[, promotion\])](#playmove-promotion) | `String` | Play a move and return the resulting FEN string. |
| [reset()](#reset) | `undefined` | Reset the game object and reload the board to the start position. |
| [setFEN(\[fen\])](#setfenfen) | `undefined` | Load the FEN position on the chessboard. |
| [setGameInfo(info, value)](#setgameinfoinfo-value) | `undefined` | Set the desired information in the game. |
| [setPGN(pgn)](#setpgnpgn) | `undefined` | Load the PGN notation of the game. |


### Constructor details

Create an instance of the AbChess class. Define the id of the HTML element to contain the desired chessboard. An options object can be also used to configure the instance.


#### new AbChess(containerId[, config]);


| Parameter |     | Description |
| :--- | :--- | :--- |
| <`String`> containerId | Required | The id of the HTML element to contain the chess board. |
| <`Object`> options | Optional | A configuration object. See options properties. |

| Options property |     | Description | Default value |
| :--- | :--- | :--- | :--- |
| <`String`> animationSpeed | Optional | The speed of pieces animation. Accepted values are `slow`, `normal`, `fast` and `instant`. | `normal`
| <`Boolean`> clickable | Optional | A value to set if the pieces should be clickable or not. | `true`
| <`Boolean`> draggable | Optional | A value to set if the pieces should be draggable or not. | `true`
| <`Boolean`> flipped | Optional | A value to set if the board should be flipped or not. | `false`
| <`String`> imagesExtension | Optional | The file extension of the chess pieces images. | `".png"`
| <`String`> imagesPath | Optional | The relative filepath of the chess pieces images. | `"images/wikipedia/"`
| <`String`> legalMarksColor | Optional | The CSS color value of circles drawn on the squares. | `"steelblue"`
| <`Boolean`> markKingInCheck | Optional | A value to set if the king in check should be marked. | `true`
| <`Boolean`> markLastMove | Optional | A value to set if the last played move should be marked. | `true`
| <`Boolean`> markLegalSquares | Optional | A value to set if the legal squares should be marked. | `true`
| <`Boolean`> markOverflownSquare | Optional | 	If set to true, highlight the overflown square during a drag and drop operation. | `true`
| <`Boolean`> markSelectedSquare | Optional | A value to set if the selected square should be marked. | `true`
| <`Boolean`> notationBorder | Optional | A value to set if the board should have notation borders or not. | `true`
| <`Number`> width | Optional | A number representing the width in pixels of the board. | `360`

### Methods details

---

#### draw()

Draw the chessboard in the HTML container element.

Return type : `undefined`

---

#### flip()

Change the orientation of the chessboard.

Return type : `undefined`

---

#### getActiveColor(n)

Return the active color in the nth position. It will return 'w' is it's white to move, or 'b' for black.

Return type : `String`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### getFEN(n)

Return the Forsyth-Edwards notation of the nth position.

Return type : `String`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### getGameInfo(info)

Return the desired information stored in the PGN of the game.

Return type : `String`

Parameters :
<table>
  <tr>
    <td><<code>String</code>> info</td><td>Required</td><td>The desired information.</td>
  </tr>
</table>

---

#### getGameMoves()

Return an array of the moves stored in the game.

Return type : `String[]`

---

#### getGameMovesPGN()

Return an array of the moves stored in the game with the PGN notation.

Return type : `String[]`

---

#### getLastPositionIndex()

Return the index of the last position of the game.

Return type : `Number`

---

#### getLegalMoves(n)

Return an array of the legal moves for the nth position.

Return type : `String[]`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>An integer number. The index of the desired position.</td>
  </tr>
</table>

---

#### getPGN()

Return the Portable Game Notation.

Return type : `String`

---

#### is50MovesDraw(n)

Return true if a position is a draw because of the 50 moves rule or false if it's not.

Return type : `Boolean`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### isCheckmate(n)

Check if the king of the active color is checkmated in the nth position.

Return type : `Boolean`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### isInCheck(n)

Check if the king of the active color is in check in the nth position.

Return type : `Boolean`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### isInsufficientMaterialDraw(n)

Return true if the remaining material is insufficient to win a position or false if it's not.

Return type : `Boolean`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### isLegal(n, move)

Check if a move is legal in the nth position.

Return type : `Boolean`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
  <tr>
    <td><<code>String</code>> move</td><td>Required</td><td>The move to play in format : [a-h][1-8]-[a-h][1-8].</td>
  </tr>
</table>

Sample :
```Javascript
var isLegal = abChess.isLegal(0, "g1-f3");
```

---

#### isStalemate(n)

Check if the king of the active color is stalemated in the nth position.

Return type : `Boolean`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### isValidFEN(fen, onlyCheckRows)

Return true if a FEN string is valid or false if it's not.

Return type : `Boolean`

Parameters :
<table>
  <tr>
    <td><<code>String</code>> fen</td><td>Required</td><td>The Forsyth-Edwards Notation string to validate.</td>
  </tr>
  <tr>
    <td><<code>Boolean</code>> onlyCheckRows</td><td>Required</td><td>When set to true, the function will only check if the position rows are valid. When set to false, the function will validate the entire string.</td>
  </tr>
</table>

---

#### isValidPGN(pgn)

Return true if a PGN string is valid or false if it's not.

Return type : `Boolean`

Parameters :
<table>
  <tr>
    <td><<code>String</code>> pgn</td><td>Required</td><td>The Portable Game Notation string to validate.</td>
  </tr>
</table>

---

#### navigate(n)

Update the board to the nth position of the game.

Return type : `undefined`

Parameters :
<table>
  <tr>
    <td><<code>Number</code>> n</td><td>Required</td><td>A positive integer. The index of the concerned position.</td>
  </tr>
</table>

---

#### onMovePlayed(callback)

Update the board to the nth position of the game.

Return type : `undefined`

Parameters :
<table>
  <tr>
    <td><<code>Function</code>> callback</td><td>Required</td><td>The function to call after a move has been played.</td>
  </tr>
</table>

---

#### play(move[, promotion])

Play a move and return the resulting FEN string.

Return type : `String`

Parameters :
<table>
  <tr>
    <td><<code>String</code>> move</td><td>Required</td><td>The move to play in format : [a-h][1-8]-[a-h][1-8].</td>
  </tr>
  <tr>
    <td><<code>String</code>> promotion</td><td>Optional</td><td>The piece to choose if the move is a promotion.
    Accepted values are 'b', 'n', 'q', 'r'.</td>
  </tr>
</table>

Sample :
```Javascript
abChess.play("g1-f3");
abChess.play("a7-a8", "q");
```

---

#### reset()

Reset the game object and reload the board to the initial position.

Return type : `undefined`

---

#### setFEN([fen])

Load the FEN position on the chessboard.

Return type : `undefined`

Parameters :
<table>
  <tr>
    <td><<code>String</code>> fen</td><td>Optional</td><td>The FEN string to set. The default value is the starting position.</td>
  </tr>
</table>

---

#### setGameInfo(info, value)

Set an information and its value in the game object.

Return type : `undefined`

Parameters :
<table>
  <tr>
    <td><<code>String</code>> info</td><td>Required</td><td>The name of the information to set.</td>
  </tr>
  <tr>
    <td><<code>String</code>> value</td><td>Required</td><td>The value of the information to set.</td>
  </tr>
</table>

Sample :
```Javascript
abChess.setGameInfo("White", "Kasparov, Gary");
```

---

#### setPGN(pgn)

Load the PGN notation of the game.

Return type : `undefined`

Parameters :
<table>
  <tr>
    <td><<code>String</code>> pgn</td><td>Required</td><td>The PGN string to set.</td>
  </tr>
</table>

---
