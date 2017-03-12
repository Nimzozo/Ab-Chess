// AbChess-0.2.3.js
// 2017-03-12
// Copyright (c) 2017 Nimzozo

/*global
    window
*/

/*jslint
    browser, white
*/

window.AbChess = window.AbChess || function (containerId, abConfig) {
    "use strict";

    var abBoard = {};

    // Chess constants.

    var chess = {
        bishopVectors: [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ],
        black: "b",
        blackBishop: "b",
        blackKing: "k",
        blackKnight: "n",
        blackPawn: "p",
        blackQueen: "q",
        blackRook: "r",
        captureSymbol: "x",
        castleKingSymbol: "O-O",
        castleQueenSymbol: "O-O-O",
        checkSymbol: "+",
        checkmateSymbol: "#",
        columns: "abcdefgh",
        defaultFEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        kingVectors: [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1]
        ],
        knightVectors: [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]
        ],
        promotionSymbol: "=",
        resultBlack: "0-1",
        resultDraw: "1/2-1/2",
        resultWhite: "1-0",
        rookVectors: [
            [-1, 0],
            [0, -1],
            [0, 1],
            [1, 0]
        ],
        rows: "12345678",
        white: "w",
        whiteBishop: "B",
        whiteKing: "K",
        whiteKnight: "N",
        whitePawn: "P",
        whiteQueen: "Q",
        whiteRook: "R"
    };

    // Css classes and ids.

    var css = {
        blackSquare: "square_black",
        checkSquare: "square_check",
        columnsBorder: "columns-border",
        columnsBorderFragment: "columns-border__fragment",
        ghostPiece: "ghost_piece",
        lastMoveSquare: "square_last-move",
        overflownSquare: "square_overflown",
        promotionButton: "promotion-button",
        promotionDiv: "promotion-div",
        rowsBorder: "rows-border",
        rowsBorderFragment: "rows-border__fragment",
        selectedSquare: "square_selected",
        square: "square",
        squareCanvas: "square__canvas",
        squarePiece: "square__piece",
        squaresDiv: "squares-div",
        whiteSquare: "square_white"
    };

    // Config default values.

    var defaultConfig = {
        animationSpeed: "normal",
        clickable: true,
        draggable: true,
        flipped: false,
        imagesExtension: ".png",
        imagesPath: "images/wikipedia/",
        legalMarksColor: "steelblue",
        markKingInCheck: true,
        markLastMove: true,
        markLegalSquares: true,
        markOverflownSquare: true,
        markSelectedSquare: true,
        notationBorder: true,
        width: 360
    };

    // Error messages.

    var error = {
        illegalMove: "Illegal move.",
        invalidFEN: "Invalid FEN string.",
        invalidParameter: "Invalid parameter.",
        invalidPGN: "Invalid PGN."
    };

    // Custom events.

    var event = {
        onMovePlayed: null
    };

    var getCoordinate = function (element) {

        // Return the coordinate of an HTML element.

        var x = element.getBoundingClientRect().left + window.pageXOffset;
        var y = element.getBoundingClientRect().top + window.pageYOffset;
        return [Math.round(x), Math.round(y)];
    };

    // RAF polyfill.

    var rAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };

    // Regular expressions.

    var regExp = {
        castle: /^e(?:1-c1|1-g1|8-c8|8-g8)$/,
        comment: /\{[^]+?\}/gm,
        enPassant: /^[a-h]4-[a-h]3|[a-h]5-[a-h]6$/,
        fen: /^(?:[bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q|-)\s([a-h][36]|-)\s(0|[1-9]\d*)\s([1-9]\d*)$/,
        fenRow: /^[bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8$/i,
        move: /^[a-h][1-8]-[a-h][1-8]$/,
        pgnCastle: /^O-O(?:-O)?(?:\+|#)?$/,
        pgnKingMove: /^(?:Kx?([a-h][1-8])|O-O(?:-O)?)(?:\+|#)?$/,
        pgnMove: /(?:[1-9][0-9]*\.(?:\.\.)?\s*)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm,
        pgnMoveNumber: /[1-9][0-9]*\.(?:\.\.)?\s?/,
        pgnPawnMove: /^([a-h]?)x?([a-h][1-8])(\=[BNQR])?(?:\+|#)?$/,
        pgnPieceMove: /^[BNQR]([a-h]?[1-8]?)x?([a-h][1-8])(?:\+|#)?$/,
        pgnPromotion: /\=[BNQR]$/,
        pgnShortMove: /^(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?$/,
        pieceChar: /[bknpqr]/i,
        promotion: /^[a-h]2-[a-h]1|[a-h]7-[a-h]8$/,
        result: /1-0|0-1|1\/2-1\/2|\*/,
        row: /[1-8]/,
        tagPair: /\[[A-Z][^]+?\s"[^]+?"\]/gm,
        tagPairCapture: /\[(\S+)\s"(.*)"/,
        tagPairsSection: /(?:\[[^]+?\s"[^]+?"\]\s+){7,}\s+/gm,
        variation: /\([^()]*?\)/gm
    };

    // Position ----------------------------------------------------------------

    function Position(fen) {

        // A chess Position is constructed with a FEN string.
        // It represents the pieces placement plus some extra data.

        var the_position = {
            activeColor: "",
            allowedCastles: "",
            enPassantSquare: "",
            fenString: fen,
            fullmoveNumber: 0,
            halfmoveClock: 0,
            occupiedSquares: null
        };

        the_position.checkMoveLegality = function (move) {

            // Check whether a move is legal or not.
            // Check : active color, kings are not in check, moves are legal.

            var arrival = move.substr(3, 2);
            var arrivalPieceColor = "";
            var pieceColor = "";
            var start = move.substr(0, 2);
            var targets = [];
            var testPosition = {};
            if (!regExp.move.test(move)) {
                return false;
            }
            if (!the_position.occupiedSquares.hasOwnProperty(start)) {
                return false;
            }
            pieceColor = (the_position.occupiedSquares[start] ===
                the_position.occupiedSquares[start].toLowerCase())
                ? chess.black
                : chess.white;
            if (the_position.activeColor !== pieceColor) {
                return false;
            }
            if (the_position.occupiedSquares.hasOwnProperty(arrival)) {
                arrivalPieceColor = (the_position.occupiedSquares[arrival] ===
                    the_position.occupiedSquares[arrival].toLowerCase())
                    ? chess.black
                    : chess.white;
                if (arrivalPieceColor === pieceColor) {
                    return false;
                }
            }
            testPosition = the_position.getNextPosition(move);
            if (testPosition.isInCheck(the_position.activeColor)) {
                return false;
            }
            targets = the_position.getTargets(start, false);
            return targets.some(function (target) {
                return target === arrival;
            });
        };

        the_position.getKingSquare = function (color) {

            // Return the square where the desired king is placed.

            var desiredKing = (color === chess.black)
                ? chess.blackKing
                : chess.whiteKing;
            return Object.keys(the_position.occupiedSquares).find(
                function (key) {
                    return the_position.occupiedSquares[key] === desiredKing;
                });
        };

        the_position.getLegalMoves = function () {

            // Return an array of all legal moves.

            var legalMoves = [];
            var pieces = [];
            pieces = the_position.getPiecesPlaces(the_position.activeColor);
            pieces.forEach(function (square) {
                var legalSquares = the_position.getLegalSquares(square);
                legalSquares.forEach(function (arrival) {
                    var move = square + "-" + arrival;
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
                var move = start + "-" + target;
                if (the_position.checkMoveLegality(move)) {
                    legalSquares.push(target);
                }
            });
            return legalSquares;
        };

        the_position.getLineTargets = function (start, vectors) {

            // Return an array of linear squares without collision.

            var alliesPlaces = [];
            var color = "";
            var columnNumber = 0;
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var piece = the_position.occupiedSquares[start];
            var rowNumber = 0;
            var targets = [];
            columnNumber = chess.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            color = (piece.toLowerCase() === piece)
                ? chess.black
                : chess.white;
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chess.black)
                ? chess.white
                : chess.black;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            vectors.forEach(function (vector) {
                var columnVector = vector[0];
                var rowVector = vector[1];
                var square = "";
                var testColumn = columnNumber + columnVector;
                var testRow = rowNumber + rowVector;
                while (testColumn > 0 && testRow > 0 &&
                    testColumn < 9 && testRow < 9) {
                    square = chess.columns[testColumn - 1] + testRow;
                    if (alliesPlaces.indexOf(square) > -1) {
                        break;
                    }
                    targets.push(square);
                    if (ennemiesPlaces.indexOf(square) > -1) {
                        break;
                    }
                    testColumn += columnVector;
                    testRow += rowVector;
                }
            });
            return targets;
        };

        the_position.getNextActiveColor = function () {

            // Return the new active color.

            return (the_position.activeColor === chess.white)
                ? chess.black
                : chess.white;
        };

        the_position.getNextAllowedCastles = function (move) {

            // Return the updated allowed castles.

            var arrival = "";
            var castles = the_position.allowedCastles;
            var king = [chess.whiteKing, chess.blackKing];
            var queen = [chess.whiteQueen, chess.blackQueen];
            var rows = [1, 8];
            var start = "";
            if (castles === "-") {
                return castles;
            }
            start = move.substr(0, 2);
            arrival = move.substr(3, 2);
            function removeCastle(char, kingStart, rookSquare) {
                if (castles.indexOf(char) > -1 && (start === kingStart ||
                    start === rookSquare || arrival === rookSquare)) {
                    castles = castles.replace(char, "");
                }
            }
            rows.forEach(function (row, index) {
                var kingRook = chess.columns[7] + row;
                var kingStart = chess.columns[4] + row;
                var queenRook = chess.columns[0] + row;
                removeCastle(king[index], kingStart, kingRook);
                removeCastle(queen[index], kingStart, queenRook);
            });
            if (castles === "") {
                castles = "-";
            }
            return castles;
        };

        the_position.getNextEnPassant = function (move) {

            // Return the new en passant square.

            var arrivalRowNumber = 0;
            var arrivalSquare = "";
            var nextEnPassantTarget = "-";
            var playedPiece = "";
            var startRowNumber = 0;
            var startSquare = move.substr(0, 2);
            playedPiece = the_position.occupiedSquares[startSquare];
            if (playedPiece.toLowerCase() !== chess.blackPawn) {
                return nextEnPassantTarget;
            }
            startRowNumber = Number(startSquare[1]);
            arrivalSquare = move.substr(3, 2);
            arrivalRowNumber = Number(arrivalSquare[1]);
            if (arrivalRowNumber - startRowNumber === 2) {
                nextEnPassantTarget = startSquare[0] + "3";
            }
            if (startRowNumber - arrivalRowNumber === 2) {
                nextEnPassantTarget = startSquare[0] + "6";
            }
            return nextEnPassantTarget;
        };

        the_position.getNextFullmoveNumber = function () {

            // Return the new fullmove number.

            return (the_position.activeColor === chess.black)
                ? the_position.fullmoveNumber + 1
                : the_position.fullmoveNumber;
        };

        the_position.getNextHalfmoveClock = function (move) {

            // Return the new halfmoveclock.

            var arrivalSquare = move.substr(3, 2);
            var playedPiece = "";
            var startSquare = move.substr(0, 2);
            var takenPiece = false;
            playedPiece = the_position.occupiedSquares[startSquare];
            takenPiece = the_position.occupiedSquares.hasOwnProperty(
                arrivalSquare);
            return (playedPiece.toLowerCase() === chess.blackPawn ||
                takenPiece)
                ? 0
                : the_position.halfmoveClock + 1;
        };

        the_position.getNextPosition = function (move, promotion) {

            // Return the new Position object after a move has been played.
            // The move parameter must be on the form [a-h][1-8]-[a-h][1-8].
            // The data of FEN position are updated here.
            // The played move is assumed to be legal.

            var newActiveColor = "";
            var newAllowedCastles = "";
            var newEnPassant = "";
            var newFEN = "";
            var newFullmove = 0;
            var newHalfmove = 0;
            var newPosition = "";
            newPosition = the_position.getNextPositionString(move, promotion);
            newActiveColor = the_position.getNextActiveColor();
            newAllowedCastles = the_position.getNextAllowedCastles(move);
            newEnPassant = the_position.getNextEnPassant(move);
            newHalfmove = the_position.getNextHalfmoveClock(move);
            newFullmove = the_position.getNextFullmoveNumber();
            newFEN = newPosition +
                " " + newActiveColor +
                " " + newAllowedCastles +
                " " + newEnPassant +
                " " + newHalfmove +
                " " + newFullmove;
            return new Position(newFEN);
        };

        the_position.getNextPositionString = function (move, promotion) {

            // Return the next position string.

            var arrival = move.substr(3, 2);
            var enPassantPawn = "";
            var newPosition = {};
            var piece = "";
            var rookArrival = "";
            var rookStart = "";
            var start = move.substr(0, 2);
            newPosition = Position.fenToObject(the_position.fenString);
            piece = newPosition[start];
            if (piece.toLowerCase() === chess.blackKing &&
                regExp.castle.test(move)) {
                if (arrival[0] === chess.columns[2]) {
                    rookStart = chess.columns[0];
                    rookArrival = chess.columns[3];
                } else {
                    rookStart = chess.columns[7];
                    rookArrival = chess.columns[5];
                }
                rookStart += arrival[1];
                rookArrival += arrival[1];
                delete newPosition[rookStart];
                newPosition[rookArrival] = (start[1] === chess.rows[0])
                    ? chess.whiteRook
                    : chess.blackRook;
            } else if (piece.toLowerCase() === chess.blackPawn) {
                if (arrival === the_position.enPassantSquare &&
                    regExp.enPassant.test(move)) {
                    enPassantPawn = the_position.enPassantSquare[0] + start[1];
                    delete newPosition[enPassantPawn];
                }
                if (regExp.promotion.test(move)) {
                    promotion = promotion || chess.blackQueen;
                    piece = (arrival[1] === chess.rows[0])
                        ? promotion.toLowerCase()
                        : promotion.toUpperCase();
                }
            }
            delete newPosition[start];
            newPosition[arrival] = piece;
            return Position.objectToFEN(newPosition);
        };

        the_position.getPiecesPlaces = function (color) {

            // Return an array of the names of the squares where are placed
            // the pieces of a specific color.

            var occupiedSquares = the_position.occupiedSquares;
            var placements = [];
            Object.keys(occupiedSquares).forEach(function (square) {
                var piece = the_position.occupiedSquares[square];
                if ((color === chess.white &&
                    piece === piece.toUpperCase())
                    || (color === chess.black &&
                        piece === piece.toLowerCase())) {
                    placements.push(square);
                }
            });
            return placements;
        };

        the_position.getTargets = function (start, onlyAttack) {

            // Return the target a specific piece can reach.
            // A target is a square that a piece controls or can move on.
            // The onlyAttack parameter allows to filter king moves
            // and pawn non-attacking moves.

            var piece = the_position.occupiedSquares[start];
            var queenVectors = [];
            if (piece.toLowerCase() === chess.blackBishop) {
                return the_position.getLineTargets(start,
                    chess.bishopVectors);
            } else if (piece.toLowerCase() === chess.blackKing) {
                return the_position.getTargetsKing(start, onlyAttack);
            } else if (piece.toLowerCase() === chess.blackKnight) {
                return the_position.getVectorsTargets(start,
                    chess.knightVectors);
            } else if (piece.toLowerCase() === chess.blackPawn) {
                return the_position.getTargetsPawn(start, onlyAttack);
            } else if (piece.toLowerCase() === chess.blackQueen) {
                queenVectors = chess.bishopVectors.concat(
                    chess.rookVectors);
                return the_position.getLineTargets(start, queenVectors);
            } else {
                return the_position.getLineTargets(start,
                    chess.rookVectors);
            }
        };

        the_position.getTargetsCastle = function (start) {

            // Return an array of squares for allowed castles.

            var adjacentColumns = [
                chess.columns[5],
                chess.columns[3]
            ];
            var castles = [
                [chess.whiteKing, chess.blackKing],
                [chess.whiteQueen, chess.blackQueen]
            ];
            var castleStart = "";
            var collisions = [
                ["f", "g"],
                ["b", "c", "d"]
            ];
            var colors = [chess.black, chess.white];
            var i = 0;
            var legalColumns = [chess.columns[6], chess.columns[2]];
            var piece = the_position.occupiedSquares[start];
            var rows = [chess.rows[0], chess.rows[7]];
            var targets = [];
            i = (piece.toUpperCase() === piece)
                ? 0
                : 1;
            castleStart = chess.columns[4] + rows[i];
            if (start !== castleStart ||
                the_position.isControlledBy(castleStart, colors[i])) {
                return targets;
            }
            function hasNoCollision(column) {
                var square = column + rows[i];
                return !the_position.occupiedSquares.hasOwnProperty(square);
            }
            castles.forEach(function (value, index) {
                var square = "";
                if (the_position.allowedCastles.indexOf(value[i]) === -1) {
                    return;
                }
                square = adjacentColumns[index] + rows[i];
                if (the_position.isControlledBy(square, colors[i])) {
                    return;
                }
                if (collisions[index].every(hasNoCollision)) {
                    square = legalColumns[index] + rows[i];
                    targets.push(square);
                }
            });
            return targets;
        };

        the_position.getTargetsKing = function (start, noCastles) {

            // Return an array of squares a king on a specific square can reach.
            // Add castles, filter ennemy king opposition.

            var castleTargets = [];
            var ennemiesColor = "";
            var ennemyKingSquare = "";
            var ennemyKingTargets = [];
            var normalTargets = [];
            var piece = the_position.occupiedSquares[start];
            var targets = [];
            normalTargets = the_position.getVectorsTargets(start,
                chess.kingVectors);
            ennemiesColor = (piece.toLowerCase() === piece)
                ? chess.white
                : chess.black;
            ennemyKingSquare = the_position.getKingSquare(ennemiesColor);
            ennemyKingTargets = the_position.getVectorsTargets(
                ennemyKingSquare, chess.kingVectors);
            targets = normalTargets.filter(function (target) {
                return ennemyKingTargets.indexOf(target) === -1;
            });
            if (noCastles) {
                return targets;
            }
            castleTargets = the_position.getTargetsCastle(start);
            targets = targets.concat(castleTargets);
            return targets;
        };

        the_position.getTargetsPawn = function (start, onlyAttack) {

            // Return an array of squares a pawn on a specific square can reach.
            // Pawns can move, take (en passant), promote.
            // Use onlyAttack to get only attacking moves.

            var attacks = the_position.getTargetsPawnAttack(start, onlyAttack);
            if (onlyAttack) {
                return attacks;
            }
            return attacks.concat(the_position.getTargetsPawnMove(start));
        };

        the_position.getTargetsPawnAttack = function (start, onlyAttack) {

            // Return an array of attacking pawn moves.

            var colDirections = [-1, 1];
            var columnNumber = 0;
            var direction = 0;
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var piece = the_position.occupiedSquares[start];
            var rowNumber = 0;
            var targets = [];
            var testRow = 0;
            columnNumber = chess.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            if (piece.toLowerCase() === piece) {
                direction = -1;
                ennemiesColor = chess.white;
            } else {
                direction = 1;
                ennemiesColor = chess.black;
            }
            testRow = rowNumber + direction;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            colDirections.forEach(function (colDirection) {
                var testCol = columnNumber + colDirection;
                var testSquare = chess.columns[testCol - 1] + testRow;
                if (ennemiesPlaces.indexOf(testSquare) > -1 ||
                    the_position.enPassantSquare === testSquare) {
                    targets.push(testSquare);
                } else if (onlyAttack) {
                    targets.push(testSquare);
                }
            });
            return targets;
        };

        the_position.getTargetsPawnMove = function (start) {

            // Return an array of squares a pawn can reach (no capture).

            var colNumber = 0;
            var direction = 0;
            var piece = the_position.occupiedSquares[start];
            var rowNumber = 0;
            var targets = [];
            var testCol = 0;
            var testRow = 0;
            var testSquare = "";
            colNumber = chess.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            if (piece.toLowerCase() === piece) {
                direction = -1;
            } else {
                direction = 1;
            }
            testCol = colNumber;
            testRow = rowNumber + direction;
            testSquare = chess.columns[testCol - 1] + testRow;
            if (the_position.occupiedSquares.hasOwnProperty(testSquare)) {
                return targets;
            }
            targets.push(testSquare);
            if ((rowNumber === 2 && direction === 1) ||
                (rowNumber === 7 && direction === -1)) {
                testRow = rowNumber + 2 * direction;
                testSquare = chess.columns[testCol - 1] + testRow;
                if (!the_position.occupiedSquares.hasOwnProperty(testSquare)) {
                    targets.push(testSquare);
                }
            }
            return targets;
        };

        the_position.getVectorsTargets = function (start, vectors) {

            // Return an array of squares found with vectors.

            var alliesPlaces = [];
            var color = "";
            var columnNumber = 0;
            var piece = the_position.occupiedSquares[start];
            var rowNumber = 0;
            var targets = [];
            color = (piece.toLowerCase() === piece)
                ? chess.black
                : chess.white;
            alliesPlaces = the_position.getPiecesPlaces(color);
            columnNumber = chess.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            vectors.forEach(function (vector) {
                var testColNumber = 0;
                var testRowNumber = 0;
                var testSquare = "";
                testColNumber = columnNumber + vector[0];
                testRowNumber = rowNumber + vector[1];
                if (testColNumber < 1 || testColNumber > 8 ||
                    testRowNumber < 1 || testRowNumber > 8) {
                    return;
                }
                testSquare = chess.columns[testColNumber - 1] +
                    testRowNumber;
                if (alliesPlaces.indexOf(testSquare) === -1) {
                    targets.push(testSquare);
                }
            });
            return targets;
        };

        the_position.hasLegalMoves = function () {

            // Return true if the position is playable.

            var piecesPlaces = the_position.getPiecesPlaces(
                the_position.activeColor);
            return piecesPlaces.some(function (square) {
                var legalSquares = the_position.getLegalSquares(square);
                return legalSquares.length > 0;
            });
        };

        the_position.isCheckmate = function () {

            // Return true if the active king is checkmated.

            var isCheck = the_position.isInCheck(the_position.activeColor);
            if (!isCheck) {
                return false;
            }
            return !the_position.hasLegalMoves();
        };

        the_position.isControlledBy = function (square, color) {

            // Check if the desired square is controlled
            // by a specified color.

            var ennemies = the_position.getPiecesPlaces(color);
            return ennemies.some(function (ennemy) {
                var targets = the_position.getTargets(ennemy, true);
                return targets.indexOf(square) > -1;
            });
        };

        the_position.isDrawBy50MovesRule = function () {

            // Check if the position is draw by the 50 moves rule.

            return the_position.halfmoveClock > 99;
        };

        the_position.isDrawByInsufficientMaterial = function () {

            // Check if the position is draw by the insufficient material rule.

            var blackPlaces = [];
            var insufficientBlack = false;
            var insufficients = [
                [chess.blackKing, chess.blackBishop],
                [chess.blackKing, chess.blackKnight],
                [chess.blackKing, chess.blackKnight,
                chess.blackKnight]
            ];
            var pieces = [];
            var whitePlaces = [];
            blackPlaces = the_position.getPiecesPlaces(chess.black);
            if (blackPlaces.length > 3) {
                return false;
            }
            whitePlaces = the_position.getPiecesPlaces(chess.white);
            if (whitePlaces.length > 3) {
                return false;
            }
            function sameArray(array1, array2) {
                if (array1.length !== array2.length) {
                    return false;
                }
                return array1.every(function (value, index) {
                    return array2[index] === value;
                });
            }
            if (blackPlaces.length > 1) {
                blackPlaces.forEach(function (square) {
                    var piece = the_position.occupiedSquares[square];
                    pieces.push(piece);
                });
                insufficientBlack = insufficients.some(function (insufficient) {
                    return sameArray(insufficient, pieces);
                });
                if (!insufficientBlack) {
                    return false;
                }
            }
            if (whitePlaces.length === 1) {
                return true;
            }
            pieces = [];
            whitePlaces.forEach(function (square) {
                var piece = the_position.occupiedSquares[square];
                pieces.push(piece.toLowerCase());
            });
            return insufficients.some(function (insufficient) {
                return sameArray(insufficient, pieces);
            });
        };

        the_position.isInCheck = function (color) {

            // Check if the desired king is in check.

            var ennemiesColor = "";
            var kingSquare = "";
            ennemiesColor = (color === chess.white)
                ? chess.black
                : chess.white;
            kingSquare = the_position.getKingSquare(color);
            return the_position.isControlledBy(kingSquare, ennemiesColor);
        };

        the_position.initialize = function () {

            // Initialize the position object.

            var fenMatches = [];
            if (!Position.isValidFEN(fen)) {
                throw new Error(error.invalidFEN);
            }
            fenMatches = regExp.fen.exec(fen);
            the_position.activeColor = fenMatches[1];
            the_position.allowedCastles = fenMatches[2];
            the_position.enPassantSquare = fenMatches[3];
            the_position.fullmoveNumber = Number(fenMatches[5]);
            the_position.halfmoveClock = Number(fenMatches[4]);
            the_position.occupiedSquares = Position.fenToObject(fen);
        };

        the_position.initialize();
        return the_position;
    }

    Position.fenToObject = function (fen) {

        // Convert a FEN string to an object.

        var object = {};
        var rows = "";
        var rowsArray = [];
        rows = fen.replace(/\s.*/, "");
        rowsArray = rows.split("/");
        rowsArray.forEach(function (row, index) {
            var colNumber = 1;
            var rowNumber = 8 - index;
            row.split("").forEach(function (char) {
                var name = "";
                if (regExp.pieceChar.test(char)) {
                    name = chess.columns[colNumber - 1] + rowNumber;
                    object[name] = char;
                    colNumber += 1;
                } else if (regExp.row.test(char)) {
                    colNumber += Number(char);
                } else {
                    throw new Error(error.invalidFEN);
                }
            });
        });
        return object;
    };

    Position.isValidFEN = function (fen, onlyRows) {

        // FEN string validator.

        var rows = fen.replace(/\s.*/, "").split("/");
        onlyRows = onlyRows || false;
        if (!onlyRows && !regExp.fen.test(fen)) {
            return false;
        }
        return rows.every(function (row) {
            return regExp.fenRow.test(row);
        });
    };

    Position.objectToFEN = function (position) {

        // Convert a position to a FEN string.

        var columns = chess.columns.split("");
        var fenPosition = "";
        var rows = chess.rows.split("").reverse();
        rows.forEach(function (row, rowIndex) {
            var emptyCount = 0;
            columns.forEach(function (column, columnIndex) {
                if (position.hasOwnProperty(column + row)) {
                    if (emptyCount > 0) {
                        fenPosition += emptyCount;
                        emptyCount = 0;
                    }
                    fenPosition += position[column + row];
                } else {
                    emptyCount += 1;
                }
                if (columnIndex < 7) {
                    return;
                }
                if (emptyCount > 0) {
                    fenPosition += emptyCount;
                }
                if (rowIndex < 7) {
                    fenPosition += "/";
                }
            });
        });
        return fenPosition;
    };

    // Chessgame ---------------------------------------------------------------

    function Chessgame() {

        // The Chessgame class constructs a full chess game.
        // We assume a chessgame is mainly an ordered collection
        // of FEN positions.
        // A FEN position is a chess position plus some data :
        // active color, castling possibilities, en passant square,
        // halfmove clock and fullmove number.

        var the_game = {
            comments: [],
            fenStrings: [chess.defaultFEN],
            moves: [],
            pgnMoves: [],
            tags: null
        };

        the_game.addMove = function (move, promotion) {

            // Play a move and store the new FEN string.

            var lastIndex = the_game.fenStrings.length - 1;
            var lastPosition = the_game.getNthPosition(lastIndex);
            var nextPosition = {};
            var pgnMove = "";
            promotion = promotion || "";
            nextPosition = lastPosition.getNextPosition(move, promotion);
            the_game.fenStrings.push(nextPosition.fenString);
            the_game.setResult(nextPosition);
            the_game.moves.push(move);
            pgnMove = the_game.getPGNMove(lastIndex, promotion);
            the_game.pgnMoves.push(pgnMove);
        };

        the_game.exportPGN = function () {

            // Return the PGN string.
            // https://www.chessclub.com/user/help/PGN-spec

            var lineCount = 0;
            var lineFeed = "\n";
            var lineLimit = 80;
            var pgn = "";
            Object.keys(the_game.tags).forEach(function (tag) {
                var value = the_game.tags[tag];
                pgn += "[" + tag + " \"" + value + "\"]" + lineFeed;
            });
            pgn += lineFeed;
            the_game.pgnMoves.forEach(function (move, index) {
                var moveText = "";
                if (lineCount !== 0) {
                    moveText = " ";
                }
                if (index % 2 === 0) {
                    moveText += (index / 2 + 1) + ". ";
                }
                moveText += move;
                lineCount += moveText.length;
                if (lineCount >= lineLimit) {
                    pgn += lineFeed;
                    lineCount = moveText.length;
                }
                pgn += moveText;
            });
            return pgn + " " + the_game.tags.Result + lineFeed + lineFeed;
        };

        the_game.getNthPosition = function (n) {

            // Return the n-th position object.

            var fen = "";
            var lastIndex = 0;
            lastIndex = the_game.fenStrings.length - 1;
            if (typeof n !== "number" || n < 0 || n > lastIndex) {
                throw new Error(error.invalidParameter);
            }
            fen = the_game.fenStrings[n];
            return new Position(fen);
        };

        the_game.getPGNKing = function (n) {

            // Return the PGN notation for a king move.

            var arrival = "";
            var move = the_game.moves[n];
            var pgnMove = "";
            var playedPiece = "";
            var position = the_game.getNthPosition(n);
            var start = move.substr(0, 2);
            playedPiece = position.occupiedSquares[start];
            arrival = move.substr(3, 2);
            if (regExp.castle.test(move)) {
                if (arrival[0] === chess.columns[2]) {
                    pgnMove = chess.castleQueenSymbol;
                } else {
                    pgnMove = chess.castleKingSymbol;
                }
            } else {
                pgnMove = playedPiece.toUpperCase();
                if (position.occupiedSquares.hasOwnProperty(arrival)) {
                    pgnMove += chess.captureSymbol;
                }
                pgnMove += arrival;
            }
            return pgnMove;
        };

        the_game.getPGNMove = function (n, promotion) {

            // Return the PGN notation for a move.

            var move = the_game.moves[n];
            var pgnMove = "";
            var playedPiece = "";
            var position = the_game.getNthPosition(n);
            var start = move.substr(0, 2);
            playedPiece = position.occupiedSquares[start];
            if (playedPiece.toLowerCase() === chess.blackKing) {
                pgnMove = the_game.getPGNKing(n);
            } else if (playedPiece.toLowerCase() === chess.blackPawn) {
                pgnMove = the_game.getPGNPawn(n, promotion);
            } else {
                pgnMove = the_game.getPGNPiece(n);
            }
            return pgnMove + the_game.getPGNSymbol(n, promotion);
        };

        the_game.getPGNPawn = function (n, promotion) {

            // Return the PGN notation for a pawn move.

            var arrival = "";
            var isCapture = false;
            var move = the_game.moves[n];
            var pgnMove = "";
            var position = the_game.getNthPosition(n);
            var start = move.substr(0, 2);
            arrival = move.substr(3, 2);
            isCapture = position.occupiedSquares.hasOwnProperty(arrival);
            if (isCapture || arrival === position.enPassantSquare) {
                pgnMove = start[0] + chess.captureSymbol;
            }
            pgnMove += arrival;
            if (regExp.promotion.test(move)) {
                pgnMove += chess.promotionSymbol + promotion.toUpperCase();
            }
            return pgnMove;
        };

        the_game.getPGNPiece = function (n) {

            // Return the PGN notation for a piece (non-pawn) move.

            var arrival = "";
            var candidates = [];
            var move = the_game.moves[n];
            var occupiedSquares = {};
            var pgnMove = "";
            var playedPiece = "";
            var position = the_game.getNthPosition(n);
            var sameColumn = false;
            var sameRow = false;
            var start = move.substr(0, 2);
            occupiedSquares = position.occupiedSquares;
            playedPiece = occupiedSquares[start];
            arrival = move.substr(3, 2);
            candidates = Object.keys(occupiedSquares).filter(function (square) {
                var legalSquares = [];
                var piece = occupiedSquares[square];
                if (piece !== playedPiece || square === start) {
                    return false;
                }
                legalSquares = position.getLegalSquares(square);
                return legalSquares.indexOf(arrival) > -1;
            });
            sameColumn = candidates.some(function (candidate) {
                return candidate[0] === start[0];
            });
            sameRow = candidates.some(function (candidate) {
                return candidate[1] === start[1];
            });
            pgnMove = playedPiece.toUpperCase();
            if (sameColumn) {
                if (sameRow) {
                    pgnMove += start;
                } else {
                    pgnMove += start[1];
                }
            } else if (sameRow) {
                pgnMove += start[0];
            }
            if (occupiedSquares.hasOwnProperty(arrival)) {
                pgnMove += chess.captureSymbol;
            }
            pgnMove += arrival;
            return pgnMove;
        };

        the_game.getPGNSymbol = function (n, promotion) {

            // Return the check or checkmate symbol for a PGN move if needed.

            var move = the_game.moves[n];
            var nextPosition = {};
            var position = the_game.getNthPosition(n);
            nextPosition = position.getNextPosition(move, promotion);
            if (!nextPosition.isInCheck(nextPosition.activeColor)) {
                return "";
            }
            return (!nextPosition.hasLegalMoves())
                ? chess.checkmateSymbol
                : chess.checkSymbol;
        };

        the_game.getSimpleKingMove = function (n) {

            // Return a simple move from a PGN king move.

            var arrival = "";
            var matches = [];
            var pgnMove = the_game.pgnMoves[n];
            var position = the_game.getNthPosition(n);
            var row = "";
            var start = "";
            matches = pgnMove.match(regExp.pgnKingMove);
            if (pgnMove.match(regExp.pgnCastle) !== null) {
                row = (position.activeColor === chess.white)
                    ? chess.rows[0]
                    : chess.rows[7];
                start = chess.columns[4] + row;
                arrival = (pgnMove === chess.castleKingSymbol)
                    ? chess.columns[6] + row
                    : chess.columns[2] + row;
            } else {
                arrival = matches[1];
                start = position.getKingSquare(position.activeColor);
            }
            return start + "-" + arrival;
        };

        the_game.getSimpleMove = function (n, pgnMove) {

            // Return the corresponding move in simple notation.

            if (regExp.pgnKingMove.test(pgnMove)) {
                return the_game.getSimpleKingMove(n);
            } else if (regExp.pgnPawnMove.test(pgnMove)) {
                return the_game.getSimplePawnMove(n);
            } else if (regExp.pgnPieceMove.test(pgnMove)) {
                return the_game.getSimplePieceMove(n);
            } else {
                throw new SyntaxError(error.invalidParameter);
            }
        };

        the_game.getSimplePawnMove = function (n) {

            // Return a simple move from a PGN pawn move.

            var ambiguity = "";
            var arrival = "";
            var matches = [];
            var move = {};
            var pgnMove = the_game.pgnMoves[n];
            var piece = "";
            var promotion = "";
            var start = "";
            matches = pgnMove.match(regExp.pgnPawnMove);
            ambiguity = matches[1];
            arrival = matches[2];
            if (regExp.pgnPromotion.test(pgnMove)) {
                promotion = matches[3];
            }
            piece = (n % 2 === 0)
                ? chess.whitePawn
                : chess.blackPawn;
            move.piece = piece;
            move.ambiguity = ambiguity;
            move.arrival = arrival;
            start = the_game.getSimpleStart(n, move);
            return start + "-" + arrival + promotion;
        };

        the_game.getSimplePieceMove = function (n) {

            // Return a simple move from a PGN piece move.

            var ambiguity = "";
            var arrival = "";
            var matches = [];
            var move = {};
            var pgnMove = the_game.pgnMoves[n];
            var piece = "";
            var start = "";
            matches = pgnMove.match(regExp.pgnPieceMove);
            ambiguity = matches[1];
            arrival = matches[2];
            piece = pgnMove[0];
            move.piece = piece;
            move.ambiguity = ambiguity;
            move.arrival = arrival;
            start = the_game.getSimpleStart(n, move);
            return start + "-" + arrival;
        };

        the_game.getSimpleStart = function (n, move) {

            // Return the start of a piece.

            var piecesPlaces = [];
            var position = the_game.getNthPosition(n);
            piecesPlaces = position.getPiecesPlaces(position.activeColor);
            return piecesPlaces.find(function (start) {
                var legalSquares = [];
                var testPiece = position.occupiedSquares[start];
                if (testPiece.toLowerCase() !== move.piece.toLowerCase()) {
                    return false;
                }
                legalSquares = position.getLegalSquares(start);
                if (legalSquares.indexOf(move.arrival) === -1) {
                    return false;
                }
                if (move.ambiguity === "") {
                    return true;
                }
                return start.indexOf(move.ambiguity) > -1;
            });
        };

        the_game.importMoves = function () {

            // Generate the moves and the FEN strings from the PGN moves.

            var lastPosition = {};
            the_game.fenStrings = [chess.defaultFEN];
            the_game.moves = [];
            lastPosition = the_game.getNthPosition(0);
            the_game.pgnMoves.forEach(function (pgnMove, index) {
                var move = the_game.getSimpleMove(index, pgnMove);
                var nextPosition = {};
                var promotion = "";
                if (move.indexOf(chess.promotionSymbol) > -1) {
                    promotion = move[move.length - 1];
                    move = move.replace(regExp.pgnPromotion, "");
                }
                the_game.moves.push(move);
                nextPosition = lastPosition.getNextPosition(move, promotion);
                the_game.fenStrings.push(nextPosition.fenString);
                lastPosition = nextPosition;
            });
        };

        the_game.importPGNMoves = function (pgn) {

            // Import the PGN moves from a PGN string.

            var importedPGNMoves = [];
            the_game.pgnMoves = [];
            while (regExp.comment.test(pgn)) {
                pgn = pgn.replace(regExp.comment, "");
            }
            while (regExp.variation.test(pgn)) {
                pgn = pgn.replace(regExp.variation, "");
            }
            pgn = pgn.replace(/\s{2,}/gm, " ");
            importedPGNMoves = pgn.match(regExp.pgnMove);
            importedPGNMoves.forEach(function (pgnMove) {
                pgnMove = pgnMove.replace(regExp.pgnMoveNumber, "");
                the_game.pgnMoves.push(pgnMove);
            });
        };

        the_game.importTags = function (pgn) {

            // Import the tag pairs from a PGN.

            var importedTags = pgn.match(regExp.tagPair);
            the_game.initialize();
            importedTags.forEach(function (tagPair) {
                var matches = regExp.tagPairCapture.exec(tagPair);
                the_game.tags[matches[1]] = matches[2];
            });
        };

        the_game.initialize = function () {

            // Initialize the 7 required tag pairs.

            var requiredTags = {
                "Event": "?",
                "Site": "?",
                "Date": "????.??.??",
                "Round": "?",
                "White": "?",
                "Black": "?",
                "Result": "*"
            };
            the_game.tags = {};
            Object.keys(requiredTags).forEach(function (tag) {
                the_game.tags[tag] = requiredTags[tag];
            });
        };

        the_game.isInCheck = function (n) {

            // Check if the active player is in check in the n-th position.

            var activeColor = "";
            var position = {};
            position = the_game.getNthPosition(n);
            activeColor = position.activeColor;
            return position.isInCheck(activeColor);
        };

        the_game.isLegal = function (n, move) {

            // Check if a move is legal in the n-th position.

            var position = the_game.getNthPosition(n);
            return position.checkMoveLegality(move);
        };

        the_game.setPGN = function (pgn) {

            // Load a PGN string. To proceed :
            // - Validate.
            // - Reset the game object.
            // - Set game informations.
            // - Delete comments.
            // - Variations.
            // - Store the PGN moves.
            // - Get simple moves and FEN strings from PGN moves.

            if (!Chessgame.isValidPGN(pgn)) {
                throw new SyntaxError(error.invalidPGN);
            }
            the_game.importTags(pgn);
            the_game.importPGNMoves(pgn);
            the_game.importMoves();
        };

        the_game.setResult = function (nextPosition) {

            // Set the possible result after a move has been played.

            var hasNoMoves = !nextPosition.hasLegalMoves();
            var isInCheck = false;
            var result = the_game.tags.Result;
            if (hasNoMoves) {
                isInCheck = nextPosition.isInCheck(nextPosition.activeColor);
                if (isInCheck) {
                    result = (nextPosition.activeColor === chess.black)
                        ? chess.resultWhite
                        : chess.resultBlack;
                } else {
                    result = chess.resultDraw;
                }
            } else if (nextPosition.isDrawByInsufficientMaterial() ||
                nextPosition.isDrawBy50MovesRule()) {
                result = chess.resultDraw;
            }
            the_game.tags.Result = result;
        };

        the_game.initialize();
        return the_game;
    }

    Chessgame.isValidPGN = function (pgn) {

        // Validate a PGN string.
        // - Test and remove the tag pairs section.
        // - Remove the comments.
        // - Test and remove variations.
        // - Test and remove the moves section.
        // - Test the final result.

        var moves = [];
        var variations = [];
        if (!regExp.tagPairsSection.test(pgn)) {
            return false;
        }
        pgn = pgn.replace(regExp.tagPairsSection, "");
        while (regExp.comment.test(pgn)) {
            pgn = pgn.replace(regExp.comment, "");
        }
        function hasMoveSection(str) {
            return regExp.pgnMove.test(str);
        }
        while (regExp.variation.test(pgn)) {
            variations = pgn.match(regExp.variation);
            if (!variations.every(hasMoveSection)) {
                return false;
            }
            pgn = pgn.replace(regExp.variation, "");
        }
        moves = pgn.match(regExp.pgnMove);
        if (moves.length < 1) {
            return false;
        }
        pgn = pgn.replace(regExp.pgnMove, "");
        return regExp.result.test(pgn);
    };

    // Piece -------------------------------------------------------------------

    function Piece(name, url, width) {

        // The Piece class constructs an HTML DIV element.
        // The name property is a 2 chars string (b|w)[bknqr]
        // to identify the chess piece.
        // The chess image is set with css backgroundImage url.

        var the_piece = {
            div: null,
            ghost: null,
            isAnimated: false,
            name: name,
            square: null,
            url: url,
            width: width
        };

        the_piece.animateGhost = function (animation) {

            // Animate the ghost movement.

            var distances = [];
            var position = [];
            position[0] = animation.start[0] + animation.vectors[0];
            position[1] = animation.start[1] + animation.vectors[1];
            distances[0] = Math.abs(position[0] - animation.arrival[0]);
            distances[1] = Math.abs(position[1] - animation.arrival[1]);
            if (animation.instant || (distances[0] === animation.rest[0] &&
                distances[1] === animation.rest[1])) {
                if (the_piece.ghost.parentElement !== null) {
                    document.body.removeChild(the_piece.ghost);
                }
                the_piece.ghost.style.transform = "";
                the_piece.div.style.opacity = "1";
                the_piece.isAnimated = false;
                return;
            }
            the_piece.ghost.style.transform = "translate(" +
                animation.vectors[0] * animation.step + "px, " +
                animation.vectors[1] * animation.step + "px)";
            animation.start = position;
            animation.step += 1;
            rAF(function () {
                the_piece.animateGhost(animation);
            });
        };

        the_piece.animatePut = function (square) {

            // Place the piece in the DOM tree.

            rAF(function () {
                square.div.appendChild(the_piece.div);
            });
        };

        the_piece.animateRemove = function () {

            // Remove the piece from the DOM tree.

            rAF(function () {
                var parent = the_piece.div.parentElement;
                parent.removeChild(the_piece.div);
            });
        };

        the_piece.deselect = function () {

            // Deselect the piece after a click or a drag end.

            var board = the_piece.square.board;
            the_piece.showLegalSquares();
            if (board.markSelectedSquare) {
                the_piece.square.isSelected = false;
                the_piece.square.updateCSS();
            }
            board.selectedSquare = null;
        };

        the_piece.fadingPlace = function (square) {

            // Fade the piece in until its opacity reaches 1.

            var opacity = Number(the_piece.div.style.opacity);
            if (opacity === 0) {
                the_piece.animatePut(square);
            }
            opacity += 0.1;
            the_piece.div.style.opacity = opacity;
            if (opacity === 1) {
                return;
            }
            rAF(function () {
                the_piece.fadingPlace(square);
            });
        };

        the_piece.fadingRemove = function () {

            // Fade the piece until its opacity reaches 0.

            var opacity = the_piece.div.style.opacity;
            if (opacity === "") {
                opacity = 1;
            }
            opacity -= 0.1;
            the_piece.div.style.opacity = opacity;
            if (opacity > 0) {
                rAF(the_piece.fadingRemove);
            } else {
                the_piece.animateRemove();
            }
        };

        the_piece.initialize = function () {

            // Initialize the piece object.

            var backgroundImage = "url('" + url + "')";
            the_piece.div = document.createElement("DIV");
            the_piece.div.className = css.squarePiece;
            the_piece.div.style.backgroundImage = backgroundImage;
            the_piece.div.addEventListener("mousedown", the_piece.onMouseDown);
            the_piece.ghost = document.createElement("DIV");
            the_piece.ghost.className = css.ghostPiece;
            the_piece.ghost.style.backgroundImage = backgroundImage;
        };

        the_piece.move = function (move, animate) {

            // Move the piece and modify its place in the DOM tree.

            var arrivalXY = [];
            var startXY = [];
            if (animate) {
                arrivalXY = getCoordinate(move.arrival.div);
                startXY = getCoordinate(the_piece.square.div);
                the_piece.setGhostPosition(startXY[0], startXY[1]);
                the_piece.showGhost();
                the_piece.startGhostAnimation(startXY, arrivalXY);
            }
            if (move.isCapture) {
                move.arrival.piece.fadingRemove();
            }
            the_piece.animateRemove();
            the_piece.animatePut(move.arrival);
        };

        the_piece.onMouseDown = function (e) {
            var board = the_piece.square.board;
            e.preventDefault();
            if (!board.draggable || the_piece.isAnimated || e.button !== 0) {
                return;
            }
            board.isDragging = true;
            if (board.markOverflownSquare) {
                the_piece.square.isOverflown = true;
                the_piece.square.updateCSS();
            }
            the_piece.setGhostPositionCursor(e);
            the_piece.showGhost();
            if (board.selectedSquare === the_piece.square.name) {
                board.hasDraggedClickedSquare = true;
                return;
            }
            the_piece.select();
        };

        the_piece.put = function (square) {

            // Put the piece on a square.

            if (!square.isEmpty()) {
                square.piece.remove();
            }
            square.piece = the_piece;
            the_piece.square = square;
        };

        the_piece.remove = function () {

            // Remove the piece from the square.

            if (the_piece.square === null) {
                return;
            }
            the_piece.square.piece = null;
        };

        the_piece.select = function () {

            // Select the piece after a click or a drag start.

            var board = the_piece.square.board;
            if (board.selectedSquare !== null) {
                board.squares[board.selectedSquare].piece.deselect();
            }
            the_piece.showLegalSquares();
            if (board.markSelectedSquare) {
                the_piece.square.isSelected = true;
                the_piece.square.updateCSS();
            }
            board.selectedSquare = the_piece.square.name;
        };

        the_piece.setGhostPosition = function (left, top) {

            // Set the ghost position.

            rAF(function () {
                the_piece.ghost.style.left = left + "px";
                the_piece.ghost.style.top = top + "px";
            });
        };

        the_piece.setGhostPositionCursor = function (e) {

            // Attach the ghost to the cursor position.

            var left = e.clientX + window.pageXOffset - the_piece.width / 2;
            var top = e.clientY + window.pageYOffset - the_piece.width / 2;
            the_piece.setGhostPosition(left, top);
        };

        the_piece.showGhost = function () {

            // Show the ghost and make the piece disappear.

            rAF(function () {
                the_piece.div.style.opacity = "0";
                the_piece.ghost.style.height = the_piece.width + "px";
                the_piece.ghost.style.width = the_piece.width + "px";
                document.body.appendChild(the_piece.ghost);
            });
        };

        the_piece.showLegalSquares = function () {

            // Display or hide the legal squares canvas.

            var board = the_piece.square.board;
            var index = 0;
            var lastPosition = {};
            var legalSquares = [];
            if (!board.markLegalSquares) {
                return;
            }
            index = board.game.fenStrings.length - 1;
            lastPosition = board.game.getNthPosition(index);
            legalSquares = lastPosition.getLegalSquares(the_piece.square.name);
            legalSquares.forEach(function (name) {
                board.squares[name].showCanvas();
            });
        };

        the_piece.startGhostAnimation = function (start, arrival) {

            // Start the ghost animation.

            var animation = {};
            var distances = [];
            var rests = [];
            var signs = [];
            var speed = the_piece.square.board.animationSpeed;
            var vectors = [];
            distances[0] = Math.abs(start[0] - arrival[0]);
            distances[1] = Math.abs(start[1] - arrival[1]);
            if (Math.max(distances[0], distances[1]) < speed) {
                animation.instant = true;
            } else {
                distances.forEach(function (distance, i) {
                    signs[i] = (start[i] < arrival[i])
                        ? 1
                        : -1;
                    rests[i] = distance % speed;
                    vectors[i] = signs[i] * (distance - rests[i]) / speed;
                });
            }
            animation.arrival = arrival;
            animation.rest = rests;
            animation.start = start;
            animation.step = 1;
            animation.vectors = vectors;
            the_piece.isAnimated = true;
            rAF(function () {
                the_piece.animateGhost(animation);
            });
        };

        the_piece.initialize();
        return the_piece;
    }

    // Square ------------------------------------------------------------------

    function Square(name, width) {

        // The Square class constructs a HTML DIV element
        // named with its coordinate.

        var the_square = {
            board: null,
            canvas: null,
            div: null,
            hasCircle: false,
            isCheck: false,
            isLastMove: false,
            isOverflown: false,
            isSelected: false,
            name: name,
            piece: null,
            width: width
        };

        the_square.drawFilledCircle = function (cssColor) {
            var context = the_square.canvas.getContext("2d");
            var radius = Math.floor(the_square.width / 8);
            var xy = Math.floor(the_square.width / 2);
            the_square.canvas.className = css.squareCanvas;
            the_square.canvas.setAttribute("height", the_square.width + "px");
            the_square.canvas.setAttribute("width", the_square.width + "px");
            context.beginPath();
            context.arc(xy, xy, radius, 0, 2 * Math.PI);
            context.fillStyle = cssColor;
            context.fill();
        };

        the_square.getClassName = function () {

            // Return the css class name of the square.

            var initialClass = css.square + " ";
            initialClass += (Square.isWhite(the_square.name))
                ? css.whiteSquare
                : css.blackSquare;
            if (the_square.isLastMove) {
                initialClass += " " + css.lastMoveSquare;
            }
            if (the_square.isCheck) {
                initialClass += " " + css.checkSquare;
            }
            if (the_square.isOverflown) {
                initialClass += " " + css.overflownSquare;
            }
            if (the_square.isSelected) {
                initialClass += " " + css.selectedSquare;
            }
            return initialClass;
        };

        the_square.initialize = function () {

            // Initialize the square object.

            var cssClass = (Square.isWhite(name))
                ? css.square + " " + css.whiteSquare
                : css.square + " " + css.blackSquare;
            var div = document.createElement("DIV");
            the_square.canvas = document.createElement("CANVAS");
            the_square.div = div;
            div.className = cssClass;
            div.addEventListener("click", the_square.onClick);
            div.addEventListener("mousedown", the_square.onMouseDown);
            div.addEventListener("mouseenter", function () {
                the_square.onMouseEnterLeave(true);
            });
            div.addEventListener("mouseleave", function () {
                the_square.onMouseEnterLeave(false);
            });
            div.addEventListener("mouseup", the_square.onMouseUp);
        };

        the_square.isEmpty = function () {

            // Check whether the square is empty.

            return the_square.piece === null;
        };

        the_square.onClick = function () {
            var board = the_square.board;
            var isEmptySquare = the_square.isEmpty();
            var startSquare = board.selectedSquare;
            if (!board.clickable) {
                return;
            }
            if (the_square.name === startSquare) {
                the_square.piece.deselect();
                return;
            }
            if (startSquare === null) {
                if (!isEmptySquare && !board.hasDraggedClickedSquare) {
                    the_square.piece.select();
                }
            } else {
                board.squares[startSquare].piece.deselect();
                if (!board.confirmMove(startSquare, the_square.name, true) &&
                    !isEmptySquare) {
                    the_square.piece.select();
                }
            }
            board.hasDraggedClickedSquare = false;
        };

        the_square.onMouseDown = function (e) {
            e.preventDefault();
        };

        the_square.onMouseEnterLeave = function (overflow) {
            var board = the_square.board;
            if (board.isDragging && board.markOverflownSquare) {
                the_square.isOverflown = overflow;
                the_square.updateCSS();
            }
        };

        the_square.onMouseUp = function () {
            var board = the_square.board;
            var destination = [];
            var ghostXY = [];
            var playedPiece = {};
            var startSquare = {};
            if (!board.isDragging) {
                return;
            }
            if (board.markOverflownSquare) {
                the_square.isOverflown = false;
                the_square.updateCSS();
            }
            startSquare = board.squares[board.selectedSquare];
            playedPiece = startSquare.piece;
            playedPiece.deselect();
            ghostXY = getCoordinate(playedPiece.ghost);
            destination = (the_square.name !== startSquare.name &&
                board.confirmMove(startSquare.name, the_square.name, false))
                ? getCoordinate(the_square.div)
                : getCoordinate(startSquare.div);
            playedPiece.startGhostAnimation(ghostXY, destination);
            board.isDragging = false;
        };

        the_square.showCanvas = function () {

            // Show the square's canvas.
            // Hide if already showed.

            if (the_square.hasCircle) {
                rAF(function () {
                    the_square.div.removeChild(the_square.canvas);
                });
            } else {
                rAF(function () {
                    the_square.div.appendChild(the_square.canvas);
                });
            }
            the_square.hasCircle = !the_square.hasCircle;
        };

        the_square.updateCSS = function () {

            // Update the CSS class.

            var className = the_square.getClassName();
            rAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.initialize();
        return the_square;
    }

    Square.isWhite = function (name) {

        // Check whether the square is white or not.

        var colNumber = 0;
        var rowNumber = 0;
        colNumber = chess.columns.indexOf(name[0]) + 1;
        rowNumber = Number(name[1]);
        return (rowNumber % 2 === 0)
            ? colNumber % 2 === 1
            : colNumber % 2 === 0;
    };

    // Chessboard --------------------------------------------------------------

    function Chessboard(containerId, config) {

        // The Chessboard class constructs an HTML chessboard.

        var the_board = {
            animationSpeed: config.animationSpeed,
            clickable: config.clickable,
            columnsBorder: null,
            container: null,
            draggable: config.draggable,
            game: null,
            hasDraggedClickedSquare: false,
            imagesExtension: config.imagesExtension,
            imagesPath: config.imagesPath,
            isDragging: false,
            isFlipped: config.flipped,
            legalMarksColor: config.legalMarksColor,
            markKingInCheck: config.markKingInCheck,
            markLastMove: config.markLastMove,
            markLegalSquares: config.markLegalSquares,
            markOverflownSquare: config.markOverflownSquare,
            markSelectedSquare: config.markSelectedSquare,
            notationBorder: config.notationBorder,
            pendingMove: null,
            promotionDiv: null,
            rowsBorder: null,
            selectedSquare: null,
            squares: null,
            squaresDiv: null,
            width: config.width
        };

        the_board.addNavigationData = function (animations, similarPieces) {

            // Change the position data after an animation occured.

            Object.keys(the_board.squares).forEach(function (key) {
                var square = the_board.squares[key];
                square.piece = null;
            });
            similarPieces.forEach(function (similarPiece) {
                similarPiece.square.piece = similarPiece;
            });
            animations.forEach(function (animation) {
                var arrival = animation.arrival;
                var piece = animation.piece;
                var start = animation.start;
                if (arrival === undefined) {
                    return;
                }
                if (start === undefined) {
                    arrival.piece = piece;
                    piece.square = arrival;
                } else {
                    arrival.piece = piece;
                    piece.square = arrival;
                }
            });
        };

        the_board.askPromotion = function (color) {

            // Display the promotion div to complete a move.

            var pieces = [
                chess.blackQueen, chess.blackRook,
                chess.blackBishop, chess.blackKnight
            ];
            var promotionDiv = the_board.promotionDiv;
            while (promotionDiv.hasChildNodes()) {
                promotionDiv.removeChild(promotionDiv.lastChild);
            }
            pieces.forEach(function (piece) {
                var button = document.createElement("BUTTON");
                var url = the_board.imagesPath + color + piece +
                    the_board.imagesExtension;
                button.className = css.promotionButton;
                button.setAttribute("name", piece);
                button.style.backgroundImage = "url('" + url + "')";
                button.addEventListener("click", the_board.onPromote);
                promotionDiv.appendChild(button);
            });
            the_board.lock();
            rAF(function () {
                promotionDiv.style.display = "block";
            });
        };

        the_board.clearHighlight = function () {

            // Remove all the highlight of the squares.

            Object.keys(the_board.squares).forEach(function (key) {
                var currentSquare = the_board.squares[key];
                if (currentSquare.hasCircle) {
                    currentSquare.showCanvas();
                }
                if (currentSquare.isCheck) {
                    currentSquare.isCheck = false;
                }
                if (currentSquare.isLastMove) {
                    currentSquare.isLastMove = false;
                }
                if (currentSquare.isSelected) {
                    currentSquare.isSelected = false;
                }
                currentSquare.updateCSS();
            });
            the_board.selectedSquare = null;
        };

        the_board.confirmMove = function (start, arrival, animate) {

            // Confirm a move :
            // - Test the legality.
            // - Ask for promotion if needed.

            var color = "";
            var index = 0;
            var move = start + "-" + arrival;
            var piece = "";
            var position = {};
            if (!regExp.move.test(move)) {
                throw new Error(error.invalidParameter);
            }
            index = the_board.game.fenStrings.length - 1;
            if (!the_board.game.isLegal(index, move)) {
                return false;
            }
            position = the_board.game.getNthPosition(index);
            piece = position.occupiedSquares[start];
            if (piece.toLowerCase() === chess.blackPawn &&
                regExp.promotion.test(move)) {
                the_board.pendingMove = move;
                color = (arrival[1] === chess.rows[7])
                    ? chess.white
                    : chess.black;
                the_board.askPromotion(color);
            } else {
                the_board.play(move, "", animate);
            }
            return true;
        };

        the_board.createBoard = function () {

            // Create the HTML board.

            var columns = chess.columns.split("");
            var rows = chess.rows.split("");
            the_board.squaresDiv = document.createElement("DIV");
            the_board.squaresDiv.style.width = the_board.width + "px";
            the_board.squaresDiv.style.height = the_board.width + "px";
            the_board.squaresDiv.className = css.squaresDiv;
            if (the_board.isFlipped) {
                // From h1 to a1.
                columns = columns.reverse();
            } else {
                // From a8 to h8.
                rows = rows.reverse();
            }
            rows.forEach(function buildRow(row) {
                columns.forEach(function (column) {
                    var square = the_board.squares[column + row];
                    the_board.squaresDiv.appendChild(square.div);
                });
            });
        };

        the_board.createColumnsBorder = function () {

            // Create the border with a-h coordinate.

            var columns = chess.columns.split("");
            the_board.columnsBorder = document.createElement("DIV");
            the_board.columnsBorder.className = css.columnsBorder;
            the_board.columnsBorder.style.width = the_board.width + "px";
            if (the_board.isFlipped) {
                columns = columns.reverse();
            }
            columns.forEach(function (column) {
                var borderFragment = document.createElement("DIV");
                borderFragment.className = css.columnsBorderFragment;
                borderFragment.innerHTML = column;
                the_board.columnsBorder.appendChild(borderFragment);
            });
        };

        the_board.createRowsBorder = function () {

            // Create the border with 1-8 coordinate.

            var lineHeight = Math.floor(the_board.width / 8) + "px";
            var rows = chess.rows.split("");
            the_board.rowsBorder = document.createElement("DIV");
            the_board.rowsBorder.className = css.rowsBorder;
            the_board.rowsBorder.style.height = the_board.width + "px";
            if (!the_board.isFlipped) {
                rows = rows.reverse();
            }
            rows.forEach(function (row) {
                var borderFragment = document.createElement("DIV");
                borderFragment.className = css.rowsBorderFragment;
                borderFragment.style.lineHeight = lineHeight;
                borderFragment.innerHTML = row;
                the_board.rowsBorder.appendChild(borderFragment);
            });
        };

        the_board.createSquares = function () {

            // Create the squares property.

            var columns = chess.columns.split("");
            var rows = chess.rows.split("");
            var squareWidth = Math.floor(the_board.width / 8);
            the_board.squares = {};
            columns.forEach(function (column) {
                rows.forEach(function (row) {
                    var name = column + row;
                    var square = new Square(name, squareWidth);
                    square.drawFilledCircle(the_board.legalMarksColor);
                    square.board = the_board;
                    the_board.squares[name] = square;
                });
            });
        };

        the_board.draw = function () {

            // Draw the empty chessboard.

            the_board.promotionDiv = document.createElement("DIV");
            the_board.promotionDiv.className = css.promotionDiv;
            the_board.createBoard();
            rAF(function () {
                the_board.squaresDiv.appendChild(the_board.promotionDiv);
                the_board.container.appendChild(the_board.squaresDiv);
            });
            if (!the_board.notationBorder) {
                return;
            }
            the_board.createRowsBorder();
            rAF(function () {
                the_board.container.insertBefore(the_board.rowsBorder,
                    the_board.squaresDiv);
            });
            the_board.createColumnsBorder();
            rAF(function () {
                the_board.container.appendChild(the_board.columnsBorder);
            });
        };

        the_board.empty = function () {

            // Remove all the pieces of the board.

            Object.keys(the_board.squares).forEach(function (key) {
                var currentSquare = the_board.squares[key];
                if (currentSquare.isEmpty()) {
                    return;
                }
                currentSquare.piece.animateRemove();
                currentSquare.piece.remove();
            });
        };

        the_board.getAnimations = function (position) {

            // Return an array of animations to perform to navigate.
            // Determine the pieces :
            // - to remove.
            // - to place.
            // - to animate.

            var animations = [];
            var newPosition = position.occupiedSquares;
            var newSquares = [];
            var oldDifferentSquares = [];
            var oldPosition = the_board.getPositionObject();
            Object.keys(oldPosition).forEach(function (square) {
                if (newPosition[square] !== oldPosition[square]) {
                    oldDifferentSquares.push(square);
                }
            });
            Object.keys(newPosition).forEach(function (newSquare) {
                var foundAnimation = false;
                var indexToRemove = 0;
                if (oldPosition[newSquare] === newPosition[newSquare]) {
                    return;
                }
                foundAnimation = oldDifferentSquares.some(function (oldSquare,
                    oldIndex) {
                    var animation = {};
                    var arrivalSquare = {};
                    var pieceToAnimate = {};
                    var startSquare = {};
                    if (newPosition[newSquare] !== oldPosition[oldSquare]) {
                        return false;
                    }
                    startSquare = the_board.squares[oldSquare];
                    arrivalSquare = the_board.squares[newSquare];
                    pieceToAnimate = startSquare.piece;
                    animation.start = startSquare;
                    animation.arrival = arrivalSquare;
                    animation.piece = pieceToAnimate;
                    animations.push(animation);
                    indexToRemove = oldIndex;
                    return true;
                });
                if (foundAnimation) {
                    oldDifferentSquares.splice(indexToRemove, 1);
                } else {
                    newSquares.push(newSquare);
                }
            });
            oldDifferentSquares.forEach(function (oldSquare) {
                var animation = {};
                var pieceToRemove = {};
                var startSquare = the_board.squares[oldSquare];
                pieceToRemove = startSquare.piece;
                animation.start = startSquare;
                animation.piece = pieceToRemove;
                animations.push(animation);
            });
            newSquares.forEach(function (newSquare) {
                var animation = {};
                var arrivalSquare = the_board.squares[newSquare];
                var char = newPosition[newSquare];
                animation.arrival = arrivalSquare;
                animation.piece = the_board.getNewPiece(char);
                animations.push(animation);
            });
            return animations;
        };

        the_board.getNewPiece = function (char) {

            // Create and return a new piece object.

            var name = (char.toLowerCase() === char)
                ? chess.black + char
                : chess.white + char.toLowerCase();
            var url = the_board.imagesPath + name + the_board.imagesExtension;
            var width = Math.floor(the_board.width / 8);
            return new Piece(name, url, width);
        };

        the_board.getPositionObject = function () {

            // Return a position object of the pieces places.

            var occupiedSquares = {};
            Object.keys(the_board.squares).forEach(function (key) {
                var pieceChar = "";
                var pieceName = "";
                var square = the_board.squares[key];
                if (square.isEmpty()) {
                    return;
                }
                pieceName = square.piece.name;
                pieceChar = (pieceName[0] === chess.white)
                    ? pieceName[1].toUpperCase()
                    : pieceName[1].toLowerCase();
                occupiedSquares[key] = pieceChar;
            });
            return occupiedSquares;
        };

        the_board.getSimilarPieces = function (position) {

            // Returns an array of similar pieces compared to another position.

            var newPosition = position.occupiedSquares;
            var oldPosition = the_board.getPositionObject();
            var similarPieces = [];
            Object.keys(newPosition).forEach(function (square) {
                var newPiece = newPosition[square];
                var oldPiece = oldPosition[square];
                var piece = {};
                if (oldPiece === newPiece) {
                    piece = the_board.squares[square].piece;
                    similarPieces.push(piece);
                }
            });
            return similarPieces;
        };

        the_board.highlightKing = function (position) {

            // Highlight a king in check.

            var kingSquare = "";
            if (!the_board.markKingInCheck ||
                !position.isInCheck(position.activeColor)) {
                return;
            }
            kingSquare = position.getKingSquare(position.activeColor);
            the_board.squares[kingSquare].isCheck = true;
            the_board.squares[kingSquare].updateCSS();
        };

        the_board.highlightLastMove = function (index) {

            // Highlight the squares of the last move.

            var lastMove = "";
            var lastMoveArrival = "";
            var lastMoveStart = "";
            if (!the_board.markLastMove || index < 1) {
                return;
            }
            lastMove = the_board.game.moves[index - 1];
            lastMoveArrival = lastMove.substr(3, 2);
            the_board.squares[lastMoveArrival].isLastMove = true;
            the_board.squares[lastMoveArrival].updateCSS();
            lastMoveStart = lastMove.substr(0, 2);
            the_board.squares[lastMoveStart].isLastMove = true;
            the_board.squares[lastMoveStart].updateCSS();
        };

        the_board.initialize = function () {

            // Initialize the board object.

            the_board.container = document.getElementById(containerId);
            switch (the_board.animationSpeed) {
                case "slow":
                    the_board.animationSpeed = 12;
                    break;
                case "normal":
                    the_board.animationSpeed = 8;
                    break;
                case "fast":
                    the_board.animationSpeed = 4;
                    break;
                case "instant":
                    the_board.animationSpeed = Infinity;
                    break;
                default:
                    the_board.animationSpeed = 8;
            }
            the_board.game = new Chessgame();
            document.addEventListener("mousemove", the_board.onMouseMove);
            document.addEventListener("mouseup", the_board.onMouseUp);
        };

        the_board.lock = function () {

            // Lock the pieces.

            the_board.clickable = false;
            the_board.draggable = false;
        };

        the_board.move = function (move, promotion, animate) {

            // Play the desired move on the board.
            // Manage special moves (castle, en passant, promotion).

            var arrival = "";
            var arrivalSquare = {};
            var emptyArrival = false;
            var moveObject = {};
            var piece = {};
            var start = move.substr(0, 2);
            var startSquare = the_board.squares[start];
            piece = startSquare.piece;
            arrival = move.substr(3, 2);
            arrivalSquare = the_board.squares[arrival];
            emptyArrival = arrivalSquare.isEmpty();
            moveObject.arrival = arrivalSquare;
            moveObject.isCapture = !emptyArrival;
            piece.move(moveObject, animate);
            piece.remove();
            piece.put(arrivalSquare);
            if (regExp.castle.test(move) &&
                piece.name[1] === chess.blackKing) {
                the_board.moveCastle(arrival);
                return;
            }
            if (piece.name[1] === chess.blackPawn) {
                if (emptyArrival && regExp.enPassant.test(move) &&
                    start[0] !== arrival[0]) {
                    the_board.moveEnPassant(arrival);
                } else if (regExp.promotion.test(move)) {
                    the_board.movePromotion(piece, arrival, promotion);
                }
            }
        };

        the_board.moveCastle = function (arrival) {

            // Play a move if it's a castle.

            var moveObject = {};
            var rook = {};
            var rookArrival = "";
            var rookStart = "";
            if (arrival[0] === chess.columns[2]) {
                rookStart = chess.columns[0];
                rookArrival = chess.columns[3];
            } else if (arrival[0] === chess.columns[6]) {
                rookStart = chess.columns[7];
                rookArrival = chess.columns[5];
            }
            rookStart += arrival[1];
            rookArrival += arrival[1];
            if (the_board.squares[rookStart].isEmpty()) {
                throw new Error(error.illegalMove);
            }
            rook = the_board.squares[rookStart].piece;
            moveObject.arrival = the_board.squares[rookArrival];
            moveObject.isCapture = false;
            rook.move(moveObject, true);
            rook.remove();
            rook.put(the_board.squares[rookArrival]);
        };

        the_board.moveEnPassant = function (arrival) {

            // Play a move if it's a move en passant.

            var enPassant = "";
            var enPassantSquare = {};
            enPassant = (arrival[1] === chess.rows[2])
                ? arrival[0] + chess.rows[3]
                : arrival[0] + chess.rows[4];
            enPassantSquare = the_board.squares[enPassant];
            if (enPassantSquare.isEmpty()) {
                throw new Error(error.illegalMove);
            }
            enPassantSquare.piece.fadingRemove();
            enPassantSquare.piece.remove();
        };

        the_board.movePromotion = function (playedPiece, arrival, promotion) {

            // Play a move if it's a promotion.

            var arrivalSquare = the_board.squares[arrival];
            var newPiece = {};
            var newPieceColor = "";
            var newPieceName = "";
            var url = "";
            var width = Math.floor(the_board.width / 8);
            promotion = promotion || chess.blackQueen;
            newPieceColor = (arrival[1] === chess.rows[0])
                ? chess.black
                : chess.white;
            newPieceName = newPieceColor + promotion.toLowerCase();
            url = the_board.imagesPath + newPieceName +
                the_board.imagesExtension;
            newPiece = new Piece(newPieceName, url, width);
            playedPiece.fadingRemove();
            playedPiece.remove();
            newPiece.fadingPlace(arrivalSquare);
            newPiece.put(arrivalSquare);
        };

        the_board.navigate = function (index) {

            // Navigate to the desired position.
            // Update the board position and the highlighting.

            var animations = [];
            var maxIndex = the_board.game.fenStrings.length - 1;
            var position = {};
            var similarPieces = [];
            if (index < 0 || index > maxIndex) {
                throw new Error(error.invalidParameter);
            }
            position = the_board.game.getNthPosition(index);
            the_board.updateHighlight(index, position);
            animations = the_board.getAnimations(position);
            similarPieces = the_board.getSimilarPieces(position);
            the_board.performAnimations(animations);
            the_board.addNavigationData(animations, similarPieces);
            if (index < maxIndex) {
                the_board.lock();
            } else {
                the_board.unlock();
            }
        };

        the_board.onMouseMove = function (e) {
            var activeSquare = {};
            if (!the_board.isDragging) {
                return;
            }
            activeSquare = the_board.squares[the_board.selectedSquare];
            activeSquare.piece.setGhostPositionCursor(e);
        };

        the_board.onMouseUp = function () {
            var ghostXY = [];
            var selectedSquare = {};
            var squareXY = [];
            if (!the_board.isDragging) {
                return;
            }
            selectedSquare = the_board.squares[the_board.selectedSquare];
            ghostXY = getCoordinate(selectedSquare.piece.ghost);
            squareXY = getCoordinate(selectedSquare.div);
            selectedSquare.piece.startGhostAnimation(ghostXY, squareXY);
            selectedSquare.piece.deselect();
            the_board.isDragging = false;
        };

        the_board.onPromote = function (e) {
            the_board.play(the_board.pendingMove, e.target.name, true);
            the_board.pendingMove = null;
            the_board.unlock();
            rAF(function () {
                the_board.promotionDiv.style.display = "none";
            });
        };

        the_board.performAnimations = function (animations) {

            // Animate the navigation to a position.

            animations.forEach(function (animation) {
                var arrival = animation.arrival;
                var move = {};
                var piece = animation.piece;
                var start = animation.start;
                if (arrival === undefined) {
                    piece.fadingRemove();
                } else if (start === undefined) {
                    piece.fadingPlace(arrival);
                } else {
                    move.arrival = arrival;
                    move.isCapture = false;
                    piece.move(move, true);
                }
            });
        };

        the_board.play = function (move, promotion, animate) {

            // Play a move on the board and store it in the game.

            var currentPosition = {};
            var lastIndex = the_board.game.fenStrings.length - 1;
            var nextPosition = {};
            the_board.move(move, promotion, animate);
            the_board.game.addMove(move, promotion);
            currentPosition = the_board.game.getNthPosition(lastIndex);
            nextPosition = currentPosition.getNextPosition(move, promotion);
            the_board.updateHighlight(lastIndex + 1, nextPosition);
            if (typeof event.onMovePlayed === "function") {
                rAF(event.onMovePlayed);
            }
        };

        the_board.setFEN = function (fen) {

            // Load a position from a FEN string.

            var squares = {};
            fen = fen || chess.defaultFEN;
            if (!Position.isValidFEN(fen, true)) {
                throw new SyntaxError(error.invalidFEN);
            }
            the_board.empty();
            squares = Position.fenToObject(fen);
            Object.keys(squares).forEach(function (squareName) {
                var char = squares[squareName];
                var newPiece = the_board.getNewPiece(char);
                var square = the_board.squares[squareName];
                newPiece.animatePut(square);
                newPiece.put(square);
            });
        };

        the_board.unlock = function () {

            // Unlock the pieces.

            the_board.clickable = config.clickable;
            the_board.draggable = config.draggable;
        };

        the_board.updateHighlight = function (index, position) {

            // Update the highlight (check and last move) on the board.

            the_board.clearHighlight();
            the_board.highlightKing(position);
            the_board.highlightLastMove(index);
        };

        the_board.initialize();
        return the_board;
    }

    // API ---------------------------------------------------------------------

    abConfig = abConfig || {};
    Object.keys(defaultConfig).forEach(function (key) {
        if (!abConfig.hasOwnProperty(key)) {
            abConfig[key] = defaultConfig[key];
        }
    });
    abBoard = new Chessboard(containerId, abConfig);
    return {
        DEFAULT_FEN: chess.defaultFEN,

        draw: function () {

            // Create the HTML squares.
            // Draw the chessboard.

            abBoard.createSquares();
            abBoard.draw();
        },

        flip: function () {

            // Change the board orientation.

            function removeChildren() {
                while (abBoard.container.hasChildNodes()) {
                    abBoard.container.removeChild(abBoard.container.lastChild);
                }
            }
            rAF(removeChildren);
            abBoard.isFlipped = !abBoard.isFlipped;
            abBoard.draw();
        },

        getActiveColor: function (n) {

            // Return the active color b|w in the n-th position.

            var position = abBoard.game.getNthPosition(n);
            return position.activeColor;
        },

        getFEN: function (n) {

            // Return the n-th FEN string of the game.

            var lastIndex = abBoard.game.fenStrings.length - 1;
            if (typeof n !== "number" || n < 0 || n > lastIndex) {
                throw new Error(error.invalidParameter);
            }
            return abBoard.game.fenStrings[n];
        },

        getGameInfo: function (info) {

            // Return the desired information.

            return abBoard.game.tags[info];
        },

        getGameMoves: function () {

            // Return an array of the moves of the game.

            return abBoard.game.moves;
        },

        getGameMovesPGN: function () {

            // Return an array of the moves of the game in PGN notation.

            return abBoard.game.pgnMoves;
        },

        getLastPositionIndex: function () {

            // Return the index of the last position of the game.

            return abBoard.game.fenStrings.length - 1;
        },

        getLegalMoves: function (n) {

            // Return an array of the legal moves in the n-th position.

            var position = abBoard.game.getNthPosition(n);
            return position.getLegalMoves();
        },

        getPGN: function () {

            // Return the full PGN string.

            return abBoard.game.exportPGN();
        },

        is50MovesDraw: function (n) {

            // Check if the draw by 50 moves rule can be claimed
            // in the n-th position.

            var position = abBoard.game.getNthPosition(n);
            return position.isDrawBy50MovesRule();
        },

        isCheckmate: function (n) {

            // Check if the active player is checkmated in the n-th position.

            var position = abBoard.game.getNthPosition(n);
            return position.isCheckmate();
        },

        isInCheck: function (n) {

            // Check if the active player is in check in the n-th position.

            return abBoard.game.isInCheck(n);
        },

        isInsufficientMaterialDraw: function (n) {

            // Check if the material is insufficient to win
            // in the n-th position.

            var position = abBoard.game.getNthPosition(n);
            return position.isDrawByInsufficientMaterial();
        },

        isLegal: function (n, move) {

            // Check if a move is legal in the n-th position.

            if (!regExp.move.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            return abBoard.game.isLegal(n, move);
        },

        isStalemate: function (n) {

            // Check if the active player is stalemated in the n-th position.

            var activeColor = "";
            var position = abBoard.game.getNthPosition(n);
            activeColor = position.activeColor;
            return !position.isInCheck(activeColor) &&
                !position.hasLegalMoves();
        },

        isValidFEN: function (fen, onlyCheckPosition) {

            // Check if a FEN string is valid.

            return Position.isValidFEN(fen, onlyCheckPosition);
        },

        isValidPGN: function (pgn) {

            // Check if a PGN string is valid.

            return Chessgame.isValidPGN(pgn);
        },

        navigate: function (index) {

            // Navigate to a position.

            return abBoard.navigate(index);
        },

        onMovePlayed: function (callback) {

            // Event fired when a move has been played.

            if (typeof callback !== "function") {
                throw new Error(error.invalidParameter);
            }
            event.onMovePlayed = callback;
        },

        play: function (move, promotion) {

            // Play the desired move.

            var lastIndex = 0;
            if (!regExp.move.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            lastIndex = abBoard.game.fenStrings.length - 1;
            if (!abBoard.game.isLegal(lastIndex, move)) {
                throw new SyntaxError(error.illegalMove);
            }
            abBoard.play(move, promotion, true);
        },

        reset: function () {

            // Reset the game and the board.

            abBoard.setFEN();
            abBoard.clearHighlight();
            abBoard.unlock();
            abBoard.game = new Chessgame();
        },

        setFEN: function (fen) {

            // Load the FEN position on the board.

            abBoard.setFEN(fen);
        },

        setGameInfo: function (info, value) {

            // Set the desired game information.

            abBoard.game.tags[info] = value;
        },

        setPGN: function (pgn) {

            // Set the PGN in the game.

            abBoard.game.setPGN(pgn);
        }

    };
};
