// AbChess-0.2.2.js
// 2017-02-24
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
    var abGame = {};

    // Chess constants.

    var chessValue = {
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

    // Css class and ids.

    var css = {
        blackSquare: "square_black",
        columnsBorder: "columns-border",
        columnsBorderFragment: "columns-border__fragment",
        ghostPiece: "ghost_piece",
        highlightedSquare: "square_highlighted",
        markedSquare: "square_marked",
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

    // RAF

    var rAF = window.requestAnimationFrame ||
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

            var arrival = "";
            var pieceColor = "";
            var start = "";
            var targets = [];
            var testPosition = {};
            if (!regExp.move.test(move)) {
                return false;
            }
            start = move.substr(0, 2);
            if (!the_position.occupiedSquares.hasOwnProperty(start)) {
                return false;
            }
            pieceColor = (the_position.occupiedSquares[start] ===
                the_position.occupiedSquares[start].toLowerCase())
                ? chessValue.black
                : chessValue.white;
            if (the_position.activeColor !== pieceColor) {
                return false;
            }
            testPosition = the_position.getNextPosition(move);
            if (testPosition.isInCheck(the_position.activeColor)) {
                return false;
            }
            targets = the_position.getTargets(start, false);
            arrival = move.substr(3, 2);
            return targets.some(function (target) {
                return target === arrival;
            });
        };

        the_position.getKingSquare = function (color) {

            // Return the square where the desired king is placed.

            var desiredKing = "";
            var square = "";
            desiredKing = (color === chessValue.black)
                ? chessValue.blackKing
                : chessValue.whiteKing;
            Object.keys(the_position.occupiedSquares).every(function (key) {
                var piece = the_position.occupiedSquares[key];
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

        the_position.getLinearTargets = function (start, color, vectors) {

            // Return an array of linear squares without collision.

            var alliesPlaces = [];
            var columnNumber = 0;
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            columnNumber = chessValue.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chessValue.black)
                ? chessValue.white
                : chessValue.black;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            vectors.forEach(function (vector) {
                var columnVector = vector[0];
                var rowVector = vector[1];
                var square = "";
                var testColumn = columnNumber + columnVector;
                var testRow = rowNumber + rowVector;
                while (testColumn > 0 && testRow > 0 &&
                    testColumn < 9 && testRow < 9) {
                    square = chessValue.columns[testColumn - 1] + testRow;
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

            return (the_position.activeColor === chessValue.white)
                ? chessValue.black
                : chessValue.white;
        };

        the_position.getNextAllowedCastles = function (move) {

            // Return the new allowed castles.

            var allowedCastles = the_position.allowedCastles;
            var arrivalSquare = "";
            var newAllowedCastles = "";
            var playedPiece = "";
            var startSquare = "";
            if (allowedCastles === "-") {
                return allowedCastles;
            }
            newAllowedCastles = allowedCastles;
            startSquare = move.substr(0, 2);
            playedPiece = the_position.occupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            if (allowedCastles.search(/[kq]/) > -1) {
                if (playedPiece === chessValue.blackKing) {
                    newAllowedCastles = allowedCastles.replace(/[kq]/g, "");
                }
                if (startSquare === "a8" || arrivalSquare === "a8") {
                    newAllowedCastles = allowedCastles.replace(/q/, "");
                }
                if (startSquare === "h8" || arrivalSquare === "h8") {
                    newAllowedCastles = allowedCastles.replace(/k/, "");
                }
            }
            if (allowedCastles.search(/[KQ]/) > -1) {
                if (playedPiece === chessValue.whiteKing) {
                    newAllowedCastles = allowedCastles.replace(/[KQ]/g, "");
                }
                if (startSquare === "a1" || arrivalSquare === "a1") {
                    newAllowedCastles = allowedCastles.replace(/Q/, "");
                }
                if (startSquare === "h1" || arrivalSquare === "h1") {
                    newAllowedCastles = allowedCastles.replace(/K/, "");
                }
            }
            if (newAllowedCastles === "") {
                newAllowedCastles = "-";
            }
            return newAllowedCastles;
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
            if (playedPiece.toLowerCase() !== chessValue.blackPawn) {
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

            return (the_position.activeColor === chessValue.black)
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
            return (playedPiece.toLowerCase() === chessValue.blackPawn ||
                takenPiece)
                ? 0
                : the_position.halfmoveClock + 1;
        };

        the_position.getNextPosition = function (move, promotion) {

            // Return the new Position object after a move has been played.
            // The move parameter must be on the form [a-h][1-8]-[a-h][1-8].
            // The data of FEN position are updated here.
            // The played move is assumed to be legal.

            var arrivalSquare = move.substr(3, 2);
            var enPassantCapture = "";
            var newActiveColor = "";
            var newAllowedCastles = "";
            var newEnPassant = "";
            var newFEN = "";
            var newFullmove = 0;
            var newHalfmove = 0;
            var newOccupiedSquares = {};
            var playedPiece = "";
            var positionString = "";
            var rookArrival = "";
            var rookStart = "";
            var startSquare = move.substr(0, 2);
            newOccupiedSquares = Position.fenToObject(the_position.fenString);
            playedPiece = newOccupiedSquares[startSquare];
            if (playedPiece.toLowerCase() === chessValue.blackKing &&
                regExp.castle.test(move)) {
                if (arrivalSquare[0] === chessValue.columns[2]) {
                    rookStart = chessValue.columns[0] + arrivalSquare[1];
                    rookArrival = chessValue.columns[3] + arrivalSquare[1];
                } else {
                    rookStart = chessValue.columns[7] + arrivalSquare[1];
                    rookArrival = chessValue.columns[5] + arrivalSquare[1];
                }
                delete newOccupiedSquares[rookStart];
                if (startSquare === "e1") {
                    newOccupiedSquares[rookArrival] = chessValue.whiteRook;
                } else {
                    newOccupiedSquares[rookArrival] = chessValue.blackRook;
                }
            } else if (playedPiece.toLowerCase() === chessValue.blackPawn) {
                if (arrivalSquare === the_position.enPassantSquare &&
                    regExp.enPassant.test(move)) {
                    enPassantCapture = the_position.enPassantSquare[0] +
                        startSquare[1];
                    delete newOccupiedSquares[enPassantCapture];
                }
                if (regExp.promotion.test(move)) {
                    promotion = promotion || chessValue.blackQueen;
                    if (arrivalSquare[1] === "1") {
                        playedPiece = promotion.toLowerCase();
                    }
                    if (arrivalSquare[1] === "8") {
                        playedPiece = promotion.toUpperCase();
                    }
                }
            }
            delete newOccupiedSquares[startSquare];
            newOccupiedSquares[arrivalSquare] = playedPiece;
            positionString = Position.objectToFEN(newOccupiedSquares);
            newActiveColor = the_position.getNextActiveColor();
            newAllowedCastles = the_position.getNextAllowedCastles(move);
            newEnPassant = the_position.getNextEnPassant(move);
            newHalfmove = the_position.getNextHalfmoveClock(move);
            newFullmove = the_position.getNextFullmoveNumber();
            newFEN = positionString +
                " " + newActiveColor +
                " " + newAllowedCastles +
                " " + newEnPassant +
                " " + newHalfmove +
                " " + newFullmove;
            return new Position(newFEN);
        };

        the_position.getPGNKing = function (move) {

            // Return the PGN notation for a king move.

            var arrival = move.substr(3, 2);
            var pgnMove = "";
            var playedPiece = "";
            var start = move.substr(0, 2);
            playedPiece = the_position.occupiedSquares[start];
            if (regExp.castle.test(move)) {
                if (arrival[0] === chessValue.columns[2]) {
                    pgnMove = chessValue.castleQueenSymbol;
                } else {
                    pgnMove = chessValue.castleKingSymbol;
                }
            } else {
                pgnMove = playedPiece.toUpperCase();
                if (the_position.occupiedSquares.hasOwnProperty(arrival)) {
                    pgnMove += chessValue.captureSymbol;
                }
                pgnMove += arrival;
            }
            return pgnMove;
        };

        the_position.getPGNMove = function (move, promotion) {

            // Return the PGN notation for a move.

            var isInCheck = false;
            var nextPosition = {};
            var pgnMove = "";
            var playedPiece = "";
            var start = move.substr(0, 2);
            playedPiece = the_position.occupiedSquares[start];
            switch (playedPiece.toLowerCase()) {
                case chessValue.blackBishop:
                case chessValue.blackKnight:
                case chessValue.blackQueen:
                case chessValue.blackRook:
                    pgnMove = the_position.getPGNPiece(move);
                    break;
                case chessValue.blackKing:
                    pgnMove = the_position.getPGNKing(move);
                    break;
                case chessValue.blackPawn:
                    pgnMove = the_position.getPGNPawn(move, promotion);
                    break;
            }
            nextPosition = the_position.getNextPosition(move, promotion);
            isInCheck = nextPosition.isInCheck(nextPosition.activeColor);
            if (!isInCheck) {
                return pgnMove;
            }
            if (!nextPosition.hasLegalMoves()) {
                pgnMove += chessValue.checkmateSymbol;
            } else {
                pgnMove += chessValue.checkSymbol;
            }
            return pgnMove;
        };

        the_position.getPGNPawn = function (move, promotion) {

            // Return the PGN notation for a pawn move.

            var arrival = move.substr(3, 2);
            var isCapture = false;
            var pgnMove = "";
            var start = move.substr(0, 2);
            isCapture = the_position.occupiedSquares.hasOwnProperty(arrival);
            if (isCapture || arrival === the_position.enPassantSquare) {
                pgnMove = start[0] + chessValue.captureSymbol;
            }
            pgnMove += arrival;
            if (regExp.promotion.test(move)) {
                pgnMove += chessValue.promotionSymbol + promotion.toUpperCase();
            }
            return pgnMove;
        };

        the_position.getPGNPiece = function (move) {

            // Return the PGN notation for a piece (non-pawn) move.

            var ambiguity = false;
            var arrival = move.substr(3, 2);
            var clue = "";
            var occupiedSquares = the_position.occupiedSquares;
            var pgnMove = "";
            var playedPiece = "";
            var sameColumn = false;
            var sameRow = false;
            var start = move.substr(0, 2);
            playedPiece = the_position.occupiedSquares[start];
            pgnMove = playedPiece.toUpperCase();
            Object.keys(occupiedSquares).forEach(function (square) {
                var legalSquares = [];
                var piece = "";
                if (square === start) {
                    return;
                }
                if (sameColumn && sameRow) {
                    return;
                }
                piece = the_position.occupiedSquares[square];
                if (piece !== playedPiece) {
                    return;
                }
                legalSquares = the_position.getLegalSquares(square);
                if (legalSquares.indexOf(arrival) === -1) {
                    return;
                }
                if (square[0] === start[0]) {
                    sameColumn = true;
                } else if (square[1] === start[1]) {
                    sameRow = true;
                }
                ambiguity = true;
            });
            if (ambiguity) {
                if (sameColumn) {
                    if (sameRow) {
                        clue = start;
                    } else {
                        clue = start[1];
                    }
                } else {
                    clue = start[0];
                }
                pgnMove += clue;
            }
            if (occupiedSquares.hasOwnProperty(arrival)) {
                pgnMove += chessValue.captureSymbol;
            }
            pgnMove += arrival;
            return pgnMove;
        };

        the_position.getPiecesPlaces = function (color) {

            // Return an array of the names of the squares where are placed
            // the pieces of a specific color.

            var occupiedSquares = the_position.occupiedSquares;
            var placements = [];
            Object.keys(occupiedSquares).forEach(function (square) {
                var piece = the_position.occupiedSquares[square];
                if ((color === chessValue.white &&
                    piece === piece.toUpperCase())
                    || (color === chessValue.black &&
                        piece === piece.toLowerCase())) {
                    placements.push(square);
                }
            });
            return placements;
        };

        the_position.getSimpleKingMove = function (pgnMove) {

            // Return a simple move from a PGN king move.

            var arrival = "";
            var matches = [];
            var row = "";
            var start = "";
            matches = pgnMove.match(regExp.pgnKingMove);
            if (pgnMove.match(regExp.pgnCastle) !== null) {
                row = (the_position.activeColor === chessValue.white)
                    ? "1"
                    : "8";
                start = "e" + row;
                arrival = (pgnMove === chessValue.castleKingSymbol)
                    ? "g" + row
                    : "c" + row;
            } else {
                arrival = matches[1];
                start = the_position.getKingSquare(the_position.activeColor);
            }
            return start + "-" + arrival;
        };

        the_position.getSimpleMove = function (pgnMove) {

            // Convert a PGN move to a simple move [a-h][1-8]-[a-h][1-8].

            if (regExp.pgnKingMove.test(pgnMove)) {
                return the_position.getSimpleKingMove(pgnMove);
            } else if (regExp.pgnPawnMove.test(pgnMove)) {
                return the_position.getSimplePawnMove(pgnMove);
            } else if (regExp.pgnPieceMove.test(pgnMove)) {
                return the_position.getSimplePieceMove(pgnMove);
            } else {
                throw new SyntaxError(error.invalidParameter);
            }
        };

        the_position.getSimplePawnMove = function (pgnMove) {

            // Return a simple move from a PGN pawn move.

            var ambiguity = "";
            var arrival = "";
            var matches = [];
            var piece = "";
            var promotion = "";
            var start = "";
            matches = pgnMove.match(regExp.pgnPawnMove);
            ambiguity = matches[1];
            arrival = matches[2];
            if (regExp.pgnPromotion.test(pgnMove)) {
                promotion = matches[3];
            }
            piece = (the_position.activeColor === chessValue.white)
                ? chessValue.whitePawn
                : chessValue.blackPawn;
            start = the_position.getSimpleStart(piece, arrival, ambiguity);
            return start + "-" + arrival + promotion;
        };

        the_position.getSimplePieceMove = function (pgnMove) {

            // Return a simple move from a PGN piece move.

            var ambiguity = "";
            var arrival = "";
            var matches = [];
            var piece = "";
            var start = "";
            matches = pgnMove.match(regExp.pgnPieceMove);
            ambiguity = matches[1];
            arrival = matches[2];
            piece = pgnMove[0];
            start = the_position.getSimpleStart(piece, arrival, ambiguity);
            return start + "-" + arrival;
        };

        the_position.getSimpleStart = function (piece, arrival, ambiguity) {

            // Return the start of a piece.

            var piecesPlaces = the_position.getPiecesPlaces(
                the_position.activeColor);
            return piecesPlaces.find(function (start) {
                var legalSquares = [];
                var testPiece = the_position.occupiedSquares[start];
                if (testPiece.toLowerCase() !== piece.toLowerCase()) {
                    return false;
                }
                legalSquares = the_position.getLegalSquares(start);
                if (legalSquares.indexOf(arrival) === -1) {
                    return false;
                }
                if (ambiguity === "") {
                    return true;
                }
                return start.indexOf(ambiguity) > -1;
            });
        };

        the_position.getTargets = function (start, onlyAttack) {

            // Return the target a specific piece can reach.
            // A target is a square that a piece controls or can move on.
            // The onlyAttack parameter allows to filter king moves
            // and pawn non-attacking moves.

            var color = "";
            var piece = "";
            var targets = [];
            var queenVectors = [];
            if (!the_position.occupiedSquares.hasOwnProperty(start)) {
                return targets;
            }
            piece = the_position.occupiedSquares[start];
            color = (piece.toLowerCase() === piece)
                ? chessValue.black
                : chessValue.white;
            switch (piece.toLowerCase()) {
                case chessValue.blackBishop:
                    targets = the_position.getLinearTargets(start, color,
                        chessValue.bishopVectors);
                    break;
                case chessValue.blackKing:
                    targets = the_position.getTargetsKing(start, color,
                        onlyAttack);
                    break;
                case chessValue.blackKnight:
                    targets = the_position.getTargetsByVectors(
                        start, color, chessValue.knightVectors);
                    break;
                case chessValue.blackPawn:
                    targets = the_position.getTargetsPawn(start, color,
                        onlyAttack);
                    break;
                case chessValue.blackQueen:
                    queenVectors = chessValue.bishopVectors.concat(
                        chessValue.rookVectors);
                    targets = the_position.getLinearTargets(start, color,
                        queenVectors);
                    break;
                case chessValue.blackRook:
                    targets = the_position.getLinearTargets(start, color,
                        chessValue.rookVectors);
                    break;
            }
            return targets;
        };

        the_position.getTargetsByVectors = function (start, color, vectors) {

            // Return an array of squares found with vectors.

            var alliesPlaces = [];
            var colNumber = 0;
            var rowNumber = 0;
            var targets = [];
            alliesPlaces = the_position.getPiecesPlaces(color);
            colNumber = chessValue.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            vectors.forEach(function (vector) {
                var testColNumber = 0;
                var testRowNumber = 0;
                var testSquare = "";
                testColNumber = colNumber + vector[0];
                testRowNumber = rowNumber + vector[1];
                if (testColNumber < 1 || testColNumber > 8 ||
                    testRowNumber < 1 || testRowNumber > 8) {
                    return;
                }
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
                if (alliesPlaces.indexOf(testSquare) === -1) {
                    targets.push(testSquare);
                }
            });
            return targets;
        };

        the_position.getTargetsCastle = function (start, color) {

            // Return an array of squares for allowed castles.

            var bishopSquare = "";
            var castleStart = "";
            var kingSide = "";
            var kSideCollisions = ["f", "g"];
            var noCollision = false;
            var oppositeColor = "";
            var qSideCollisions = ["b", "c", "d"];
            var queenSide = "";
            var queenSquare = "";
            var row = "";
            var targets = [];
            if (color === chessValue.white) {
                kingSide = chessValue.whiteKing;
                oppositeColor = chessValue.black;
                queenSide = chessValue.whiteQueen;
                row = "1";
            } else {
                kingSide = chessValue.blackKing;
                oppositeColor = chessValue.white;
                queenSide = chessValue.blackQueen;
                row = "8";
            }
            castleStart = "e" + row;
            if (start !== castleStart || the_position.isControlledBy(
                castleStart, oppositeColor)) {
                return targets;
            }
            function hasNoCollision(column) {
                var testSquare = column + row;
                return !the_position.occupiedSquares.hasOwnProperty(testSquare);
            }
            queenSquare = "d" + row;
            if (the_position.allowedCastles.indexOf(queenSide) > -1 &&
                !the_position.isControlledBy(queenSquare, oppositeColor)) {
                noCollision = qSideCollisions.every(hasNoCollision);
                if (noCollision) {
                    targets.push("c" + row);
                }
            }
            bishopSquare = "f" + row;
            if (the_position.allowedCastles.indexOf(kingSide) > -1 &&
                !the_position.isControlledBy(bishopSquare, oppositeColor)) {
                noCollision = kSideCollisions.every(hasNoCollision);
                if (noCollision) {
                    targets.push("g" + row);
                }
            }
            return targets;
        };

        the_position.getTargetsKing = function (start, color, noCastles) {

            // Return an array of squares a king on a specific square can reach.
            // Add castles, filter ennemy king opposition.

            var castleTargets = [];
            var ennemiesColor = "";
            var ennemyKingSquare = "";
            var ennemyKingTargets = [];
            var normalTargets = [];
            var targets = [];
            normalTargets = the_position.getTargetsByVectors(
                start, color, chessValue.kingVectors);
            ennemiesColor = (color === chessValue.black)
                ? chessValue.white
                : chessValue.black;
            ennemyKingSquare = the_position.getKingSquare(ennemiesColor);
            ennemyKingTargets = the_position.getTargetsByVectors(
                ennemyKingSquare, ennemiesColor, chessValue.kingVectors);
            targets = normalTargets.filter(function (target) {
                return ennemyKingTargets.indexOf(target) === -1;
            });
            if (noCastles) {
                return targets;
            }
            castleTargets = the_position.getTargetsCastle(start, color);
            targets = targets.concat(castleTargets);
            return targets;
        };

        the_position.getTargetsPawn = function (start, color, onlyAttack) {

            // Return an array of squares a pawn on a specific square can reach.
            // Pawns can move, take (en passant), promote.
            // Use onlyAttack to get only attacking moves.

            var pawnAttacks = the_position.getTargetsPawnAttack(start, color,
                onlyAttack);
            if (onlyAttack) {
                return pawnAttacks;
            }
            return pawnAttacks.concat(the_position.getTargetsPawnMove(start,
                color));
        };

        the_position.getTargetsPawnAttack = function (start, color,
            onlyAttack) {

            // Return an array of attacking pawn moves.

            var colDirections = [-1, 1];
            var colNumber = 0;
            var direction = 0;
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            var testRow = 0;
            colNumber = chessValue.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            if (color === chessValue.black) {
                direction = -1;
                ennemiesColor = chessValue.white;
            } else {
                direction = 1;
                ennemiesColor = chessValue.black;
            }
            testRow = rowNumber + direction;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            colDirections.forEach(function (colDirection) {
                var testCol = colNumber + colDirection;
                var testSquare = chessValue.columns[testCol - 1] + testRow;
                if (ennemiesPlaces.indexOf(testSquare) > -1 ||
                    the_position.enPassantSquare === testSquare) {
                    targets.push(testSquare);
                } else if (onlyAttack) {
                    targets.push(testSquare);
                }
            });
            return targets;
        };

        the_position.getTargetsPawnMove = function (start, color) {

            // Return an array of squares a pawn can reach (no capture).

            var colNumber = 0;
            var direction = 0;
            var rowNumber = 0;
            var targets = [];
            var testCol = 0;
            var testRow = 0;
            var testSquare = "";
            colNumber = chessValue.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            if (color === chessValue.black) {
                direction = -1;
            } else {
                direction = 1;
            }
            testCol = colNumber;
            testRow = rowNumber + direction;
            testSquare = chessValue.columns[testCol - 1] + testRow;
            if (the_position.occupiedSquares.hasOwnProperty(testSquare)) {
                return targets;
            }
            targets.push(testSquare);
            if ((rowNumber === 2 && direction === 1) ||
                (rowNumber === 7 && direction === -1)) {
                testRow = rowNumber + 2 * direction;
                testSquare = chessValue.columns[testCol - 1] + testRow;
                if (!the_position.occupiedSquares.hasOwnProperty(testSquare)) {
                    targets.push(testSquare);
                }
            }
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
                [chessValue.blackKing, chessValue.blackBishop],
                [chessValue.blackKing, chessValue.blackKnight],
                [chessValue.blackKing, chessValue.blackKnight,
                chessValue.blackKnight]
            ];
            var pieces = [];
            var whitePlaces = [];
            blackPlaces = the_position.getPiecesPlaces(chessValue.black);
            if (blackPlaces.length > 3) {
                return false;
            }
            whitePlaces = the_position.getPiecesPlaces(chessValue.white);
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
            ennemiesColor = (color === chessValue.white)
                ? chessValue.black
                : chessValue.white;
            kingSquare = the_position.getKingSquare(color);
            return the_position.isControlledBy(kingSquare, ennemiesColor);
        };

        the_position.initPosition = function () {

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

        the_position.initPosition();
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
                    name = chessValue.columns[colNumber - 1] + rowNumber;
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

        var columns = chessValue.columns.split("");
        var fenPosition = "";
        var rows = chessValue.rows.split("").reverse();
        function buildRowString(row, rowIndex) {
            var emptyCount = 0;
            columns.forEach(function (column, columnIndex) {
                var square = column + row;
                if (position.hasOwnProperty(square)) {
                    if (emptyCount > 0) {
                        fenPosition += emptyCount;
                        emptyCount = 0;
                    }
                    fenPosition += position[square];
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
        }
        rows.forEach(buildRowString);
        return fenPosition;
    };

    // -------------------------------------------------------------------------

    function Piece(name, url) {

        // The Piece class constructs an HTML DIV element.
        // The name property is a 2 chars string (b|w)[bknqr]
        // to identify the chess piece.
        // The chess image is set with css backgroundImage url.

        var the_piece = {
            div: null,
            ghost: null,
            ghostWidth: 0,
            isAnimated: false,
            name: name,
            square: null,
            url: url
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

        the_piece.fadingPlace = function (square) {

            // Fade the piece in until its opacity reaches 1.

            var opacity = Number(the_piece.div.style.opacity);
            if (opacity === 0) {
                the_piece.animatePut(square);
            }
            opacity += 0.05;
            the_piece.div.style.opacity = opacity;
            if (opacity === 1) {
                return;
            }
            rAF(the_piece.fadingPlace);
        };

        the_piece.fadingRemove = function () {

            // Fade the piece until its opacity reaches 0.

            var opacity = the_piece.div.style.opacity;
            if (opacity === "") {
                opacity = 1;
            }
            opacity -= 0.05;
            the_piece.div.style.opacity = opacity;
            if (opacity > 0) {
                rAF(the_piece.fadingRemove);
            } else {
                the_piece.animateRemove();
            }
        };

        the_piece.getGhostCoordinate = function () {

            // Returns the coordinate of the ghost.

            var x = Math.round(the_piece.ghost.getBoundingClientRect().left +
                window.pageXOffset);
            var y = Math.round(the_piece.ghost.getBoundingClientRect().top +
                window.pageYOffset);
            return [x, y];
        };

        the_piece.initPiece = function () {

            // Initialize the piece object.

            var backgroundImage = "url('" + url + "')";
            the_piece.div = document.createElement("DIV");
            the_piece.div.className = css.squarePiece;
            the_piece.div.style.backgroundImage = backgroundImage;
            the_piece.div.addEventListener("mousedown",
                the_piece.mouseDownHandler);
            the_piece.ghost = document.createElement("DIV");
            the_piece.ghost.className = css.ghostPiece;
            the_piece.ghost.style.backgroundImage = backgroundImage;
        };

        the_piece.mouseDownHandler = function (e) {
            if (typeof the_piece.square.board.onPieceMouseDown === "function") {
                the_piece.square.board.onPieceMouseDown(e, the_piece);
            }
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

        the_piece.setGhostPosition = function (left, top) {

            // Set the ghost position.

            the_piece.ghost.style.left = left + "px";
            the_piece.ghost.style.top = top + "px";
        };

        the_piece.setGhostPositionCursor = function (e) {

            // Attach the ghost to the cursor position.

            var left = e.clientX + window.pageXOffset -
                the_piece.ghostWidth / 2;
            var top = e.clientY + window.pageYOffset - the_piece.ghostWidth / 2;
            the_piece.setGhostPosition(left, top);
        };

        the_piece.showGhost = function (width) {

            // Show the ghost and make the piece disappear.

            the_piece.ghostWidth = width;
            the_piece.div.style.opacity = "0";
            the_piece.ghost.style.height = width + "px";
            the_piece.ghost.style.width = width + "px";
            document.body.appendChild(the_piece.ghost);
        };

        the_piece.initPiece();
        return the_piece;
    }

    // -------------------------------------------------------------------------

    function Square(name, width) {

        // The Square class constructs a HTML DIV element
        // named with its coordinate.

        var the_square = {
            board: null,
            canvas: null,
            div: null,
            hasCircle: false,
            isHighlighted: false,
            isMarked: false,
            isOverflown: false,
            isSelected: false,
            name: name,
            piece: null,
            width: width
        };

        the_square.clickHandler = function () {
            if (typeof the_square.board.onSquareClick === "function") {
                the_square.board.onSquareClick(the_square.name);
            }
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

        the_square.mouseDownHandler = function (e) {
            if (typeof the_square.board.onSquareMouseDown === "function") {
                the_square.board.onSquareMouseDown(e);
            }
        };

        the_square.mouseEnterHandler = function () {
            if (typeof the_square.board.onSquareEnter === "function") {
                the_square.board.onSquareEnter(the_square);
            }
        };

        the_square.mouseLeaveHandler = function () {
            if (typeof the_square.board.onSquareLeave === "function") {
                the_square.board.onSquareLeave(the_square);
            }
        };

        the_square.mouseUpHandler = function () {
            if (typeof the_square.board.onSquareMouseUp === "function") {
                the_square.board.onSquareMouseUp(the_square);
            }
        };

        the_square.getClassName = function () {

            // Return the css class name of the square.

            var initialClass = css.square + " ";
            initialClass += (Square.isWhite(the_square.name))
                ? css.whiteSquare
                : css.blackSquare;
            if (the_square.isHighlighted) {
                initialClass += " " + css.highlightedSquare;
            }
            if (the_square.isMarked) {
                initialClass += " " + css.markedSquare;
            }
            if (the_square.isOverflown) {
                initialClass += " " + css.overflownSquare;
            }
            if (the_square.isSelected) {
                initialClass += " " + css.selectedSquare;
            }
            return initialClass;
        };

        the_square.getCoordinate = function () {

            // Returns an array of coordinate of the square.

            var x = Math.round(the_square.div.getBoundingClientRect().left +
                window.pageXOffset);
            var y = Math.round(the_square.div.getBoundingClientRect().top +
                window.pageYOffset);
            return [x, y];
        };

        the_square.highlight = function () {

            // Highlight the square (last move).
            // Cancel if already highlighted.

            the_square.isHighlighted = !the_square.isHighlighted;
            the_square.updateClass();
        };

        the_square.initSquare = function () {

            // Initialize the square object.

            var cssClass = (Square.isWhite(name))
                ? css.square + " " + css.whiteSquare
                : css.square + " " + css.blackSquare;
            var div = document.createElement("DIV");
            the_square.canvas = document.createElement("CANVAS");
            the_square.div = div;
            div.className = cssClass;
            div.addEventListener("click", the_square.clickHandler);
            div.addEventListener("mousedown", the_square.mouseDownHandler);
            div.addEventListener("mouseenter", the_square.mouseEnterHandler);
            div.addEventListener("mouseleave", the_square.mouseLeaveHandler);
            div.addEventListener("mouseup", the_square.mouseUpHandler);
        };

        the_square.isEmpty = function () {

            // Check whether the square is empty.

            return the_square.piece === null;
        };

        the_square.mark = function () {

            // Mark the square (king in check).
            // Cancel if already marked.

            the_square.isMarked = !the_square.isMarked;
            the_square.updateClass();
        };

        the_square.overfly = function () {

            // Overfly the square.
            // Cancel if already overflown.

            the_square.isOverflown = !the_square.isOverflown;
            the_square.updateClass();
        };

        the_square.select = function () {

            // Select the square.
            // Cancel if already selected.

            the_square.isSelected = !the_square.isSelected;
            the_square.updateClass();
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

        the_square.updateClass = function () {

            // Update the CSS class of the square.

            var className = the_square.getClassName();
            rAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.initSquare();
        return the_square;
    }

    Square.isWhite = function (name) {

        // Check whether the square is white or not.

        var colNumber = 0;
        var rowNumber = 0;
        colNumber = chessValue.columns.indexOf(name[0]) + 1;
        rowNumber = Number(name[1]);
        return (rowNumber % 2 === 0)
            ? colNumber % 2 === 1
            : colNumber % 2 === 0;
    };

    // -------------------------------------------------------------------------

    function Chessboard(containerId, config) {

        // The Chessboard class constructs an HTML chessboard.

        var the_board = {
            animationSpeed: config.animationSpeed,
            clickablePieces: config.clickable,
            columnsBorder: null,
            container: null,
            draggablePieces: config.draggable,
            imagesExtension: config.imagesExtension,
            imagesPath: config.imagesPath,
            hasDraggedClickedSquare: false,
            isDragging: false,
            isFlipped: config.flipped,
            isNavigating: false,
            legalMarksColor: config.legalMarksColor,
            markOverflownSquare: config.markOverflownSquare,
            notationBorder: config.notationBorder,
            onMouseMove: null,
            onMouseUp: null,
            onPieceMouseDown: null,
            onPromotionChose: null,
            onSquareClick: null,
            onSquareEnter: null,
            onSquareMouseDown: null,
            onSquareMouseUp: null,
            onSquareLeave: null,
            pendingMove: null,
            promotionDiv: null,
            rowsBorder: null,
            selectedSquare: null,
            squares: {},
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

        the_board.animateGhost = function (animation) {

            // Animate the ghost movement.

            var newCoordinates = [
                animation.start[0] + animation.vectors[0],
                animation.start[1] + animation.vectors[1]
            ];
            var newDistances = [
                Math.abs(newCoordinates[0] - animation.arrival[0]),
                Math.abs(newCoordinates[1] - animation.arrival[1])
            ];
            var piece = animation.piece;
            if (animation.instant || (newDistances[0] === animation.rest[0] &&
                newDistances[1] === animation.rest[1])) {
                if (piece.ghost.parentElement !== null) {
                    document.body.removeChild(piece.ghost);
                }
                piece.div.style.opacity = "1";
                the_board.isNavigating = false;
                piece.isAnimated = false;
                return;
            }
            piece.setGhostPosition(newCoordinates[0], newCoordinates[1]);
            animation.start = newCoordinates;
            rAF(function () {
                the_board.animateGhost(animation);
            });
        };

        the_board.animateNavigation = function (animations) {

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
                    move.piece = piece;
                    the_board.movePiece(move, true);
                }
            });
        };

        the_board.askPromotion = function (color) {

            // Display the promotion div to complete a move.

            var pieces = [
                chessValue.blackQueen, chessValue.blackRook,
                chessValue.blackBishop, chessValue.blackKnight
            ];
            var promotionDiv = the_board.promotionDiv;
            while (promotionDiv.hasChildNodes()) {
                promotionDiv.removeChild(promotionDiv.lastChild);
            }
            pieces.forEach(function (piece) {
                var promotionButton;
                var url = the_board.imagesPath + color + piece +
                    the_board.imagesExtension;
                promotionButton = document.createElement("INPUT");
                promotionButton.className = css.promotionButton;
                promotionButton.setAttribute("type", "button");
                promotionButton.setAttribute("name", piece);
                promotionButton.style.backgroundImage = "url('" + url + "')";
                promotionButton.addEventListener("click",
                    the_board.clickPromotionHandler);
                promotionDiv.appendChild(promotionButton);
            });
            the_board.lock();
            rAF(function () {
                promotionDiv.style.display = "block";
            });
        };

        the_board.clearMarks = function () {

            // Remove all the marks of the squares.

            Object.keys(the_board.squares).forEach(function (key) {
                var currentSquare = the_board.squares[key];
                if (config.markLastMove && currentSquare.isHighlighted) {
                    currentSquare.highlight();
                }
                if (config.markKingInCheck && currentSquare.isMarked) {
                    currentSquare.mark();
                }
                if (config.markOverflownSquare && currentSquare.isOverflown) {
                    currentSquare.overfly();
                }
                if (config.markSelectedSquare && currentSquare.isSelected) {
                    currentSquare.select();
                }
                if (config.markLegalSquares && currentSquare.hasCircle) {
                    currentSquare.showCanvas();
                }
            });
        };

        the_board.clickPromotionHandler = function (e) {
            var choice = e.target.name;
            if (typeof the_board.onPromotionChose === "function") {
                the_board.onPromotionChose(choice);
            }
            the_board.pendingMove = null;
            the_board.unlock();
            rAF(function () {
                the_board.promotionDiv.style.display = "none";
            });
        };

        the_board.createBoard = function () {

            // Create the HTML board.

            var columns = chessValue.columns.split("");
            var rows = chessValue.rows.split("");
            the_board.promotionDiv = document.createElement("DIV");
            the_board.promotionDiv.className = css.promotionDiv;
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
            function buildRow(row) {
                columns.forEach(function (column) {
                    var square = the_board.squares[column + row];
                    the_board.squaresDiv.appendChild(square.div);
                });
            }
            rows.forEach(buildRow);
        };

        the_board.createColumnsBorder = function () {

            // Create the border with a-h coordinate.

            var columns = chessValue.columns.split("");
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
            var rows = chessValue.rows.split("");
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

            var columns = chessValue.columns.split("");
            var rows = chessValue.rows.split("");
            var squareWidth = Math.floor(the_board.width / 8);
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

        the_board.displayCanvas = function (squares) {

            // Display or hide the circles for an array of squares.

            squares.forEach(function (name) {
                var square = the_board.squares[name];
                square.showCanvas();
            });
        };

        the_board.draw = function () {

            // Draw the empty chessboard.

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
            var newSquares = [];
            var newDifferentSquares = [];
            var newPosition = position.occupiedSquares;
            var oldDifferentSquares = [];
            var oldPosition = the_board.getPositionObject();
            Object.keys(oldPosition).forEach(function (square) {
                if (newPosition[square] !== oldPosition[square]) {
                    oldDifferentSquares.push(square);
                }
            });
            Object.keys(newPosition).forEach(function (square) {
                if (oldPosition[square] !== newPosition[square]) {
                    newDifferentSquares.push(square);
                }
            });
            newDifferentSquares.forEach(function (newSquare) {
                var foundAnimation = false;
                var indexToRemove = 0;
                var newPiece = newPosition[newSquare];
                foundAnimation = oldDifferentSquares.some(function (oldSquare,
                    oldIndex) {
                    var animation = {};
                    var arrivalSquare = {};
                    var oldPiece = oldPosition[oldSquare];
                    var pieceToAnimate = {};
                    var startSquare = {};
                    if (newPiece !== oldPiece) {
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

            var pieceName = (char.toLowerCase() === char)
                ? chessValue.black + char
                : chessValue.white + char.toLowerCase();
            var url = the_board.imagesPath + pieceName +
                the_board.imagesExtension;
            return new Piece(pieceName, url);
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
                pieceChar = (pieceName[0] === chessValue.white)
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

        the_board.highlightSquares = function (squares) {

            // Highlight an array of squares.

            squares.forEach(function (square) {
                the_board.squares[square].highlight();
            });
        };

        the_board.initBoard = function () {

            // Initialize the board object.

            the_board.container = document.getElementById(containerId);
            switch (the_board.animationSpeed) {
                case "slow":
                    the_board.animationSpeed = 20;
                    break;
                case "normal":
                    the_board.animationSpeed = 10;
                    break;
                case "fast":
                    the_board.animationSpeed = 5;
                    break;
                case "instant":
                    the_board.animationSpeed = Infinity;
                    break;
                default:
                    the_board.animationSpeed = 10;
            }
        };

        the_board.loadFEN = function (fen) {

            // Load a position from a FEN string.

            var squares = {};
            fen = fen || chessValue.defaultFEN;
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

        the_board.lock = function () {

            // Lock the pieces.

            the_board.clickablePieces = false;
            the_board.draggablePieces = false;
        };

        the_board.markSquares = function (squares) {

            // Mark an array of squares.

            squares.forEach(function (square) {
                the_board.squares[square].mark();
            });
        };

        the_board.movePiece = function (move, animateGhost) {

            // Move a piece and modify its place in the DOM tree with animation.

            var arrivalCoordinate = move.arrival.getCoordinate();
            var capturedPiece = {};
            var ghostWidth = Math.floor(abBoard.width / 8);
            var startCoordinate = move.piece.square.getCoordinate();
            if (move.isCapture) {
                capturedPiece = move.arrival.piece;
            }
            if (animateGhost) {
                rAF(function () {
                    move.piece.setGhostPosition(startCoordinate[0],
                        startCoordinate[1]);
                    move.piece.showGhost(ghostWidth);
                });
                the_board.startGhostAnimation(move.piece, startCoordinate,
                    arrivalCoordinate);
            }
            if (move.isCapture) {
                capturedPiece.fadingRemove();
            }
            move.piece.animateRemove();
            move.piece.animatePut(move.arrival);
        };

        the_board.play = function (move, promotion, animateGhost) {

            // Play the desired move on the board.
            // Manage special moves (castle, en passant, promotion).

            var arrival = "";
            var arrivalSquare = {};
            var emptyArrival = false;
            var moveObject = {};
            var playedPiece = {};
            var start = move.substr(0, 2);
            var startSquare = the_board.squares[start];
            if (startSquare.isEmpty()) {
                throw new Error(error.illegalMove);
            }
            playedPiece = startSquare.piece;
            arrival = move.substr(3, 2);
            arrivalSquare = the_board.squares[arrival];
            emptyArrival = arrivalSquare.isEmpty();
            moveObject.arrival = arrivalSquare;
            moveObject.isCapture = !emptyArrival;
            moveObject.piece = playedPiece;
            the_board.movePiece(moveObject, animateGhost);
            playedPiece.remove();
            playedPiece.put(arrivalSquare);
            if (regExp.castle.test(move) &&
                playedPiece.name[1] === chessValue.blackKing) {
                the_board.playCastle(arrival, animateGhost);
            } else if (playedPiece.name[1] === chessValue.blackPawn) {
                if (emptyArrival && regExp.enPassant.test(move) &&
                    start[0] !== arrival[0]) {
                    the_board.playEnPassant(arrival);
                } else if (regExp.promotion.test(move)) {
                    the_board.playPromotion(playedPiece, arrival, promotion);
                }
            }
        };

        the_board.playCastle = function (arrival, animateGhost) {

            // Play a move if it's a castle.

            var moveObject = {};
            var rook = {};
            var rookArrival = "";
            var rookStart = "";
            switch (arrival[0]) {
                case chessValue.columns[2]:
                    rookStart = chessValue.columns[0] + arrival[1];
                    rookArrival = chessValue.columns[3] + arrival[1];
                    break;
                case chessValue.columns[6]:
                    rookStart = chessValue.columns[7] + arrival[1];
                    rookArrival = chessValue.columns[5] + arrival[1];
                    break;
            }
            if (the_board.squares[rookStart].isEmpty()) {
                throw new Error(error.illegalMove);
            }
            rook = the_board.squares[rookStart].piece;
            moveObject.arrival = the_board.squares[rookArrival];
            moveObject.isCapture = false;
            moveObject.piece = rook;
            the_board.movePiece(moveObject, animateGhost);
            rook.remove();
            rook.put(the_board.squares[rookArrival]);
        };

        the_board.playEnPassant = function (arrival) {

            // Play a move if it's a move en passant.

            var enPassant = "";
            var enPassantSquare = {};
            enPassant = arrival[0];
            switch (arrival[1]) {
                case "3":
                    enPassant += "4";
                    break;
                case "6":
                    enPassant += "5";
                    break;
            }
            enPassantSquare = the_board.squares[enPassant];
            if (enPassantSquare.isEmpty()) {
                throw new Error(error.illegalMove);
            }
            enPassantSquare.piece.fadingRemove();
            enPassantSquare.piece.remove();
        };

        the_board.playPromotion = function (playedPiece, arrival, promotion) {

            // Play a move if it's a promotion.

            var arrivalSquare = the_board.squares[arrival];
            var newPiece = {};
            var newPieceColor = "";
            var newPieceName = "";
            var url = "";
            promotion = promotion || chessValue.blackQueen;
            newPieceColor = (arrival[1] === "1")
                ? chessValue.black
                : chessValue.white;
            newPieceName = newPieceColor + promotion.toLowerCase();
            url = the_board.imagesPath + newPieceName +
                the_board.imagesExtension;
            newPiece = new Piece(newPieceName, url);
            playedPiece.fadingRemove();
            playedPiece.remove();
            newPiece.fadingPlace(arrivalSquare);
            newPiece.put(arrivalSquare);
        };

        the_board.startGhostAnimation = function (piece, ghostCoordinate,
            coordinate) {

            // Start the ghost animation.

            var animation = {};
            var directions = [];
            var distances = [];
            var rests = [];
            var speed = the_board.animationSpeed;
            var vectors = [];
            the_board.isNavigating = true;
            piece.isAnimated = true;
            distances[0] = Math.abs(ghostCoordinate[0] - coordinate[0]);
            distances[1] = Math.abs(ghostCoordinate[1] - coordinate[1]);
            if (Math.max(distances[0], distances[1]) < speed) {
                animation.instant = true;
            } else {
                distances.forEach(function (distance, index) {
                    rests[index] = distance % speed;
                    directions[index] =
                        (ghostCoordinate[index] < coordinate[index])
                            ? 1
                            : -1;
                    vectors[index] = directions[index] *
                        (distance - rests[index]) / speed;
                });
            }
            animation.arrival = coordinate;
            animation.piece = piece;
            animation.rest = rests;
            animation.start = ghostCoordinate;
            animation.vectors = vectors;
            rAF(function () {
                the_board.animateGhost(animation);
            });
        };

        the_board.unlock = function () {

            // Unlock the pieces.

            the_board.clickablePieces = config.clickable;
            the_board.draggablePieces = config.draggable;
        };

        the_board.initBoard();
        return the_board;
    }

    // -------------------------------------------------------------------------

    function Chessgame() {

        // The Chessgame class constructs a full chess game.
        // We assume a chessgame is mainly an ordered collection
        // of FEN positions.
        // A FEN position is a chess position plus some data :
        // active color, castling possibilities, en passant square,
        // halfmove clock and fullmove number.

        var the_game = {
            comments: [],
            fenStrings: [chessValue.defaultFEN],
            moves: [],
            pgnMoves: [],
            tags: {}
        };

        the_game.addMove = function (move, promotion) {

            // Play a move and store the new FEN string.

            var currentPosition = {};
            var lastIndex = the_game.fenStrings.length - 1;
            var nextPosition = {};
            var pgnMove = "";
            promotion = promotion || "";
            currentPosition = the_game.getNthPosition(lastIndex);
            nextPosition = currentPosition.getNextPosition(move, promotion);
            the_game.fenStrings.push(nextPosition.fenString);
            the_game.moves.push(move);
            pgnMove = currentPosition.getPGNMove(move, promotion);
            the_game.pgnMoves.push(pgnMove);
            the_game.setResult(nextPosition);
        };

        the_game.exportPGN = function () {

            // Return the PGN string.

            var charCount = 0;
            var limit = 80;
            var lineFeed = "\n";
            var pgn = "";
            Object.keys(the_game.tags).forEach(function (tag) {
                var value = the_game.tags[tag];
                pgn += "[" + tag + " \"" + value + "\"]" + lineFeed;
            });
            pgn += lineFeed;
            the_game.pgnMoves.forEach(function (move, index) {
                var moveNumber = "";
                if (index % 2 === 0) {
                    moveNumber = (index / 2 + 1) + ".";
                }
                charCount += moveNumber.length + 1;
                if (charCount > limit) {
                    pgn += lineFeed;
                    charCount = 0;
                }
                pgn += moveNumber + " ";
                charCount += move.length + 1;
                if (charCount > limit) {
                    pgn += lineFeed;
                    charCount = 0;
                }
                pgn += move + " ";
            });
            return pgn + the_game.getInfo("Result");
        };

        the_game.getInfo = function (tag) {
            return the_game.tags[tag];
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

        the_game.importMoves = function () {

            // Generate the moves and the FEN strings from the PGN moves.

            var lastPosition = {};
            the_game.fenStrings = [chessValue.defaultFEN];
            the_game.moves = [];
            lastPosition = the_game.getNthPosition(0);
            the_game.pgnMoves.forEach(function (pgnMove) {
                var move = lastPosition.getSimpleMove(pgnMove);
                var nextPosition = {};
                var promotion = "";
                if (move.indexOf(chessValue.promotionSymbol) > -1) {
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
            the_game.tags = {};
            the_game.initRequiredTags();
            importedTags.forEach(function (tagPair) {
                var matches = regExp.tagPairCapture.exec(tagPair);
                the_game.setTag(matches[1], matches[2]);
            });
        };

        the_game.initRequiredTags = function () {

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
            var result = "*";
            if (hasNoMoves) {
                isInCheck = nextPosition.isInCheck(nextPosition.activeColor);
                if (isInCheck) {
                    result = (nextPosition.activeColor === chessValue.black)
                        ? chessValue.resultWhite
                        : chessValue.resultBlack;
                } else {
                    result = chessValue.resultDraw;
                }
            } else if (nextPosition.isDrawByInsufficientMaterial() ||
                nextPosition.isDrawBy50MovesRule()) {
                result = chessValue.resultDraw;
            }
            the_game.setTag("Result", result);
        };

        the_game.setTag = function (tag, value) {
            the_game.tags[tag] = value;
        };

        the_game.initRequiredTags();
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

    // -------------------------------------------------------------------------
    // Application

    // Load default configuration for empty properties.

    abConfig = abConfig || {};
    Object.keys(defaultConfig).forEach(function (key) {
        if (!abConfig.hasOwnProperty(key)) {
            abConfig[key] = defaultConfig[key];
        }
    });

    // Create the objects board and game. Set default behaviour.

    abBoard = new Chessboard(containerId, abConfig);
    abGame = new Chessgame();

    function navigate(index, updatePosition) {

        // Navigate through the game to the desired position.
        // Update the board position and marks.

        var animations = [];
        var kingSquare = "";
        var lastMove = "";
        var lastMoveArrival = "";
        var lastMoveStart = "";
        var maxIndex = 0;
        var position = {};
        var similarPieces = [];
        if (abBoard.isNavigating) {
            return;
        }
        maxIndex = abGame.fenStrings.length - 1;
        if (index < 0 || index > maxIndex) {
            throw new Error(error.invalidParameter);
        }
        position = abGame.getNthPosition(index);
        if (updatePosition) {
            animations = abBoard.getAnimations(position);
            similarPieces = abBoard.getSimilarPieces(position);
            abBoard.animateNavigation(animations);
            abBoard.addNavigationData(animations, similarPieces);
            if (index < maxIndex) {
                abBoard.lock();
            } else {
                abBoard.unlock();
            }
        }
        abBoard.clearMarks();
        if (abConfig.markLastMove && index > 0) {
            lastMove = abGame.moves[index - 1];
            lastMoveStart = lastMove.substr(0, 2);
            lastMoveArrival = lastMove.substr(3, 2);
            abBoard.highlightSquares([lastMoveStart, lastMoveArrival]);
        }
        if (abConfig.markKingInCheck &&
            position.isInCheck(position.activeColor)) {
            kingSquare = position.getKingSquare(position.activeColor);
            abBoard.markSquares([kingSquare]);
        }
    }

    function selectPiece(square) {

        // Select or deselect a piece on the board and show its legal squares.

        var lastPosition = {};
        var legalSquares = [];
        var n = 0;
        if (abBoard.selectedSquare === null) {
            abBoard.selectedSquare = square;
        } else {
            abBoard.selectedSquare = null;
        }
        if (abConfig.markSelectedSquare) {
            abBoard.squares[square].select();
        }
        if (abConfig.markLegalSquares) {
            n = abGame.fenStrings.length - 1;
            lastPosition = abGame.getNthPosition(n);
            legalSquares = lastPosition.getLegalSquares(square);
            abBoard.displayCanvas(legalSquares);
        }
    }

    function playMove(move, promotion, animateGhost) {

        // Play a move on the board and store it in the game.

        var currentPosition = {};
        var lastIndex = abGame.fenStrings.length - 1;
        currentPosition = abGame.getNthPosition(lastIndex);
        if (!currentPosition.checkMoveLegality(move)) {
            throw new Error(error.illegalMove);
        }
        abBoard.play(move, promotion, animateGhost);
        abGame.addMove(move, promotion);
        navigate(lastIndex + 1, false);
        if (typeof event.onMovePlayed === "function") {
            rAF(event.onMovePlayed);
        }
    }

    function finishMove(start, arrival, animateGhost) {

        // Perform the second step of a move once the arrival square is defined.
        // Test the legality.
        // Show promotion div if needed.

        var color = "";
        var move = "";
        var n = 0;
        var playedPiece = "";
        var position = {};
        move = start + "-" + arrival;
        if (!regExp.move.test(move)) {
            throw new Error(error.invalidParameter);
        }
        n = abGame.fenStrings.length - 1;
        if (!abGame.isLegal(n, move)) {
            return false;
        }
        position = abGame.getNthPosition(n);
        playedPiece = position.occupiedSquares[start];
        if (playedPiece.toLowerCase() === chessValue.blackPawn &&
            regExp.promotion.test(move)) {
            abBoard.pendingMove = move;
            color = (arrival[1] === "8")
                ? chessValue.white
                : chessValue.black;
            abBoard.askPromotion(color);
        } else {
            playMove(move, "", animateGhost);
        }
        return true;
    }

    // Board events initialization.

    abBoard.onMouseMove = function (e) {
        var activeSquare = {};
        if (!abBoard.isDragging) {
            return;
        }
        activeSquare = abBoard.squares[abBoard.selectedSquare];
        activeSquare.piece.setGhostPositionCursor(e);
    };

    abBoard.onMouseUp = function () {
        var coordinate = [];
        var ghostCoordinate = [];
        var selectedSquare = {};
        if (!abBoard.isDragging) {
            return;
        }
        selectedSquare = abBoard.squares[abBoard.selectedSquare];
        ghostCoordinate = selectedSquare.piece.getGhostCoordinate();
        coordinate = selectedSquare.getCoordinate();
        abBoard.startGhostAnimation(selectedSquare.piece, ghostCoordinate,
            coordinate);
        if (abBoard.selectedSquare !== null) {
            selectPiece(abBoard.selectedSquare);
        }
        abBoard.isDragging = false;
    };

    abBoard.onPieceMouseDown = function (e, piece) {
        var ghostWidth = 0;
        e.preventDefault();
        if (piece.isAnimated) {
            return;
        }
        if (!abBoard.draggablePieces) {
            return;
        }
        if (e.button !== 0) {
            return;
        }
        abBoard.isDragging = true;
        ghostWidth = Math.floor(abBoard.width / 8);
        piece.showGhost(ghostWidth);
        piece.setGhostPositionCursor(e);
        if (abBoard.markOverflownSquare) {
            piece.square.overfly();
        }
        if (abBoard.selectedSquare === piece.square.name) {
            abBoard.hasDraggedClickedSquare = true;
            return;
        }
        if (abBoard.selectedSquare !== null) {
            selectPiece(abBoard.selectedSquare);
        }
        selectPiece(piece.square.name);
    };

    abBoard.onPromotionChose = function (choice) {
        var move = abBoard.pendingMove;
        playMove(move, choice, true);
    };

    abBoard.onSquareClick = function (clickedSquare) {
        var isEmptySquare = abBoard.squares[clickedSquare].isEmpty();
        var startSquare = abBoard.selectedSquare;
        if (!abBoard.clickablePieces) {
            return;
        }
        if (clickedSquare === startSquare) {
            selectPiece(startSquare);
        } else {
            if (startSquare === null) {
                if (!isEmptySquare && !abBoard.hasDraggedClickedSquare) {
                    selectPiece(clickedSquare);
                }
            } else {
                selectPiece(startSquare);
                if (!finishMove(startSquare, clickedSquare, true) &&
                    !isEmptySquare) {
                    selectPiece(clickedSquare);
                }
            }
        }
        abBoard.hasDraggedClickedSquare = false;
    };

    abBoard.onSquareEnter = function (square) {
        if (!abBoard.isDragging) {
            return;
        }
        if (abBoard.markOverflownSquare) {
            square.overfly();
        }
    };

    abBoard.onSquareLeave = function (square) {
        if (!abBoard.isDragging) {
            return;
        }
        if (abBoard.markOverflownSquare) {
            square.overfly();
        }
    };

    abBoard.onSquareMouseDown = function (e) {
        e.preventDefault();
    };

    abBoard.onSquareMouseUp = function (dropSquare) {
        var dropCoordinate = [];
        var ghostCoordinate = [];
        var playedPiece = {};
        var startCoordinate = [];
        var startSquare = {};
        if (!abBoard.isDragging) {
            return;
        }
        if (abBoard.markOverflownSquare) {
            dropSquare.overfly();
        }
        startSquare = abBoard.squares[abBoard.selectedSquare];
        selectPiece(startSquare.name);
        playedPiece = startSquare.piece;
        ghostCoordinate = startSquare.piece.getGhostCoordinate();
        if (dropSquare.name !== startSquare.name &&
            finishMove(startSquare.name, dropSquare.name, false)) {
            dropCoordinate = dropSquare.getCoordinate();
            abBoard.startGhostAnimation(playedPiece, ghostCoordinate,
                dropCoordinate);
        } else {
            startCoordinate = startSquare.getCoordinate();
            abBoard.startGhostAnimation(playedPiece, ghostCoordinate,
                startCoordinate);
        }
        abBoard.isDragging = false;
    };

    document.addEventListener("mousemove", abBoard.onMouseMove);
    document.addEventListener("mouseup", abBoard.onMouseUp);

    // -------------------------------------------------------------------------
    // Public api.

    return {
        DEFAULT_FEN: chessValue.defaultFEN,

        draw: function () {

            // Create the HTML squares.
            // Draw the chessboard.

            abBoard.createSquares();
            abBoard.draw();
        },

        flip: function () {

            // Change the board orientation.

            var container = abBoard.container;
            abBoard.isFlipped = !abBoard.isFlipped;
            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }
            abBoard.draw();
        },

        getActiveColor: function (n) {

            // Return the active color b|w in the n-th position.

            var position = {};
            position = abGame.getNthPosition(n);
            return position.activeColor;
        },

        getFEN: function (n) {

            // Return the n-th FEN string of the game.

            var lastIndex = 0;
            lastIndex = abGame.fenStrings.length - 1;
            if (typeof n !== "number" || n < 0 || n > lastIndex) {
                throw new Error(error.invalidParameter);
            }
            return abGame.fenStrings[n];
        },

        getGameInfo: function (info) {

            // Return the desired information.

            return abGame.getInfo(info);
        },

        getGameMoves: function () {

            // Return an array of the moves of the game.

            return abGame.moves;
        },

        getGameMovesPGN: function () {

            // Return an array of the moves of the game in PGN notation.

            return abGame.pgnMoves;
        },

        getLastPositionIndex: function () {

            // Return the index of the last position of the game.

            return abGame.fenStrings.length - 1;
        },

        getLegalMoves: function (n) {

            // Return an array of the legal moves in the n-th position.

            var position = {};
            position = abGame.getNthPosition(n);
            return position.getLegalMoves();
        },

        getPGN: function () {

            // Return the full PGN string.

            return abGame.exportPGN();
        },

        is50MovesDraw: function (n) {

            // Check if the draw by 50 moves rule can be claimed
            // in the n-th position.

            var position = {};
            position = abGame.getNthPosition(n);
            return position.isDrawBy50MovesRule();
        },

        isCheckmate: function (n) {

            // Check if the active player is checkmated in the n-th position.

            var position = {};
            position = abGame.getNthPosition(n);
            return position.isCheckmate();
        },

        isInCheck: function (n) {

            // Check if the active player is in check in the n-th position.

            return abGame.isInCheck(n);
        },

        isInsufficientMaterialDraw: function (n) {

            // Check if the material is insufficient to win
            // in the n-th position.

            var position = {};
            position = abGame.getNthPosition(n);
            return position.isDrawByInsufficientMaterial();
        },

        isLegal: function (n, move) {

            // Check if a move is legal in the n-th position.

            if (!regExp.move.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            return abGame.isLegal(n, move);
        },

        isStalemate: function (n) {

            // Check if the active player is stalemated in the n-th position.

            var activeColor = "";
            var position = abGame.getNthPosition(n);
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

            return navigate(index, true);
        },

        onMovePlayed: function (callback) {

            // Event fired when a move has been played.

            if (typeof callback !== "function") {
                throw new Error(error.invalidParameter);
            }
            event.onMovePlayed = callback;
        },

        play: function (move, promotion) {

            // Play the desired move and return the resulting FEN string.

            if (!regExp.move.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            return playMove(move, promotion, true);
        },

        reset: function () {

            // Reset the game and the board.

            abBoard.loadFEN();
            abBoard.clearMarks();
            abBoard.unlock();
            abGame = new Chessgame();
        },

        setFEN: function (fen) {

            // Load the FEN position on the board.

            abBoard.loadFEN(fen);
        },

        setGameInfo: function (info, value) {

            // Set the desired game information.

            return abGame.setTag(info, value);
        },

        setPGN: function (pgn) {

            // Set the PGN in the game.

            abGame.setPGN(pgn);
        }

    };
};