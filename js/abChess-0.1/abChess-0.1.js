// abChess script

window.abChess = window.abChess || function (containerId, width) {
    'use strict';

    // The global abChess module

    var abc;

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

    var error = {
        fen: 'Invalid FEN string.'
    };

    var images_path = '../Images/wikipedia/';
    var png_extension = '.png';

    function Square(name) {

        // Square class constructor.

        var the_square = {
            clickHandler: null,
            div: null,
            isEmpty: true,
            isSelected: false,
            isWhite: Square.isWhite(name),
            name: name,
            piece: ''
        };

        the_square.putPiece = function (piece) {

            // Put a piece on a square.

            var htmlPiece = document.createElement("DIV");
            htmlPiece.style.backgroundImage = 'url("' + images_path + piece + png_extension + '")';
            the_square.div.appendChild(htmlPiece);
        };

        the_square.removePiece = function () {

            // Remove a piece from a square.

            if (!the_square.isEmpty) {
                //the_square.div;
                the_square.isEmpty = true;
                the_square.piece = '';
            }
        };

        the_square.select = function () {

            // Select or unselect a square.

            var initialClass = css.square + ' ';
            if (the_square.isSelected) {
                initialClass += (the_square.isWhite)
                    ? css.white_square
                    : css.black_square;
                the_square.div.className = initialClass;
                the_square.isSelected = false;
            } else {
                the_square.div.className += ' ' + css.selected_square;
                the_square.isSelected = true;
            }
        };

        return the_square;
    }

    Square.isWhite = function (name) {

        // Check whether the square is white or not.

        var colNumber = columns.indexOf(name[0]) + 1;
        var rowNumber = parseInt(name[1]);
        if (rowNumber % 2 === 0) {
            return colNumber % 2 === 1;
        } else {
            return colNumber % 2 === 0;
        }
    };

    // -----------------------------------------------

    function Chessboard(containerId, width) {

        // The HTML chessboard class constructor.

        var the_board = {
            container: document.getElementById(containerId),
            containerId: containerId,
            game: {},
            hasBorder: true,
            isFlipped: false,
            htmlSquares: {},
            width: width
        };

        the_board.activateEventHandlers = function () {

            // Square class ??

            Object.keys(the_board.htmlSquares).forEach(function (key) {
                var square = the_board.htmlSquares[key];
                var handler = function () {
                    square.select();
                };
                square.clickHandler = handler;
                square.div.addEventListener('click', handler);
            });
        };

        the_board.createHTMLSquares = function () {

            // Create the htmlSquares property.

            var colNumber = 1;
            var column = '';
            var cssClass = '';
            var div;
            var htmlSquare = {};
            var isWhiteSquare = false;
            var name = '';
            var rowNumber = 1;
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
                    htmlSquare = new Square(name);
                    htmlSquare.div = div;
                    squares[name] = htmlSquare;
                    colNumber += 1;
                }
                rowNumber += 1;
            }
            the_board.htmlSquares = squares;
        };

        the_board.draw = function () {

            // Draw the chessboard.

            var borderFragment;
            var bottomBorder;
            var colNumber = 0;
            var column = '';
            var htmlSquare;
            var index = 0;
            var rightBorder;
            var rowNumber = 0;
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
                        htmlSquare = the_board.htmlSquares[column + rowNumber];
                        squaresDiv.appendChild(htmlSquare.div);
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
                        htmlSquare = the_board.htmlSquares[column + rowNumber];
                        squaresDiv.appendChild(htmlSquare.div);
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

        the_board.loadFEN = function (fen) {

            // Load a position from a FEN string.

            var chars = [];
            var colNumber = 0;
            var piece = '';
            var position;
            var regex_number = /[1-8]/;
            var regex_piece = /[BKNPQR]/i;
            var rowNumber = 0;
            var rows = [];
            var square = {};
            var squareName = '';
            fen = fen || default_fen;
            if (!Chessboard.isValidFEN(fen)) {
                throw new SyntaxError(error.fen);
            }
            position = fen.replace(/\s.*/, '');
            rows = position.split('/');
            rowNumber = 8;
            rows.forEach(function (rowValue) {

                // Rows loop

                colNumber = 1;
                chars = rowValue.split('');
                chars.forEach(function (char) {

                    // Columns loop

                    if (regex_number.test(char)) {
                        colNumber += parseInt(char);
                    } else if (regex_piece.test(char)) {
                        squareName = columns[colNumber - 1] + rowNumber;
                        square = the_board.htmlSquares[squareName];
                        piece = (char.toLowerCase() === char)
                            ? chess_piece.black + char.toLowerCase()
                            : chess_piece.white + char.toLowerCase();
                        square.putPiece(piece);
                        colNumber += 1;
                    } else {
                        throw new SyntaxError(error.fen);
                    }
                });
                rowNumber -= 1;
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

    function Chessgame(pgn) {

        // The Chessgame class constructor.

        var the_game = {
            moves: [],
            pgn: pgn
        };

        return the_game;
    }

    Chessgame.isValidPGN = function (pgn) {

        // PGN string validator

        var regexString = "([1-9][0-9]*\\.{1,3}\\s*)?" +
            "(O-O-O|" +
            "O-O|" +
            "([BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|" +
            "([a-h]x)?[a-h][1-8](=[BNQR])?" +
            ")(\\+|#)?";
        var regex = new RegExp(regexString, "gm");
        return regex.test(pgn.trim());
    };

    // ---------------------------------------------------

    abc = new Chessboard(containerId, width);

    // Returned api.

    return {
        draw: function () {

            // Draw the chessboard.

            abc.createHTMLSquares();
            abc.activateEventHandlers();
            abc.draw();
        },

        fen: {

            // Get or set the FEN position.

            get: function () {
                return abc.fen;
            },
            set: function (fen) {
                abc.loadFEN(fen);
            }
        },

        flip: function () {

            // Flip the board.

            abc.isFlipped = !abc.isFlipped;
            while (abc.container.hasChildNodes()) {
                abc.container.removeChild(abc.container.lastChild);
            }
            abc.draw();
        },

        select: function (square) {

            // Select a square (or the piece on it).

            abc.htmlSquares[square].select();
        }
    };

};
