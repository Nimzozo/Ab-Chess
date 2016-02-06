// AbChess-0.1.js
// 2016-02-06
// Copyright (c) 2016 Nimzozo

// TODO :
// make events cleaner + bug interference
// optimize legality loops
// fix sync layout

/*global
    window, requestAnimationFrame
*/

/*jslint
    browser, white
*/

window.AbChess = window.AbChess || function (containerId, abConfig) {
    'use strict';

    var abBoard = {};
    var abGame = {};
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
        highlighted_square: 'highlightedSquare',
        marked_square: 'markedSquare',
        promotion_div: 'promotionDiv',
        selected_square: 'selectedSquare',
        square: 'square',
        squares_div: 'squaresDiv',
        white_square: 'whiteSquare'
    };
    var default_config = {
        circleColor: 'steelblue',
        clickable: true,
        draggable: true,
        flipped: false,
        hasBorder: true,
        onPieceDragEnd: null,
        onPieceDragStart: null,
        onPromotionChose: null,
        onSquareClick: null,
        onSquareDrop: null,
        showKingInCheck: true,
        showLegalMoves: true,
        width: 360
    };
    var default_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    var error = {
        fen: 'Invalid FEN string.',
        illegal_move: 'Illegal move.'
    };
    var images_path = '../images/wikipedia/';
    var png_extension = '.png';
    var regex_castle = /^e(1-c1|1-g1|8-c8|8-g8)$/;
    var regex_en_passant = /^([a-h]4-[a-h]3|[a-h]5-[a-h]6)$/;
    var regex_fen = /^([bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q|-)\s([a-h][36]|-)\s(0|[1-9]\d*)\s([1-9]\d*)$/;
    var regex_fen_row = /^([bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8)$/i;
    var regex_move = /^[a-h][1-8]-[a-h][1-8]$/;
    var regex_promotion = /^([a-h]2-[a-h]1|[a-h]7-[a-h]8)$/;

    // -------------------------------------------------------------------------

    function Position(fen) {

        // A chess Position is constructed with a FEN string.
        // It represents the pieces placement plus some extra data.

        var the_position = {
            fen: fen
        };

        the_position.checkMoveLegality = function (move) {

            // Check whether a move is legal or not.
            // Check : active color, kings are not in check, moves are legal.

            var activeColor = the_position.getActiveColor();
            var arrival = move.substr(3, 2);
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var pieceColor = '';
            var start = move.substr(0, 2);
            var targets = the_position.getTargets(start, false);
            var testPosition = the_position.getNewPosition(move);
            if (!regex_move.test(move)) {
                return false;
            }
            if (!occupiedSquares.hasOwnProperty(start)) {
                return false;
            }
            pieceColor = (occupiedSquares[start] === occupiedSquares[start].toLowerCase())
                ? chess_piece.black
                : chess_piece.white;
            if (activeColor !== pieceColor) {
                return false;
            }
            if (testPosition.isInCheck(activeColor)) {
                return false;
            }
            return targets.some(function (target) {
                return (target === arrival);
            });
        };

        the_position.getActiveColor = function () {
            var matches = regex_fen.exec(the_position.fen);
            return matches[2];
        };

        the_position.getAllowedCastles = function () {
            var matches = regex_fen.exec(the_position.fen);
            return matches[3];
        };

        the_position.getEnPassantTarget = function () {
            var matches = regex_fen.exec(the_position.fen);
            return matches[4];
        };

        the_position.getFullmoveNumber = function () {
            var matches = regex_fen.exec(the_position.fen);
            return Number(matches[6]);
        };

        the_position.getHalfmoveClock = function () {
            var matches = regex_fen.exec(the_position.fen);
            return Number(matches[5]);
        };

        the_position.getKingSquare = function (color) {

            // Return the square where the desired king is placed.

            var desiredKing = (color === chess_piece.black)
                ? chess_piece.black_king
                : chess_piece.white_king;
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var square = '';
            Object.keys(occupiedSquares).every(function (key) {
                var piece = occupiedSquares[key];
                if (piece === desiredKing) {
                    square = key;
                    return false;
                }
                return true;
            });
            return square;
        };

        the_position.getNewActiveColor = function () {
            var nextActiveColor = (the_position.getActiveColor() === chess_piece.white)
                ? chess_piece.black
                : chess_piece.white;
            return nextActiveColor;
        };

        the_position.getNewAllowedCastles = function (move) {
            var allowedCastles = the_position.getAllowedCastles();
            var arrivalSquare = move.substr(3, 2);
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var playedPiece = '';
            var startSquare = move.substr(0, 2);
            if (!regex_move.test(move)) {
                return false;
            }
            if (allowedCastles === '-') {
                return allowedCastles;
            }
            playedPiece = occupiedSquares[startSquare];
            if (allowedCastles.search(/[kq]/) !== -1) {
                if (playedPiece === chess_piece.black_king) {
                    allowedCastles = allowedCastles.replace(/[kq]/g, '');
                }
                if (startSquare === 'a8' || arrivalSquare === 'a8') {
                    allowedCastles = allowedCastles.replace(/q/, '');
                }
                if (startSquare === 'h8' || arrivalSquare === 'h8') {
                    allowedCastles = allowedCastles.replace(/k/, '');
                }
            }
            if (allowedCastles.search(/[KQ]/) !== -1) {
                if (playedPiece === chess_piece.white_king) {
                    allowedCastles = allowedCastles.replace(/[KQ]/g, '');
                }
                if (startSquare === 'a1' || arrivalSquare === 'a1') {
                    allowedCastles = allowedCastles.replace(/Q/, '');
                }
                if (startSquare === 'h1' || arrivalSquare === 'h1') {
                    allowedCastles = allowedCastles.replace(/K/, '');
                }
            }
            if (allowedCastles === '') {
                allowedCastles = '-';
            }
            return allowedCastles;
        };

        the_position.getNewEnPassant = function (move) {
            var arrivalRowNumber = 0;
            var arrivalSquare = move.substr(3, 2);
            var nextEnPassantTarget = '-';
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var playedPiece = '';
            var startRowNumber = 0;
            var startSquare = move.substr(0, 2);
            if (!regex_move.test(move)) {
                return;
            }
            arrivalRowNumber = Number(arrivalSquare[1]);
            startRowNumber = Number(startSquare[1]);
            playedPiece = occupiedSquares[startSquare];
            if (playedPiece === chess_piece.black_pawn || playedPiece === chess_piece.white_pawn) {
                if (arrivalRowNumber - startRowNumber === 2) {
                    nextEnPassantTarget = startSquare[0] + '3';
                }
                if (startRowNumber - arrivalRowNumber === 2) {
                    nextEnPassantTarget = startSquare[0] + '6';
                }
            }
            return nextEnPassantTarget;
        };

        the_position.getNewFullmoveNumber = function () {
            var nextFullmoveNumber = (the_position.getActiveColor() === chess_piece.black)
                ? the_position.getFullmoveNumber() + 1
                : the_position.getFullmoveNumber();
            return nextFullmoveNumber;
        };

        the_position.getNewHalfmoveClock = function (move) {
            var arrivalSquare = move.substr(3, 2);
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var playedPiece = '';
            var nextHalfmoveClock = 0;
            var startSquare = move.substr(0, 2);
            var takenPiece = occupiedSquares[arrivalSquare];
            if (!regex_move.test(move)) {
                return;
            }
            playedPiece = occupiedSquares[startSquare];
            if (playedPiece === chess_piece.black_pawn || playedPiece === chess_piece.white_pawn || takenPiece !== undefined) {
                nextHalfmoveClock = 0;
            } else {
                nextHalfmoveClock = the_position.getHalfmoveClock() + 1;
            }
            return nextHalfmoveClock;
        };

        the_position.getNewPosition = function (move, promotion) {

            // Return the new Position object after a move has been played.
            // The move parameter must be on the form [a-h][1-8]-[a-h][1-8].
            // The data of FEN position are updated here.
            // The played move is assumed to be legal.

            var arrivalSquare = move.substr(3, 2);
            var enPassantCapture = '';
            var enPassantSquare = the_position.getEnPassantTarget();
            var newActiveColor = the_position.getNewActiveColor();
            var newAllowedCastles = the_position.getNewAllowedCastles(move);
            var newEnPassant = the_position.getNewEnPassant(move);
            var newFEN = '';
            var newFullmove = the_position.getNewFullmoveNumber();
            var newHalfmove = the_position.getNewHalfmoveClock(move);
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var playedPiece = '';
            var positionString = '';
            var rookArrival = '';
            var rookStart = '';
            var startSquare = move.substr(0, 2);
            if (!regex_move.test(move)) {
                return;
            }
            playedPiece = occupiedSquares[startSquare];
            if (playedPiece.toLowerCase() === chess_piece.black_king && regex_castle.test(move)) {
                rookStart = (arrivalSquare[0] === columns[2])
                    ? columns[0] + arrivalSquare[1]
                    : columns[7] + arrivalSquare[1];
                rookArrival = (arrivalSquare[0] === columns[2])
                    ? columns[3] + arrivalSquare[1]
                    : columns[5] + arrivalSquare[1];
                delete occupiedSquares[rookStart];
                if (startSquare === 'e1') {
                    occupiedSquares[rookArrival] = chess_piece.white_rook;
                } else {
                    occupiedSquares[rookArrival] = chess_piece.black_rook;
                }
            } else if (playedPiece.toLowerCase() === chess_piece.black_pawn) {
                if (arrivalSquare === enPassantSquare && regex_en_passant.test(move)) {
                    enPassantCapture = enPassantSquare[0] + startSquare[1];
                    delete occupiedSquares[enPassantCapture];
                }
                if (regex_promotion.test(move)) {
                    promotion = promotion || chess_piece.black_queen;
                    if (arrivalSquare[1] === '1') {
                        playedPiece = promotion.toLowerCase();
                    }
                    if (arrivalSquare[1] === '8') {
                        playedPiece = promotion.toUpperCase();
                    }
                }
            }
            delete occupiedSquares[startSquare];
            occupiedSquares[arrivalSquare] = playedPiece;
            positionString = Position.objectToFEN(occupiedSquares);
            newFEN = positionString + ' '
            + newActiveColor + ' '
            + newAllowedCastles + ' '
            + newEnPassant + ' '
            + newHalfmove + ' '
            + newFullmove;
            return new Position(newFEN);
        };

        the_position.getPiecesPlaces = function (color) {

            // Return an array of the names of the squares where are placed
            // the pieces of a specific color.

            var placements = [];
            var squares = Position.fenToObject(the_position.fen);
            var squaresArray = Object.keys(squares);
            squaresArray.forEach(function (square) {
                var piece = squares[square];
                if ((color === chess_piece.white
                    && piece === piece.toUpperCase())
                    || (color === chess_piece.black
                        && piece === piece.toLowerCase())) {
                    placements.push(square);
                }
            });
            return placements;
        };

        the_position.getTargets = function (start, getOffensiveTargets) {

            // Return the target a specific piece can reach.
            // A target is a square that a piece controls or can move on.
            // The getOffensiveTargets parameter allows to filter king moves
            // and pawn non-attacking moves.

            var color = '';
            var piece = '';
            var squares = Position.fenToObject(the_position.fen);
            var targets = [];
            if (!squares.hasOwnProperty(start)) {
                return targets;
            }
            piece = squares[start];
            color = (piece.toLowerCase() === piece)
                ? chess_piece.black
                : chess_piece.white;
            switch (piece) {
                case chess_piece.black_bishop:
                case chess_piece.white_bishop:
                    targets = the_position.getTargets_bishop(start, color);
                    break;
                case chess_piece.black_king:
                case chess_piece.white_king:
                    if (!getOffensiveTargets) {
                        targets = the_position.getTargets_king_special(start, color);
                    }
                    break;
                case chess_piece.black_knight:
                case chess_piece.white_knight:
                    targets = the_position.getTargets_knight(start, color);
                    break;
                case chess_piece.black_pawn:
                case chess_piece.white_pawn:
                    targets = the_position.getTargets_pawn(start, color, getOffensiveTargets);
                    break;
                case chess_piece.black_queen:
                case chess_piece.white_queen:
                    targets = the_position.getTargets_queen(start, color);
                    break;
                case chess_piece.black_rook:
                case chess_piece.white_rook:
                    targets = the_position.getTargets_rook(start, color);
                    break;
            }
            return targets;
        };

        the_position.getTargets_bishop = function (start, color) {

            // Return an array of squares a bishop
            // on a specific square can reach.

            var alliesPlaces = the_position.getPiecesPlaces(color);
            var colNumber = 1 + columns.indexOf(start[0]);
            var ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            var ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            var rowNumber = Number(start[1]);
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            testColNumber = colNumber + 1;
            testRowNumber = rowNumber + 1;
            while (testColNumber < 9 && testRowNumber < 9) {
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                testColNumber += 1;
                testRowNumber += 1;
            }
            testColNumber = colNumber - 1;
            testRowNumber = rowNumber - 1;
            while (testColNumber > 0 && testRowNumber > 0) {
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                testColNumber -= 1;
                testRowNumber -= 1;
            }
            testColNumber = colNumber + 1;
            testRowNumber = rowNumber - 1;
            while (testColNumber < 9 && testRowNumber > 0) {
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                testColNumber += 1;
                testRowNumber -= 1;
            }
            testColNumber = colNumber - 1;
            testRowNumber = rowNumber + 1;
            while (testColNumber > 0 && testRowNumber < 9) {
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                testColNumber -= 1;
                testRowNumber += 1;
            }
            return targets;
        };

        the_position.getTargets_king = function (start, color) {

            // Return an array of squares a king on a specific square can reach.
            // Only for normal moves.

            var alliesPlaces = the_position.getPiecesPlaces(color);
            var colMoves = [-1, 0, 1];
            var colNumber = 1 + columns.indexOf(start[0]);
            var rowMoves = [-1, 0, 1];
            var rowNumber = Number(start[1]);
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            colMoves.forEach(function (colValue) {
                rowMoves.forEach(function (rowValue) {
                    if (colValue !== 0 || rowValue !== 0) {
                        testColNumber = colNumber + colValue;
                        testRowNumber = rowNumber + rowValue;
                        if (testColNumber > 0 && testColNumber < 9 && testRowNumber > 0 && testRowNumber < 9) {
                            testSquare = columns[testColNumber - 1] + testRowNumber;
                            if (alliesPlaces.indexOf(testSquare) === -1) {
                                targets.push(testSquare);
                            }
                        }
                    }
                });
            });
            return targets;
        };

        the_position.getTargets_king_special = function (start, color) {

            // Return an array of squares a king on a specific square can reach.
            // Only for : castles,  filter ennemy king opposition.

            var allowedCastles = the_position.getAllowedCastles();
            var ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            var ennemyKingSquare = the_position.getKingSquare(ennemiesColor);
            var ennemyKingTargets = the_position.getTargets_king(ennemyKingSquare, ennemiesColor);
            var kingSideCastle = ['f', 'g'];
            var normalTargets = the_position.getTargets_king(start, color);
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var queenSideCastle = ['b', 'c', 'd'];
            var targets = [];
            var testSquare = '';
            targets = normalTargets.filter(function (target) {
                return (ennemyKingTargets.indexOf(target) === -1);
            });
            if (start === 'e1' && !the_position.isControlledBy('e1', chess_piece.black)) {
                if (allowedCastles.indexOf(chess_piece.white_queen) !== -1 && !the_position.isControlledBy('d1', chess_piece.black)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + '1';
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push('c1');
                    }
                }
                if (allowedCastles.indexOf(chess_piece.white_king) !== -1 && !the_position.isControlledBy('f1', chess_piece.black)) {
                    if (kingSideCastle.every(function (column) {
                        testSquare = column + '1';
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push('g1');
                    }
                }
            } else if (start === 'e8' && !the_position.isControlledBy('e8', chess_piece.white)) {
                if (allowedCastles.indexOf(chess_piece.black_queen) !== -1 && !the_position.isControlledBy('d8', chess_piece.white)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + '8';
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push('c8');
                    }
                }
                if (allowedCastles.indexOf(chess_piece.black_king) !== -1 && !the_position.isControlledBy('f8', chess_piece.white)) {
                    if (kingSideCastle.every(function (column) {
                        testSquare = column + '8';
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push('g8');
                    }
                }
            }
            return targets;
        };

        the_position.getTargets_knight = function (start, color) {

            // Return an array of squares a knight
            // on a specific square can reach.

            var alliesPlaces = the_position.getPiecesPlaces(color);
            var colMoves = [-2, -1, 1, 2];
            var colNumber = 1 + columns.indexOf(start[0]);
            var rowMoves = [-2, -1, 1, 2];
            var rowNumber = Number(start[1]);
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            colMoves.forEach(function (colValue) {
                rowMoves.forEach(function (rowValue) {
                    if (Math.abs(colValue) !== Math.abs(rowValue)) {
                        testColNumber = colNumber + colValue;
                        testRowNumber = rowNumber + rowValue;
                        if (testColNumber > 0 && testColNumber < 9 && testRowNumber > 0 && testRowNumber < 9) {
                            testSquare = columns[testColNumber - 1] + testRowNumber;
                            if (alliesPlaces.indexOf(testSquare) === -1) {
                                targets.push(testSquare);
                            }
                        }
                    }
                });
            });
            return targets;
        };

        the_position.getTargets_pawn = function (start, color, getOffensiveTargets) {

            // Return an array of squares a pawn on a specific square can reach.
            // Pawns can move, take (en passant), promote.
            // Set getOffensiveTargets to true to check only captures.

            var alliesPlaces = the_position.getPiecesPlaces(color);
            var colDirections = [-1, 1];
            var colNumber = 1 + columns.indexOf(start[0]);
            var direction = (color === chess_piece.black)
                ? -1
                : 1;
            var ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            var ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            var enPassantSquare = the_position.getEnPassantTarget();
            var rowNumber = Number(start[1]);
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            testRowNumber = rowNumber + direction;
            colDirections.forEach(function (colDirection) {
                testColNumber = colNumber + colDirection;
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (ennemiesPlaces.indexOf(testSquare) !== -1 || enPassantSquare === testSquare) {
                    targets.push(testSquare);
                } else if (getOffensiveTargets) {
                    targets.push(testSquare);
                }
            });
            if (!getOffensiveTargets) {
                testColNumber = colNumber;
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) === -1 && ennemiesPlaces.indexOf(testSquare) === -1) {
                    targets.push(testSquare);
                    if ((rowNumber === 2 && direction === 1) || (rowNumber === 7 && direction === -1)) {
                        testRowNumber = rowNumber + 2 * direction;
                        testSquare = columns[testColNumber - 1] + testRowNumber;
                        if (alliesPlaces.indexOf(testSquare) === -1 && ennemiesPlaces.indexOf(testSquare) === -1) {
                            targets.push(testSquare);
                        }
                    }
                }
            }
            return targets;
        };

        the_position.getTargets_queen = function (start, color) {

            // Return an array of squares a queen
            // on a specific square can reach.

            return the_position.getTargets_bishop(start, color).concat(the_position.getTargets_rook(start, color));
        };

        the_position.getTargets_rook = function (start, color) {

            // Return an array of squares a rook on a specific square can reach.

            var alliesPlaces = the_position.getPiecesPlaces(color);
            var colNumber = 1 + columns.indexOf(start[0]);
            var ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            var ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            var rowNumber = Number(start[1]);
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            testColNumber = colNumber + 1;
            testRowNumber = rowNumber;
            while (testColNumber < 9) {
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                testColNumber += 1;
            }
            testColNumber = colNumber - 1;
            while (testColNumber > 0) {
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                testColNumber -= 1;
            }
            testColNumber = colNumber;
            testRowNumber = rowNumber + 1;
            while (testRowNumber < 9) {
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                testRowNumber += 1;
            }
            testRowNumber = rowNumber - 1;
            while (testRowNumber > 0) {
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) !== -1) {
                    break;
                }
                testRowNumber -= 1;
            }
            return targets;
        };

        the_position.isControlledBy = function (square, color) {

            // Check if the desired square is controlled
            // by a specified color.

            var ennemies = [];
            ennemies = the_position.getPiecesPlaces(color);
            return ennemies.some(function (ennemy) {
                var targets = the_position.getTargets(ennemy, true);
                return (targets.indexOf(square) !== -1);
            });
        };

        the_position.isInCheck = function (color) {

            // Check if the desired king is in check.

            var ennemiesColor = (color === chess_piece.white)
                ? chess_piece.black
                : chess_piece.white;
            var kingSquare = the_position.getKingSquare(color);
            return the_position.isControlledBy(kingSquare, ennemiesColor);
        };

        return the_position;
    }

    Position.fenToObject = function (fen) {

        // Convert a FEN string to an object.

        var colNumber = 1;
        var name = '';
        var object = {};
        var regexNumber = /[1-8]/;
        var regexPiece = /[bknpqr]/i;
        var rowNumber = 8;
        var rows = fen.replace(/\s.*/, '');
        var rowsArray = rows.split('/');
        rowsArray.forEach(function (row, index) {
            colNumber = 1;
            rowNumber = 8 - index;
            row.split('').forEach(function (char) {
                if (regexPiece.test(char)) {
                    name = columns[colNumber - 1] + rowNumber;
                    object[name] = char;
                    colNumber += 1;
                } else if (regexNumber.test(char)) {
                    colNumber += Number(char);
                } else {
                    throw new Error(error.fen);
                }
            });
        });
        return object;
    };

    Position.isValidFEN = function (fen, onlyRows) {

        // FEN string validator.

        var rows = fen.replace(/\s.*/, '').split('/');
        onlyRows = onlyRows || false;
        if (!onlyRows && !regex_fen.test(fen)) {
            return false;
        }
        return rows.every(function (row) {
            return regex_fen_row.test(row);
        });
    };

    Position.objectToFEN = function (position) {

        // Convert a position to a FEN string.

        var colNumber = 1;
        var counter = 0;
        var fenPosition = '';
        var rowNumber = 8;
        var square = '';
        while (rowNumber > 0) {
            colNumber = 1;
            counter = 0;
            while (colNumber < 9) {
                square = columns[colNumber - 1] + rowNumber;
                if (position.hasOwnProperty(square)) {
                    if (counter > 0) {
                        fenPosition += counter;
                        counter = 0;
                    }
                    fenPosition += position[square];
                } else {
                    counter += 1;
                }
                if (colNumber === 8) {
                    if (counter > 0) {
                        fenPosition += counter;
                    }
                    if (rowNumber > 1) {
                        fenPosition += '/';
                    }
                }
                colNumber += 1;
            }
            rowNumber -= 1;
        }
        return fenPosition;
    };

    // -------------------------------------------------------------------------

    function Piece(name) {

        // The Piece class constructs an HTML DIV element.
        // The name property is a 2 chars string ((b|w)[bknqr])
        // to identify the chess piece.
        // The chess image is set with css backgroundImage.

        var div = document.createElement('DIV');
        var the_piece;
        var url = images_path + name + png_extension;
        div.style.backgroundImage = 'url("' + url + '")';
        div.setAttribute('draggable', 'true');

        the_piece = {
            div: div,
            name: name,
            square: null
        };

        the_piece.dragEndHandler = function (e) {
            var activeSquare = the_piece.square.name;
            if (the_piece.square.board.isDragging) {
                the_piece.square.board.isDragging = false;
                the_piece.square.board.draggedSquare = null;
                the_piece.square.highlight();
                if (typeof the_piece.square.board.onPieceDragEnd === 'function') {
                    the_piece.square.board.onPieceDragEnd(activeSquare, e);
                }
            }
        };

        the_piece.dragStartHandler = function (e) {
            var activeSquare = the_piece.square.name;
            if (the_piece.square.board.draggablePieces) {
                if (the_piece.square.board.clickedSquare !== null) {

                    the_piece.square.board.clickedSquare = null;
                }
                e.dataTransfer.effectAllowed = 'move';
                the_piece.square.board.isDragging = true;
                the_piece.square.board.draggedSquare = activeSquare;
                the_piece.square.highlight();
                if (typeof the_piece.square.board.onPieceDragStart === 'function') {
                    the_piece.square.board.onPieceDragStart(activeSquare);
                }
            }
        };

        the_piece.initEventListeners = function () {
            div.addEventListener('dragstart', the_piece.dragStartHandler);
            div.addEventListener('dragend', the_piece.dragEndHandler);
        };

        the_piece.put = function (square) {

            // Put the piece on a square.

            if (!square.isEmpty()) {
                square.piece.remove();
            }
            requestAnimationFrame(function () {
                square.div.appendChild(the_piece.div);
                square.piece = the_piece;
                the_piece.square = square;
            });
        };

        the_piece.remove = function () {

            // Remove the piece from the square.

            requestAnimationFrame(function () {
                if (the_piece.square !== null) {
                    the_piece.square.div.removeChild(the_piece.div);
                    the_piece.square.piece = null;
                    the_piece.square = null;
                }
            });
        };

        return the_piece;
    }

    // -------------------------------------------------------------------------

    function Square(name) {

        // The Square class constructs a HTML DIV element
        // named with its coordinate.

        var the_square = {
            board: null,
            canvas: null,
            div: null,
            hasCircle: false,
            isHighlighted: false,
            isMarked: false,
            isSelected: false,
            name: name,
            piece: null
        };

        the_square.clickHandler = function () {
            var activeSquare = the_square.board.clickedSquare;
            var arrival = '';
            var start = '';
            if (the_square.board.clickablePieces) {
                if (!the_square.isEmpty() && activeSquare === null) {
                    start = the_square.name;
                    the_square.select();
                    the_square.board.clickedSquare = the_square.name;
                } else if (activeSquare !== null) {
                    start = activeSquare;
                    arrival = the_square.name;
                    the_square.board.squares[activeSquare].select();
                    the_square.board.clickedSquare = null;
                }
                if (typeof the_square.board.onSquareClick === 'function') {
                    the_square.board.onSquareClick(start, arrival);
                }
            }
        };

        the_square.dragEnterHandler = function (e) {
            if (the_square.board.isDragging) {
                e.preventDefault();
                the_square.select();
            }
        };

        the_square.dragLeaveHandler = function () {
            if (the_square.board.isDragging) {
                the_square.select();
            }
        };

        the_square.dragOverHandler = function (e) {
            if (the_square.board.isDragging) {
                e.preventDefault();
            }
        };

        the_square.drawFilledCircle = function (x, y, radius, cssColor) {
            var context = the_square.canvas.getContext('2d');
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fillStyle = cssColor;
            context.fill();
        };

        the_square.dropHandler = function (e) {
            var activeSquare = the_square.board.draggedSquare;
            if (the_square.board.isDragging) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                the_square.select();
                if (typeof the_square.board.onSquareDrop === 'function') {
                    the_square.board.onSquareDrop(activeSquare, the_square.name);
                }
            }
        };

        the_square.getClassName = function () {

            // Return the css class name of the square.

            var initialClass = css.square + ' ';
            initialClass += (Square.isWhite(the_square.name))
                ? css.white_square
                : css.black_square;
            if (the_square.isHighlighted) {
                initialClass += ' ' + css.highlighted_square;
            }
            if (the_square.isMarked) {
                initialClass += ' ' + css.marked_square;
            }
            if (the_square.isSelected) {
                initialClass += ' ' + css.selected_square;
            }
            return initialClass;
        };

        the_square.highlight = function () {

            // Highlight the square.
            // Cancel if already highlighted.

            var className = '';
            the_square.isHighlighted = !the_square.isHighlighted;
            className = the_square.getClassName();
            requestAnimationFrame(function () {
                the_square.div.className = className;
            });
        };

        the_square.isEmpty = function () {

            // Check whether the square is empty.

            return (the_square.piece === null);
        };

        the_square.mark = function () {

            // Mark the square.
            // Cancel if already marked.

            var className = '';
            the_square.isMarked = !the_square.isMarked;
            className = the_square.getClassName();
            requestAnimationFrame(function () {
                the_square.div.className = className;
            });
        };

        the_square.select = function () {

            // Select the square.
            // Cancel if already selected.

            var className = '';
            the_square.isSelected = !the_square.isSelected;
            className = the_square.getClassName();
            requestAnimationFrame(function () {
                the_square.div.className = className;
            });
        };

        return the_square;
    }

    Square.isWhite = function (name) {

        // Check whether the square is white or not.

        var colNumber = columns.indexOf(name[0]) + 1;
        var rowNumber = Number(name[1]);
        if (rowNumber % 2 === 0) {
            return (colNumber % 2 === 1);
        } else {
            return (colNumber % 2 === 0);
        }
    };

    // -------------------------------------------------------------------------

    function Chessboard(containerId, config) {

        // The Chessboard class constructs an HTML chessboard.

        var the_board = {
            circleColor: config.circleColor,
            clickablePieces: config.clickable,
            clickedSquare: null,
            container: document.getElementById(containerId),
            draggablePieces: config.draggable,
            draggedSquare: null,
            hasBorder: config.hasBorder,
            isDragging: false,
            isFlipped: config.flipped,
            onPieceDragEnd: config.onPieceDragEnd,
            onPieceDragStart: config.onPieceDragStart,
            onPromotionChose: config.onPromotionChose,
            onSquareClick: config.onSquareClick,
            onSquareDrop: config.onSquareDrop,
            pendingMove: null,
            promotionDiv: document.createElement('DIV'),
            squares: {},
            width: config.width
        };

        the_board.clickPromotionHandler = function (e) {
            var choice = e.target.name;
            if (typeof the_board.onPromotionChose === 'function') {
                the_board.onPromotionChose(choice);
            }
            the_board.pendingMove = null;
            the_board.clickablePieces = config.clickable;
            the_board.draggablePieces = config.draggable;
            requestAnimationFrame(function () {
                the_board.promotionDiv.style.display = 'none';
            });
        };

        the_board.createSquares = function () {

            // Create the squares property.

            var canvas;
            var canvasWidth = the_board.width / 8 + 'px';
            var colNumber = 1;
            var column = '';
            var cssClass = '';
            var div;
            var isWhiteSquare = false;
            var name = '';
            var radius = the_board.width / 48;
            var rowNumber = 1;
            var square = {};
            var squares = {};
            var xy = Math.floor(the_board.width / 16);
            while (rowNumber < 9) {
                colNumber = 1;
                while (colNumber < 9) {
                    column = columns[colNumber - 1];
                    name = column + rowNumber;
                    isWhiteSquare = Square.isWhite(name);
                    canvas = document.createElement('CANVAS');
                    canvas.setAttribute('height', canvasWidth);
                    canvas.setAttribute('width', canvasWidth);
                    div = document.createElement('DIV');
                    cssClass = (isWhiteSquare)
                        ? css.square + ' ' + css.white_square
                        : css.square + ' ' + css.black_square;
                    div.className = cssClass;
                    square = new Square(name);
                    square.canvas = canvas;
                    square.drawFilledCircle(xy, xy, radius, the_board.circleColor);
                    square.board = the_board;
                    square.div = div;
                    div.addEventListener('click', square.clickHandler);
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
            the_board.promotionDiv.className = css.promotion_div;
            squaresDiv = document.createElement('DIV');
            squaresDiv.style.width = the_board.width + 'px';
            squaresDiv.style.height = the_board.width + 'px';
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
            requestAnimationFrame(function () {
                the_board.container.appendChild(squaresDiv);
                squaresDiv.appendChild(the_board.promotionDiv);
            });
            if (the_board.hasBorder) {
                bottomBorder = document.createElement('DIV');
                bottomBorder.className = css.bottom_border;
                bottomBorder.style.width = the_board.width + 'px';
                colNumber = 1;
                while (colNumber < 9) {
                    borderFragment = document.createElement('DIV');
                    index = (the_board.isFlipped)
                        ? 8 - colNumber
                        : colNumber - 1;
                    borderFragment.innerHTML = columns[index].toUpperCase();
                    bottomBorder.appendChild(borderFragment);
                    colNumber += 1;
                }
                rightBorder = document.createElement('DIV');
                rightBorder.className = css.right_border;
                rightBorder.style.height = the_board.width + 'px';
                rowNumber = 1;
                while (rowNumber < 9) {
                    borderFragment = document.createElement('DIV');
                    borderFragment.style.lineHeight = (the_board.width / 8) + 'px';
                    index = (the_board.isFlipped)
                        ? rowNumber
                        : 9 - rowNumber;
                    borderFragment.innerHTML = index;
                    rightBorder.appendChild(borderFragment);
                    rowNumber += 1;
                }
                requestAnimationFrame(function () {
                    the_board.container.appendChild(rightBorder);
                    the_board.container.appendChild(bottomBorder);
                });
            }
        };

        the_board.drawCircles = function (squares) {

            // Draw circles for an array of squares.

            squares.forEach(function (name) {
                var square = the_board.squares[name];
                requestAnimationFrame(function () {
                    if (square.hasCircle) {
                        square.div.removeChild(square.canvas);
                    } else {
                        square.div.appendChild(square.canvas);
                    }
                    square.hasCircle = !square.hasCircle;
                });
            });
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

        the_board.getPositionObject = function () {

            // Return a position object of the pieces places.

            var occupiedSquares = {};
            var squares = Object.keys(the_board.squares);
            squares.forEach(function (key) {
                var pieceChar = '';
                var pieceName = '';
                var square = the_board.squares[key];
                if (!square.isEmpty()) {
                    pieceName = square.piece.name;
                    pieceChar = (pieceName[0] === chess_piece.white)
                        ? pieceName[1].toUpperCase()
                        : pieceName[1].toLowerCase();
                    occupiedSquares[key] = pieceChar;
                }
            });
            return occupiedSquares;
        };

        the_board.highlightSquares = function (squares) {

            // Highlight an array of squares.

            squares.forEach(function (square) {
                the_board.squares[square].highlight();
            });
        };

        the_board.loadFEN = function (fen) {

            // Load a position from a FEN string.

            var squares = {};
            fen = fen || default_fen;
            if (!Position.isValidFEN(fen, true)) {
                throw new SyntaxError(error.fen);
            }
            the_board.empty();
            squares = Position.fenToObject(fen);
            Object.keys(squares).forEach(function (squareName) {
                var square = the_board.squares[squareName];
                var char = squares[squareName];
                var pieceName = (char.toLowerCase() === char)
                    ? chess_piece.black + char
                    : chess_piece.white + char.toLowerCase();
                var piece = new Piece(pieceName);
                piece.initEventListeners();
                piece.put(square);
            });
        };

        the_board.markSquares = function (squares) {

            // Mark an array of squares.

            squares.forEach(function (square) {
                the_board.squares[square].mark();
            });
        };

        the_board.play = function (move, promotion) {

            // Play the desired move on the board. Manage special moves.

            var arrival = move.substr(3, 2);
            var arrivalSquare = the_board.squares[arrival];
            var emptyArrival = arrivalSquare.isEmpty();
            var enPassant = '';
            var newPiece = {};
            var newPieceColor = '';
            var playedPiece = {};
            var rook = {};
            var rookArrival = '';
            var rookStart = '';
            var start = move.substr(0, 2);
            var startSquare = the_board.squares[start];
            if (!regex_move.test(move)) {
                return;
            }
            if (!startSquare.isEmpty()) {
                playedPiece = startSquare.piece;
                playedPiece.remove();
                playedPiece.put(arrivalSquare);
                if (regex_castle.test(move) && playedPiece.name[1] === chess_piece.black_king) {
                    switch (arrival[0]) {
                        case columns[2]:
                            rookStart = columns[0];
                            rookArrival = columns[3];
                            break;
                        case columns[6]:
                            rookStart = columns[7];
                            rookArrival = columns[5];
                            break;
                    }
                    rookArrival += arrival[1];
                    rookStart += arrival[1];
                    if (!the_board.squares[rookStart].isEmpty()) {
                        rook = the_board.squares[rookStart].piece;
                        rook.remove();
                        rook.put(the_board.squares[rookArrival]);
                    }
                } else if (playedPiece.name[1] === chess_piece.black_pawn) {
                    if (regex_en_passant.test(move) && emptyArrival && start[0] !== arrival[0]) {
                        enPassant = arrival[0];
                        switch (arrival[1]) {
                            case '3':
                                enPassant += '4';
                                break;
                            case '6':
                                enPassant += '5';
                                break;
                        }
                        if (!the_board.squares[enPassant].isEmpty()) {
                            the_board.squares[enPassant].piece.remove();
                        }
                    } else if (regex_promotion.test(move)) {
                        promotion = promotion || chess_piece.black_queen;
                        newPieceColor = (arrival[1] === '1')
                            ? chess_piece.black
                            : chess_piece.white;
                        newPiece = new Piece(newPieceColor + promotion.toLowerCase());
                        newPiece.initEventListeners();
                        playedPiece.remove();
                        newPiece.put(arrivalSquare);
                    }
                }
            }
        };

        the_board.showPromotionDiv = function (color) {

            // Display the promotion div to complete a move.

            var buttons = the_board.promotionDiv.childNodes;
            var pieces = [chess_piece.black_queen, chess_piece.black_rook, chess_piece.black_bishop, chess_piece.black_knight];
            while (buttons.length > 0) {
                the_board.promotionDiv.removeChild(the_board.promotionDiv.lastChild);
            }
            pieces.forEach(function (piece) {
                var promotionButton;
                var url = images_path + color + piece + png_extension;
                promotionButton = document.createElement('INPUT');
                promotionButton.setAttribute('type', 'button');
                promotionButton.setAttribute('name', piece);
                promotionButton.style.backgroundImage = 'url("' + url + '")';
                promotionButton.addEventListener('click', the_board.clickPromotionHandler);
                the_board.promotionDiv.appendChild(promotionButton);
            });
            the_board.clickablePieces = false;
            the_board.draggablePieces = false;
            requestAnimationFrame(function () {
                the_board.promotionDiv.style.display = 'block';
            });
        };

        return the_board;
    }

    // -------------------------------------------------------------------------

    function Chessgame(pgn) {

        // The Chessgame class constructs a full chess game.
        // We assume a chessgame is mainly an ordered collection
        // of FEN positions.
        // A FEN position is a chess position plus some data :
        // active color, castling possibilities, en passant square,
        // halfmove clock and fullmove number.

        var the_game = {
            fenPositions: [default_fen],
            pgn: pgn
        };

        the_game.getLegalMoves = function () {

            // Return an array of all legal moves.

            var activeColor = '';
            var legalMoves = [];
            var pieces = [];
            var position = the_game.getLastPosition();
            activeColor = position.getActiveColor();
            pieces = position.getPiecesPlaces(activeColor);
            pieces.forEach(function (square) {
                var legalSquares = the_game.getLegalSquares(square);
                legalSquares.forEach(function (arrival) {
                    var move = square + '-' + arrival;
                    legalMoves.push(move);
                });
            });
            return legalMoves;
        };

        the_game.getLegalSquares = function (start) {

            // Return an array of legal arrival squares.

            var legalMoves = [];
            var position = the_game.getLastPosition();
            var targets = position.getTargets(start, false);
            targets.forEach(function (target) {
                var move = start + '-' + target;
                if (position.checkMoveLegality(move)) {
                    legalMoves.push(target);
                }
            });
            return legalMoves;
        };

        the_game.getMoveNotation = function () {

            // Return the notation for the last move played.

            var lastFEN = '';
            var lastIndex = the_game.fenPositions.length - 1;
            var lastSquares = {};
            var previousFEN = '';
            var previousIndex = lastIndex - 1;
            var previousSquares = {};
            if (the_game.fenPositions.length > 1) {
                lastFEN = the_game.fenPositions[lastIndex];
                lastSquares = Position.fenToObject(lastFEN);
                previousFEN = the_game.fenPositions[previousIndex];
                previousSquares = Position.fenToObject(previousFEN);

                return '';
            }
        };

        the_game.getLastPosition = function () {

            // Return the last position object.

            var lastFEN = '';
            var lastIndex = the_game.fenPositions.length - 1;
            lastFEN = the_game.fenPositions[lastIndex];
            return new Position(lastFEN);
        };

        the_game.isInCheck = function () {

            // Check if the active player is in check.

            var activeColor = '';
            var position = the_game.getLastPosition();
            activeColor = position.getActiveColor();
            return position.isInCheck(activeColor);
        };

        the_game.isLegal = function (move) {

            // Check if a move is legal in the last position.

            var position = the_game.getLastPosition();
            if (!regex_move.test(move)) {
                return false;
            }
            return position.checkMoveLegality(move);
        };

        the_game.play = function (move, promotion) {

            // Play a move and store the new FEN in the Chessgame object
            // if it's legal. Then returns the new FEN.

            var lastPosition = the_game.getLastPosition();
            var nextPosition = {};
            if (!regex_move.test(move)) {
                return;
            }
            if (lastPosition.checkMoveLegality(move)) {
                nextPosition = lastPosition.getNewPosition(move, promotion);
                the_game.fenPositions.push(nextPosition.fen);
                return nextPosition.fen;
            } else {
                throw new Error(error.illegal_move);
            }
        };

        return the_game;
    }

    Chessgame.isValidPGN = function (pgn) {

        // PGN string validator.

        var regex_pgn = /([1-9][0-9]*\\.{1,3}\\s*)?(O-O-O|O-O|([BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|([a-h]x)?[a-h][1-8](\=[BNQR])?)(\\+|#)?/gm;
        return regex_pgn.test(pgn.trim());
    };

    // -------------------------------------------------------------------------

    // Load default configuration.

    abConfig = abConfig || {};
    Object.keys(default_config).forEach(function (key) {
        if (!abConfig.hasOwnProperty(key)) {
            abConfig[key] = default_config[key];
        }
    });

    // Create the objects board and game.
    // Set default behaviour.

    abBoard = new Chessboard(containerId, abConfig);
    abGame = new Chessgame();

    function showLegalSquares(start) {

        // Perform the first step of a move. Show legal squares.

        var legalSquares = abGame.getLegalSquares(start);
        abBoard.drawCircles(legalSquares);
    }

    function finishMove(start, arrival) {

        // Perform the second step of a move once the arrival square is defined.
        // Test the legality. Show promotion div. Remove legal squares.

        var color = '';
        var move = start + '-' + arrival;
        var occupiedSquares = {};
        var playedPiece = '';
        var position = abGame.getLastPosition();
        if (!regex_move.test(move)) {
            return;
        }
        showLegalSquares(start);
        if (abGame.isLegal(move)) {
            occupiedSquares = Position.fenToObject(position.fen);
            playedPiece = occupiedSquares[start];
            if (regex_promotion.test(move) && playedPiece.toLowerCase() === chess_piece.black_pawn) {
                abBoard.pendingMove = move;
                color = (arrival[1] === '8')
                    ? chess_piece.white
                    : chess_piece.black;
                abBoard.showPromotionDiv(color);
            } else {
                playMove(move);
            }
        }
    }

    function playMove(move, promotion) {
        abBoard.play(move, promotion);
        abGame.play(move, promotion);
    }

    abBoard.onPieceDragEnd = function (start, e) {
        if (e.dataTransfer.dropEffect === 'none') {
            showLegalSquares(start);
        }
    };

    abBoard.onPieceDragStart = function (start) {
        showLegalSquares(start);
    };

    abBoard.onPromotionChose = function (choice) {
        var move = abBoard.pendingMove;
        playMove(move, choice);
    };

    abBoard.onSquareClick = function (start, arrival) {
        if (arrival === '') {
            showLegalSquares(start);
        } else {
            finishMove(start, arrival);
        }
    };

    abBoard.onSquareDrop = function (start, arrival) {
        finishMove(start, arrival);
    };

    // Public api.

    return {
        DEFAULT_FEN: default_fen,
        draw: function () {

            // Draw the chessboard.

            abBoard.createSquares();
            abBoard.draw();
        },
        flip: function () {

            // Flip the board.

            abBoard.isFlipped = !abBoard.isFlipped;
            requestAnimationFrame(function () {
                while (abBoard.container.hasChildNodes()) {
                    abBoard.container.removeChild(abBoard.container.lastChild);
                }
            });
            abBoard.draw();
        },
        highlightSquares: function (array) {

            // Highlight an array of squares.

            abBoard.highlightSquares(array);
        },
        getActiveColor: function () {

            // Return the active color : b|w.

            var position = abGame.getLastPosition();
            return position.getActiveColor();
        },
        getFEN: function () {

            // Get the last FEN string.

            var lastIndex = abGame.fenPositions.length - 1;
            return abGame.fenPositions[lastIndex];
        },
        getLastMoveNotation: function () {

            // Return the PGN notation of the last played move.

            return;
        },
        getLegalSquares: function (start) {

            // Return an array of legal moves for the desired start square.

            return abGame.getLegalSquares(start);
        },
        isCheckmated: function () {

            // Check if the active player is checkmated.

            var activeColor = '';
            var legalMoves = abGame.getLegalMoves();
            var position = abGame.getLastPosition();
            activeColor = position.getActiveColor();
            return position.isInCheck(activeColor) && legalMoves.length === 0;
        },
        isInCheck: function () {

            // Check if the active player is in check.

            var activeColor = '';
            var position = abGame.getLastPosition();
            activeColor = position.getActiveColor();
            return position.isInCheck(activeColor);
        },
        isLegal: function (move) {

            // Check if a move is legal.

            return abGame.isLegal(move);
        },
        play: function (move) {

            // Play the desired move and return the resulting FEN string.

            return abGame.play(move);
        },
        setFEN: function (fen) {

            // Set the FEN string.

            abBoard.loadFEN(fen);
        }
    };
};
