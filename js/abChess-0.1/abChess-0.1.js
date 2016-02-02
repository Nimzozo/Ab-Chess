// AbChess-0.1.js
// 2016-02-02
// Copyright (c) 2016 Nimzozo

// TODO :
// click handler

/*global
    window
*/

/*jslint
    browser, white
*/

/*property
    AbChess, abs, addEventListener, appendChild, backgroundImage, black,
    black_bishop, black_king, black_knight, black_pawn, black_queen,
    black_rook, black_square, board, bottom_border, checkLegality, className,
    clickHandler, clickablePieces, concat, container, containerId,
    createElement, createSquares, dataTransfer, div, dragEndHandler,
    dragEnterHandler, dragLeaveHandler, dragOverHandler, dragStartHandler,
    draggablePieces, draw, dropEffect, dropHandler, effectAllowed, empty,
    every, exec, fen, fenPositions, fenToObject, flip, forEach, game, get,
    getActiveColor, getAllowedCastles, getElementById, getEnPassantTarget,
    getFullmoveNumber, getHalfmoveClock, getKingSquare, getLastMoveNotation,
    getMoveNotation, getNextPosition, getPGN, getPiecesPlaces,
    getPositionObject, getTargets, getTargets_bishop, getTargets_king,
    getTargets_knight, getTargets_pawn, getTargets_queen, getTargets_rook,
    hasBorder, hasChildNodes, hasOwnProperty, height, highlight,
    highlightSquares, illegal_move, indexOf, initEventsListeners, inline_block,
    innerHTML, isControlledBy, isEmpty, isFlipped, isHighlighted, isInCheck,
    isLegal, isValidFEN, isValidPGN, isWhite, keys, lastChild, length,
    lineHeight, loadPosition, moves, name, objectToFEN, pgn, piece, play,
    preventDefault, push, put, remove, removeChild, replace, right_border,
    search, selected_square, set, setAttribute, some, split, square, squares,
    squares_div, style, substr, test, toLowerCase, toUpperCase, trim, white,
    white_bishop, white_king, white_knight, white_pawn, white_queen,
    white_rook, white_square, width
*/

