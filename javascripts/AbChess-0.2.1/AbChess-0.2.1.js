// AbChess-0.2.1.js
// 2017-02-12
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
        promotionSymbol: "=",
        resultBlack: "0-1",
        resultDraw: "1/2-1/2",
        resultWhite: "1-0",
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
        bottomBorder: "bottom-border",
        bottomBorderFragment: "bottom-border__fragment",
        ghostPiece: "ghost_piece",
        highlightedSquare: "square_highlighted",
        markedSquare: "square_marked",
        overflownSquare: "square_overflown",
        promotionButton: "promotion-button",
        promotionDiv: "promotion-div",
        rightBorder: "right-border",
        rightBorderFragment: "right-border__fragment",
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

    var regexCastle = /^e(?:1-c1|1-g1|8-c8|8-g8)$/;
    var regexComment = /\{[^]+?\}/gm;
    var regexEnPassant = /^[a-h]4-[a-h]3|[a-h]5-[a-h]6$/;
    var regexFEN = /^(?:[bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q|-)\s([a-h][36]|-)\s(0|[1-9]\d*)\s([1-9]\d*)$/;
    var regexFENRow = /^[bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8$/i;
    var regexMove = /^[a-h][1-8]-[a-h][1-8]$/;
    var regexPGNMove = /(?:[1-9][0-9]*\.{1,3}\s*)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm;
    var regexPromotion = /^[a-h]2-[a-h]1|[a-h]7-[a-h]8$/;
    var regexTagPair = /\[[A-Z][^]+?\s"[^]+?"\]/gm;
    var regexVariation = /\([^()]*?\)/gm;

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

        var activeColor = "";
        var allowedCastles = "";
        var enPassantSquare = "";
        var fenMatches = [];
        var fullmoveNumber = 0;
        var halfmoveClock = 0;
        var occupiedSquares = {};
        var the_position = {};
        if (!Position.isValidFEN(fen)) {
            throw new Error(error.invalidFEN);
        }
        fenMatches = regexFEN.exec(fen);
        activeColor = fenMatches[1];
        allowedCastles = fenMatches[2];
        enPassantSquare = fenMatches[3];
        fullmoveNumber = Number(fenMatches[5]);
        halfmoveClock = Number(fenMatches[4]);
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

            var arrival = "";
            var pieceColor = "";
            var start = "";
            var targets = [];
            var testPosition = {};
            if (!regexMove.test(move)) {
                return false;
            }
            start = move.substr(0, 2);
            if (!occupiedSquares.hasOwnProperty(start)) {
                return false;
            }
            pieceColor = (occupiedSquares[start] ===
                occupiedSquares[start].toLowerCase())
                ? chessValue.black
                : chessValue.white;
            if (activeColor !== pieceColor) {
                return false;
            }
            testPosition = the_position.getNextPosition(move);
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

            var desiredKing = "";
            var square = "";
            desiredKing = (color === chessValue.black)
                ? chessValue.blackKing
                : chessValue.whiteKing;
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

        the_position.getNextActiveColor = function () {

            var nextActiveColor = "";
            nextActiveColor = (the_position.activeColor === chessValue.white)
                ? chessValue.black
                : chessValue.white;
            return nextActiveColor;
        };

        the_position.getNextAllowedCastles = function (move) {

            var arrivalSquare = "";
            var newAllowedCastles = "";
            var playedPiece = "";
            var startSquare = "";
            if (!regexMove.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            if (allowedCastles === "-") {
                return allowedCastles;
            }
            newAllowedCastles = allowedCastles;
            startSquare = move.substr(0, 2);
            playedPiece = occupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            if (allowedCastles.search(/[kq]/) !== -1) {
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
            if (allowedCastles.search(/[KQ]/) !== -1) {
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

            var arrivalRowNumber = 0;
            var arrivalSquare = "";
            var nextEnPassantTarget = "-";
            var playedPiece = "";
            var startRowNumber = 0;
            var startSquare = "";
            if (!regexMove.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            arrivalSquare = move.substr(3, 2);
            arrivalRowNumber = Number(arrivalSquare[1]);
            startSquare = move.substr(0, 2);
            startRowNumber = Number(startSquare[1]);
            playedPiece = occupiedSquares[startSquare];
            if (playedPiece === chessValue.blackPawn ||
                playedPiece === chessValue.whitePawn) {
                if (arrivalRowNumber - startRowNumber === 2) {
                    nextEnPassantTarget = startSquare[0] + "3";
                }
                if (startRowNumber - arrivalRowNumber === 2) {
                    nextEnPassantTarget = startSquare[0] + "6";
                }
            }
            return nextEnPassantTarget;
        };

        the_position.getNextFullmoveNumber = function () {

            var nextFullmoveNumber = 0;
            nextFullmoveNumber =
                (the_position.activeColor === chessValue.black)
                    ? fullmoveNumber + 1
                    : fullmoveNumber;
            return nextFullmoveNumber;
        };

        the_position.getNextHalfmoveClock = function (move) {

            var arrivalSquare = "";
            var playedPiece = "";
            var nextHalfmoveClock = 0;
            var startSquare = "";
            var takenPiece = false;
            if (!regexMove.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            startSquare = move.substr(0, 2);
            playedPiece = occupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            takenPiece = occupiedSquares.hasOwnProperty(arrivalSquare);
            if (playedPiece === chessValue.blackPawn ||
                playedPiece === chessValue.whitePawn || takenPiece) {
                nextHalfmoveClock = 0;
            } else {
                nextHalfmoveClock = halfmoveClock + 1;
            }
            return nextHalfmoveClock;
        };

        the_position.getNextPosition = function (move, promotion) {

            // Return the new Position object after a move has been played.
            // The move parameter must be on the form [a-h][1-8]-[a-h][1-8].
            // The data of FEN position are updated here.
            // The played move is assumed to be legal.

            var arrivalSquare = "";
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
            var startSquare = "";
            if (!regexMove.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            newOccupiedSquares = Position.fenToObject(the_position.fenString);
            startSquare = move.substr(0, 2);
            playedPiece = newOccupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            if (playedPiece.toLowerCase() === chessValue.blackKing &&
                regexCastle.test(move)) {
                rookStart = (arrivalSquare[0] === chessValue.columns[2])
                    ? chessValue.columns[0] + arrivalSquare[1]
                    : chessValue.columns[7] + arrivalSquare[1];
                rookArrival = (arrivalSquare[0] === chessValue.columns[2])
                    ? chessValue.columns[3] + arrivalSquare[1]
                    : chessValue.columns[5] + arrivalSquare[1];
                delete newOccupiedSquares[rookStart];
                if (startSquare === "e1") {
                    newOccupiedSquares[rookArrival] = chessValue.whiteRook;
                } else {
                    newOccupiedSquares[rookArrival] = chessValue.blackRook;
                }
            } else if (playedPiece.toLowerCase() === chessValue.blackPawn) {
                if (arrivalSquare === enPassantSquare &&
                    regexEnPassant.test(move)) {
                    enPassantCapture = enPassantSquare[0] + startSquare[1];
                    delete newOccupiedSquares[enPassantCapture];
                }
                if (regexPromotion.test(move)) {
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

        the_position.getPGNMove = function (move, promotion, withNumber,
            stringToAdd) {

            // Return the PGN notation for the desired move.

            var ambiguousFile = false;
            var ambiguousRow = false;
            var arrival = "";
            var clue = "";
            var isCapture = false;
            var isPromotion = false;
            var pgnMove = "";
            var playedPiece = "";
            var start = "";
            if (!regexMove.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            if (withNumber) {
                pgnMove = (activeColor === chessValue.white)
                    ? fullmoveNumber + ". "
                    : fullmoveNumber + "... ";
            }
            start = move.substr(0, 2);
            playedPiece = occupiedSquares[start];
            arrival = move.substr(3, 2);
            if (regexCastle.test(move)) {
                if (arrival[0] === chessValue.columns[2]) {
                    pgnMove += chessValue.castleQueenSymbol;
                } else {
                    pgnMove += chessValue.castleKingSymbol;
                }
            } else {
                isCapture = occupiedSquares.hasOwnProperty(arrival);
                switch (playedPiece.toLowerCase()) {
                    case chessValue.blackBishop:
                    case chessValue.blackKing:
                    case chessValue.blackKnight:
                    case chessValue.blackQueen:
                    case chessValue.blackRook:
                        pgnMove += playedPiece.toUpperCase();
                        break;
                    case chessValue.blackPawn:
                        if (isCapture || arrival === enPassantSquare) {
                            pgnMove += start[0];
                            isCapture = true;
                        }
                        isPromotion = regexPromotion.test(move);
                        break;
                }
                if (playedPiece.toLowerCase() !== chessValue.blackPawn &&
                    playedPiece.toLowerCase() !== chessValue.blackKing) {
                    Object.keys(occupiedSquares).forEach(function (key) {
                        var legalSquares = [];
                        var piece = "";
                        if (ambiguousFile && ambiguousRow) {
                            return;
                        }
                        piece = occupiedSquares[key];
                        if (piece === playedPiece && key !== start) {
                            legalSquares = the_position.getLegalSquares(key);
                            if (legalSquares.indexOf(arrival) !== -1) {
                                if (key[0] === start[0]) {
                                    ambiguousFile = true;
                                } else if (key[1] === start[1]) {
                                    ambiguousRow = true;
                                } else {
                                    clue = start[0];
                                }
                            }
                        }
                    });
                    if (ambiguousFile) {
                        clue += start[1];
                    }
                    if (ambiguousRow) {
                        clue += start[0];
                    }
                    pgnMove += clue;
                }
                if (isCapture) {
                    pgnMove += chessValue.captureSymbol;
                }
                pgnMove += arrival;
                if (isPromotion) {
                    pgnMove += chessValue.promotionSymbol +
                        promotion.toUpperCase();
                }
            }
            stringToAdd = stringToAdd || "";
            pgnMove += stringToAdd;
            return pgnMove;
        };

        the_position.getPiecesPlaces = function (color) {

            // Return an array of the names of the squares where are placed
            // the pieces of a specific color.

            var placements = [];
            Object.keys(occupiedSquares).forEach(function (square) {
                var piece = occupiedSquares[square];
                if ((color === chessValue.white &&
                    piece === piece.toUpperCase())
                    || (color === chessValue.black &&
                        piece === piece.toLowerCase())) {
                    placements.push(square);
                }
            });
            return placements;
        };

        the_position.getSimpleNotation = function (pgnMove) {

            // Convert a PGN move in an simple notation [a-h][1-8]-[a-h][1-8].

            var ambiguity = "";
            var arrival = "";
            var matches = [];
            var playedPiece = "";
            var promotion = "";
            var regexKing = /^(Kx?([a-h][1-8])|O-O(?:-O)?)(?:\+|#)?$/;
            var regexPawn = /^([a-h]?)x?([a-h][1-8])(\=[BNQR])?(?:\+|#)?$/;
            var regexPiece = /^[BNQR]([a-h]?[1-8]?)x?([a-h][1-8])(?:\+|#)?$/;
            var rowNumber = 0;
            var samePieces = [];
            var start = "";
            if (regexKing.test(pgnMove)) {
                matches = regexKing.exec(pgnMove);
                if (matches[1] === chessValue.castleKingSymbol ||
                    matches[1] === chessValue.castleQueenSymbol) {
                    rowNumber = (activeColor === chessValue.black)
                        ? 8
                        : 1;
                    start = "e" + rowNumber;
                    arrival = (matches[1] === chessValue.castleKingSymbol)
                        ? "g" + rowNumber
                        : "c" + rowNumber;
                    return start + "-" + arrival;
                }
                playedPiece = chessValue.whiteKing;
                arrival = matches[2];
            } else if (regexPawn.test(pgnMove)) {
                playedPiece = chessValue.whitePawn;
                matches = regexPawn.exec(pgnMove);
                ambiguity = matches[1];
                arrival = matches[2];
                if (pgnMove.indexOf(chessValue.promotionSymbol) !== -1) {
                    promotion = matches[3];
                }
            } else if (regexPiece.test(pgnMove)) {
                playedPiece = pgnMove[0];
                matches = regexPiece.exec(pgnMove);
                ambiguity = matches[1];
                arrival = matches[2];
            } else {
                throw new SyntaxError(error.invalidParameter);
            }
            samePieces = the_position.getPiecesPlaces(activeColor);
            samePieces = samePieces.filter(function (place) {
                var piece = occupiedSquares[place];
                return (piece.toLowerCase() === playedPiece.toLowerCase());
            });
            samePieces = samePieces.filter(function (place) {
                var legalSquares = [];
                legalSquares = the_position.getLegalSquares(place);
                return (legalSquares.indexOf(arrival) !== -1);
            });
            if (samePieces.length > 1) {
                start = samePieces.find(function (place) {
                    return (place.indexOf(ambiguity) !== -1);
                });
            } else {
                start = samePieces[0];
            }
            return start + "-" + arrival + promotion;
        };

        the_position.getTargets = function (start, onlyOffensive) {

            // Return the target a specific piece can reach.
            // A target is a square that a piece controls or can move on.
            // The onlyOffensive parameter allows to filter king moves
            // and pawn non-attacking moves.

            var color = "";
            var piece = "";
            var targets = [];
            if (!occupiedSquares.hasOwnProperty(start)) {
                return targets;
            }
            piece = occupiedSquares[start];
            color = (piece.toLowerCase() === piece)
                ? chessValue.black
                : chessValue.white;
            switch (piece) {
                case chessValue.blackBishop:
                case chessValue.whiteBishop:
                    targets = the_position.getTargets_bishop(start, color);
                    break;
                case chessValue.blackKing:
                case chessValue.whiteKing:
                    targets = the_position.getTargets_kingFull(start,
                        color, onlyOffensive);
                    break;
                case chessValue.blackKnight:
                case chessValue.whiteKnight:
                    targets = the_position.getTargets_knight(start, color);
                    break;
                case chessValue.blackPawn:
                case chessValue.whitePawn:
                    targets = the_position.getTargets_pawn(start,
                        color, onlyOffensive);
                    break;
                case chessValue.blackQueen:
                case chessValue.whiteQueen:
                    targets = the_position.getTargets_queen(start, color);
                    break;
                case chessValue.blackRook:
                case chessValue.whiteRook:
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
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = "";
            colNumber = chessValue.columns.indexOf(start[0]) + 1;
            testColNumber = colNumber + 1;
            rowNumber = Number(start[1]);
            testRowNumber = rowNumber + 1;
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chessValue.black)
                ? chessValue.white
                : chessValue.black;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            while (testColNumber < 9 && testRowNumber < 9) {
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
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
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
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
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
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
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
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
            var testSquare = "";
            alliesPlaces = the_position.getPiecesPlaces(color);
            colNumber = chessValue.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            colMoves.forEach(function (colValue) {
                rowMoves.forEach(function (rowValue) {
                    if (colValue !== 0 || rowValue !== 0) {
                        testColNumber = colNumber + colValue;
                        testRowNumber = rowNumber + rowValue;
                        if (testColNumber > 0 && testColNumber < 9 &&
                            testRowNumber > 0 && testRowNumber < 9) {
                            testSquare = chessValue.columns[testColNumber - 1] +
                                testRowNumber;
                            if (alliesPlaces.indexOf(testSquare) === -1) {
                                targets.push(testSquare);
                            }
                        }
                    }
                });
            });
            return targets;
        };

        the_position.getTargets_kingFull = function (start, color, noCastles) {

            // Return an array of squares a king on a specific square can reach.
            // Add castles,  filter ennemy king opposition.

            var ennemiesColor = "";
            var ennemyKingSquare = "";
            var ennemyKingTargets = [];
            var kingSideCastle = ["f", "g"];
            var normalTargets = [];
            var queenSideCastle = ["b", "c", "d"];
            var targets = [];
            var testSquare = "";
            normalTargets = the_position.getTargets_king(start, color);
            ennemiesColor = (color === chessValue.black)
                ? chessValue.white
                : chessValue.black;
            ennemyKingSquare = the_position.getKingSquare(ennemiesColor);
            ennemyKingTargets = the_position.getTargets_king(ennemyKingSquare,
                ennemiesColor);
            targets = normalTargets.filter(function (target) {
                return (ennemyKingTargets.indexOf(target) === -1);
            });
            if (noCastles) {
                return targets;
            }
            if (start === "e1" && !the_position.isControlledBy("e1",
                chessValue.black)) {
                if (allowedCastles.indexOf(chessValue.whiteQueen) !== -1 &&
                    !the_position.isControlledBy("d1", chessValue.black)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + "1";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("c1");
                    }
                }
                if (allowedCastles.indexOf(chessValue.whiteKing) !== -1 &&
                    !the_position.isControlledBy("f1", chessValue.black)) {
                    if (kingSideCastle.every(function (column) {
                        testSquare = column + "1";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("g1");
                    }
                }
            } else if (start === "e8" &&
                !the_position.isControlledBy("e8", chessValue.white)) {
                if (allowedCastles.indexOf(chessValue.blackQueen) !== -1 &&
                    !the_position.isControlledBy("d8", chessValue.white)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + "8";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("c8");
                    }
                }
                if (allowedCastles.indexOf(chessValue.blackKing) !== -1 &&
                    !the_position.isControlledBy("f8", chessValue.white)) {
                    if (kingSideCastle.every(function (column) {
                        testSquare = column + "8";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("g8");
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
            var testSquare = "";
            alliesPlaces = the_position.getPiecesPlaces(color);
            colNumber = chessValue.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            colMoves.forEach(function (colValue) {
                rowMoves.forEach(function (rowValue) {
                    if (Math.abs(colValue) !== Math.abs(rowValue)) {
                        testColNumber = colNumber + colValue;
                        testRowNumber = rowNumber + rowValue;
                        if (testColNumber > 0 && testColNumber < 9 &&
                            testRowNumber > 0 && testRowNumber < 9) {
                            testSquare = chessValue.columns[testColNumber - 1] +
                                testRowNumber;
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
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = "";
            colNumber = chessValue.columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            direction = (color === chessValue.black)
                ? -1
                : 1;
            testRowNumber = rowNumber + direction;
            ennemiesColor = (color === chessValue.black)
                ? chessValue.white
                : chessValue.black;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            colDirections.forEach(function (colDirection) {
                testColNumber = colNumber + colDirection;
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
                if (ennemiesPlaces.indexOf(testSquare) !== -1 ||
                    enPassantSquare === testSquare) {
                    targets.push(testSquare);
                } else if (onlyOffensive) {
                    targets.push(testSquare);
                }
            });
            if (!onlyOffensive) {
                testColNumber = colNumber;
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
                alliesPlaces = the_position.getPiecesPlaces(color);
                if (alliesPlaces.indexOf(testSquare) === -1 &&
                    ennemiesPlaces.indexOf(testSquare) === -1) {
                    targets.push(testSquare);
                    if ((rowNumber === 2 && direction === 1) ||
                        (rowNumber === 7 && direction === -1)) {
                        testRowNumber = rowNumber + 2 * direction;
                        testSquare = chessValue.columns[testColNumber - 1] +
                            testRowNumber;
                        if (alliesPlaces.indexOf(testSquare) === -1 &&
                            ennemiesPlaces.indexOf(testSquare) === -1) {
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

            return the_position.getTargets_bishop(start,
                color).concat(the_position.getTargets_rook(start, color));
        };

        the_position.getTargets_rook = function (start, color) {

            // Return an array of squares a rook on a specific square can reach.

            var alliesPlaces = [];
            var colNumber = 0;
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = "";
            colNumber = chessValue.columns.indexOf(start[0]) + 1;
            testColNumber = colNumber + 1;
            rowNumber = Number(start[1]);
            testRowNumber = rowNumber;
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chessValue.black)
                ? chessValue.white
                : chessValue.black;
            ennemiesPlaces = the_position.getPiecesPlaces(ennemiesColor);
            while (testColNumber < 9) {
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
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
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
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
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
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
                testSquare = chessValue.columns[testColNumber - 1] +
                    testRowNumber;
                if (alliesPlaces.indexOf(testSquare) > -1) {
                    break;
                }
                targets.push(testSquare);
                if (ennemiesPlaces.indexOf(testSquare) > -1) {
                    break;
                }
                testRowNumber -= 1;
            }
            return targets;
        };

        the_position.hasLegalMoves = function () {

            // Return true if the position is playable.

            var piecesPlaces = [];
            piecesPlaces = the_position.getPiecesPlaces(activeColor);
            return piecesPlaces.some(function (square) {
                var legalSquares = [];
                legalSquares = the_position.getLegalSquares(square);
                return (legalSquares.length > 0);
            });
        };

        the_position.isCheckmate = function () {

            // Return true if the active king is checkmated.

            var isCheck = false;
            isCheck = the_position.isInCheck(activeColor);
            if (!isCheck) {
                return false;
            }
            return !the_position.hasLegalMoves();
        };

        the_position.isControlledBy = function (square, color) {

            // Check if the desired square is controlled
            // by a specified color.

            var ennemies = [];
            ennemies = the_position.getPiecesPlaces(color);
            return ennemies.some(function (ennemy) {
                var targets = the_position.getTargets(ennemy, true);
                return (targets.indexOf(square) > -1);
            });
        };

        the_position.isDrawBy50MovesRule = function () {

            // Check if the position is draw by the 50 moves rule.

            return (halfmoveClock > 99);
        };

        the_position.isDrawByInsufficientMaterial = function () {

            // Check if the position is draw by the insufficient material rule.

            var blackPieces = [];
            var testArray = [];
            var whitePieces = [];
            var insufficients = [
                ["b"],
                ["n"],
                ["n", "n"]
            ];
            var isInsufficient = false;
            blackPieces = the_position.getPiecesPlaces(chessValue.black);
            if (blackPieces.length > 3) {
                return false;
            }
            if (blackPieces.length > 1) {
                blackPieces.forEach(function (key) {
                    var piece = occupiedSquares[key];
                    if (piece !== chessValue.blackKing) {
                        testArray.push(piece);
                    }
                });
                isInsufficient = insufficients.some(function (insufficient) {
                    var sameArray = false;
                    if (insufficient.length !== testArray.length) {
                        return false;
                    }
                    sameArray = insufficient.every(function (value, index) {
                        return (testArray[index] === value);
                    });
                    return sameArray;
                });
                if (!isInsufficient) {
                    return false;
                }
            }
            whitePieces = the_position.getPiecesPlaces(chessValue.white);
            if (whitePieces.length > 3) {
                return false;
            }
            if (whitePieces.length === 1) {
                return true;
            }
            testArray = [];
            whitePieces.forEach(function (key) {
                var piece = occupiedSquares[key];
                if (piece !== chessValue.whiteKing) {
                    testArray.push(piece.toLowerCase());
                }
            });
            isInsufficient = insufficients.some(function (insufficient) {
                var sameArray = false;
                if (insufficient.length !== testArray.length) {
                    return false;
                }
                sameArray = insufficient.every(function (value, index) {
                    return (testArray[index] === value);
                });
                return sameArray;
            });
            return isInsufficient;
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

        return the_position;
    }

    Position.fenToObject = function (fen) {

        // Convert a FEN string to an object.

        var object = {};
        var regexNumber = /[1-8]/;
        var regexPiece = /[bknpqr]/i;
        var rows = "";
        var rowsArray = [];
        rows = fen.replace(/\s.*/, "");
        rowsArray = rows.split("/");
        rowsArray.forEach(function (row, index) {
            var colNumber = 1;
            var rowNumber = 8 - index;
            row.split("").forEach(function (char) {
                var name = "";
                if (regexPiece.test(char)) {
                    name = chessValue.columns[colNumber - 1] + rowNumber;
                    object[name] = char;
                    colNumber += 1;
                } else if (regexNumber.test(char)) {
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
        if (!onlyRows && !regexFEN.test(fen)) {
            return false;
        }
        return rows.every(function (row) {
            return regexFENRow.test(row);
        });
    };

    Position.objectToFEN = function (position) {

        // Convert a position to a FEN string.

        var colNumber = 0;
        var counter = 0;
        var fenPosition = "";
        var rowNumber = 0;
        var square = "";
        rowNumber = 8;
        while (rowNumber > 0) {
            colNumber = 1;
            counter = 0;
            while (colNumber < 9) {
                square = chessValue.columns[colNumber - 1] + rowNumber;
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
                        fenPosition += "/";
                    }
                }
                colNumber += 1;
            }
            rowNumber -= 1;
        }
        return fenPosition;
    };

    // -------------------------------------------------------------------------

    function Piece(name, url) {

        // The Piece class constructs an HTML DIV element.
        // The name property is a 2 chars string (b|w)[bknqr]
        // to identify the chess piece.
        // The chess image is set with css backgroundImage url.

        var backgroundImage = "url('" + url + "')";
        var div = {};
        var ghost = {};
        var the_piece = {};
        div = document.createElement("DIV");
        div.className = css.squarePiece;
        div.style.backgroundImage = backgroundImage;
        ghost = document.createElement("DIV");
        ghost.className = css.ghostPiece;
        ghost.style.backgroundImage = backgroundImage;

        the_piece = {
            div: div,
            ghost: ghost,
            isCurrentlyAnimated: false,
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
            if (opacity < 1) {
                rAF(function () {
                    the_piece.fadingPlace(square);
                });
            }
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

            var x = Math.round(ghost.getBoundingClientRect().left +
                window.pageXOffset);
            var y = Math.round(ghost.getBoundingClientRect().top +
                window.pageYOffset);
            return [x, y];
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

        div.addEventListener("mousedown", the_piece.mouseDownHandler);

        return the_piece;
    }

    // -------------------------------------------------------------------------

    function Square(name) {

        // The Square class constructs a HTML DIV element
        // named with its coordinate.

        var cssClass = "";
        var div = document.createElement("DIV");
        var isWhiteSquare = Square.isWhite(name);
        var the_square = {
            board: null,
            canvas: null,
            div: div,
            hasCircle: false,
            isHighlighted: false,
            isMarked: false,
            isOverflown: false,
            isSelected: false,
            name: name,
            piece: null
        };
        cssClass = (isWhiteSquare)
            ? css.square + " " + css.whiteSquare
            : css.square + " " + css.blackSquare;
        div.className = cssClass;

        the_square.clickHandler = function () {
            if (typeof the_square.board.onSquareClick === "function") {
                the_square.board.onSquareClick(the_square.name);
            }
        };

        the_square.drawFilledCircle = function (x, y, radius, cssColor) {
            var context = the_square.canvas.getContext("2d");
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fillStyle = cssColor;
            context.fill();
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

            var className = "";
            the_square.isHighlighted = !the_square.isHighlighted;
            className = the_square.getClassName();
            rAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.isEmpty = function () {

            // Check whether the square is empty.

            return (the_square.piece === null);
        };

        the_square.mark = function () {

            // Mark the square (king in check).
            // Cancel if already marked.

            var className = "";
            the_square.isMarked = !the_square.isMarked;
            className = the_square.getClassName();
            rAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.overfly = function () {

            // Overfly the square.
            // Cancel if already overflown.

            var className = "";
            the_square.isOverflown = !the_square.isOverflown;
            className = the_square.getClassName();
            rAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.select = function () {

            // Select the square.
            // Cancel if already selected.

            var className = "";
            the_square.isSelected = !the_square.isSelected;
            className = the_square.getClassName();
            rAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.div.addEventListener("click", the_square.clickHandler);
        the_square.div.addEventListener("mouseenter",
            the_square.mouseEnterHandler);
        the_square.div.addEventListener("mouseleave",
            the_square.mouseLeaveHandler);
        the_square.div.addEventListener("mouseup", the_square.mouseUpHandler);

        return the_square;
    }

    Square.isWhite = function (name) {

        // Check whether the square is white or not.

        var colNumber = 0;
        var rowNumber = 0;
        colNumber = chessValue.columns.indexOf(name[0]) + 1;
        rowNumber = Number(name[1]);
        return (rowNumber % 2 === 0)
            ? (colNumber % 2 === 1)
            : (colNumber % 2 === 0);
    };

    // -------------------------------------------------------------------------

    function Chessboard(containerId, config) {

        // The Chessboard class constructs an HTML chessboard.

        var the_board = {
            animationSpeed: config.animationSpeed,
            clickablePieces: config.clickable,
            container: document.getElementById(containerId),
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
            onSquareMouseUp: null,
            onSquareLeave: null,
            pendingMove: null,
            promotionDiv: document.createElement("DIV"),
            selectedSquare: null,
            squares: {},
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

        the_board.animateGhost = function (piece, ghostCoordinate, coordinate) {

            // Animate the ghost movement.

            var coeffX = 0;
            var coeffY = 0;
            var diffX = 0;
            var diffY = 0;
            var directionX = 0;
            var directionY = 0;
            var ghost = piece.ghost;
            var ghostX = ghostCoordinate[0];
            var ghostY = ghostCoordinate[1];
            var speed = 0;
            the_board.isNavigating = true;
            piece.isCurrentlyAnimated = true;
            switch (the_board.animationSpeed) {
                case "slow":
                    speed = 0.1;
                    break;
                case "normal":
                    speed = 0.25;
                    break;
                case "fast":
                    speed = 0.5;
                    break;
                default:
                    speed = 0.25;
            }
            if (ghostX === coordinate[0] && ghostY === coordinate[1]) {
                if (ghost.parentElement !== null) {
                    document.body.removeChild(ghost);
                }
                piece.div.style.visibility = "visible";
                piece.isCurrentlyAnimated = false;
                the_board.isNavigating = false;
                return;
            }
            if (ghostX < coordinate[0]) {
                diffX = coordinate[0] - ghostX;
                directionX = 1;
            } else {
                diffX = ghostX - coordinate[0];
                directionX = -1;
            }
            if (ghostY < coordinate[1]) {
                diffY = coordinate[1] - ghostY;
                directionY = 1;
            } else {
                diffY = ghostY - coordinate[1];
                directionY = -1;
            }
            coeffX = Math.ceil(diffX * speed);
            coeffY = Math.ceil(diffY * speed);
            ghostCoordinate[0] = ghostX + directionX * coeffX;
            ghostCoordinate[1] = ghostY + directionY * coeffY;
            ghost.style.left = ghostCoordinate[0] + "px";
            ghost.style.top = ghostCoordinate[1] + "px";
            rAF(function () {
                the_board.animateGhost(piece, ghostCoordinate, coordinate);
            });
        };

        the_board.animateNavigation = function (animations) {

            // Animate the navigation to a position.

            animations.forEach(function (animation) {
                var arrival = animation.arrival;
                var piece = animation.piece;
                var start = animation.start;
                if (arrival === undefined) {
                    piece.fadingRemove();
                } else if (start === undefined) {
                    piece.fadingPlace(arrival);
                } else {
                    the_board.movePiece(piece, start, arrival);
                }
            });
        };

        the_board.askPromotion = function (color) {

            // Display the promotion div to complete a move.

            var buttons = the_board.promotionDiv.childNodes;
            var pieces = [
                chessValue.blackQueen, chessValue.blackRook,
                chessValue.blackBishop, chessValue.blackKnight
            ];
            while (buttons.length > 0) {
                the_board.promotionDiv.removeChild(
                    the_board.promotionDiv.lastChild);
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
                the_board.promotionDiv.appendChild(promotionButton);
            });
            the_board.lock();
            rAF(function () {
                the_board.promotionDiv.style.display = "block";
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
                if (currentSquare.isSelected) {
                    currentSquare.select();
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

        the_board.createSquares = function () {

            // Create the squares property.

            var canvas = {};
            var canvasWidth = "";
            var colNumber = 0;
            var column = "";
            var name = "";
            var radius = 0;
            var rowNumber = 0;
            var square = {};
            var squares = {};
            var xy = 0;
            canvasWidth = Math.floor(the_board.width / 8) + "px";
            radius = Math.floor(the_board.width / 62);
            xy = Math.floor(the_board.width / 16);
            rowNumber = 1;
            while (rowNumber < 9) {
                colNumber = 1;
                while (colNumber < 9) {
                    column = chessValue.columns[colNumber - 1];
                    name = column + rowNumber;
                    canvas = document.createElement("CANVAS");
                    canvas.className = css.squareCanvas;
                    canvas.setAttribute("height", canvasWidth);
                    canvas.setAttribute("width", canvasWidth);
                    square = new Square(name);
                    square.canvas = canvas;
                    square.drawFilledCircle(xy, xy, radius,
                        the_board.legalMarksColor);
                    square.board = the_board;
                    squares[name] = square;
                    colNumber += 1;
                }
                rowNumber += 1;
            }
            the_board.squares = squares;
        };

        the_board.displayCanvas = function (squares) {

            // Display the circles for an array of squares.

            squares.forEach(function (name) {
                var square = the_board.squares[name];
                rAF(function () {
                    if (square.hasCircle) {
                        square.div.removeChild(square.canvas);
                    } else {
                        square.div.appendChild(square.canvas);
                    }
                    square.hasCircle = !square.hasCircle;
                });
            });
        };

        the_board.draw = function () {

            // Draw the empty chessboard.

            var borderFragment = {};
            var bottomBorder = {};
            var colNumber = 0;
            var column = "";
            var index = 0;
            var rightBorder;
            var rowNumber = 0;
            var square = {};
            var squaresDiv = {};
            the_board.promotionDiv.className = css.promotionDiv;
            squaresDiv = document.createElement("DIV");
            squaresDiv.style.width = the_board.width + "px";
            squaresDiv.style.height = the_board.width + "px";
            squaresDiv.className = css.squaresDiv;
            if (!the_board.isFlipped) {
                // Draw the squares (the first row is from a8 to h8).
                rowNumber = 8;
                while (rowNumber > 0) {
                    colNumber = 1;
                    while (colNumber < 9) {
                        column = chessValue.columns[colNumber - 1];
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
                        column = chessValue.columns[colNumber - 1];
                        square = the_board.squares[column + rowNumber];
                        squaresDiv.appendChild(square.div);
                        colNumber -= 1;
                    }
                    rowNumber += 1;
                }
            }
            rAF(function () {
                squaresDiv.appendChild(the_board.promotionDiv);
                the_board.container.appendChild(squaresDiv);
            });
            if (the_board.notationBorder) {
                bottomBorder = document.createElement("DIV");
                bottomBorder.className = css.bottomBorder;
                bottomBorder.style.width = the_board.width + "px";
                colNumber = 1;
                while (colNumber < 9) {
                    borderFragment = document.createElement("DIV");
                    borderFragment.className = css.bottomBorderFragment;
                    index = (the_board.isFlipped)
                        ? 8 - colNumber
                        : colNumber - 1;
                    borderFragment.innerHTML =
                        chessValue.columns[index].toUpperCase();
                    bottomBorder.appendChild(borderFragment);
                    colNumber += 1;
                }
                rightBorder = document.createElement("DIV");
                rightBorder.className = css.rightBorder;
                rightBorder.style.height = the_board.width + "px";
                rowNumber = 1;
                while (rowNumber < 9) {
                    borderFragment = document.createElement("DIV");
                    borderFragment.className = css.rightBorderFragment;
                    borderFragment.style.lineHeight =
                        Math.floor(the_board.width / 8) + "px";
                    index = (the_board.isFlipped)
                        ? rowNumber
                        : 9 - rowNumber;
                    borderFragment.innerHTML = index;
                    rightBorder.appendChild(borderFragment);
                    rowNumber += 1;
                }
                rAF(function () {
                    the_board.container.appendChild(rightBorder);
                    the_board.container.appendChild(bottomBorder);
                });
            }
        };

        the_board.empty = function () {

            // Remove all the pieces of the board.

            Object.keys(the_board.squares).forEach(function (key) {
                var currentSquare = the_board.squares[key];
                if (!currentSquare.isEmpty()) {
                    currentSquare.piece.animateRemove();
                    currentSquare.piece.remove();
                }
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
            var newPosition = position.occupiedSquares;
            var oldPosition = the_board.getPositionObject();
            var newDifferentSquares = [];
            var oldDifferentSquares = [];
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
                    if (newPiece === oldPiece) {
                        startSquare = the_board.squares[oldSquare];
                        arrivalSquare = the_board.squares[newSquare];
                        pieceToAnimate = startSquare.piece;
                        animation.start = startSquare;
                        animation.arrival = arrivalSquare;
                        animation.piece = pieceToAnimate;
                        animations.push(animation);
                        indexToRemove = oldIndex;
                        return true;
                    } else {
                        return false;
                    }
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
                var newPiece = {};
                var pieceName = "";
                var url = "";
                pieceName = (char.toLowerCase() === char)
                    ? chessValue.black + char
                    : chessValue.white + char.toLowerCase();
                url = the_board.imagesPath + pieceName +
                    the_board.imagesExtension;
                newPiece = new Piece(pieceName, url);
                animation.arrival = arrivalSquare;
                animation.piece = newPiece;
                animations.push(animation);
            });
            return animations;
        };

        the_board.getPositionObject = function () {

            // Return a position object of the pieces places.

            var occupiedSquares = {};
            Object.keys(the_board.squares).forEach(function (key) {
                var pieceChar = "";
                var pieceName = "";
                var square = the_board.squares[key];
                if (!square.isEmpty()) {
                    pieceName = square.piece.name;
                    pieceChar = (pieceName[0] === chessValue.white)
                        ? pieceName[1].toUpperCase()
                        : pieceName[1].toLowerCase();
                    occupiedSquares[key] = pieceChar;
                }
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
                var char = "";
                var piece = {};
                var pieceName = "";
                var square = {};
                var url = "";
                char = squares[squareName];
                pieceName = (char.toLowerCase() === char)
                    ? chessValue.black + char
                    : chessValue.white + char.toLowerCase();
                url = the_board.imagesPath + pieceName +
                    the_board.imagesExtension;
                piece = new Piece(pieceName, url);
                square = the_board.squares[squareName];
                piece.animatePut(square);
                piece.put(square);
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

        the_board.movePiece = function (playedPiece, startSquare,
            arrivalSquare, noAnimation, isCapture, capturedPiece) {

            // Move a piece and modify its place in the DOM tree.

            var arrivalCoordinate = arrivalSquare.getCoordinate();
            var ghostWidth = 0;
            var squareCoordinate = startSquare.getCoordinate();
            // if (playedPiece.isCurrentlyAnimated) {
            //     return;
            // }
            if (typeof noAnimation !== "boolean") {
                noAnimation = false;
            }
            if (typeof isCapture !== "boolean") {
                isCapture = false;
            }
            ghostWidth = Math.floor(abBoard.width / 8);
            rAF(function () {
                var ghost = {};
                if (!noAnimation) {
                    ghost = playedPiece.ghost;
                    playedPiece.div.style.visibility = "hidden";
                    ghost.style.height = ghostWidth + "px";
                    ghost.style.width = ghostWidth + "px";
                    ghost.style.left = squareCoordinate[0] + "px";
                    ghost.style.top = squareCoordinate[1] + "px";
                    document.body.appendChild(ghost);
                    the_board.animateGhost(playedPiece, squareCoordinate,
                        arrivalCoordinate);
                }
                if (isCapture) {
                    capturedPiece.fadingRemove();
                }
                playedPiece.animateRemove();
                playedPiece.animatePut(arrivalSquare);
            });
        };

        the_board.play = function (move, promotion, noAnimation) {

            // Play the desired move on the board.
            // Manage special moves (castle, en passant, promotion).

            var arrival = "";
            var arrivalSquare = {};
            var capturedPiece = {};
            var emptyArrival = false;
            var enPassant = "";
            var enPassantSquare = {};
            var newPiece = {};
            var newPieceColor = "";
            var newPieceName = "";
            var playedPiece = {};
            var rook = {};
            var rookArrival = "";
            var rookStart = "";
            var start = "";
            var startSquare = {};
            var url = "";
            if (!regexMove.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            start = move.substr(0, 2);
            startSquare = the_board.squares[start];
            if (startSquare.isEmpty()) {
                throw new Error(error.illegalMove);
            }
            playedPiece = startSquare.piece;
            arrival = move.substr(3, 2);
            arrivalSquare = the_board.squares[arrival];
            emptyArrival = arrivalSquare.isEmpty();
            if (!emptyArrival) {
                capturedPiece = arrivalSquare.piece;
            }
            the_board.movePiece(playedPiece, startSquare, arrivalSquare,
                noAnimation, !emptyArrival, capturedPiece);
            playedPiece.remove();
            playedPiece.put(arrivalSquare);
            if (regexCastle.test(move) &&
                playedPiece.name[1] === chessValue.blackKing) {
                switch (arrival[0]) {
                    case chessValue.columns[2]:
                        rookStart = chessValue.columns[0];
                        rookArrival = chessValue.columns[3];
                        break;
                    case chessValue.columns[6]:
                        rookStart = chessValue.columns[7];
                        rookArrival = chessValue.columns[5];
                        break;
                }
                rookArrival += arrival[1];
                rookStart += arrival[1];
                if (!the_board.squares[rookStart].isEmpty()) {
                    rook = the_board.squares[rookStart].piece;
                    the_board.movePiece(rook, the_board.squares[rookStart],
                        the_board.squares[rookArrival]);
                    rook.remove();
                    rook.put(the_board.squares[rookArrival]);
                }
            } else if (playedPiece.name[1] === chessValue.blackPawn) {
                if (regexEnPassant.test(move) &&
                    emptyArrival && start[0] !== arrival[0]) {
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
                    if (!enPassantSquare.isEmpty()) {
                        enPassantSquare.piece.fadingRemove();
                        enPassantSquare.piece.remove();
                    }
                } else if (regexPromotion.test(move)) {
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
                }
            }
        };

        the_board.unlock = function () {

            // Unlock the pieces.

            the_board.clickablePieces = config.clickable;
            the_board.draggablePieces = config.draggable;
        };

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

        var requiredTags = {
            "Event": "?",
            "Site": "?",
            "Date": "????.??.??",
            "Round": "?",
            "White": "?",
            "Black": "?",
            "Result": "*"
        };
        var tags = {};
        var the_game = {};
        Object.keys(requiredTags).forEach(function (key) {
            tags[key] = requiredTags[key];
        });
        the_game = {
            comments: [],
            fenStrings: [chessValue.defaultFEN],
            moves: [],
            pgnMoves: [],
            tags: tags
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

        the_game.getPGN = function () {

            // Return the PGN string.

            var charRowCount = 0;
            var lineFeed = "\n";
            var pgn = "";
            var result = "";
            Object.keys(tags).forEach(function (tag) {
                var value = tags[tag];
                pgn += "[" + tag + " \"" + value + "\"]" + lineFeed;
            });
            pgn += lineFeed;
            the_game.pgnMoves.forEach(function (move, index) {
                var limit = 80;
                var moveNumber = "";
                if (index % 2 === 0) {
                    moveNumber = (index / 2 + 1) + ".";
                }
                charRowCount += moveNumber.length + 1;
                if (charRowCount > limit) {
                    pgn += lineFeed;
                    charRowCount = 0;
                }
                pgn += moveNumber + " ";
                charRowCount += move.length + 1;
                if (charRowCount > limit) {
                    pgn += lineFeed;
                    charRowCount = 0;
                }
                pgn += move + " ";
            });
            result = the_game.getInfo("Result");
            pgn += result;
            return pgn;
        };

        the_game.getInfo = function (tag) {
            return tags[tag];
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

            var position = {};
            if (!regexMove.test(move)) {
                return false;
            }
            position = the_game.getNthPosition(n);
            return position.checkMoveLegality(move);
        };

        the_game.play = function (move, promotion) {

            // Play a move and store the new FEN in the Chessgame object
            // if it's legal. Then returns the new FEN.

            var currentPosition = {};
            var isDrawn = false;
            var isInCheck = false;
            var isOver = false;
            var n = 0;
            var nextPosition = {};
            var pgnMove = "";
            var stringToAdd = "";
            if (!regexMove.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            n = the_game.fenStrings.length - 1;
            currentPosition = the_game.getNthPosition(n);
            if (currentPosition.checkMoveLegality(move)) {
                promotion = promotion || "";
                nextPosition = currentPosition.getNextPosition(move, promotion);
                the_game.fenStrings.push(nextPosition.fenString);
                the_game.moves.push(move);
                isInCheck = nextPosition.isInCheck(nextPosition.activeColor);
                isOver = !nextPosition.hasLegalMoves();
                isDrawn = (nextPosition.isDrawByInsufficientMaterial() ||
                    nextPosition.isDrawBy50MovesRule());
                if (isInCheck) {
                    if (isOver) {
                        stringToAdd = chessValue.checkmateSymbol;
                        if (nextPosition.activeColor === chessValue.black) {
                            the_game.setTag("Result", chessValue.resultWhite);
                        } else {
                            the_game.setTag("Result", chessValue.resultBlack);
                        }
                    } else {
                        stringToAdd = chessValue.checkSymbol;
                    }
                } else if (isOver) {
                    the_game.setTag("Result", chessValue.resultDraw);
                } else if (isDrawn) {
                    the_game.setTag("Result", chessValue.resultDraw);
                }
                pgnMove = currentPosition.getPGNMove(
                    move, promotion, false, stringToAdd);
                the_game.pgnMoves.push(pgnMove);
                return nextPosition.fenString;
            } else {
                throw new Error(error.illegalMove);
            }
        };

        the_game.setPGN = function (pgn) {

            // Load a PGN string. To proceed :
            // - Validate.
            // - Reset the game object.
            // - Set game informations.
            // - Delete comments.
            // - Variations.
            // - Store the pgn moves, simple moves, then fen strings.

            var importedMoves = [];
            var importedTags = [];
            if (!Chessgame.isValidPGN(pgn)) {
                throw new SyntaxError(error.invalidPGN);
            }
            Object.keys(requiredTags).forEach(function (key) {
                tags[key] = requiredTags[key];
            });
            the_game.fenStrings = [chessValue.defaultFEN];
            the_game.moves = [];
            the_game.pgnMoves = [];
            the_game.tags = tags;
            importedTags = pgn.match(regexTagPair);
            importedTags.forEach(function (tagPair) {
                var matches = [];
                var regex = /\[([^]+)\s"([^]*)"/gm;
                matches = regex.exec(tagPair);
                the_game.setTag(matches[1], matches[2]);
            });
            while (regexComment.test(pgn)) {
                pgn = pgn.replace(regexComment, "");
            }
            while (regexVariation.test(pgn)) {
                pgn = pgn.replace(regexVariation, "");
            }
            pgn = pgn.replace(/\s{2,}/gm, " ");
            importedMoves = pgn.match(regexPGNMove);
            importedMoves.forEach(function (move) {
                move = move.replace(/[1-9][0-9]*\.(?:\.\.)?\s?/, "");
                the_game.pgnMoves.push(move);
            });
            the_game.pgnMoves.forEach(function (move) {
                var lastPosition = {};
                var n = 0;
                var nextFEN = "";
                var nextPosition = {};
                var promotion = "";
                var simpleMove = "";
                n = the_game.fenStrings.length - 1;
                lastPosition = the_game.getNthPosition(n);
                simpleMove = lastPosition.getSimpleNotation(move);
                if (simpleMove.indexOf(chessValue.promotionSymbol) !== -1) {
                    promotion = simpleMove[simpleMove.length - 1];
                    simpleMove = simpleMove.replace(/\=[BNQR]$/, "");
                }
                nextPosition = lastPosition.getNextPosition(
                    simpleMove, promotion);
                nextFEN = nextPosition.fenString;
                the_game.moves.push(simpleMove);
                the_game.fenStrings.push(nextFEN);
            });
        };

        the_game.setTag = function (tag, value) {
            tags[tag] = value;
        };

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
        var regexMoveSection = /(?:[1-9][0-9]*\.(?:\.\.)?\s*)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm;
        var regexResult = /1-0|0-1|1\/2-1\/2|\*/;
        var regexTagPairsSection = /(?:\[[^]+?\s"[^]+?"\]\s+){7,}\s+/gm;
        var variations = [];
        if (!regexTagPairsSection.test(pgn)) {
            return false;
        }
        pgn = pgn.replace(regexTagPairsSection, "");
        while (regexComment.test(pgn)) {
            pgn = pgn.replace(regexComment, "");
        }
        function hasMoveSection(str) {
            return regexMoveSection.test(str);
        }
        while (regexVariation.test(pgn)) {
            variations = pgn.match(regexVariation);
            if (!variations.every(hasMoveSection)) {
                return false;
            }
            pgn = pgn.replace(regexVariation, "");
        }
        moves = pgn.match(regexMoveSection);
        if (moves.length < 1) {
            return false;
        }
        pgn = pgn.replace(regexMoveSection, "");
        return regexResult.test(pgn);
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
            abBoard.addNavigationData(animations, similarPieces);
            abBoard.animateNavigation(animations);
            if (index < maxIndex) {
                abBoard.lock();
            } else {
                abBoard.unlock();
            }
        }
        abBoard.clearMarks();
        if (abConfig.markLastMove) {
            if (index > 0) {
                lastMove = abGame.moves[index - 1];
                lastMoveStart = lastMove.substr(0, 2);
                lastMoveArrival = lastMove.substr(3, 2);
                abBoard.highlightSquares([lastMoveStart, lastMoveArrival]);
            }
        }
        if (abConfig.markKingInCheck &&
            position.isInCheck(position.activeColor)) {
            kingSquare = position.getKingSquare(position.activeColor);
            abBoard.markSquares([kingSquare]);
        }
    }

    function selectPiece(square) {

        // Select or deselect a piece on the board and show its legal squares.

        var legalSquares = [];
        var lastPosition = {};
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

    function playMove(move, noAnimation, promotion) {

        // Play a move on the board and store it in the game.

        var index = 0;
        abBoard.play(move, promotion, noAnimation);
        abGame.play(move, promotion);
        index = abGame.fenStrings.length - 1;
        navigate(index, false);
        if (typeof event.onMovePlayed === "function") {
            rAF(event.onMovePlayed);
        }
    }

    function finishMove(start, arrival, noAnimation) {

        // Perform the second step of a move once the arrival square is defined.
        // Test the legality.
        // Show promotion div if needed.

        var color = "";
        var move = "";
        var n = 0;
        var playedPiece = "";
        var position = {};
        if (typeof noAnimation !== "boolean") {
            noAnimation = false;
        }
        move = start + "-" + arrival;
        if (!regexMove.test(move)) {
            throw new Error(error.invalidParameter);
        }
        n = abGame.fenStrings.length - 1;
        if (abGame.isLegal(n, move)) {
            position = abGame.getNthPosition(n);
            playedPiece = position.occupiedSquares[start];
            if (regexPromotion.test(move) &&
                playedPiece.toLowerCase() === chessValue.blackPawn) {
                abBoard.pendingMove = move;
                color = (arrival[1] === "8")
                    ? chessValue.white
                    : chessValue.black;
                abBoard.askPromotion(color);
            } else {
                playMove(move, noAnimation);
            }
            return true;
        }
        return false;
    }

    // Board events initialization.

    abBoard.onMouseMove = function (e) {
        var activeSquare = {};
        var ghost = {};
        var ghostWidth = 0;
        var left = 0;
        var top = 0;
        if (!abBoard.isDragging) {
            return;
        }
        activeSquare = abBoard.squares[abBoard.selectedSquare];
        ghost = activeSquare.piece.ghost;
        ghostWidth = Math.floor(abBoard.width / 8);
        left = e.clientX + window.pageXOffset - ghostWidth / 2;
        top = e.clientY + window.pageYOffset - ghostWidth / 2;
        ghost.style.left = left + "px";
        ghost.style.top = top + "px";
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
        abBoard.animateGhost(selectedSquare.piece, ghostCoordinate, coordinate);
        if (abBoard.selectedSquare !== null) {
            selectPiece(abBoard.selectedSquare);
        }
        abBoard.isDragging = false;
    };

    abBoard.onPieceMouseDown = function (e, piece) {
        var ghostWidth = 0;
        var left = 0;
        var top = 0;
        e.preventDefault();
        if (!abBoard.draggablePieces) {
            return;
        }
        if (e.button !== 0) {
            return;
        }
        abBoard.isDragging = true;
        piece.div.style.visibility = "hidden";
        ghostWidth = Math.floor(abBoard.width / 8);
        piece.ghost.style.height = ghostWidth + "px";
        piece.ghost.style.width = ghostWidth + "px";
        left = e.clientX + window.pageXOffset - ghostWidth / 2;
        top = e.clientY + window.pageYOffset - ghostWidth / 2;
        piece.ghost.style.left = left + "px";
        piece.ghost.style.top = top + "px";
        document.body.appendChild(piece.ghost);
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
        playMove(move, false, choice);
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
                if (!finishMove(startSquare, clickedSquare) && !isEmptySquare) {
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
            finishMove(startSquare.name, dropSquare.name, true)) {
            dropCoordinate = dropSquare.getCoordinate();
            abBoard.animateGhost(playedPiece, ghostCoordinate, dropCoordinate);
        } else {
            startCoordinate = startSquare.getCoordinate();
            abBoard.animateGhost(playedPiece, ghostCoordinate, startCoordinate);
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

            return abGame.getPGN();
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

            var activeColor = "";
            var position = {};
            position = abGame.getNthPosition(n);
            activeColor = position.activeColor;
            return position.isInCheck(activeColor);
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

            return abGame.isLegal(n, move);
        },

        isStalemate: function (n) {

            // Check if the active player is stalemated in the n-th position.

            var activeColor = "";
            var position = {};
            position = abGame.getNthPosition(n);
            activeColor = position.activeColor;
            return (!position.isInCheck(activeColor) &&
                !position.hasLegalMoves());
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

            return playMove(move, false, promotion);
        },

        reset: function () {

            // Reset the game and the board.

            abBoard.loadFEN();
            abBoard.clearMarks();
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
