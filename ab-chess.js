// The ab-chess object will expose some functions for managing chessboards, chessgames, etc...

window.abchess = window.abchess || function (id, width, options) {
    'use strict';
  
    // Chess constants
  
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

    var error = {
        fen: 'Invalid FEN string.'
    };

    var images_path = '/images/wikipedia/';

    var png_extension = '.png';



    function Chessboard(id, width) {
    
        // Chessboard class
    
        this.hasBorder = true;
        this.HTMLSquares = {};
        this.container = document.getElementById(id);
        this.HTML = {};
        this.isFlipped = false;
        this.game = {};
        this.width = width;
    }

    Chessboard.isWhiteSquare = function (squareName) {
    
        // Check whether the square is white or not.
    
        var colNumber = columns.indexOf(squareName[0]) + 1;
        var rowNumber = parseInt(squareName[1]);

        if (rowNumber % 2 === 0) {
            return colNumber % 2 === 1;
        } else {
            return colNumber % 2 === 0;
        }
    };

    Chessboard.isValidFEN = function (fen) {
    
        // FEN string validator
    
        var char = '';
        var counter = 0;
        var i = 0;
        var j = 0;
        var position = fen.replace(/\s.*/, '');
        var regex_fen = /^([BKNPQR1-8]{1,8}\/){7}[BKNQPR1-8]{1,8}/i;
        var regex_square = /[BKNPQR1]/i;
        var regex_number = /[2-8]/;
        var row = '';
        var rows = position.split('/');

        if (!regex_fen.test(fen)) {
            return false;
        }

        for (i = 0; i < rows.length; i += 1) {
            row = rows[i];
            counter = 0;

            for (j = 0; j < row.length; j += 1) {
                char = row.charAt(j);
                if (regex_square.test(char)) {
                    counter += 1;

                } else if (regex_number.test(char)) {
                    counter += parseInt(char);

                } else {
                    throw new SyntaxError(error.fen);
                }
            }

            if (counter !== 8) {
                return false;
            }
        }

        return true;
    };

    Chessboard.prototype = {

        loadFEN: function (fen) {
      
            // Load a position from a FEN string.
      
            var char = '';
            var i = 0;
            var j = 0;
            var square = '';
            var piece = '';
            var colNumber = 0;
            var rowNumber = 0;
            var position;
            var row = '';
            var rows = [];
            var regex_number = /[1-8]/;
            var regex_piece = /[BKNPQR]/i;

            if (!Chessboard.isValidFEN(fen)) {
                throw new SyntaxError(error.fen);
            }

            position = fen.replace(/\s.*/, "");
            rows = position.split("/");

            // Rows loop

            for (i = 0; i < rows.length; i += 1) {
                row = rows[i];
                colNumber = 1;
                rowNumber = 8 - i;
          
                // Columns loop

                for (j = 0; j < row.length; j += 1) {
                    char = row.charAt(j);

                    if (regex_number.test(char)) {
                        colNumber += parseInt(char);

                    } else if (regex_piece.test(char)) {
                        square = columns[colNumber - 1] + rowNumber;
                        piece = char.toLowerCase() === char ?
                            chess_piece.black + char.toLowerCase() :
                            chess_piece.white + char.toLowerCase();
                        this.placerPiece(square, piece);
                        colNumber += 1;

                    } else {
                        throw new SyntaxError(error.fen);
                    }
                }
            }
        },

        createSquares: function () {
      
            // Create the chessboard squares property.
  
            var isWhiteSquare = false;
            var caseHTML;
            var column = '';
            var cssClass = '';
            var colNumber = 0;
            var rowNumber = 0;

            for (rowNumber = 1; rowNumber < 9; rowNumber += 1) {

                for (colNumber = 1; colNumber < 9; colNumber += 1) {
                    column = columns[colNumber - 1];
                    isWhiteSquare = Chessboard.isWhiteSquare(column + rowNumber);
                    caseHTML = document.createElement("DIV");
                    cssClass = isWhiteSquare ?
                        CSS.CASE + " " + CSS.CASE_BLANCHE :
                        CSS.CASE + " " + CSS.CASE_NOIRE;
                    caseHTML.className = cssClass;
                    this.casesHTML[column + rowNumber] = caseHTML;
                }
            }
        },

        draw: function () {
      
            // Draw the chessboard
      
            var bottomBorder;
            var rightBorder;
            var caseHTML;
            var casesHTML;              // Element conteneur cases
            var column = '';
            var echiquierHTML;          // Element échiquier entier
            var i = 0;
            var j = 0;
            var borderFragment;
            var colNumber = 0;
            var rowNumber = 0;
    
            // Construction échiquier

            echiquierHTML = document.createElement("DIV");
            this.html = echiquierHTML;

            casesHTML = document.createElement("DIV");
            casesHTML.style.width = this.width + "px";
            casesHTML.style.height = this.width + "px";
            casesHTML.className = CSS.CASES;
            echiquierHTML.appendChild(casesHTML);

            // Cases : a8 => h8. Si retourne : h1 => a1

            for (i = 8; i > 0; i -= 1) {
                rowNumber = i;
                if (this.inverse) {
                    rowNumber = 9 - rowNumber;
                }
                for (j = 1; j < 9; j += 1) {
                    colNumber = j;
                    if (this.inverse) {
                        colNumber = 9 - colNumber;
                    }
                    column = columns[colNumber - 1];
                    caseHTML = this.casesHTML[column + rowNumber];
                    casesHTML.appendChild(caseHTML);
                }
            }

            if (this.avecBordures) {

                // Bordure horizontale (bas)

                bottomBorder = document.createElement("DIV");
                bottomBorder.className = CSS.BORDURE_HORIZONTALE;
                bottomBorder.style.width = this.width + "px";

                for (i = 1; i < 9; i += 1) {
                    colNumber = i;
                    if (this.inverse) {
                        colNumber = 9 - colNumber;
                    }
                    borderFragment = document.createElement("DIV");
                    borderFragment.className = CSS.MORCEAU_HORIZONTAL;
                    borderFragment.innerHTML =
                    columns[colNumber - 1].toUpperCase();
                    bottomBorder.appendChild(borderFragment);
                }

                // Bordure verticale (droite)

                rightBorder = document.createElement("DIV");
                rightBorder.className = CSS.BORDURE_VERTICALE;
                rightBorder.style.height = this.width + "px";

                for (i = 8; i > 0; i -= 1) {
                    rowNumber = i;
                    if (this.inverse) {
                        rowNumber = 9 - rowNumber;
                    }
                    borderFragment = document.createElement("DIV");
                    borderFragment.className = CSS.MORCEAU_VERTICAL;
                    borderFragment.style.lineHeight = (this.width / 8) + "px";
                    borderFragment.innerHTML = rowNumber;
                    rightBorder.appendChild(borderFragment);
                }

                echiquierHTML.appendChild(rightBorder);
                echiquierHTML.appendChild(bottomBorder);
            }

            this.container.appendChild(echiquierHTML);
        },

        putPiece: function (nomCase, piece) {
      
            // Put a piece on a square
            // Params : piece "wk", square "e1"
      
            var pieceHTML = document.createElement("DIV");

            pieceHTML.style.backgroundImage = "url('" + images_path + piece + png_extension + "')";
            this.casesHTML[nomCase].appendChild(pieceHTML);
        }

    };

};


