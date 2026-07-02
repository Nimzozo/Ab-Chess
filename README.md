# AbChess

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4cf8f39c2ee846b4ad7349dc5532efad)](https://www.codacy.com/app/Nimzozo/Ab-Chess?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Nimzozo/Ab-Chess&amp;utm_campaign=Badge_Grade)

AbChess is a lightweight JavaScript library for building playable HTML chessboards with animated pieces, full chess-rule support, and PGN/FEN validation.

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Chess resources](#chess-resources)

## Features

### Graphical user interface
  - customizable board and piece styles
  - playable moves with two-click or drag-and-drop
  - animations for moves, captures, illegal moves, and position changes

### Chess logic
  - standard piece movements
  - promotion, en passant, castling, king opposition
  - detection: check, checkmate, stalemate, 50-move rule, insufficient material

### String validation
  - FEN position
  - PGN game

### Game support
  - input moves and retrieve game state
  - parse and display PGN games

## Installation

Use the release files from `src/AbChess` or your local build.

```html
<link rel="stylesheet" href="src/AbChess/AbChess-0.3.1.css">
<script src="src/AbChess/AbChess-0.3.1.js"></script>
```

## Usage

Add a chessboard container and initialize AbChess.

```html
<div id="chessboard"></div>
<script>
  var abChess = new AbChess('chessboard');
  abChess.setFEN();
</script>
```

See the docs for detailed API usage, configuration, and examples.

## Documentation

Full documentation and examples are available on GitHub Pages:

- [Overview](https://nimzozo.github.io/Ab-Chess/docs/overview.html) for setup
- [API reference](https://nimzozo.github.io/Ab-Chess/docs/reference.html)
- [Examples](https://nimzozo.github.io/Ab-Chess/examples.html) for demos
- [Releases](https://nimzozo.github.io/Ab-Chess/releases.html)

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Clone it locally.
3. Open the `src/AbChess` and `test` files.
4. Run your changes in the browser using the example pages.

Please update documentation and add tests for bug fixes or new features.

## License

This project is licensed under the [MIT License](https://github.com/Nimzozo/ab-chess/blob/master/LICENSE.txt).

## Chess resources

- [FEN Wikipedia](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)
- [PGN Wikipedia](https://en.wikipedia.org/wiki/Portable_Game_Notation)
- [PGN-spec](https://www.chessclub.com/user/help/PGN-spec)
