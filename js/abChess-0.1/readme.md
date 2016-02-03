# AbChess API documentation

##Class AbChess
<code>new AbChess(containerId, [config])</code>
<br>Constructs an AbChess object containing properties and methods to manage a chess game.

**Parameters :**
* <code>containerId</code> *\<String\>*
<br>The id of the desired HTML element to contain the chess board.
* <code>config</code> *\<Object\>*
<br>**Optional.** A configuration object.

####AbChess.board

**Methods :**

<code>draw()</code>
<br>Draw the board.
<hr>

*\<String\>* <code>AbChess.fen.get()</code>
<br>Returns the current FEN string.
<hr>

<code>AbChess.fen.set(fen)</code>
<br>Set the current FEN string.
*Parameters :*
* <code>fen</code> *\<String\>*
<br>The FEN string.
<hr>

<code>flip()</code>
<br>Flip the board.
<hr>

####AbChess.game
<code>AbChess.game</code>
<br>Returns a game object which allows to manage the chess game data.

**Methods :**

*\<String\>* <code>getActiveColor()</code>
<br>Return a character ('b' or 'w') representing the active color.

<hr>

*\<Boolean\>* <code>isInCheck()</code>
<br>Check if the active color is in check.

<hr>

*\<Boolean\>* <code>isLegal(move)</code>
<br>Check if a move is legal or not.

*Parameters :*
* <code>move</code> *\<String\>*
<br>The string representation of the move to play. It must match the regular expression <code>[a-h][1-8]-[a-h][1-8]</code>.
<br>For example : <code>isLegal('e2-e4')</code>

<hr>

<code>play(move)</code>
<br>Play the desired move.

*Parameters :*
* <code>move</code> *\<String\>*
<br>The string representation of the move to play. It must match the regular expression <code>[a-h][1-8]-[a-h][1-8]</code>.
<br>For example : <code>play('e2-e4')</code>

<hr>