window.AbChess = window.AbChess || function (containerId, width) {
    'use strict';

    var abChess = {};
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
        selected_square: 'selectedSquare',
        square: 'square',
        squares_div: 'squaresDiv',
        white_square: 'whiteSquare'
    };
    var default_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    var dragStart = null;
    var isDragging = false;
    var error = {
        fen: 'Invalid FEN string.',
        illegal_move: 'Illegal move.'
    };
    var images_path = '../images/wikipedia/';
    var png_extension = '.png';
    var regex_fen = /^([bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q|-)\s([a-h][36]|-)\s(0|[1-9]\d*)\s([1-9]\d*)$/;
    var regex_fen_row = /^([bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8)$/i;

    // --------------------------------------------------------------

    function Position(fen) {

        // A chess Position is constructed with a FEN string.
        // It represents the pieces placement plus some extra data.

        var the_position = {
            fen: fen
        };

        the_position.checkLegality = function (move) {

            // Check whether a move is legal or not.
            // Check : active color, kings are not in check, moves are legal.

            var activeColor = the_position.getActiveColor();
            var arrival = move.substr(3, 2);
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var pieceColor = '';
            var start = move.substr(0, 2);
            var targets = the_position.getTargets(start, false);
            var testPosition = the_position.getNextPosition(move);
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

        the_position.getNextPosition = function (move) {

            // Return the new Position object after a move has been played.
            // The move parameter must be on the form [a-h][1-8]-[a-h][1-8].
            // The states of FEN extra data are updated here.

            var allowedCastles = the_position.getAllowedCastles();
            var arrivalRowNumber = 0;
            var arrivalSquare = move.substr(3, 2);
            var nextActiveColor = '';
            var nextAllowedCastles = allowedCastles;
            var nextEnPassantTarget = '-';
            var nextFEN = '';
            var nextFullmoveNumber = 0;
            var nextHalfmoveClock = 0;
            var nextPosition = {};
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var playedPiece = '';
            var startRowNumber = 0;
            var startSquare = move.substr(0, 2);
            var takenPiece = occupiedSquares[arrivalSquare];
            nextActiveColor = (the_position.getActiveColor() === chess_piece.white)
                ? chess_piece.black
                : chess_piece.white;
            arrivalRowNumber = Number(arrivalSquare[1]);
            startRowNumber = Number(startSquare[1]);
            playedPiece = occupiedSquares[startSquare];
            if (allowedCastles !== '-') {
                if (allowedCastles.search(/[kq]/) !== -1) {
                    if (playedPiece === chess_piece.black_king) {
                        nextAllowedCastles = allowedCastles.replace(/[kq]/g, '');
                    }
                    if (startSquare === 'a8' || arrivalSquare === 'a8') {
                        nextAllowedCastles = allowedCastles.replace(/q/, '');
                    }
                    if (startSquare === 'h8' || arrivalSquare === 'h8') {
                        nextAllowedCastles = allowedCastles.replace(/k/, '');
                    }
                }
                if (allowedCastles.search(/[KQ]/) !== -1) {
                    if (playedPiece === chess_piece.white_king) {
                        nextAllowedCastles = allowedCastles.replace(/[KQ]/g, '');
                    }
                    if (startSquare === 'a1' || arrivalSquare === 'a1') {
                        nextAllowedCastles = allowedCastles.replace(/Q/, '');
                    }
                    if (startSquare === 'h1' || arrivalSquare === 'h1') {
                        nextAllowedCastles = allowedCastles.replace(/K/, '');
                    }
                }
            }
            if (playedPiece === chess_piece.black_pawn || playedPiece === chess_piece.white_pawn) {
                if (arrivalRowNumber - startRowNumber === 2) {
                    nextEnPassantTarget = startSquare[0] + '3';
                }
                if (startRowNumber - arrivalRowNumber === 2) {
                    nextEnPassantTarget = startSquare[0] + '6';
                }
            }
            if (playedPiece === chess_piece.black_pawn || playedPiece === chess_piece.white_pawn || takenPiece !== undefined) {
                nextHalfmoveClock = the_position.getHalfmoveClock() + 1;
            } else {
                nextHalfmoveClock = 0;
            }
            nextFullmoveNumber = (nextActiveColor === chess_piece.white)
                ? the_position.getFullmoveNumber() + 1
                : the_position.getFullmoveNumber();
            delete occupiedSquares[startSquare];
            occupiedSquares[arrivalSquare] = playedPiece;
            nextFEN = Position.objectToFEN(occupiedSquares) + ' '
            + nextActiveColor + ' ' + nextAllowedCastles + ' '
            + nextEnPassantTarget + ' ' + nextHalfmoveClock + ' '
            + nextFullmoveNumber;
            nextPosition = new Position(nextFEN);
            return nextPosition;
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

        the_position.getTargets = function (start, onlyAttack) {

            // Return the target a specific piece can reach.
            // A target is a square that a piece controls or can move on.
            // The onlyAttack parameter allows to filter
            // pawn non-attacking moves.

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
                    targets = the_position.getTargets_king(start, color);
                    break;
                case chess_piece.black_knight:
                case chess_piece.white_knight:
                    targets = the_position.getTargets_knight(start, color);
                    break;
                case chess_piece.black_pawn:
                case chess_piece.white_pawn:
                    targets = the_position.getTargets_pawn(start, color, onlyAttack);
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
            // A king cannot be near the ennemy king.
            // A king can castle.

            var alliesPlaces = the_position.getPiecesPlaces(color);
            var allowedCastles = the_position.getAllowedCastles();
            var colMoves = [-1, 0, 1];
            var colNumber = 1 + columns.indexOf(start[0]);
            var ennemiesColor = (color === chess_piece.black)
                ? chess_piece.white
                : chess_piece.black;
            var ennemyColNumber = 0;
            var ennemyRowNumber = 0;
            var ennemyKingSquare = the_position.getKingSquare(ennemiesColor);
            var ennemyKingTargets = [];
            var kingSideCastle = ['f', 'g'];
            var occupiedSquares = Position.fenToObject(the_position.fen);
            var queenSideCastle = ['b', 'c', 'd'];
            var rowMoves = [-1, 0, 1];
            var rowNumber = Number(start[1]);
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = '';
            colMoves.forEach(function (colValue) {
                rowMoves.forEach(function (rowValue) {
                    if (colValue !== 0 || rowValue !== 0) {
                        ennemyColNumber = 1 + columns.indexOf(ennemyKingSquare[0]) + colValue;
                        ennemyRowNumber = Number(ennemyKingSquare[1]) + rowValue;
                        if (ennemyColNumber > 0 && ennemyColNumber < 9 && ennemyRowNumber > 0 && ennemyRowNumber < 9) {
                            ennemyKingTargets.push(columns[ennemyColNumber - 1] + ennemyRowNumber);
                        }
                    }
                });
            });
            colMoves.forEach(function (colValue) {
                rowMoves.forEach(function (rowValue) {
                    if (colValue !== 0 || rowValue !== 0) {
                        testColNumber = colNumber + colValue;
                        testRowNumber = rowNumber + rowValue;
                        if (testColNumber > 0 && testColNumber < 9 && testRowNumber > 0 && testRowNumber < 9) {
                            testSquare = columns[testColNumber - 1] + testRowNumber;
                            if (alliesPlaces.indexOf(testSquare) === -1 && ennemyKingTargets.indexOf(testSquare) === -1) {
                                targets.push(testSquare);
                            }
                        }
                    }
                });
            });
            if (start === 'e1') {
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
            } else if (start === 'e8') {
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

        the_position.getTargets_pawn = function (start, color, onlyAttack) {

            // Return an array of squares a pawn on a specific square can reach.
            // Pawns can move, take (en passant), promote.
            // Set onlyAttack to true to check only captures.

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
                }
            });
            if (!onlyAttack) {
                testColNumber = colNumber;
                testSquare = columns[testColNumber - 1] + testRowNumber;
                if (alliesPlaces.indexOf(testSquare) === -1 && ennemiesPlaces.indexOf(testSquare) === -1) {
                    targets.push(testSquare);
                    if (rowNumber === 2 || rowNumber === 7) {
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

            // Check whether the desired square is controlled
            // by the specified color.

            var ennemies = [];
            var ennemiesColor = (color === chess_piece.white)
                ? chess_piece.black
                : chess_piece.white;
            ennemies = the_position.getPiecesPlaces(ennemiesColor);
            return ennemies.some(function (ennemy) {
                var targets = the_position.getTargets(ennemy, true);
                return (targets.indexOf(square) !== -1);
            });
        };

        the_position.isInCheck = function (color) {

            // Check whether the desired king is in check.

            var kingSquare = the_position.getKingSquare(color);
            return the_position.isControlledBy(kingSquare, color);
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

    // ---------------------------------------------------

    function Piece(name) {

        // The Piece class constructs an HTML DIV element.
        // The name property is a 2 chars string ((b|w)[bknqr])
        // to identify the chess piece.
        // The chess image is set with css backgroundImage.

        var div = document.createElement("DIV");
        var the_piece;
        var url = images_path + name + png_extension;
        div.style.backgroundImage = 'url("' + url + '")';
        div.setAttribute('draggable', 'true');

        the_piece = {
            div: div,
            name: name,
            square: null
        };

        the_piece.initEventsListeners = function () {
            div.addEventListener('dragstart', the_piece.dragStartHandler);
            div.addEventListener('dragend', the_piece.dragEndHandler);
            div.addEventListener('click', the_piece.clickHandler);
        };

        the_piece.clickHandler = function () {

        };

        the_piece.dragEndHandler = function () {
            isDragging = false;
        };

        the_piece.dragStartHandler = function (e) {
            e.dataTransfer.effectAllowed = 'move';
            isDragging = true;
            dragStart = the_piece.square.name;
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

        // The Square class constructs a HTML DIV element
        // named with its coordinate.

        var the_square = {
            board: null,
            div: null,
            isHighlighted: false,
            name: name,
            piece: null
        };

        the_square.dragEnterHandler = function (e) {
            if (isDragging) {
                e.preventDefault();
                the_square.highlight();
            }
        };

        the_square.dragLeaveHandler = function () {
            if (isDragging) {
                the_square.highlight();
            }
        };

        the_square.dragOverHandler = function (e) {
            if (isDragging) {
                e.preventDefault();
            }
        };

        the_square.dropHandler = function (e) {
            var move = '';
            if (isDragging) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                move = dragStart + '-' + the_square.name;
                the_square.board.play(move);
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
        var rowNumber = Number(name[1]);
        if (rowNumber % 2 === 0) {
            return (colNumber % 2 === 1);
        } else {
            return (colNumber % 2 === 0);
        }
    };

    // -------------------------------------------------------

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
                        ? css.square + ' ' + css.white_square
                        : css.square + ' ' + css.black_square;
                    div.className = cssClass;
                    square = new Square(name);
                    square.board = the_board;
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
            squares.forEach(function (square) {
                the_board.squares[square].highlight();
            });
        };

        the_board.loadPosition = function (fen) {

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
                piece.initEventsListeners();
                piece.put(square);
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
            var piece = {};
            var regexCastle = /^e(1-c1|1-g1|8-c8|8-g8)$/;
            var regexEnPassant = /^([a-h]4-[a-h]3|[a-h]5-[a-h]6)$/;
            var regexPromotion = /^([a-h]2-[a-h]1|[a-h]7-[a-h]8)$/;
            var rook = {};
            var rookArrival = '';
            var rookStart = '';
            var start = move.substr(0, 2);
            var startSquare = the_board.squares[start];
            if (!startSquare.isEmpty()) {
                piece = startSquare.piece;
                piece.remove();
                piece.put(arrivalSquare);
                if (regexCastle.test(move) && piece.name[1] === chess_piece.black_king) {
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
                } else if (piece.name[1] === chess_piece.black_pawn) {
                    if (regexEnPassant.test(move) && emptyArrival) {
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
                    } else if (regexPromotion.test(move)) {
                        promotion = promotion || chess_piece.black_queen;
                        newPieceColor = (arrival[1] === '1')
                            ? chess_piece.black
                            : chess_piece.white;
                        newPiece = new Piece(newPieceColor + promotion.toLowerCase());
                        newPiece.initEventsListeners();
                        newPiece.put(arrivalSquare);
                    }
                }
            }
        };

        return the_board;
    }

    // ---------------------------------------------------

    function Chessgame(pgn) {

        // The Chessgame class constructs a full chess game.
        // We assume a chessgame is mainly an ordered collection
        // of FEN positions.
        // A FEN position is a chess position plus some data :
        // active color, castling possibilities, en passant square,
        // halfmove clock and fullmove number.

        var the_game = {
            fenPositions: [default_fen],
            moves: [],
            pgn: pgn
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

        the_game.getPGN = function () {
            return the_game.pgn;
        };

        the_game.play = function (move) {

            // Play a move and store the new FEN in the Chessgame object
            // if it's legal. Then returns the new FEN.

            var lastFENPosition = '';
            var lastIndex = the_game.fenPositions.length - 1;
            var lastPosition = {};
            var nextPosition = {};
            lastFENPosition = the_game.fenPositions[lastIndex];
            lastPosition = new Position(lastFENPosition);
            if (lastPosition.checkLegality(move)) {
                nextPosition = lastPosition.getNextPosition(move);
                the_game.fenPositions.push(nextPosition.fen);
                return nextPosition.fen;
            } else {
                throw new Error(error.illegal_move);
            }
        };

        return the_game;
    }

    Chessgame.isValidPGN = function (pgn) {

        // PGN string validator

        var regex = /([1-9][0-9]*\\.{1,3}\\s*)?(O-O-O|O-O|([BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|([a-h]x)?[a-h][1-8](\=[BNQR])?)(\\+|#)?/gm;
        return regex.test(pgn.trim());
    };

    // ---------------------------------------------------
    // Api
    // ---------------------------------------------------

    abChess = new Chessboard(containerId, width);
    abGame = new Chessgame();

    return {
        draw: function () {

            // Draw the chessboard.

            abChess.createSquares();
            abChess.draw();
        },
        fen: {

            // Get or set the FEN position.

            get: function () {
                var position = abChess.getPositionObject();
                return Position.objectToFEN(position);
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
        game: {

            // Game data/methods.

            getActiveColor: function () {

                // Return the active color : b|w.

                var lastIndex = abGame.fenPositions.length - 1;
                var position = new Position(abGame.fenPositions[lastIndex]);
                return position.getActiveColor();
            },
            getLastMoveNotation: function () {

                // Return the PGN notation of the last played move.


            },
            isInCheck: function () {
                var activeColor = '';
                var lastIndex = abGame.fenPositions.length - 1;
                var position = new Position(abGame.fenPositions[lastIndex]);
                activeColor = position.getActiveColor();
                return position.isInCheck(activeColor);
            },
            isLegal: function (move) {
                var lastIndex = abGame.fenPositions.length - 1;
                var position = new Position(abGame.fenPositions[lastIndex]);
                return position.checkLegality(move);
            },
            play: function (move) {

                // Play the desired move and return the resulting FEN string.

                return abGame.play(move);
            }
        }
    };
};
