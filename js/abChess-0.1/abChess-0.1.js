// abChess script

window.AbChess = window.AbChess || function (containerId, width) {
    'use strict';

    // The global abChess module

    var abChess;

    var columns = 'abcdefgh';

    var chess_piece = {
        black: 'b',
        black_bishop: 'b',
        black_king: 'k',
        black_knight: 'n',
        black_pawn: 'p',
        black_queen: 'q',
        black_rook: 'r',
        white: 'w',
        white_bishop: 'B',
        white_king: 'K',
        white_knight: 'N',
        white_pawn: 'P',
        white_queen: 'Q',
        white_rook: 'R'
    };

    var css = {
        black_square: 'blackSquare',
        bottom_border: 'bottomBorder',
        inline_block: 'inlineBlock',
        right_border: 'rightBorder',
        selected_square: 'selectedSquare',
        square: 'square',
        squares_div: 'squaresDiv',
        white_square: 'whiteSquare'
    };

    var default_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    var draggedPiece = null;

    var draggingAction = false;

    var error = {
        fen: 'Invalid FEN string.'
    };

    var images_path = '../images/wikipedia/';
    var png_extension = '.png';

    function Piece(name) {

        // The Piece class constructs an HTML DIV element.
        // The name property is a 2 chars string (b|w[bknqr])
        // to identify the chess piece.
        // The chess image is set with css backgroundImage.

        var the_piece;
        the_piece = {
            div: null,
            name: name,
            square: null
        };

        the_piece.clickHandler = function () {

        };

        the_piece.dragEndHandler = function () {
            draggingAction = false;
        };

        the_piece.dragStartHandler = function (e) {
            e.dataTransfer.effectAllowed = 'move';
            draggingAction = true;
            draggedPiece = the_piece;
        };

        the_piece.put = function (square) {

            // Put the piece on a square.

            if (!square.isEmpty()) {
                square.piece.remove();
            }
            square.div.appendChild(the_piece.div);
            square.piece = the_piece;
            the_piece.square = square;
        };

        the_piece.remove = function () {

            // Remove the piece from the square.

            if (the_piece.square !== null) {
                the_piece.square.div.removeChild(the_piece.div);
            }
            the_piece.square.piece = null;
            the_piece.square = null;
        };

        return the_piece;
    }

    // -------------------------------------------------------------

    function Square(name) {

        // The Square class constructs a HTML DIV element named with its coordinate.

        var the_square = {
            div: null,
            isHighlighted: false,
            name: name,
            piece: null
        };

        the_square.dragEnterHandler = function (e) {
            if (draggingAction) {
                e.preventDefault();
                the_square.highlight();
            }
        };

        the_square.dragLeaveHandler = function () {
            if (draggingAction) {
                the_square.highlight();
            }
        };

        the_square.dragOverHandler = function (e) {
            if (draggingAction) {
                e.preventDefault();
            }
        };

        the_square.dropHandler = function (e) {
            if (draggingAction) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                draggedPiece.remove();
                draggedPiece.put(the_square);
                the_square.highlight();
            }
        };

        the_square.highlight = function () {

            // Highlight or cancel the highlight of the square.

            var initialClass = css.square + ' ';
            if (the_square.isHighlighted) {
                initialClass += (Square.isWhite(the_square.name))
                    ? css.white_square
                    : css.black_square;
                the_square.div.className = initialClass;
                the_square.isHighlighted = false;
            } else {
                the_square.div.className += ' ' + css.selected_square;
                the_square.isHighlighted = true;
            }
        };

        the_square.isEmpty = function () {

            // Check whether the square is empty.

            return (the_square.piece === null);
        };

        return the_square;
    }

    Square.isWhite = function (name) {

        // Check whether the square is white or not.

        var colNumber = columns.indexOf(name[0]) + 1;
        var rowNumber = parseInt(name[1]);
        if (rowNumber % 2 === 0) {
            return (colNumber % 2 === 1);
        } else {
            return (colNumber % 2 === 0);
        }
    };

    // -----------------------------------------------

    function Chessboard(containerId, width) {

        // The Chessboard class constructs an HTML chessboard.

        var the_board = {
            clickablePieces: false,
            container: document.getElementById(containerId),
            containerId: containerId,
            draggablePieces: true,
            game: {},
            hasBorder: true,
            isFlipped: false,
            squares: {},
            width: width
        };

        the_board.createSquares = function () {

            // Create the squares property.

            var colNumber = 1;
            var column = '';
            var cssClass = '';
            var div;
            var isWhiteSquare = false;
            var name = '';
            var rowNumber = 1;
            var square = {};
            var squares = {};
            while (rowNumber < 9) {
                colNumber = 1;
                while (colNumber < 9) {
                    column = columns[colNumber - 1];
                    name = column + rowNumber;
                    isWhiteSquare = Square.isWhite(name);
                    div = document.createElement("DIV");
                    cssClass = (isWhiteSquare)
                        ? css.square + " " + css.white_square
                        : css.square + " " + css.black_square;
                    div.className = cssClass;
                    square = new Square(name);
                    square.div = div;
                    div.addEventListener('dragenter', square.dragEnterHandler);
                    div.addEventListener('dragleave', square.dragLeaveHandler);
                    div.addEventListener('dragover', square.dragOverHandler);
                    div.addEventListener('drop', square.dropHandler);
                    squares[name] = square;
                    colNumber += 1;
                }
                rowNumber += 1;
            }
            the_board.squares = squares;
        };

        the_board.draw = function () {

            // Draw the chessboard.

            var borderFragment;
            var bottomBorder;
            var colNumber = 0;
            var column = '';
            var index = 0;
            var rightBorder;
            var rowNumber = 0;
            var square;
            var squaresDiv;
            squaresDiv = document.createElement("DIV");
            squaresDiv.style.width = the_board.width + "px";
            squaresDiv.style.height = the_board.width + "px";
            squaresDiv.className = css.squares_div;
            if (!the_board.isFlipped) {

                // Draw the squares (the first row is from a8 to h8).

                rowNumber = 8;
                while (rowNumber > 0) {
                    colNumber = 1;
                    while (colNumber < 9) {
                        column = columns[colNumber - 1];
                        square = the_board.squares[column + rowNumber];
                        squaresDiv.appendChild(square.div);
                        colNumber += 1;
                    }
                    rowNumber -= 1;
                }
            } else {

                // Draw the squares (the first row is from h1 to a1).

                rowNumber = 1;
                while (rowNumber < 9) {
                    colNumber = 8;
                    while (colNumber > 0) {
                        column = columns[colNumber - 1];
                        square = the_board.squares[column + rowNumber];
                        squaresDiv.appendChild(square.div);
                        colNumber -= 1;
                    }
                    rowNumber += 1;
                }
            }
            the_board.container.appendChild(squaresDiv);
            if (the_board.hasBorder) {

                // Bottom border

                bottomBorder = document.createElement("DIV");
                bottomBorder.className = css.bottom_border;
                bottomBorder.style.width = the_board.width + "px";
                colNumber = 1;
                while (colNumber < 9) {
                    borderFragment = document.createElement("DIV");
                    index = (the_board.isFlipped)
                        ? 8 - colNumber
                        : colNumber - 1;
                    borderFragment.innerHTML = columns[index].toUpperCase();
                    bottomBorder.appendChild(borderFragment);
                    colNumber += 1;
                }

                // Right border

                rightBorder = document.createElement("DIV");
                rightBorder.className = css.right_border;
                rightBorder.style.height = the_board.width + "px";
                rowNumber = 1;
                while (rowNumber < 9) {
                    borderFragment = document.createElement("DIV");
                    borderFragment.style.lineHeight = (the_board.width / 8) + "px";
                    index = (the_board.isFlipped)
                        ? rowNumber
                        : 9 - rowNumber;
                    borderFragment.innerHTML = index;
                    rightBorder.appendChild(borderFragment);
                    rowNumber += 1;
                }
                the_board.container.appendChild(rightBorder);
                the_board.container.appendChild(bottomBorder);
            }
        };

        the_board.empty = function () {

            // Remove all the pieces of the board.

            Object.keys(the_board.squares).forEach(function (key) {
                var currentSquare = the_board.squares[key];
                if (!currentSquare.isEmpty()) {
                    the_board.squares[key].piece.remove();
                }
            });
        };

        the_board.getPosition = function () {

            // Get the position of the pieces in a FEN string.

            var colNumber = 1;
            var count = 0;
            var currentSquare;
            var pieceName = '';
            var position = '';
            var rowNumber = 8;
            var squareName = '';
            while (rowNumber > 0) {
                colNumber = 1;
                while (colNumber < 9) {
                    squareName = columns[colNumber - 1] + rowNumber;
                    currentSquare = the_board.squares[squareName];
                    if (currentSquare.isEmpty()) {
                        count += 1;
                    } else {
                        pieceName = currentSquare.piece.name;
                        if (count > 0) {
                            position += count;
                            count = 0;
                        }
                        position += (pieceName[0] === chess_piece.white)
                            ? pieceName[1].toUpperCase()
                            : pieceName[1].toLowerCase();
                    }
                    if (colNumber === 8) {
                        if (count > 0) {
                            position += count;
                            count = 0;
                        }
                        if (rowNumber > 1) {
                            position += '/';
                        }
                    }
                    colNumber += 1;
                }
                rowNumber -= 1;
            }
            return position;
        };

        the_board.loadPosition = function (fen) {

            // Load a position from a FEN string.

            var char = '';
            var div;
            var piece;
            var pieceName = '';
            var position = {};
            var positionArray = [];
            var square = {};
            var url = '';
            fen = fen || default_fen;
            if (!Chessboard.isValidFEN(fen)) {
                throw new SyntaxError(error.fen);
            }
            the_board.empty();
            position = Chessgame.getPositionFromFEN(fen);
            positionArray = Object.keys(position);
            positionArray.forEach(function (squareName) {
                square = the_board.squares[squareName];
                char = position[squareName];
                pieceName = (char.toLowerCase() === char)
                    ? chess_piece.black + char
                    : chess_piece.white + char.toLowerCase();
                piece = new Piece(pieceName);
                div = document.createElement("DIV");
                url = images_path + pieceName + png_extension;
                div.style.backgroundImage = 'url("' + url + '")';
                div.setAttribute('draggable', 'true');
                div.addEventListener('dragstart', piece.dragStartHandler);
                div.addEventListener('dragend', piece.dragEndHandler);
                piece.div = div;
                piece.put(square);
            });
        };

        return the_board;
    }

    Chessboard.isValidFEN = function (fen) {

        // FEN string validator

        var chars = [];
        var position = fen.replace(/\s.*/, '');
        var regex_fen = /^([BKNPQR1-8]{1,8}\/){7}[BKNQPR1-8]{1,8}/i;
        var regex_number = /[2-8]/;
        var regex_square = /[BKNPQR1]/i;
        var rows = position.split('/');
        var squaresCounter = 0;
        if (!regex_fen.test(fen)) {
            return false;
        }
        return rows.every(function (value) {
            squaresCounter = 0;
            chars = value.split('');
            chars.every(function (char) {
                if (regex_square.test(char)) {
                    squaresCounter += 1;
                    return true;
                }
                if (regex_number.test(char)) {
                    squaresCounter += parseInt(char);
                    return true;
                }
                return false;
            });
            return (squaresCounter === 8);
        });
    };

    // ---------------------------------------------------

    function Chessgame() {

        // The Chessgame class constructs a full chess game.
        // We assume a chessgame is mainly an ordered collection
        // of FEN positions.
        // A FEN position is a chess position plus some data :
        // active color, castling possibilities, en passant square,
        // halfmove clock and fullmove number.

        var the_game = {
            pgn: '',
            fenPositions: []
        };

        the_game.getPGN = function () {
            return the_game.pgn;
        };



        return the_game;
    }

    Chessgame.getPositionFromFEN = function (fen) {

        // Return a position object from a FEN position string.

        var colNumber = 1;
        var fenArray = [];
        var name = '';
        var object = {};
        var regexNumber = /[1-8]/;
        var regexPiece = /[bknpqr]/i;
        var rowNumber = 8;
        fen = fen.replace(/\s.*/, '');
        fenArray = fen.split('');
        fenArray.forEach(function (char) {
            if (regexPiece.test(char)) {
                name = columns[colNumber - 1] + rowNumber;
                object[name] = char;
                colNumber += 1;
            } else if (regexNumber.test(char)) {
                colNumber += parseInt(char);
            } else if (char === '/') {
                colNumber = 1;
                rowNumber -= 1;
            } else {
                throw new Error(error.fen);
            }
        });
        return object;
    };

    Chessgame.isValidPGN = function (pgn) {

        // PGN string validator

        var regexString = "([1-9][0-9]*\\.{1,3}\\s*)?" +
            "(O-O-O|" +
            "O-O|" +
            "([BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|" +
            "([a-h]x)?[a-h][1-8](\=[BNQR])?" +
            ")(\\+|#)?";
        var regex = new RegExp(regexString, "gm");
        return regex.test(pgn.trim());
    };

    // ---------------------------------------------------

    abChess = new Chessboard(containerId, width);

    // Returned api.

    return {
        draw: function () {

            // Draw the chessboard.

            abChess.createSquares();
            abChess.draw();
        },

        fen: {

            // Get or set the FEN position.

            get: function () {
                return abChess.getPosition();
            },
            set: function (fen) {
                abChess.loadPosition(fen);
            }
        },

        flip: function () {

            // Flip the board.

            abChess.isFlipped = !abChess.isFlipped;
            while (abChess.container.hasChildNodes()) {
                abChess.container.removeChild(abChess.container.lastChild);
            }
            abChess.draw();
        },

        highlight: function (square) {

            // Highlight a square (or the piece on it).

            abChess.squares[square].highlight();
        }
    };

};
