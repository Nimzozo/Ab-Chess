// AbChess-0.2.5.js
// 2017-03-17
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
        lastMoveSquare: "square_last-move",
        overflownSquare: "square_overflown",
        pieceGhost: "piece-ghost",
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

    function rAF(callback) {
        return window.requestAnimationFrame(callback) ||
            window.webkitRequestAnimationFrame(callback) ||
            window.mozRequestAnimationFrame(callback) ||
            window.oRequestAnimationFrame(callback) ||
            window.setTimeout(callback, 1000 / 60);
    }

    // Regular expressions.

    var regExp = {
        castle: /^e(?:1-c1|1-g1|8-c8|8-g8)$/,
        comment: /\{[^]+?\}/gm,
        enPassant: /^[a-h]4-[a-h]3|[a-h]5-[a-h]6$/,
        fen: /^(?:[bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(K?Q?k?q?|-)\s([a-h][36]|-)\s(0|[1-9]\d{0,2})\s([1-9]\d{0,2})$/,
        fenRow: /^[bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8$/i,
        move: /^[a-h][1-8]-[a-h][1-8]$/,
        pgnCastle: /^O-O(?:-O)?(?:\+|#)?$/,
        pgnKingMove: /^(?:Kx?([a-h][1-8])|O-O(?:-O)?)(?:\+|#)?$/,
        pgnMove: /(?:[1-9]\d{0,2}\.(?:\.\.)?\s?)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm,
        pgnMoveNumber: /[1-9]\d{0,2}\.(?:\.\.)?\s?/,
        pgnPawnMove: /^([a-h]?)x?([a-h][1-8])(\=[BNQR])?(?:\+|#)?$/,
        pgnPieceMove: /^[BNQR]([a-h]?[1-8]?)x?([a-h][1-8])(?:\+|#)?$/,
        pgnPromotion: /\=[BNQR]/,
        pgnShortMove: /^(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?$/,
        pieceChar: /[bknpqr]/i,
        promotion: /^[a-h]2-[a-h]1|[a-h]7-[a-h]8$/,
        result: /1-0|0-1|1\/2-1\/2|\*/,
        row: /[1-8]/,
        tagPair: /\[[A-Z][^]+?\s"[^]+?"\]/gm,
        tagPairCapture: /\[(\S+)\s"(.*)"\]/,
        tagPairsSection: /(?:\[[^]+?\s"[^]+?"\]\n){7,}\n/gm,
        variation: /\([^()]*?\)/gm
    };

    // Position ----------------------------------------------------------------

    function Position(fen) {

        // A chess Position is constructed with a FEN string.
        // It represents the pieces placement plus some extra data.

        var thePosition = {
            activeColor: "",
            allowedCastles: "",
            enPassantSquare: "",
            fenString: fen,
            fullmoveNumber: 0,
            halfmoveClock: 0,
            occupiedSquares: null
        };

        thePosition.checkCannibalism = function (start, arrival) {

            // Check if the move is cannibalism.

            var squares = thePosition.occupiedSquares;
            var whiteArrival = false;
            var whiteStart = false;
            if (!squares.hasOwnProperty(arrival)) {
                return false;
            }
            whiteStart = squares[start] === squares[start].toUpperCase();
            whiteArrival = squares[arrival] === squares[arrival].toUpperCase();
            return whiteStart === whiteArrival;
        };

        thePosition.checkLegality = function (move) {

            // Check if a move is legal :
            // - active color.
            // - cannibalism.
            // - move is playable.
            // - king is not in check.

            var arrival = move.substr(3, 2);
            var nextPosition = {};
            var start = move.substr(0, 2);
            var targets = [];
            if (!regExp.move.test(move) || !thePosition.checkTurn(start) ||
                thePosition.checkCannibalism(start, arrival)) {
                return false;
            }
            targets = thePosition.getTargets(start, false);
            if (targets.indexOf(arrival) === -1) {
                return false;
            }
            nextPosition = thePosition.getNextPosition(move);
            return !nextPosition.isInCheck(thePosition.activeColor);
        };

        thePosition.checkTurn = function (start) {

            // Check if the move is legal according to the turn.

            var color = "";
            var position = thePosition.occupiedSquares;
            if (!position.hasOwnProperty(start)) {
                return false;
            }
            color = (position[start] === position[start].toUpperCase())
                ? chess.white
                : chess.black;
            return thePosition.activeColor === color;
        };

        thePosition.getKingSquare = function (color) {

            // Return the square where the desired king is placed.

            var desiredKing = (color === chess.black)
                ? chess.blackKing
                : chess.whiteKing;
            var square = "";
            Object.keys(thePosition.occupiedSquares).some(function (key) {
                if (thePosition.occupiedSquares[key] === desiredKing) {
                    square = key;
                    return true;
                }
                return false;
            });
            return square;
        };

        thePosition.getLegalMoves = function () {

            // Return an array of all legal moves.

            var legalMoves = [];
            var pieces = [];
            pieces = thePosition.getPiecesPlaces(thePosition.activeColor);
            pieces.forEach(function (square) {
                var legalSquares = thePosition.getLegalSquares(square);
                legalSquares.forEach(function (arrival) {
                    var move = square + "-" + arrival;
                    legalMoves.push(move);
                });
            });
            return legalMoves;
        };

        thePosition.getLegalSquares = function (start) {

            // Return an array of legal arrival squares.

            var legalSquares = [];
            var targets = [];
            targets = thePosition.getTargets(start, false);
            targets.forEach(function (target) {
                var move = start + "-" + target;
                if (thePosition.checkLegality(move)) {
                    legalSquares.push(target);
                }
            });
            return legalSquares;
        };

        thePosition.getLineTargets = function (start) {

            // Return an array of linear squares without collision.

            var alliesPlaces = [];
            var color = "";
            var columnNumber = 0;
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var piece = thePosition.occupiedSquares[start];
            var rowNumber = 0;
            var targets = [];
            var vectors = [];
            columnNumber = chess.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            color = (piece.toLowerCase() === piece)
                ? chess.black
                : chess.white;
            alliesPlaces = thePosition.getPiecesPlaces(color);
            ennemiesColor = (color === chess.black)
                ? chess.white
                : chess.black;
            ennemiesPlaces = thePosition.getPiecesPlaces(ennemiesColor);
            if (piece.toLowerCase() === chess.blackBishop) {
                vectors = chess.bishopVectors;
            } else if (piece.toLowerCase() === chess.blackQueen) {
                vectors = chess.bishopVectors.concat(chess.rookVectors);
            } else if (piece.toLowerCase() === chess.blackRook) {
                vectors = chess.rookVectors;
            }
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

        thePosition.getNextAllowedCastles = function (move) {

            // Return the updated allowed castles.

            var arrival = "";
            var castles = thePosition.allowedCastles;
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

        thePosition.getNextEnPassant = function (move) {

            // Return the new en passant square.

            var arrivalRowNumber = 0;
            var arrivalSquare = "";
            var nextEnPassantTarget = "-";
            var playedPiece = "";
            var startRowNumber = 0;
            var startSquare = move.substr(0, 2);
            playedPiece = thePosition.occupiedSquares[startSquare];
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

        thePosition.getNextFENPosition = function (move, promotion) {

            // Return the next FEN position string.

            var arrival = move.substr(3, 2);
            var enPassantPawn = "";
            var newPosition = {};
            var piece = "";
            var rookArrival = "";
            var rookStart = "";
            var start = move.substr(0, 2);
            newPosition = Position.fenToObject(thePosition.fenString);
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
                if (arrival === thePosition.enPassantSquare &&
                    regExp.enPassant.test(move)) {
                    enPassantPawn = thePosition.enPassantSquare[0] + start[1];
                    delete newPosition[enPassantPawn];
                } else if (regExp.promotion.test(move)) {
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

        thePosition.getNextHalfmoveClock = function (move) {

            // Return the new halfmoveclock.

            var arrival = move.substr(3, 2);
            var playedPiece = "";
            var start = move.substr(0, 2);
            playedPiece = thePosition.occupiedSquares[start];
            return (playedPiece.toLowerCase() === chess.blackPawn ||
                thePosition.occupiedSquares.hasOwnProperty(arrival))
                ? 0
                : thePosition.halfmoveClock + 1;
        };

        thePosition.getNextPosition = function (move, promotion) {

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
            if (thePosition.activeColor === chess.white) {
                newActiveColor = chess.black;
                newFullmove = thePosition.fullmoveNumber;
            } else {
                newActiveColor = chess.white;
                newFullmove = thePosition.fullmoveNumber + 1;
            }
            newPosition = thePosition.getNextFENPosition(move, promotion);
            newAllowedCastles = thePosition.getNextAllowedCastles(move);
            newEnPassant = thePosition.getNextEnPassant(move);
            newHalfmove = thePosition.getNextHalfmoveClock(move);
            newFEN = newPosition +
                " " + newActiveColor +
                " " + newAllowedCastles +
                " " + newEnPassant +
                " " + newHalfmove +
                " " + newFullmove;
            return new Position(newFEN);
        };

        thePosition.getPiecesPlaces = function (color) {

            // Return an array of the names of the squares where are placed
            // the pieces of a specific color.

            var occupiedSquares = thePosition.occupiedSquares;
            return Object.keys(occupiedSquares).filter(function (square) {
                var piece = thePosition.occupiedSquares[square];
                return (color === chess.white &&
                    piece === piece.toUpperCase()) ||
                    (color === chess.black && piece === piece.toLowerCase());
            });
        };

        thePosition.getTargets = function (start, onlyAttack) {

            // Return the target a specific piece can reach.
            // A target is a square that a piece controls or can move on.
            // The onlyAttack parameter allows to filter king moves
            // and pawn non-attacking moves.

            var piece = thePosition.occupiedSquares[start];
            if (/[bqr]/i.test(piece)) {
                return thePosition.getLineTargets(start);
            }
            if (piece.toLowerCase() === chess.blackKing) {
                return thePosition.getTargetsKing(start, onlyAttack);
            }
            if (piece.toLowerCase() === chess.blackKnight) {
                return thePosition.getVectorTargets(start, chess.knightVectors);
            }
            if (piece.toLowerCase() === chess.blackPawn) {
                return thePosition.getTargetsPawn(start, onlyAttack);
            }
            throw new SyntaxError(error.invalidParameter);
        };

        thePosition.getTargetsCastle = function (start) {

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
            var piece = thePosition.occupiedSquares[start];
            var rows = [chess.rows[0], chess.rows[7]];
            var targets = [];
            i = (piece.toUpperCase() === piece)
                ? 0
                : 1;
            castleStart = chess.columns[4] + rows[i];
            if (start !== castleStart ||
                thePosition.isControlledBy(castleStart, colors[i])) {
                return targets;
            }
            function hasNoCollision(column) {
                var square = column + rows[i];
                return !thePosition.occupiedSquares.hasOwnProperty(square);
            }
            castles.forEach(function (value, index) {
                var square = "";
                if (thePosition.allowedCastles.indexOf(value[i]) === -1) {
                    return;
                }
                square = adjacentColumns[index] + rows[i];
                if (thePosition.isControlledBy(square, colors[i])) {
                    return;
                }
                if (collisions[index].every(hasNoCollision)) {
                    square = legalColumns[index] + rows[i];
                    targets.push(square);
                }
            });
            return targets;
        };

        thePosition.getTargetsKing = function (start, noCastles) {

            // Return an array of squares a king on a specific square can reach.
            // Add castles, filter ennemy king opposition.

            var castleTargets = [];
            var ennemiesColor = "";
            var ennemyKingSquare = "";
            var ennemyKingTargets = [];
            var normalTargets = [];
            var piece = thePosition.occupiedSquares[start];
            var targets = [];
            normalTargets = thePosition.getVectorTargets(start,
                chess.kingVectors);
            ennemiesColor = (piece.toLowerCase() === piece)
                ? chess.white
                : chess.black;
            ennemyKingSquare = thePosition.getKingSquare(ennemiesColor);
            ennemyKingTargets = thePosition.getVectorTargets(
                ennemyKingSquare, chess.kingVectors);
            targets = normalTargets.filter(function (target) {
                return ennemyKingTargets.indexOf(target) === -1;
            });
            if (noCastles) {
                return targets;
            }
            castleTargets = thePosition.getTargetsCastle(start);
            return targets.concat(castleTargets);
        };

        thePosition.getTargetsPawn = function (start, onlyAttack) {

            // Return an array of squares a pawn on a specific square can reach.
            // Pawns can move, take (en passant), promote.
            // Use onlyAttack to get only attacking moves.

            var attacks = thePosition.getTargetsPawnAttack(start, onlyAttack);
            if (onlyAttack) {
                return attacks;
            }
            return attacks.concat(thePosition.getTargetsPawnMove(start));
        };

        thePosition.getTargetsPawnAttack = function (start, onlyAttack) {

            // Return an array of attacking pawn moves.

            var colDirections = [-1, 1];
            var columnNumber = 0;
            var direction = 0;
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var piece = thePosition.occupiedSquares[start];
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
            ennemiesPlaces = thePosition.getPiecesPlaces(ennemiesColor);
            colDirections.forEach(function (colDirection) {
                var testCol = columnNumber + colDirection;
                var testSquare = chess.columns[testCol - 1] + testRow;
                if (ennemiesPlaces.indexOf(testSquare) > -1 ||
                    thePosition.enPassantSquare === testSquare) {
                    targets.push(testSquare);
                } else if (onlyAttack) {
                    targets.push(testSquare);
                }
            });
            return targets;
        };

        thePosition.getTargetsPawnMove = function (start) {

            // Return an array of squares a pawn can reach (no capture).

            var colNumber = 0;
            var direction = 0;
            var piece = thePosition.occupiedSquares[start];
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
            if (thePosition.occupiedSquares.hasOwnProperty(testSquare)) {
                return targets;
            }
            targets.push(testSquare);
            if ((rowNumber === 2 && direction === 1) ||
                (rowNumber === 7 && direction === -1)) {
                testRow = rowNumber + 2 * direction;
                testSquare = chess.columns[testCol - 1] + testRow;
                if (!thePosition.occupiedSquares.hasOwnProperty(testSquare)) {
                    targets.push(testSquare);
                }
            }
            return targets;
        };

        thePosition.getVectorTargets = function (start, vectors) {

            // Return an array of squares found with vectors.

            var columnNumber = 0;
            var rowNumber = 0;
            var targets = [];
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
                testSquare = chess.columns[testColNumber - 1] + testRowNumber;
                targets.push(testSquare);
            });
            return targets;
        };

        thePosition.hasLegalMoves = function () {

            // Return true if the position is playable.

            var piecesPlaces = thePosition.getPiecesPlaces(
                thePosition.activeColor);
            return piecesPlaces.some(function (square) {
                var legalSquares = thePosition.getLegalSquares(square);
                return legalSquares.length > 0;
            });
        };

        thePosition.isControlledBy = function (square, color) {

            // Check if the desired square is controlled
            // by a specified color.

            var ennemies = thePosition.getPiecesPlaces(color);
            return ennemies.some(function (ennemy) {
                var targets = thePosition.getTargets(ennemy, true);
                return targets.indexOf(square) > -1;
            });
        };

        thePosition.isInCheck = function (color) {

            // Check if the desired king is in check.

            var ennemiesColor = "";
            var kingSquare = "";
            ennemiesColor = (color === chess.white)
                ? chess.black
                : chess.white;
            kingSquare = thePosition.getKingSquare(color);
            return thePosition.isControlledBy(kingSquare, ennemiesColor);
        };

        thePosition.isInsufficientMaterial = function () {

            // Check if the position is drawn by insufficient material.

            var blackPlaces = [];
            var insufficientBlack = false;
            var insufficients = [
                [chess.blackKing, chess.blackBishop],
                [chess.blackKing, chess.blackKnight],
                [chess.blackKing, chess.blackKnight, chess.blackKnight]
            ];
            var pieces = [];
            var whitePlaces = [];
            blackPlaces = thePosition.getPiecesPlaces(chess.black);
            if (blackPlaces.length > 3) {
                return false;
            }
            whitePlaces = thePosition.getPiecesPlaces(chess.white);
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
                    var piece = thePosition.occupiedSquares[square];
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
                var piece = thePosition.occupiedSquares[square];
                pieces.push(piece.toLowerCase());
            });
            return insufficients.some(function (insufficient) {
                return sameArray(insufficient, pieces);
            });
        };

        thePosition.initialize = function () {

            // Initialize and return the position object.

            var fenMatches = [];
            if (!Position.isValidFEN(fen)) {
                throw new Error(error.invalidFEN);
            }
            fenMatches = regExp.fen.exec(fen);
            thePosition.activeColor = fenMatches[1];
            thePosition.allowedCastles = fenMatches[2];
            thePosition.enPassantSquare = fenMatches[3];
            thePosition.fullmoveNumber = Number(fenMatches[5]);
            thePosition.halfmoveClock = Number(fenMatches[4]);
            thePosition.occupiedSquares = Position.fenToObject(fen);
            return thePosition;
        };

        thePosition.initialize();
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

        var theGame = {
            comments: [],
            fenStrings: [chess.defaultFEN],
            moves: [],
            pgnMoves: [],
            tags: null
        };

        theGame.addMove = function (move, promotion) {

            // Play a move and store the new FEN string.

            var lastIndex = theGame.fenStrings.length - 1;
            var lastPosition = theGame.getNthPosition(lastIndex);
            var newPosition = {};
            var pgnMove = "";
            promotion = promotion || "";
            newPosition = lastPosition.getNextPosition(move, promotion);
            theGame.fenStrings.push(newPosition.fenString);
            theGame.updateResult(newPosition);
            theGame.moves.push(move);
            pgnMove = theGame.getPGNMove(lastIndex, promotion);
            theGame.pgnMoves.push(pgnMove);
        };

        theGame.exportPGN = function () {

            // Return the PGN string.
            // https://www.chessclub.com/user/help/PGN-spec

            var lineCount = 0;
            var lineFeed = "\n";
            var lineLimit = 80;
            var pgn = "";
            Object.keys(theGame.tags).forEach(function (tag) {
                var value = theGame.tags[tag];
                pgn += "[" + tag + " \"" + value + "\"]" + lineFeed;
            });
            pgn += lineFeed;
            theGame.pgnMoves.forEach(function (move, index) {
                var moveText = "";
                if (index % 2 === 0) {
                    moveText = (index / 2 + 1) + ". ";
                }
                moveText += move;
                lineCount += 1 + moveText.length;
                if (lineCount < lineLimit) {
                    pgn += " " + moveText;
                } else {
                    pgn += lineFeed + moveText;
                    lineCount = moveText.length;
                }
            });
            return pgn + " " + theGame.tags.Result + lineFeed + lineFeed;
        };

        theGame.getNthPosition = function (n) {

            // Return the n-th position object.

            var fen = "";
            var lastIndex = 0;
            lastIndex = theGame.fenStrings.length - 1;
            if (typeof n !== "number" || n < 0 || n > lastIndex) {
                throw new Error(error.invalidParameter);
            }
            fen = theGame.fenStrings[n];
            return new Position(fen);
        };

        theGame.getPGNKing = function (n) {

            // Return the PGN notation for a king move.

            var arrival = "";
            var move = theGame.moves[n];
            var pgnMove = "";
            var playedPiece = "";
            var position = theGame.getNthPosition(n);
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

        theGame.getPGNMove = function (n, promotion) {

            // Return the PGN notation for a move.

            var move = theGame.moves[n];
            var pgnMove = "";
            var playedPiece = "";
            var position = theGame.getNthPosition(n);
            var start = move.substr(0, 2);
            playedPiece = position.occupiedSquares[start];
            if (playedPiece.toLowerCase() === chess.blackKing) {
                pgnMove = theGame.getPGNKing(n);
            } else if (playedPiece.toLowerCase() === chess.blackPawn) {
                pgnMove = theGame.getPGNPawn(n, promotion);
            } else {
                pgnMove = theGame.getPGNPiece(n);
            }
            return pgnMove + theGame.getPGNSymbol(n, promotion);
        };

        theGame.getPGNPawn = function (n, promotion) {

            // Return the PGN notation for a pawn move.

            var arrival = "";
            var isCapture = false;
            var move = theGame.moves[n];
            var pgnMove = "";
            var position = theGame.getNthPosition(n);
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

        theGame.getPGNPiece = function (n) {

            // Return the PGN notation for a piece (non-pawn) move.

            var arrival = "";
            var candidates = [];
            var move = theGame.moves[n];
            var occupiedSquares = {};
            var pgnMove = "";
            var playedPiece = "";
            var position = theGame.getNthPosition(n);
            var sameColumn = false;
            var sameRow = false;
            var start = move.substr(0, 2);
            occupiedSquares = position.occupiedSquares;
            playedPiece = occupiedSquares[start];
            pgnMove = playedPiece.toUpperCase();
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
            if (candidates.length > 0) {
                sameColumn = candidates.some(function (candidate) {
                    return candidate[0] === start[0];
                });
                sameRow = candidates.some(function (candidate) {
                    return candidate[1] === start[1];
                });
                if (sameColumn) {
                    pgnMove += (sameRow)
                        ? start
                        : start[1];
                } else {
                    pgnMove += start[0];
                }
            }
            if (occupiedSquares.hasOwnProperty(arrival)) {
                pgnMove += chess.captureSymbol;
            }
            pgnMove += arrival;
            return pgnMove;
        };

        theGame.getPGNSymbol = function (n, promotion) {

            // Return the check or checkmate symbol for a PGN move if needed.

            var move = theGame.moves[n];
            var nextPosition = {};
            var position = theGame.getNthPosition(n);
            nextPosition = position.getNextPosition(move, promotion);
            if (!nextPosition.isInCheck(nextPosition.activeColor)) {
                return "";
            }
            return (!nextPosition.hasLegalMoves())
                ? chess.checkmateSymbol
                : chess.checkSymbol;
        };

        theGame.getSimpleKingMove = function (n) {

            // Return a simple move from a PGN king move.

            var arrival = "";
            var matches = [];
            var pgnMove = theGame.pgnMoves[n];
            var position = theGame.getNthPosition(n);
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

        theGame.getSimpleMove = function (n, pgnMove) {

            // Return the corresponding move in simple notation.

            if (regExp.pgnKingMove.test(pgnMove)) {
                return theGame.getSimpleKingMove(n);
            }
            if (regExp.pgnPawnMove.test(pgnMove)) {
                return theGame.getSimplePawnMove(n);
            }
            if (regExp.pgnPieceMove.test(pgnMove)) {
                return theGame.getSimplePieceMove(n);
            }
            throw new SyntaxError(error.invalidParameter);
        };

        theGame.getSimplePawnMove = function (n) {

            // Return a simple move from a PGN pawn move.

            var ambiguity = "";
            var arrival = "";
            var matches = [];
            var move = {};
            var pgnMove = theGame.pgnMoves[n];
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
            start = theGame.getSimpleStart(n, move);
            return start + "-" + arrival + promotion;
        };

        theGame.getSimplePieceMove = function (n) {

            // Return a simple move from a PGN piece move.

            var ambiguity = "";
            var arrival = "";
            var matches = [];
            var move = {};
            var pgnMove = theGame.pgnMoves[n];
            var piece = "";
            var start = "";
            matches = pgnMove.match(regExp.pgnPieceMove);
            ambiguity = matches[1];
            arrival = matches[2];
            piece = pgnMove[0];
            move.piece = piece;
            move.ambiguity = ambiguity;
            move.arrival = arrival;
            start = theGame.getSimpleStart(n, move);
            return start + "-" + arrival;
        };

        theGame.getSimpleStart = function (n, move) {

            // Return the start of a piece move.

            var piecesPlaces = [];
            var position = theGame.getNthPosition(n);
            var start = "";
            piecesPlaces = position.getPiecesPlaces(position.activeColor);
            piecesPlaces.some(function (place) {
                var legalSquares = [];
                var testPiece = position.occupiedSquares[place];
                if (testPiece.toLowerCase() !== move.piece.toLowerCase()) {
                    return false;
                }
                legalSquares = position.getLegalSquares(place);
                if (legalSquares.indexOf(move.arrival) === -1) {
                    return false;
                }
                if (move.ambiguity === "" ||
                    place.indexOf(move.ambiguity) > -1) {
                    start = place;
                    return true;
                }
                return false;
            });
            return start;
        };

        theGame.importMoves = function () {

            // Generate the moves and the FEN strings from the PGN moves.

            var lastPosition = {};
            lastPosition = theGame.getNthPosition(0);
            theGame.pgnMoves.forEach(function (pgnMove, index) {
                var move = theGame.getSimpleMove(index, pgnMove);
                var nextPosition = {};
                var promotion = "";
                if (move.indexOf(chess.promotionSymbol) > -1) {
                    promotion = move[move.length - 1];
                    move = move.replace(regExp.pgnPromotion, "");
                }
                theGame.moves.push(move);
                nextPosition = lastPosition.getNextPosition(move, promotion);
                theGame.fenStrings.push(nextPosition.fenString);
                lastPosition = nextPosition;
            });
        };

        theGame.importPGNMoves = function (pgn) {

            // Import the PGN moves from a PGN string.

            var importedPGNMoves = [];
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
                theGame.pgnMoves.push(pgnMove);
            });
        };

        theGame.importTags = function (pgn) {

            // Import the tag pairs from a PGN.

            var importedTags = pgn.match(regExp.tagPair);
            importedTags.forEach(function (tagPair) {
                var matches = regExp.tagPairCapture.exec(tagPair);
                theGame.tags[matches[1]] = matches[2];
            });
        };

        theGame.initialize = function () {

            // Initialize the 7 required tag pairs and return the game object.

            var requiredTags = {
                "Event": "?",
                "Site": "?",
                "Date": "????.??.??",
                "Round": "?",
                "White": "?",
                "Black": "?",
                "Result": "*"
            };
            theGame.tags = {};
            Object.keys(requiredTags).forEach(function (tag) {
                theGame.tags[tag] = requiredTags[tag];
            });
            return theGame;
        };

        theGame.isLegal = function (n, move) {

            // Check if a move is legal in the n-th position.

            var position = theGame.getNthPosition(n);
            return position.checkLegality(move);
        };

        theGame.setPGN = function (pgn, loadMoves) {

            // Load a PGN string. To proceed :
            // - Validate.
            // - Reset the game object.
            // - Set game informations.
            // - Delete comments.
            // - Variations.
            // - Store the PGN moves.
            // - Get simple moves and FEN strings from PGN moves.
            // Set loadMoves to false to load only infos.

            if (!Chessgame.isValidPGN(pgn)) {
                throw new SyntaxError(error.invalidPGN);
            }
            theGame.initialize();
            theGame.fenStrings = [chess.defaultFEN];
            theGame.moves = [];
            theGame.pgnMoves = [];
            theGame.importTags(pgn);
            if (typeof loadMoves === "undefined" || loadMoves) {
                theGame.importPGNMoves(pgn);
                theGame.importMoves();
            }
        };

        theGame.updateResult = function (nextPosition) {

            // Update the possible result after a move has been played.

            var result = theGame.tags.Result;
            if (!nextPosition.hasLegalMoves()) {
                if (nextPosition.isInCheck(nextPosition.activeColor)) {
                    result = (nextPosition.activeColor === chess.black)
                        ? chess.resultWhite
                        : chess.resultBlack;
                } else {
                    result = chess.resultDraw;
                }
            } else if (nextPosition.halfmoveClock > 99 ||
                nextPosition.isInsufficientMaterial()) {
                result = chess.resultDraw;
            }
            theGame.tags.Result = result;
        };

        theGame.initialize();
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

        var thePiece = {
            div: null,
            ghost: null,
            isAnimated: false,
            name: name,
            square: null,
            url: url,
            width: width
        };

        thePiece.animateGhost = function (animation) {

            // Animate the ghost movement.

            var distances = [];
            var position = [];
            position[0] = animation.start[0] + animation.vectors[0];
            position[1] = animation.start[1] + animation.vectors[1];
            distances[0] = Math.abs(position[0] - animation.arrival[0]);
            distances[1] = Math.abs(position[1] - animation.arrival[1]);
            if (animation.instant || (distances[0] === animation.rest[0] &&
                distances[1] === animation.rest[1])) {
                if (thePiece.ghost.parentElement !== null) {
                    document.body.removeChild(thePiece.ghost);
                }
                thePiece.ghost.style.transform = "";
                thePiece.div.style.opacity = "1";
                thePiece.isAnimated = false;
                return;
            }
            thePiece.ghost.style.transform = "translate(" +
                animation.vectors[0] * animation.step + "px, " +
                animation.vectors[1] * animation.step + "px)";
            animation.start = position;
            animation.step += 1;
            rAF(function () {
                thePiece.animateGhost(animation);
            });
        };

        thePiece.animatePut = function (square) {

            // Place the piece in the DOM tree.

            rAF(function () {
                square.div.appendChild(thePiece.div);
            });
        };

        thePiece.animateRemove = function () {

            // Remove the piece from the DOM tree.

            rAF(function () {
                var parent = thePiece.div.parentElement;
                parent.removeChild(thePiece.div);
            });
        };

        thePiece.deselect = function () {

            // Deselect the piece after a click or a drag end.

            var board = thePiece.square.board;
            thePiece.showLegalSquares();
            if (board.markSelectedSquare) {
                thePiece.square.isSelected = false;
                thePiece.square.updateCSS();
            }
            board.selectedSquare = null;
        };

        thePiece.fadingPlace = function (square) {

            // Place the piece and change the opacity from 0 to 1.

            var opacity = Number(thePiece.div.style.opacity);
            if (opacity === 0) {
                thePiece.animatePut(square);
            }
            opacity += 0.1;
            thePiece.div.style.opacity = opacity;
            if (opacity.toFixed(1) === "1.0") {
                return;
            }
            rAF(function () {
                thePiece.fadingPlace(square);
            });
        };

        thePiece.fadingRemove = function () {

            // Change the piece opacity from 1 to 0 and remove it.

            var opacity = Number(thePiece.div.style.opacity);
            opacity -= 0.1;
            thePiece.div.style.opacity = opacity;
            if (opacity.toFixed(1) === "0.0") {
                thePiece.animateRemove();
            } else {
                rAF(thePiece.fadingRemove);
            }
        };

        thePiece.initialize = function () {

            // Initialize and return the piece object.

            var backgroundImage = "url('" + url + "')";
            thePiece.div = document.createElement("DIV");
            thePiece.div.className = css.squarePiece;
            thePiece.div.style.backgroundImage = backgroundImage;
            thePiece.div.addEventListener("mousedown", thePiece.onMouseDown);
            thePiece.ghost = document.createElement("DIV");
            thePiece.ghost.className = css.pieceGhost;
            thePiece.ghost.style.backgroundImage = backgroundImage;
            return thePiece;
        };

        thePiece.move = function (move, animate) {

            // Move the piece and modify its place in the DOM tree.

            var arrivalXY = [];
            var startXY = [];
            if (animate) {
                arrivalXY = getCoordinate(move.arrival.div);
                startXY = getCoordinate(thePiece.square.div);
                thePiece.setGhostPosition(startXY[0], startXY[1]);
                thePiece.showGhost();
                thePiece.startGhostAnimation(startXY, arrivalXY);
            }
            if (move.isCapture) {
                move.arrival.piece.fadingRemove();
            }
            thePiece.animateRemove();
            thePiece.animatePut(move.arrival);
        };

        thePiece.onMouseDown = function (e) {
            var board = thePiece.square.board;
            e.preventDefault();
            if (!board.draggable || thePiece.isAnimated || e.button !== 0) {
                return;
            }
            board.isDragging = true;
            if (board.markOverflownSquare) {
                thePiece.square.isOverflown = true;
                thePiece.square.updateCSS();
            }
            thePiece.setGhostPositionCursor(e);
            thePiece.showGhost();
            if (board.selectedSquare === thePiece.square.name) {
                board.hasDraggedClickedSquare = true;
                return;
            }
            thePiece.select();
        };

        thePiece.put = function (square) {

            // Put the piece on a square.

            if (!square.isEmpty()) {
                square.piece.remove();
            }
            square.piece = thePiece;
            thePiece.square = square;
        };

        thePiece.remove = function () {

            // Remove the piece from the square.

            if (thePiece.square === null) {
                return;
            }
            thePiece.square.piece = null;
        };

        thePiece.select = function () {

            // Select the piece after a click or a drag start.

            var board = thePiece.square.board;
            if (board.selectedSquare !== null) {
                board.squares[board.selectedSquare].piece.deselect();
            }
            thePiece.showLegalSquares();
            if (board.markSelectedSquare) {
                thePiece.square.isSelected = true;
                thePiece.square.updateCSS();
            }
            board.selectedSquare = thePiece.square.name;
        };

        thePiece.setGhostPosition = function (left, top) {

            // Set the ghost position.

            rAF(function () {
                thePiece.ghost.style.left = left + "px";
                thePiece.ghost.style.top = top + "px";
            });
        };

        thePiece.setGhostPositionCursor = function (e) {

            // Attach the ghost to the cursor position.

            var left = e.clientX + window.pageXOffset - thePiece.width / 2;
            var top = e.clientY + window.pageYOffset - thePiece.width / 2;
            thePiece.setGhostPosition(left, top);
        };

        thePiece.showGhost = function () {

            // Show the ghost and make the piece disappear.

            rAF(function () {
                thePiece.div.style.opacity = "0";
                thePiece.ghost.style.height = thePiece.width + "px";
                thePiece.ghost.style.width = thePiece.width + "px";
                document.body.appendChild(thePiece.ghost);
            });
        };

        thePiece.showLegalSquares = function () {

            // Display or hide the legal squares canvas.

            var board = thePiece.square.board;
            var index = 0;
            var lastPosition = {};
            var legalSquares = [];
            if (!board.markLegalSquares) {
                return;
            }
            index = board.game.fenStrings.length - 1;
            lastPosition = board.game.getNthPosition(index);
            legalSquares = lastPosition.getLegalSquares(thePiece.square.name);
            legalSquares.forEach(function (name) {
                board.squares[name].showCanvas();
            });
        };

        thePiece.startGhostAnimation = function (start, arrival) {

            // Start the ghost animation.

            var animation = {};
            var distances = [];
            var rests = [];
            var signs = [];
            var speed = thePiece.square.board.animationSpeed;
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
            thePiece.isAnimated = true;
            rAF(function () {
                thePiece.animateGhost(animation);
            });
        };

        thePiece.initialize();
    }

    // Square ------------------------------------------------------------------

    function Square(name, width) {

        // The Square class constructs a HTML DIV element
        // named with its coordinate.

        var theSquare = {
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

        theSquare.drawFilledCircle = function (cssColor) {
            var context = theSquare.canvas.getContext("2d");
            var radius = Math.floor(theSquare.width / 8);
            var xy = Math.floor(theSquare.width / 2);
            theSquare.canvas.className = css.squareCanvas;
            theSquare.canvas.setAttribute("height", theSquare.width + "px");
            theSquare.canvas.setAttribute("width", theSquare.width + "px");
            context.beginPath();
            context.arc(xy, xy, radius, 0, 2 * Math.PI);
            context.fillStyle = cssColor;
            context.fill();
        };

        theSquare.getClassName = function () {

            // Return the css class name of the square.

            var initialClass = css.square + " ";
            initialClass += (Square.isWhite(theSquare.name))
                ? css.whiteSquare
                : css.blackSquare;
            if (theSquare.isLastMove) {
                initialClass += " " + css.lastMoveSquare;
            }
            if (theSquare.isCheck) {
                initialClass += " " + css.checkSquare;
            }
            if (theSquare.isOverflown) {
                initialClass += " " + css.overflownSquare;
            }
            if (theSquare.isSelected) {
                initialClass += " " + css.selectedSquare;
            }
            return initialClass;
        };

        theSquare.initialize = function () {

            // Initialize and return the square object.

            var cssClass = (Square.isWhite(name))
                ? css.square + " " + css.whiteSquare
                : css.square + " " + css.blackSquare;
            var div = document.createElement("DIV");
            theSquare.canvas = document.createElement("CANVAS");
            theSquare.div = div;
            div.className = cssClass;
            div.addEventListener("click", theSquare.onClick);
            div.addEventListener("mousedown", theSquare.onMouseDown);
            div.addEventListener("mouseenter", function () {
                theSquare.onMouseEnterLeave(true);
            });
            div.addEventListener("mouseleave", function () {
                theSquare.onMouseEnterLeave(false);
            });
            div.addEventListener("mouseup", theSquare.onMouseUp);
            return theSquare;
        };

        theSquare.isEmpty = function () {

            // Check whether the square is empty.

            return theSquare.piece === null;
        };

        theSquare.onClick = function () {
            var board = theSquare.board;
            var isEmptySquare = theSquare.isEmpty();
            var startSquare = board.selectedSquare;
            if (!board.clickable) {
                return;
            }
            if (theSquare.name === startSquare) {
                theSquare.piece.deselect();
                return;
            }
            if (startSquare === null) {
                if (!isEmptySquare && !board.hasDraggedClickedSquare) {
                    theSquare.piece.select();
                }
            } else {
                board.squares[startSquare].piece.deselect();
                if (!board.confirmMove(startSquare, theSquare.name, true) &&
                    !isEmptySquare) {
                    theSquare.piece.select();
                }
            }
            board.hasDraggedClickedSquare = false;
        };

        theSquare.onMouseDown = function (e) {
            e.preventDefault();
        };

        theSquare.onMouseEnterLeave = function (overflow) {
            var board = theSquare.board;
            if (board.isDragging && board.markOverflownSquare) {
                theSquare.isOverflown = overflow;
                theSquare.updateCSS();
            }
        };

        theSquare.onMouseUp = function () {
            var board = theSquare.board;
            var destination = [];
            var ghostXY = [];
            var playedPiece = {};
            var startSquare = {};
            if (!board.isDragging) {
                return;
            }
            if (board.markOverflownSquare) {
                theSquare.isOverflown = false;
                theSquare.updateCSS();
            }
            startSquare = board.squares[board.selectedSquare];
            playedPiece = startSquare.piece;
            playedPiece.deselect();
            ghostXY = getCoordinate(playedPiece.ghost);
            destination = (theSquare.name !== startSquare.name &&
                board.confirmMove(startSquare.name, theSquare.name, false))
                ? getCoordinate(theSquare.div)
                : getCoordinate(startSquare.div);
            playedPiece.startGhostAnimation(ghostXY, destination);
            board.isDragging = false;
        };

        theSquare.showCanvas = function () {

            // Show the square's canvas.
            // Hide if already showed.

            if (theSquare.hasCircle) {
                rAF(function () {
                    theSquare.div.removeChild(theSquare.canvas);
                });
            } else {
                rAF(function () {
                    theSquare.div.appendChild(theSquare.canvas);
                });
            }
            theSquare.hasCircle = !theSquare.hasCircle;
        };

        theSquare.updateCSS = function () {

            // Update the CSS class.

            var className = theSquare.getClassName();
            rAF(function () {
                theSquare.div.className = className;
            });
        };

        theSquare.initialize();
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

        var theBoard = {
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

        theBoard.addNavigationData = function (animations, similarPieces) {

            // Change the position data after an animation occured.

            Object.keys(theBoard.squares).forEach(function (key) {
                var square = theBoard.squares[key];
                square.piece = null;
            });
            similarPieces.forEach(function (similarPiece) {
                similarPiece.square.piece = similarPiece;
            });
            animations.forEach(function (animation) {
                var arrival = animation.arrival;
                var piece = animation.piece;
                var start = animation.start;
                if (typeof arrival === "undefined") {
                    return;
                }
                if (typeof start === "undefined") {
                    arrival.piece = piece;
                    piece.square = arrival;
                } else {
                    arrival.piece = piece;
                    piece.square = arrival;
                }
            });
        };

        theBoard.askPromotion = function (color) {

            // Display the promotion div to complete a move.

            var children = theBoard.promotionDiv.children;
            Object.keys(children).forEach(function (key) {
                var button = children[key];
                var url = theBoard.imagesPath + color + button.name +
                    theBoard.imagesExtension;
                button.style.backgroundImage = "url('" + url + "')";
            });
            theBoard.clickable = false;
            theBoard.draggable = false;
            rAF(function () {
                theBoard.promotionDiv.style.display = "block";
            });
        };

        theBoard.clearHighlight = function () {

            // Remove all the highlight of the squares.

            Object.keys(theBoard.squares).forEach(function (key) {
                var currentSquare = theBoard.squares[key];
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
            theBoard.selectedSquare = null;
        };

        theBoard.confirmMove = function (start, arrival, animate) {

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
            index = theBoard.game.fenStrings.length - 1;
            if (!theBoard.game.isLegal(index, move)) {
                return false;
            }
            position = theBoard.game.getNthPosition(index);
            piece = position.occupiedSquares[start];
            if (piece.toLowerCase() === chess.blackPawn &&
                regExp.promotion.test(move)) {
                theBoard.pendingMove = move;
                color = (arrival[1] === chess.rows[7])
                    ? chess.white
                    : chess.black;
                theBoard.askPromotion(color);
            } else {
                theBoard.play(move, "", animate);
            }
            return true;
        };

        theBoard.createBoard = function () {

            // Create the HTML board.

            var columns = chess.columns.split("");
            var pieces = [
                chess.blackQueen, chess.blackRook,
                chess.blackBishop, chess.blackKnight
            ];
            var rows = chess.rows.split("");
            theBoard.squaresDiv = document.createElement("DIV");
            theBoard.squaresDiv.style.width = theBoard.width + "px";
            theBoard.squaresDiv.style.height = theBoard.width + "px";
            theBoard.squaresDiv.className = css.squaresDiv;
            if (theBoard.isFlipped) {
                // From h1 to a1.
                columns = columns.reverse();
            } else {
                // From a8 to h8.
                rows = rows.reverse();
            }
            rows.forEach(function buildRow(row) {
                columns.forEach(function (column) {
                    var square = theBoard.squares[column + row];
                    theBoard.squaresDiv.appendChild(square.div);
                });
            });
            theBoard.promotionDiv = document.createElement("DIV");
            theBoard.promotionDiv.className = css.promotionDiv;
            pieces.forEach(function (piece) {
                var button = document.createElement("BUTTON");
                button.className = css.promotionButton;
                button.setAttribute("name", piece);
                button.addEventListener("click", theBoard.onPromote);
                theBoard.promotionDiv.appendChild(button);
            });
        };

        theBoard.createColumnsBorder = function () {

            // Create the border with a-h coordinate.

            var columns = chess.columns.split("");
            theBoard.columnsBorder = document.createElement("DIV");
            theBoard.columnsBorder.className = css.columnsBorder;
            theBoard.columnsBorder.style.width = theBoard.width + "px";
            if (theBoard.isFlipped) {
                columns = columns.reverse();
            }
            columns.forEach(function (column) {
                var borderFragment = document.createElement("DIV");
                borderFragment.className = css.columnsBorderFragment;
                borderFragment.innerHTML = column;
                theBoard.columnsBorder.appendChild(borderFragment);
            });
        };

        theBoard.createRowsBorder = function () {

            // Create the border with 1-8 coordinate.

            var lineHeight = Math.floor(theBoard.width / 8) + "px";
            var rows = chess.rows.split("");
            theBoard.rowsBorder = document.createElement("DIV");
            theBoard.rowsBorder.className = css.rowsBorder;
            theBoard.rowsBorder.style.height = theBoard.width + "px";
            if (!theBoard.isFlipped) {
                rows = rows.reverse();
            }
            rows.forEach(function (row) {
                var borderFragment = document.createElement("DIV");
                borderFragment.className = css.rowsBorderFragment;
                borderFragment.style.lineHeight = lineHeight;
                borderFragment.innerHTML = row;
                theBoard.rowsBorder.appendChild(borderFragment);
            });
        };

        theBoard.createSquares = function () {

            // Create the squares property.

            var columns = chess.columns.split("");
            var rows = chess.rows.split("");
            var squareWidth = Math.floor(theBoard.width / 8);
            theBoard.squares = {};
            columns.forEach(function (column) {
                rows.forEach(function (row) {
                    var name = column + row;
                    var square = new Square(name, squareWidth);
                    square.drawFilledCircle(theBoard.legalMarksColor);
                    square.board = theBoard;
                    theBoard.squares[name] = square;
                });
            });
        };

        theBoard.draw = function () {

            // Draw the empty chessboard.

            theBoard.createBoard();
            rAF(function () {
                theBoard.squaresDiv.appendChild(theBoard.promotionDiv);
                theBoard.container.appendChild(theBoard.squaresDiv);
            });
            if (!theBoard.notationBorder) {
                return;
            }
            theBoard.createRowsBorder();
            rAF(function () {
                theBoard.container.insertBefore(theBoard.rowsBorder,
                    theBoard.squaresDiv);
            });
            theBoard.createColumnsBorder();
            rAF(function () {
                theBoard.container.appendChild(theBoard.columnsBorder);
            });
        };

        theBoard.empty = function () {

            // Remove all the pieces of the board.

            Object.keys(theBoard.squares).forEach(function (key) {
                var currentSquare = theBoard.squares[key];
                if (currentSquare.isEmpty()) {
                    return;
                }
                currentSquare.piece.animateRemove();
                currentSquare.piece.remove();
            });
        };

        theBoard.getAnimations = function (position) {

            // Return an array of animations to perform to navigate.
            // Determine the pieces :
            // - to remove.
            // - to place.
            // - to animate.

            var animations = [];
            var newPosition = position.occupiedSquares;
            var newSquares = [];
            var oldDifferentSquares = [];
            var oldPosition = theBoard.getPositionObject();
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
                    startSquare = theBoard.squares[oldSquare];
                    arrivalSquare = theBoard.squares[newSquare];
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
                var startSquare = theBoard.squares[oldSquare];
                pieceToRemove = startSquare.piece;
                animation.start = startSquare;
                animation.piece = pieceToRemove;
                animations.push(animation);
            });
            newSquares.forEach(function (newSquare) {
                var animation = {};
                var arrivalSquare = theBoard.squares[newSquare];
                var char = newPosition[newSquare];
                animation.arrival = arrivalSquare;
                animation.piece = theBoard.getNewPiece(char);
                animations.push(animation);
            });
            return animations;
        };

        theBoard.getNewPiece = function (char) {

            // Create and return a new piece object.

            var name = (char.toLowerCase() === char)
                ? chess.black + char
                : chess.white + char.toLowerCase();
            var url = theBoard.imagesPath + name + theBoard.imagesExtension;
            var width = Math.floor(theBoard.width / 8);
            return new Piece(name, url, width);
        };

        theBoard.getPositionObject = function () {

            // Return a position object of the pieces places.

            var occupiedSquares = {};
            Object.keys(theBoard.squares).forEach(function (key) {
                var pieceChar = "";
                var pieceName = "";
                var square = theBoard.squares[key];
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

        theBoard.getSimilarPieces = function (position) {

            // Returns an array of similar pieces compared to another position.

            var newPosition = position.occupiedSquares;
            var oldPosition = theBoard.getPositionObject();
            var similarPieces = [];
            Object.keys(newPosition).forEach(function (square) {
                var newPiece = newPosition[square];
                var oldPiece = oldPosition[square];
                var piece = {};
                if (oldPiece === newPiece) {
                    piece = theBoard.squares[square].piece;
                    similarPieces.push(piece);
                }
            });
            return similarPieces;
        };

        theBoard.highlightKing = function (position) {

            // Highlight a king in check.

            var kingSquare = "";
            if (!theBoard.markKingInCheck ||
                !position.isInCheck(position.activeColor)) {
                return;
            }
            kingSquare = position.getKingSquare(position.activeColor);
            theBoard.squares[kingSquare].isCheck = true;
            theBoard.squares[kingSquare].updateCSS();
        };

        theBoard.highlightLastMove = function (index) {

            // Highlight the squares of the last move.

            var lastMove = "";
            var lastMoveArrival = "";
            var lastMoveStart = "";
            if (!theBoard.markLastMove || index < 1) {
                return;
            }
            lastMove = theBoard.game.moves[index - 1];
            lastMoveArrival = lastMove.substr(3, 2);
            theBoard.squares[lastMoveArrival].isLastMove = true;
            theBoard.squares[lastMoveArrival].updateCSS();
            lastMoveStart = lastMove.substr(0, 2);
            theBoard.squares[lastMoveStart].isLastMove = true;
            theBoard.squares[lastMoveStart].updateCSS();
        };

        theBoard.initialize = function () {

            // Initialize and return the board object.

            theBoard.container = document.getElementById(containerId);
            switch (theBoard.animationSpeed) {
                case "slow":
                    theBoard.animationSpeed = 12;
                    break;
                case "normal":
                    theBoard.animationSpeed = 8;
                    break;
                case "fast":
                    theBoard.animationSpeed = 4;
                    break;
                case "instant":
                    theBoard.animationSpeed = Infinity;
                    break;
                default:
                    theBoard.animationSpeed = 8;
            }
            theBoard.game = new Chessgame();
            document.addEventListener("mousemove", theBoard.onMouseMove);
            document.addEventListener("mouseup", theBoard.onMouseUp);
            return theBoard;
        };

        theBoard.move = function (move, promotion, animate) {

            // Play the desired move on the board.
            // Manage special moves (castle, en passant, promotion).

            var arrival = "";
            var arrivalSquare = {};
            var emptyArrival = false;
            var moveObject = {};
            var piece = {};
            var start = move.substr(0, 2);
            var startSquare = theBoard.squares[start];
            piece = startSquare.piece;
            arrival = move.substr(3, 2);
            arrivalSquare = theBoard.squares[arrival];
            emptyArrival = arrivalSquare.isEmpty();
            moveObject.arrival = arrivalSquare;
            moveObject.isCapture = !emptyArrival;
            piece.move(moveObject, animate);
            piece.remove();
            piece.put(arrivalSquare);
            if (regExp.castle.test(move) &&
                piece.name[1] === chess.blackKing) {
                theBoard.moveCastle(arrival);
                return;
            }
            if (piece.name[1] === chess.blackPawn) {
                if (emptyArrival && regExp.enPassant.test(move) &&
                    start[0] !== arrival[0]) {
                    theBoard.moveEnPassant(arrival);
                } else if (regExp.promotion.test(move)) {
                    theBoard.movePromotion(piece, arrival, promotion);
                }
            }
        };

        theBoard.moveCastle = function (arrival) {

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
            if (theBoard.squares[rookStart].isEmpty()) {
                throw new Error(error.illegalMove);
            }
            rook = theBoard.squares[rookStart].piece;
            moveObject.arrival = theBoard.squares[rookArrival];
            moveObject.isCapture = false;
            rook.move(moveObject, true);
            rook.remove();
            rook.put(theBoard.squares[rookArrival]);
        };

        theBoard.moveEnPassant = function (arrival) {

            // Play a move if it's a move en passant.

            var enPassant = "";
            var enPassantSquare = {};
            enPassant = (arrival[1] === chess.rows[2])
                ? arrival[0] + chess.rows[3]
                : arrival[0] + chess.rows[4];
            enPassantSquare = theBoard.squares[enPassant];
            if (enPassantSquare.isEmpty()) {
                throw new Error(error.illegalMove);
            }
            enPassantSquare.piece.fadingRemove();
            enPassantSquare.piece.remove();
        };

        theBoard.movePromotion = function (playedPiece, arrival, promotion) {

            // Play a move if it's a promotion.

            var arrivalSquare = theBoard.squares[arrival];
            var newColor = "";
            var newName = "";
            var newPiece = {};
            var url = "";
            var width = Math.floor(theBoard.width / 8);
            promotion = promotion || chess.blackQueen;
            newColor = (arrival[1] === chess.rows[0])
                ? chess.black
                : chess.white;
            newName = newColor + promotion.toLowerCase();
            url = theBoard.imagesPath + newName + theBoard.imagesExtension;
            newPiece = new Piece(newName, url, width);
            playedPiece.fadingRemove();
            playedPiece.remove();
            newPiece.fadingPlace(arrivalSquare);
            newPiece.put(arrivalSquare);
        };

        theBoard.navigate = function (index) {

            // Navigate to the desired position.
            // Update the board position and the highlighting.

            var animations = [];
            var maxIndex = theBoard.game.fenStrings.length - 1;
            var position = {};
            var similarPieces = [];
            if (index < 0 || index > maxIndex) {
                throw new Error(error.invalidParameter);
            }
            position = theBoard.game.getNthPosition(index);
            theBoard.clearHighlight();
            theBoard.highlightKing(position);
            theBoard.highlightLastMove(index);
            animations = theBoard.getAnimations(position);
            similarPieces = theBoard.getSimilarPieces(position);
            theBoard.performAnimations(animations);
            theBoard.addNavigationData(animations, similarPieces);
            if (index < maxIndex) {
                theBoard.clickable = false;
                theBoard.draggable = false;
            } else {
                theBoard.clickable = config.clickable;
                theBoard.draggable = config.draggable;
            }
        };

        theBoard.onMouseMove = function (e) {
            var activeSquare = {};
            if (!theBoard.isDragging) {
                return;
            }
            activeSquare = theBoard.squares[theBoard.selectedSquare];
            activeSquare.piece.setGhostPositionCursor(e);
        };

        theBoard.onMouseUp = function () {
            var ghostXY = [];
            var selectedSquare = {};
            var squareXY = [];
            if (!theBoard.isDragging) {
                return;
            }
            selectedSquare = theBoard.squares[theBoard.selectedSquare];
            ghostXY = getCoordinate(selectedSquare.piece.ghost);
            squareXY = getCoordinate(selectedSquare.div);
            selectedSquare.piece.startGhostAnimation(ghostXY, squareXY);
            selectedSquare.piece.deselect();
            theBoard.isDragging = false;
        };

        theBoard.onPromote = function (e) {
            theBoard.play(theBoard.pendingMove, e.target.name, true);
            theBoard.pendingMove = null;
            theBoard.clickable = config.clickable;
            theBoard.draggable = config.draggable;
            rAF(function () {
                theBoard.promotionDiv.style.display = "none";
            });
        };

        theBoard.performAnimations = function (animations) {

            // Animate the navigation to a position.

            animations.forEach(function (animation) {
                var arrival = animation.arrival;
                var move = {};
                var piece = animation.piece;
                var start = animation.start;
                if (typeof arrival === "undefined") {
                    piece.fadingRemove();
                } else if (typeof start === "undefined") {
                    piece.fadingPlace(arrival);
                } else {
                    move.arrival = arrival;
                    move.isCapture = false;
                    piece.move(move, true);
                }
            });
        };

        theBoard.play = function (move, promotion, animate) {

            // Play a move on the board and store it in the game.

            var currentIndex = theBoard.game.fenStrings.length - 1;
            var currentPosition = {};
            var nextPosition = {};
            theBoard.move(move, promotion, animate);
            theBoard.game.addMove(move, promotion);
            currentPosition = theBoard.game.getNthPosition(currentIndex);
            nextPosition = currentPosition.getNextPosition(move, promotion);
            theBoard.clearHighlight();
            theBoard.highlightKing(nextPosition);
            theBoard.highlightLastMove(currentIndex + 1);
            if (typeof event.onMovePlayed === "function") {
                rAF(event.onMovePlayed);
            }
        };

        theBoard.setFEN = function (fen) {

            // Load a position from a FEN string.

            var squares = {};
            fen = fen || chess.defaultFEN;
            if (!Position.isValidFEN(fen, true)) {
                throw new SyntaxError(error.invalidFEN);
            }
            theBoard.empty();
            squares = Position.fenToObject(fen);
            Object.keys(squares).forEach(function (squareName) {
                var char = squares[squareName];
                var newPiece = theBoard.getNewPiece(char);
                var square = theBoard.squares[squareName];
                newPiece.animatePut(square);
                newPiece.put(square);
            });
        };

        theBoard.initialize();
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
            return position.halfmoveClock > 99;
        },

        isCheckmate: function (n) {

            // Check if the active player is checkmated in the n-th position.

            var position = abBoard.game.getNthPosition(n);
            if (!position.isInCheck(position.activeColor)) {
                return false;
            }
            return !position.hasLegalMoves();
        },

        isInCheck: function (n) {

            // Check if the active player is in check in the n-th position.

            var position = abBoard.game.getNthPosition(n);
            return position.isInCheck(position.activeColor);
        },

        isInsufficientMaterialDraw: function (n) {

            // Check if the material is insufficient to win
            // in the n-th position.

            var position = abBoard.game.getNthPosition(n);
            return position.isInsufficientMaterial();
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
            abBoard.clickable = abConfig.clickable;
            abBoard.draggable = abConfig.draggable;
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

        setPGN: function (pgn, loadMoves) {

            // Set the PGN in the game.

            abBoard.game.setPGN(pgn, loadMoves);
        }

    };
};
