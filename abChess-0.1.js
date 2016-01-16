// Chess script

window.abChess = window.abChess || function (containerId, width) {
    'use strict';

    // The global abChess() function

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
        square: 'square',
        squares_div: 'squaresDiv',
        white_square: 'whiteSquare'
    };
    var default_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    var error = {
        fen: 'Invalid FEN string.'
    };
    var images_path = '../../Images/wikipedia/';
    var png_extension = '.png';

    function Chessboard(containerId, width) {

        // The HTML chessboard class constructor.

        var the_object = {
            container: document.getElementById(containerId),
            containerId: containerId,
            game: {},
            hasBorder: true,
            isFlipped: false,
            htmlSquares: {},
            width: width
        };

        the_object.createHTMLSquares = function () {

            // Creates the htmlSquares property.

            var colNumber = 1;
            var column = '';
            var cssClass = '';
            var htmlSquare;
            var isWhiteSquare = false;
            var rowNumber = 1;
            var squares = {};
            while (rowNumber < 9) {
                colNumber = 1;
                while (colNumber < 9) {
                    column = columns[colNumber - 1];
                    isWhiteSquare = Chessboard.isWhiteSquare(column + rowNumber);
                    htmlSquare = document.createElement("DIV");
                    cssClass = (isWhiteSquare)
                        ? css.square + " " + css.white_square
                        : css.square + " " + css.black_square;
                    htmlSquare.className = cssClass;
                    squares[column + rowNumber] = htmlSquare;
                    colNumber += 1;
                }
                rowNumber += 1;
            }
            the_object.htmlSquares = squares;
        };

        the_object.draw = function () {

            // Draws the chessboard.

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
            squaresDiv.style.width = the_object.width + "px";
            squaresDiv.style.height = the_object.width + "px";
            squaresDiv.className = css.squares_div;
            if (!the_object.isFlipped) {

                // Draws the squares (the first row is from a8 to h8).

                rowNumber = 8;
                while (rowNumber > 0) {
                    colNumber = 1;
                    while (colNumber < 9) {
                        column = columns[colNumber - 1];
                        htmlSquare = the_object.htmlSquares[column + rowNumber];
                        squaresDiv.appendChild(htmlSquare);
                        colNumber += 1;
                    }
                    rowNumber -= 1;
                }
            } else {

                // Draws the squares (the first row is from h1 to a1).

                rowNumber = 1;
                while (rowNumber < 9) {
                    colNumber = 8;
                    while (colNumber > 0) {
                        column = columns[colNumber - 1];
                        htmlSquare = the_object.htmlSquares[column + rowNumber];
                        squaresDiv.appendChild(htmlSquare);
                        colNumber -= 1;
                    }
                    rowNumber += 1;
                }
            }
            the_object.container.appendChild(squaresDiv);
            if (the_object.hasBorder) {

                // Bottom border

                bottomBorder = document.createElement("DIV");
                bottomBorder.className = css.bottom_border;
                bottomBorder.style.width = the_object.width + "px";
                colNumber = 1;
                while (colNumber < 9) {
                    borderFragment = document.createElement("DIV");
                    index = (the_object.isFlipped)
                        ? 8 - colNumber
                        : colNumber - 1;
                    borderFragment.innerHTML = columns[index].toUpperCase();
                    bottomBorder.appendChild(borderFragment);
                    colNumber += 1;
                }

                // Right border

                rightBorder = document.createElement("DIV");
                rightBorder.className = css.right_border;
                rightBorder.style.height = the_object.width + "px";
                rowNumber = 1;
                while (rowNumber < 9) {
                    borderFragment = document.createElement("DIV");
                    borderFragment.style.lineHeight = (the_object.width / 8) + "px";
                    index = (the_object.isFlipped)
                        ? rowNumber
                        : 9 - rowNumber;
                    borderFragment.innerHTML = index;
                    rightBorder.appendChild(borderFragment);
                    rowNumber += 1;
                }
                the_object.container.appendChild(rightBorder);
                the_object.container.appendChild(bottomBorder);
            }
        };

        the_object.loadFEN = function (fen) {

            // Load a position from a FEN string.

            fen = fen || default_fen;
        };

        return the_object;
    }

    Chessboard.isWhiteSquare = function (square) {

        // Check whether the square is white or not.

        var colNumber = columns.indexOf(square[0]) + 1;
        var rowNumber = parseInt(square[1]);
        if (rowNumber % 2 === 0) {
            return colNumber % 2 === 1;
        } else {
            return colNumber % 2 === 0;
        }
    };

    Chessboard.isValidFEN = function (fen) {

        // FEN string validator

        var position = fen.replace(/\s.*/, '');
        var regex_fen = /^([BKNPQR1-8]{1,8}\/){7}[BKNQPR1-8]{1,8}/i;
        var regex_number = /[2-8]/;
        var regex_square = /[BKNPQR1]/i;
        var rows = position.split('/');
        var squaresCounter = 0;
        if (!regex_fen.test(fen)) {
            return false;
        }
        rows.forEach(function (value) {
            squaresCounter = 0;
            value.forEach(function (char) {
                if (regex_square.test(char)) {
                    squaresCounter += 1;
                } else if (regex_number.test(char)) {
                    squaresCounter += parseInt(char);
                } else {
                    return false;
                }
            });
            if (squaresCounter !== 8) {
                return false;
            }
            return true;
        });
    };

    // Returned api.

    var abc = new Chessboard(containerId, width);

    return {
        draw: function () {
            abc.createHTMLSquares();
            abc.draw();
        },

        fen: function (fen) {
            abc.loadFEN(fen);
        }
    };

};
