// AbChess-0.1.js
// 2016-02-08
// Copyright (c) 2016 Nimzozo

// TODO :
// fix 'forced sync layout'
// show last move

/*global
    window
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
        showLastMove: true,
        showLegalMoves: true,
        width: 360
    };
    var default_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    var error = {
        illegal_move: 'Illegal move.',
        invalid_fen: 'Invalid FEN string.'
    };
    var images_path = '../images/wikipedia/';
    var png_extension = '.png';
    var regex_castle = /^e(1-c1|1-g1|8-c8|8-g8)$/;
    var regex_en_passant = /^([a-h]4-[a-h]3|[a-h]5-[a-h]6)$/;
    var regex_fen = /^([bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q|-)\s([a-h][36]|-)\s(0|[1-9]\d*)\s([1-9]\d*)$/;
    var regex_fen_row = /^([bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8)$/i;
    var regex_move = /^[a-h][1-8]-[a-h][1-8]$/;
    var regex_promotion = /^([a-h]2-[a-h]1|[a-h]7-[a-h]8)$/;
    var requestAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };

    // -------------------------------------------------------------------------

    function Position(fen) {

        // A chess Position is constructed with a FEN string.
        // It represents the pieces placement plus some extra data.

        var activeColor = '';
        var allowedCastles = '';
        var enPassantSquare = '';
        var fullmoveNumber = 0;
        var halfmoveClock = 0;
        var matches = [];
        var occupiedSquares = {};
        var the_position = {};
        if (!Position.isValidFEN(fen)) {
            throw new Error(error.invalid_fen);
        }
        matches = regex_fen.exec(fen);
        activeColor = matches[2];
        allowedCastles = matches[3];
        enPassantSquare = matches[4];
        fullmoveNumber = Number(matches[6]);
        halfmoveClock = Number(matches[5]);
        occupiedSquares = Position.fenToObject(fen);
        the_position = {
            activeColor: activeColor,
            allowedCastles: allowedCastles,
            enPassantSquare: enPassantSquare,
            fenString: fen,
            fullmoveNumber: fullmoveNumber,
            halfmoveClock: halfmoveClock,
            occupiedSquares: occupiedSquares
        };

        the_position.checkMoveLegality = function (move) {

            // Check whether a move is legal or not.
            // Check : active color, kings are not in check, moves are legal.

            var arrival = '';
            var pieceColor = '';
            var start = '';
            var targets = [];
            var testPosition = {};
            if (!regex_move.test(move)) {
                return false;
            }
            start = move.substr(0, 2);
            if (!occupiedSquares.hasOwnProperty(start)) {
                return false;
            }
            pieceColor = (occupiedSquares[start] === occupiedSquares[start].toLowerCase())
                ? chess_piece.black
                : chess_piece.white;
            if (activeColor !== pieceColor) {
                return false;
            }
            testPosition = the_position.getNewPosition(move);
            if (testPosition.isInCheck(activeColor)) {
                return false;
            }
            targets = the_position.getTargets(start, false);
            arrival = move.substr(3, 2);
            return targets.some(function (target) {
                return (target === arrival);
            });
        };

        the_position.getKingSquare = function (color) {

            // Return the square where the desired king is placed.

            var desiredKing = '';
            var square = '';
            desiredKing = (color === chess_piece.black)
                ? chess_piece.black_king
                : chess_piece.white_king;
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

        the_position.getLegalMoves = function () {

            // Return an array of all legal moves.

            var legalMoves = [];
            var pieces = [];
            pieces = the_position.getPiecesPlaces(activeColor);
            pieces.forEach(function (square) {
                var legalSquares = the_position.getLegalSquares(square);
                legalSquares.forEach(function (arrival) {
                    var move = square + '-' + arrival;
                    legalMoves.push(move);
                });
            });
            return legalMoves;
        };

        the_position.getLegalSquares = function (start) {

            // Return an array of legal arrival squares.

            var legalSquares = [];
            var targets = [];
            targets = the_position.getTargets(start, false);
            targets.forEach(function (target) {
                var move = start + '-' + target;
                if (the_position.checkMoveLegality(move)) {
                    legalSquares.push(target);
                }
            });
            return legalSquares;
        };

        the_position.getNewActiveColor = function () {
            var nextActiveColor = '';
            nextActiveColor = (the_position.activeColor === chess_piece.white)
                ? chess_piece.black
                : chess_piece.white;
            return nextActiveColor;
        };

        the_position.getNewAllowedCastles = function (move) {
            var arrivalSquare = '';
            var newAllowedCastles = '';
            var playedPiece = '';
            var startSquare = '';
            if (!regex_move.test(move)) {
                return;
            }
            if (allowedCastles === '-') {
                return allowedCastles;
            }
            newAllowedCastles = allowedCastles;
            startSquare = move.substr(0, 2);
            playedPiece = occupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            if (allowedCastles.search(/[kq]/) !== -1) {
                if (playedPiece === chess_piece.black_king) {
                    newAllowedCastles = allowedCastles.replace(/[kq]/g, '');
                }
                if (startSquare === 'a8' || arrivalSquare === 'a8') {
                    newAllowedCastles = allowedCastles.replace(/q/, '');
                }
                if (startSquare === 'h8' || arrivalSquare === 'h8') {
                    newAllowedCastles = allowedCastles.replace(/k/, '');
                }
            }
            if (allowedCastles.search(/[KQ]/) !== -1) {
                if (playedPiece === chess_piece.white_king) {
                    newAllowedCastles = allowedCastles.replace(/[KQ]/g, '');
                }
                if (startSquare === 'a1' || arrivalSquare === 'a1') {
                    newAllowedCastles = allowedCastles.replace(/Q/, '');
                }
                if (startSquare === 'h1' || arrivalSquare === 'h1') {
                    newAllowedCastles = allowedCastles.replace(/K/, '');
                }
            }
            if (newAllowedCastles === '') {
                newAllowedCastles = '-';
            }
            return newAllowedCastles;
        };

        the_position.getNewEnPassant = function (move) {
            var arrivalRowNumber = 0;
            var arrivalSquare = '';
            var nextEnPassantTarget = '-';
            var playedPiece = '';
            var startRowNumber = 0;
            var startSquare = '';
            if (!regex_move.test(move)) {
                return;
            }
            arrivalSquare = move.substr(3, 2);
            arrivalRowNumber = Number(arrivalSquare[1]);
            startSquare = move.substr(0, 2);
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
            var nextFullmoveNumber = 0;
            nextFullmoveNumber = (the_position.activeColor === chess_piece.black)
                ? fullmoveNumber + 1
                : fullmoveNumber;
            return nextFullmoveNumber;
        };

        the_position.getNewHalfmoveClock = function (move) {
            var arrivalSquare = '';
            var playedPiece = '';
            var nextHalfmoveClock = 0;
            var startSquare = '';
            var takenPiece = false;
            if (!regex_move.test(move)) {
                return;
            }
            startSquare = move.substr(0, 2);
            playedPiece = occupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            takenPiece = occupiedSquares.hasOwnProperty(arrivalSquare);
            if (playedPiece === chess_piece.black_pawn || playedPiece === chess_piece.white_pawn || takenPiece) {
                nextHalfmoveClock = 0;
            } else {
                nextHalfmoveClock = halfmoveClock + 1;
            }
            return nextHalfmoveClock;
        };

        the_position.getNewPosition = function (move, promotion) {

            // Return the new Position object after a move has been played.
            // The move parameter must be on the form [a-h][1-8]-[a-h][1-8].
            // The data of FEN position are updated here.
            // The played move is assumed to be legal.

            var arrivalSquare = '';
            var enPassantCapture = '';
            var newActiveColor = '';
            var newAllowedCastles = '';
            var newEnPassant = '';
            var newFEN = '';
            var newFullmove = 0;
            var newHalfmove = 0;
            var newOccupiedSquares = {};
            var playedPiece = '';
            var positionString = '';
            var rookArrival = '';
            var rookStart = '';
            var startSquare = '';
            if (!regex_move.test(move)) {
                return;
            }
            newOccupiedSquares = Position.fenToObject(the_position.fenString);
            startSquare = move.substr(0, 2);
            playedPiece = newOccupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            if (playedPiece.toLowerCase() === chess_piece.black_king && regex_castle.test(move)) {
                rookStart = (arrivalSquare[0] === columns[2])
                    ? columns[0] + arrivalSquare[1]
                    : columns[7] + arrivalSquare[1];
                rookArrival = (arrivalSquare[0] === columns[2])
                    ? columns[3] + arrivalSquare[1]
                    : columns[5] + arrivalSquare[1];
                delete newOccupiedSquares[rookStart];
                if (startSquare === 'e1') {
                    newOccupiedSquares[rookArrival] = chess_piece.white_rook;
                } else {
                    newOccupiedSquares[rookArrival] = chess_piece.black_rook;
                }
            } else if (playedPiece.toLowerCase() === chess_piece.black_pawn) {
                if (arrivalSquare === enPassantSquare && regex_en_passant.test(move)) {
                    enPassantCapture = enPassantSquare[0] + startSquare[1];
                    delete newOccupiedSquares[enPassantCapture];
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
            delete newOccupiedSquares[startSquare];
            newOccupiedSquares[arrivalSquare] = playedPiece;
            positionString = Position.objectToFEN(newOccupiedSquares);
            newActiveColor = the_position.getNewActiveColor();
            newAllowedCastles = the_position.getNewAllowedCastles(move);
            newEnPassant = the_position.getNewEnPassant(move);
            newHalfmove = the_position.getNewHalfmoveClock(move);
            newFullmove = the_position.getNewFullmoveNumber();
            newFEN = positionString + ' '
            + newActiveColor + ' '
            + newAllowedCastles + ' '
            + newEnPassant + ' '
            + newHalfmove + ' '
            + newFullmove;
            return new Position(newFEN);
        };

        the_position.getPGN = function (move, promotion, stringToAdd) {

            // Return the PGN notation for the desired move.

            var arrival = '';
            var isCapture = false;
            var isPromotion = false;
            var pgnMove = '';
            var playedPiece = '';
            var start = '';
            if (!regex_move.test(move)) {
                return;
            }
            pgnMove = (activeColor === chess_piece.white)
                ? fullmoveNumber + '. '
                : '';
            start = move.substr(0, 2);
            playedPiece = occupiedSquares[start];
            arrival = move.substr(3, 2);
            if (regex_castle.test(move)) {
                if (arrival[0] === columns[2]) {
                    pgnMove += 'O-O-O';
                } else {
                    pgnMove += 'O-O';
                }
            } else {
                isCapture = occupiedSquares.hasOwnProperty(arrival);
                switch (playedPiece.toLowerCase()) {
                    case chess_piece.black_bishop:
                    case chess_piece.black_king:
                    case chess_piece.black_knight:
                    case chess_piece.black_queen:
                    case chess_piece.black_rook:
                    pgnMove += playedPiece.toUpperCase();
                    break;
                    case chess_piece.black_pawn:
                    if (isCapture || arrival === enPassantSquare) {
                        pgnMove += start[0];
                        isCapture = true;
                    }
                    isPromotion = regex_promotion.test(move);
                    break;
                }
                if (isCapture) {
                    pgnMove += 'x';
                }
                pgnMove += arrival;
                if (isPromotion) {
                    pgnMove += '=' + promotion.toUpperCase();
                }
            }
            stringToAdd = stringToAdd || '';
            pgnMove += stringToAdd;
            return pgnMove;
        };

        the_position.getPiecesPlaces = function (color) {

            // Return an array of the names of the squares where are placed
            // the pieces of a specific color.

            var placements = [];
            Object.keys(occupiedSquares).forEach(function (square) {
                var piece = occupiedSquares[square];
                if ((color === chess_piece.white && piece === piece.toUpperCase())
                    || (color === chess_piece.black && piece === piece.toLowerCase())) {
                    placements.push(square);
                }
            });
            return placements;
        };

        the_position.getTargets = function (start, onlyOffensive) {

            // Return the target a specific piece can reach.
            // A target is a square that a piece controls or can move on.
            // The onlyOffensive parameter allows to filter king moves
            // and pawn non-attacking moves.

            var color = '';
            var piece = '';
            var targets = [];
            if (!occupiedSquares.hasOwnProperty(start)) {
                return targets;
            }
            piece = occupiedSquares[start];
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
                    if (!onlyOffensive) {
                        targets = the_position.getTargets_king_special(start, color);
                    }
                    break;
                case chess_piece.black_knight:
                case chess_piece.white_knight:
                    targets = the_position.getTargets_knight(start, color);
                    break;
                case chess_piece.black_pawn:
                case chess_piece.white_pawn:
                    targets = the_position.getTargets_pawn(start, color, onlyOffensive);
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

            var alliesPlaces = [];
            var colNumber = 0;
            var ennemiesColor = '';
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            colNumber = columns.indexOf(start[0]) + 1;
            testColNumber = colNumber + 1;
            rowNumber = Number(start[1]);
            testRowNumber = rowNumber + 1;
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
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

            var alliesPlaces = [];
            var colMoves = [-1, 0, 1];
            var colNumber = 0;
            var rowMoves = [-1, 0, 1];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            alliesPlaces = the_position.getPiecesPlaces(color);
            colNumber = columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
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

            var ennemiesColor = '';
            var ennemyKingSquare = '';
            var ennemyKingTargets = [];
            var kingSideCastle = ['f', 'g'];
            var normalTargets = [];
            var queenSideCastle = ['b', 'c', 'd'];
            var targets = [];
            var testSquare = '';
            normalTargets = the_position.getTargets_king(start, color);
            ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            ennemyKingSquare = the_position.getKingSquare(ennemiesColor);
            ennemyKingTargets = the_position.getTargets_king(ennemyKingSquare, ennemiesColor);
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

            var alliesPlaces = [];
            var colMoves = [-2, -1, 1, 2];
            var colNumber = 0;
            var rowMoves = [-2, -1, 1, 2];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            alliesPlaces = the_position.getPiecesPlaces(color);
            colNumber = columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
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

        the_position.getTargets_pawn = function (start, color, onlyOffensive) {

            // Return an array of squares a pawn on a specific square can reach.
            // Pawns can move, take (en passant), promote.
            // Set onlyOffensive to true to check only captures.

            var alliesPlaces = [];
            var colDirections = [-1, 1];
            var colNumber = 0;
            var direction = 0;
            var ennemiesColor = '';
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            colNumber = columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            direction = (color === chess_piece.black)
                ? -1
                : 1;
            testRowNumber = rowNumber + direction;
            ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            colDirections.forEach(function (colDirection) {
                testColNumber = colNumber + colDirection;
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (ennemiesPlaces.indexOf(testSquare) !== -1 || enPassantSquare === testSquare) {
                    targets.push(testSquare);
                } else if (onlyOffensive) {
                    targets.push(testSquare);
                }
            });
            if (!onlyOffensive) {
                testColNumber = colNumber;
                testSquare = columns[testColNumber - 1] + testRowNumber;
                alliesPlaces = the_position.getPiecesPlaces(color);
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

            var alliesPlaces = [];
            var colNumber = 0;
            var ennemiesColor = '';
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            colNumber = columns.indexOf(start[0]) + 1;
            testColNumber = colNumber + 1;
            rowNumber = Number(start[1]);
            testRowNumber = rowNumber;
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
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

            var ennemiesColor = '';
            var kingSquare = '';
            ennemiesColor = (color === chess_piece.white)
                ? chess_piece.black
                : chess_piece.white;
            kingSquare = the_position.getKingSquare(color);
            return the_position.isControlledBy(kingSquare, ennemiesColor);
        };

        return the_position;
    }

    Position.fenToObject = function (fen) {

        // Convert a FEN string to an object.

        var object = {};
        var regexNumber = /[1-8]/;
        var regexPiece = /[bknpqr]/i;
        var rows = '';
        var rowsArray = [];
        rows = fen.replace(/\s.*/, '');
        rowsArray = rows.split('/');
        rowsArray.forEach(function (row, index) {
            var colNumber = 1;
            var rowNumber = 8 - index;
            row.split('').forEach(function (char) {
                if (regexPiece.test(char)) {
                    var name = columns[colNumber - 1] + rowNumber;
                    object[name] = char;
                    colNumber += 1;
                } else if (regexNumber.test(char)) {
                    colNumber += Number(char);
                } else {
                    throw new Error(error.invalid_fen);
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

        var colNumber = 0;
        var counter = 0;
        var fenPosition = '';
        var rowNumber = 0;
        var square = '';
        rowNumber = 8;
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
        // The name property is a 2 chars string (b|w)[bknqr]
        // to identify the chess piece.
        // The chess image is set with css backgroundImage.

        var div;
        var the_piece;
        var url = '';
        div = document.createElement('DIV');
        url = images_path + name + png_extension;
        div.style.backgroundImage = 'url("' + url + '")';
        div.setAttribute('draggable', 'true');

        the_piece = {
            div: div,
            name: name,
            square: null
        };

        the_piece.dragEndHandler = function (e) {
            var activeSquare = the_piece.square.name;
            if (!the_piece.square.board.isDragging) {
                return;
            }
            the_piece.square.board.isDragging = false;
            if (typeof the_piece.square.board.onPieceDragEnd === 'function') {
                the_piece.square.board.onPieceDragEnd(activeSquare, e);
            }
        };

        the_piece.dragStartHandler = function (e) {
            var activeSquare = the_piece.square.name;
            if (!the_piece.square.board.draggablePieces) {
                return;
            }
            e.dataTransfer.effectAllowed = 'move';
            the_piece.square.board.isDragging = true;
            if (typeof the_piece.square.board.onPieceDragStart === 'function') {
                the_piece.square.board.onPieceDragStart(activeSquare);
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
            requestAF(function () {
                square.div.appendChild(the_piece.div);
                square.piece = the_piece;
                the_piece.square = square;
            });
        };

        the_piece.remove = function () {

            // Remove the piece from the square.

            requestAF(function () {
                if (the_piece.square === null) {
                    return;
                }
                the_piece.square.div.removeChild(the_piece.div);
                the_piece.square.piece = null;
                the_piece.square = null;
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
            if (!the_square.board.clickablePieces) {
                return;
            }
            if (typeof the_square.board.onSquareClick === 'function') {
                the_square.board.onSquareClick(the_square.name);
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
            if (!the_square.board.isDragging) {
                return;
            }
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            the_square.select();
            if (typeof the_square.board.onSquareDrop === 'function') {
                the_square.board.onSquareDrop(the_square.name);
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
            requestAF(function () {
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
            requestAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.select = function () {

            // Select the square.
            // Cancel if already selected.

            var className = '';
            the_square.isSelected = !the_square.isSelected;
            className = the_square.getClassName();
            requestAF(function () {
                the_square.div.className = className;
            });
        };

        return the_square;
    }

    Square.isWhite = function (name) {

        // Check whether the square is white or not.

        var colNumber = 0;
        var rowNumber = 0;
        colNumber = columns.indexOf(name[0]) + 1;
        rowNumber = Number(name[1]);
        return (rowNumber % 2 === 0)
            ? (colNumber % 2 === 1)
            : (colNumber % 2 === 0);
    };

    // -------------------------------------------------------------------------

    function Chessboard(containerId, config) {

        // The Chessboard class constructs an HTML chessboard.

        var the_board = {
            circleColor: config.circleColor,
            clickablePieces: config.clickable,
            container: document.getElementById(containerId),
            draggablePieces: config.draggable,
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
            selectedSquare: null,
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
            requestAF(function () {
                the_board.promotionDiv.style.display = 'none';
            });
        };

        the_board.createSquares = function () {

            // Create the squares property.

            var canvas;
            var canvasWidth = '';
            var colNumber = 0;
            var column = '';
            var cssClass = '';
            var div;
            var isWhiteSquare = false;
            var name = '';
            var radius = 0;
            var rowNumber = 0;
            var square = {};
            var squares = {};
            var xy = 0;
            canvasWidth = Math.floor(the_board.width / 8) + 'px';
            radius = Math.floor(the_board.width / 62);
            xy = Math.floor(the_board.width / 16);
            rowNumber = 1;
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
            requestAF(function () {
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
                    borderFragment.style.lineHeight = Math.floor(the_board.width / 8) + 'px';
                    index = (the_board.isFlipped)
                        ? rowNumber
                        : 9 - rowNumber;
                    borderFragment.innerHTML = index;
                    rightBorder.appendChild(borderFragment);
                    rowNumber += 1;
                }
                requestAF(function () {
                    the_board.container.appendChild(rightBorder);
                    the_board.container.appendChild(bottomBorder);
                });
            }
        };

        the_board.drawCircles = function (squares) {

            // Draw circles for an array of squares.

            squares.forEach(function (name) {
                var square = the_board.squares[name];
                requestAF(function () {
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
            Object.keys(the_board.squares).forEach(function (key) {
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
                throw new SyntaxError(error.invalid_fen);
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

            var arrival = '';
            var arrivalSquare = {};
            var emptyArrival = false;
            var enPassant = '';
            var newPiece = {};
            var newPieceColor = '';
            var playedPiece = {};
            var rook = {};
            var rookArrival = '';
            var rookStart = '';
            var start = '';
            var startSquare = {};
            if (!regex_move.test(move)) {
                return;
            }
            start = move.substr(0, 2);
            startSquare = the_board.squares[start];
            if (startSquare.isEmpty()) {
                return;
            }
            playedPiece = startSquare.piece;
            playedPiece.remove();
            arrival = move.substr(3, 2);
            arrivalSquare = the_board.squares[arrival];
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
                emptyArrival = arrivalSquare.isEmpty();
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
        };

        the_board.showPromotionDiv = function (color) {

            // Display the promotion div to complete a move.

            var buttons = the_board.promotionDiv.childNodes;
            var pieces = [
                chess_piece.black_queen, chess_piece.black_rook,
                chess_piece.black_bishop, chess_piece.black_knight
            ];
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
            requestAF(function () {
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
            fenStrings: [default_fen],
            moves: [],
            pgn: pgn
        };

        the_game.getLastPosition = function () {

            // Return the last position object.

            var lastFEN = '';
            var lastIndex = 0;
            lastIndex = the_game.fenStrings.length - 1;
            lastFEN = the_game.fenStrings[lastIndex];
            return new Position(lastFEN);
        };

        the_game.isInCheck = function () {

            // Check if the active player is in check.

            var activeColor = '';
            var position = {};
            position = the_game.getLastPosition();
            activeColor = position.activeColor;
            return position.isInCheck(activeColor);
        };

        the_game.isLegal = function (move) {

            // Check if a move is legal in the last position.

            var position = {};
            if (!regex_move.test(move)) {
                return false;
            }
            position = the_game.getLastPosition();
            return position.checkMoveLegality(move);
        };

        the_game.play = function (move, promotion) {

            // Play a move and store the new FEN in the Chessgame object
            // if it's legal. Then returns the new FEN.

            var lastPosition = {};
            var nextLegalMoves = [];
            var nextPosition = {};
            var pgnMove = '';
            var stringToAdd = '';
            if (!regex_move.test(move)) {
                return;
            }
            lastPosition = the_game.getLastPosition();
            if (lastPosition.checkMoveLegality(move)) {
                promotion = promotion || '';
                nextPosition = lastPosition.getNewPosition(move, promotion);
                the_game.fenStrings.push(nextPosition.fenString);
                if (the_game.isInCheck()) {
                    nextLegalMoves = nextPosition.getLegalMoves();
                    if (nextLegalMoves.length < 1) {
                        stringToAdd = '#';
                    } else {
                        stringToAdd = '+';
                    }
                }
                pgnMove = lastPosition.getPGN(move, promotion, stringToAdd);
                the_game.moves.push(pgnMove);
                return nextPosition.fenString;
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

    function selectPiece(square) {

        // Select or deselect a piece on the board and show its legal squares.

        var legalSquares = [];
        var lastPosition = abGame.getLastPosition();
        if (abBoard.selectedSquare === null) {
            abBoard.selectedSquare = square;
        } else {
            abBoard.selectedSquare = null;
        }
        abBoard.squares[square].highlight();
        if (abConfig.showLegalMoves) {
            legalSquares = lastPosition.getLegalSquares(square);
            abBoard.drawCircles(legalSquares);
        }
    }

    function playMove(move, promotion) {
        var color = '';
        var kingSquare = '';
        var position = {};
        if (abConfig.showKingInCheck) {
            position = abGame.getLastPosition();
            color = position.activeColor;
            kingSquare = position.getKingSquare(color);
            if (abBoard.squares[kingSquare].isMarked) {
                abBoard.markSquares([kingSquare]);
            }
        }
        abBoard.play(move, promotion);
        abGame.play(move, promotion);
        if (abConfig.showKingInCheck && abGame.isInCheck()) {
            position = abGame.getLastPosition();
            color = position.activeColor;
            kingSquare = position.getKingSquare(color);
            abBoard.markSquares([kingSquare]);
        }
    }

    function finishMove(arrival, selectArrival) {

        // Perform the second step of a move once the arrival square is defined.
        // Test the legality. Show promotion div. Remove legal squares.

        var color = '';
        var move = '';
        var playedPiece = '';
        var position = {};
        var start = '';
        start = abBoard.selectedSquare;
        move = start + '-' + arrival;
        if (!regex_move.test(move)) {
            return;
        }
        selectPiece(start);
        if (abGame.isLegal(move)) {
            position = abGame.getLastPosition();
            playedPiece = position.occupiedSquares[start];
            if (regex_promotion.test(move) && playedPiece.toLowerCase() === chess_piece.black_pawn) {
                abBoard.pendingMove = move;
                color = (arrival[1] === '8')
                    ? chess_piece.white
                    : chess_piece.black;
                abBoard.showPromotionDiv(color);
            } else {
                playMove(move);
            }
        } else if (selectArrival && arrival !== start && !abBoard.squares[arrival].isEmpty()) {
            selectPiece(arrival);
        }
    }

    abBoard.onPieceDragEnd = function (start, e) {
        if (e.dataTransfer.dropEffect === 'none') {
            selectPiece(start);
        }
    };

    abBoard.onPieceDragStart = function (start) {
        if (abBoard.selectedSquare !== null) {
            selectPiece(abBoard.selectedSquare);
        }
        selectPiece(start);
    };

    abBoard.onPromotionChose = function (choice) {
        var move = abBoard.pendingMove;
        playMove(move, choice);
    };

    abBoard.onSquareClick = function (clickedSquare) {
        if (abBoard.selectedSquare === null) {
            if (!abBoard.squares[clickedSquare].isEmpty()) {
                selectPiece(clickedSquare);
            }
        } else {
            finishMove(clickedSquare, true);
        }
    };

    abBoard.onSquareDrop = function (droppedSquare) {
        finishMove(droppedSquare, false);
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
            requestAF(function () {
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
            return position.activeColor;
        },
        getFEN: function () {

            // Get the last FEN string.

            var lastIndex = 0;
            lastIndex = abGame.fenStrings.length - 1;
            return abGame.fenStrings[lastIndex];
        },
        getMoves: function () {

            // Return an array of the PGN moves.

            return abGame.moves;
        },
        isCheckmate: function () {

            // Check if the active player is checkmated.

            var activeColor = '';
            var legalMoves = [];
            var position = {};
            position = abGame.getLastPosition();
            legalMoves = position.getLegalMoves();
            activeColor = position.activeColor;
            return position.isInCheck(activeColor) && legalMoves.length === 0;
        },
        isInCheck: function () {

            // Check if the active player is in check.

            var activeColor = '';
            var position = {};
            position = abGame.getLastPosition();
            activeColor = position.activeColor;
            return position.isInCheck(activeColor);
        },
        isLegal: function (move) {

            // Check if a move is legal.

            return abGame.isLegal(move);
        },
        isStalemate: function () {

            // Check if the active player is stalemated.

            var activeColor = '';
            var legalMoves = [];
            var position = {};
            position = abGame.getLastPosition();
            legalMoves = position.getLegalMoves();
            activeColor = position.activeColor;
            return !position.isInCheck(activeColor) && legalMoves.length === 0;
        },
        play: function (move) {

            // Play the desired move and return the resulting FEN string.

            return playMove(move);
        },
        setFEN: function (fen) {

            // Set the FEN string.

            abBoard.loadFEN(fen);
        }
    };
};
