// The ab-chess object will expose some functions for managing chessboards, chessgames, etc...

window.ab-chess = window.ab-chess || function (id, width, options) {
    'use strict';
  
  // Chess constants
  
  var columns = 'abcdefgh';
  
  var piece = {
    black : 'b',
    black_bishop : 'b',
    black_king : 'k',
    black_knight : 'n',
    black_pawn : 'p',
    black_queen : 'q',
    black_rook : 'r',
    
    white : 'w',
    white_bishop : 'B',
    white_king : 'K',
    white_knight : 'N',
    white_pawn : 'P',
    white_queen : 'Q',
    white_rook : 'R'
  };
  
  var html_id = {
    
  };
  
  var error = {
    fen : 'Invalid FEN string.'
  };

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

  Chessboard.isWhiteSquare = function(squareName) {
    
    // Check whether the square is white or not.
    
      var colNumber = columns.indexOf(squareName[0]) + 1;
      var rowNumber = parseInt(squareName[1]);

      if (rowNumber % 2 === 0) {
          return colNumber % 2 === 1;
      } else {
          return colNumber % 2 === 0;
      }
  };
  
  Chessboard.isValidFEN = function(fen) {
    
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

    loadFEN : function (fen) {
      
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
          numColonne = 1;
          numrow = 8 - i;
          
      // Columns loop

          for (j = 0; j < row.length; j += 1) {
              char = row.charAt(j);
              
              if (regex_number.test(char)) {
                  numColonne += parseInt(char);
                  
              } else if (regex_piece.test(char)) {
                  nomCase = columns[numColonne - 1] + numrow;
                  nomPiece = char.toLowerCase() === char ?
                          BLACK + char.toLowerCase() :
                          WHITE + char.toLowerCase();
                  this.placerPiece(nomCase, nomPiece);
                  numColonne += 1;
                  
              } else {
                  throw new SyntaxError(ERREURS.FEN);
              }
          }
      }
    },
    
    createSquares : function () {
      
      // Création des cases dans propriété
  
      var caseBlanche = false;
      var caseHTML;
      var colonne     = '';
      var cssClass    = '';
      var numColonne  = 0;
      var numrow   = 0;
      
      for (numrow = 1; numrow < 9; numrow += 1) {
          
          for (numColonne = 1; numColonne < 9; numColonne += 1) {
              colonne = COLONNES[numColonne - 1];
              caseBlanche =
                      Echiquier.estCaseBlanche(colonne + numrow);
              caseHTML = document.createElement("DIV");
              cssClass = caseBlanche ?
                      CSS.CASE + " " + CSS.CASE_BLANCHE :
                      CSS.CASE + " " + CSS.CASE_NOIRE;
              caseHTML.className = cssClass;
              this.casesHTML[colonne + numrow] = caseHTML;
          }
      }
    },

    draw : function () {
      
      // Draw the chessboard
      
        var
            bordureBas,
            bordureDroite,
            caseHTML,
            casesHTML,              // Element conteneur cases
            colonne         = '',
            echiquierHTML,          // Element échiquier entier
            i               = 0,
            j               = 0,
            morceauBordure,
            numColonne      = 0,
            numrow       = 0;
    
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
            numrow = i;
            if (this.inverse) {
                numrow = 9 - numrow;
            }
            for (j = 1; j < 9; j += 1) {
                numColonne = j;
                if (this.inverse) {
                    numColonne = 9 - numColonne;
                }
                colonne = COLONNES[numColonne - 1];
                caseHTML = this.casesHTML[colonne + numrow];
                casesHTML.appendChild(caseHTML);
            }
        }

        if (this.avecBordures) {

// Bordure horizontale (bas)

            bordureBas = document.createElement("DIV");
            bordureBas.className = CSS.BORDURE_HORIZONTALE;
            bordureBas.style.width = this.width + "px";

            for (i = 1; i < 9; i += 1) {
                numColonne = i;
                if (this.inverse) {
                    numColonne = 9 - numColonne;
                }
                morceauBordure = document.createElement("DIV");
                morceauBordure.className = CSS.MORCEAU_HORIZONTAL;
                morceauBordure.innerHTML =
                        COLONNES[numColonne - 1].toUpperCase();
                bordureBas.appendChild(morceauBordure);
            }

// Bordure verticale (droite)

            bordureDroite = document.createElement("DIV");
            bordureDroite.className = CSS.BORDURE_VERTICALE;
            bordureDroite.style.height = this.width + "px";

            for (i = 8; i > 0; i -= 1) {
                numrow = i;
                if (this.inverse) {
                    numrow = 9 - numrow;
                }
                morceauBordure = document.createElement("DIV");
                morceauBordure.className = CSS.MORCEAU_VERTICAL;
                morceauBordure.style.lineHeight = (this.width / 8) + "px";
                morceauBordure.innerHTML = numrow;
                bordureDroite.appendChild(morceauBordure);
            }
            
            echiquierHTML.appendChild(bordureDroite);
            echiquierHTML.appendChild(bordureBas);
        }

        this.container.appendChild(echiquierHTML);
    },

    putPiece : function (nomCase, piece) {
      
      // Put a piece on a square
      // Params : piece "wk", square "e1"
      
      var pieceHTML = document.createElement("DIV");
        
      pieceHTML.style.backgroundImage = "url('" + CHEMIN_IMAGES + piece + PNG_EXTENSION + "')";
      this.casesHTML[nomCase].appendChild(pieceHTML);
    }

    };
  
};


