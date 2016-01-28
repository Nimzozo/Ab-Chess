# AbChess API documentation

<h2>Class AbChess</h2>
<code>new AbChess(containerId, [width])</code>
<br>Constructs an AbChess object containing properties and methods to manage a chess game.

**Parameters :**
* <code>containerId</code> *\<String\>*
<br>The id of the desired HTML element to contain the chess board.
* <code>width</code> *\<Number\>*
<br>**Optional.** The desired width in pixels of the board. The default value is 400.

**Methods :**

<code>draw()</code>
<br>Draw the board.
<hr>
<code>flip()</code>
<br>Flip the board.
<hr>

<h4>AbChess.game</h4>
<code>AbChess.game()</code>
<br>Returns a game object which allows to manage the chess game data.

**Methods :**

<code>play(move)</code>
<br>Play the desired move.

*Parameters :*
* <code>move</code> *\<String\>*
<br>The string representation of the move to play. It must match the regular expression <code>[a-h][1-8]-[a-h][1-8]</code>.
<br>For example : <code>play('e2-e4')</code>
<hr>
