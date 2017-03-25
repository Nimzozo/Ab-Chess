# Ab-Chess

[![Issue Count](https://codeclimate.com/github/Nimzozo/Ab-Chess/badges/issue_count.svg)](https://codeclimate.com/github/Nimzozo/Ab-Chess)

## Chess API for JavaScript

Ab-Chess API for JavaScript provides the tools to build HTML playable chessboards with animated pieces.

It lets you import, play and export a chessgame in the PGN notation.

More informations are available on the [GitHub pages](https://nimzozo.github.io/Ab-Chess/) :

- [Documentation](https://nimzozo.github.io/Ab-Chess/docs/overview.html)
- [Examples](https://nimzozo.github.io/Ab-Chess/examples/basics/default.html)
- [Releases](https://nimzozo.github.io/Ab-Chess/download.html)

## Features

- GUI :
  - customizable board and pieces
  - playable pieces :
    - with two-clicks
    - with drag-and-drop
  - animated pieces :
    - for moves
    - for wrong moves
    - for captures
    - for position changes

- Chess logic :
  - pieces basic movements
  - pieces special moves :
    - promotion
    - en passant
    - castling
    - kings opposition
  - check detection
  - result detection :
    - checkmate
    - stalemate
    - 50 moves rule
    - insufficient material

- Validation :
  - FEN string
  - PGN string

- Game
  - export :
    - PGN moves array
    - PGN string
  - import :
    - play moves
    - PGN string

## How to use

Download the latest release and simply follow these steps :

- Load the CSS file.
```html
<link rel="stylesheet" href="AbChess-x.x.x.css">
```

- Add a chessboard container.
```html
<div id="chessboard"></div>
```

- Load the JavaScript file.
```html
<script src="AbChess-x.x.x.js"></script>
```

- To embed a chessboard with the default configuration, run this script.
```javascript
var abChess = new AbChess("chessboard");
abChess.draw();
abChess.setFEN();
```

## License

- [MIT License](https://github.com/Nimzozo/ab-chess/blob/master/LICENSE.txt)

## Chess resources

- [FEN Wikipedia](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)
- [PGN Wikipedia](https://en.wikipedia.org/wiki/Portable_Game_Notation)
- [PGN-spec](https://www.chessclub.com/user/help/PGN-spec)
