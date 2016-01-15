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
  
};


