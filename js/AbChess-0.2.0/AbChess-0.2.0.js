// AbChess-0.2.0.js
// 2016-03-13
// Copyright (c) 2016 Nimzozo

/*global
    window
*/

/*jslint
    browser, white
*/

// Todo :
// - export variations : getPGN()
// - import variations : setPGN()
// - modify variations : add, delete moves in the game

window.AbChess = window.AbChess || function (containerId, abConfig) {
    "use strict";

    var abBoard = {};
    var abGame = {};
    var columns = "abcdefgh";

    // Chess constants.

    var chess = {
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
    var regexEnPassant = /^[a-h]4-[a-h]3|[a-h]5-[a-h]6$/;
    var regexFEN = /^(?:[bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q|-)\s([a-h][36]|-)\s(0|[1-9]\d*)\s([1-9]\d*)$/;
    var regexMove = /^[a-h][1-8]-[a-h][1-8]$/;
    var regexPGNComment = /\{[^]+?\}/gm;
    var regexPGNMove = /(?:[1-9][0-9]*\.(?:\.\.)?\s*)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm;
    var regexPGNMoveNumber = /[1-9]\d*?\.(?:\.\.)?\s*/g;
    var regexPGNResult = /1-0|0-1|1\/2-1\/2|\*/;
    var regexPGNTag = /\[([A-Z][^]+?)\s/m;
    var regexPGNTagPair = /\[[A-Z][^]+?\s"[^]+?"\]/gm;
    var regexPGNTagPairsSection = /(?:\[[^]+?\s"[^]+?"\]\s+){7,}\s+/gm;
    var regexPGNTagValue = /"([^]+?)"/m;
    var regexPGNVariation = /\([^()]*?\)/gm;
    var regexPromotion = /^[a-h]2-[a-h]1|[a-h]7-[a-h]8$/;

    // RAF

    var requestAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 100 / 6);
        };


    // -------------------------------------------------------------------------

    function Position(fen) {

        // A Position is constructed with a FEN string.
        // It represents the pieces placement plus many extra data.

        var activeColor = "";       // b|k
        var allowedCastles = "";    // KkQq
        var enPassantSquare = "";   // available en passant square
        var fenNoDataChar = "-";    // fen char for no data
        var fenMatches = [];        // fen fragments
        var fullmoveNumber = 0;     // move number
        var halfmoveClock = 0;      // non capture / pawn moves count
        var moveSeparator = "-";    // move notation separator
        var occupiedSquares = {};   // squares with pieces
        var the_position = {};      // the object to return
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

        function checkMoveLegality(move) {

            // Check whether a move is legal or not.
            // Check :
            // - active color
            // - piece move is legal
            // - not active king is not in check after the move is played

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
            pieceColor = (occupiedSquares[start] === occupiedSquares[start].toLowerCase())
                ? chess.black
                : chess.white;
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
        }

        function getKingSquare(color) {

            // Return the square notation of a king with the desired color.

            var desiredKing = "";
            var square = "";
            desiredKing = (color === chess.black)
                ? chess.blackKing
                : chess.whiteKing;
            Object.keys(occupiedSquares).every(function (key) {
                var piece = occupiedSquares[key];
                if (piece === desiredKing) {
                    square = key;
                    return false;
                }
                return true;
            });
            return square;
        }

        function getLegalMoves() {

            // Return an array of all legal moves.
            // Promotions moves count for one only.

            var legalMoves = [];
            var pieces = [];
            pieces = the_position.getPiecesPlaces(activeColor);
            pieces.forEach(function (square) {
                var legalSquares = the_position.getLegalSquares(square);
                legalSquares.forEach(function (arrival) {
                    var move = square + moveSeparator + arrival;
                    legalMoves.push(move);
                });
            });
            return legalMoves;
        }

        function getLegalSquares(start) {

            // Return an array of legal arrival squares.

            var legalSquares = [];
            var targets = [];
            targets = the_position.getTargets(start, false);
            targets.forEach(function (target) {
                var move = start + moveSeparator + target;
                if (the_position.checkMoveLegality(move)) {
                    legalSquares.push(target);
                }
            });
            return legalSquares;
        }

        function getNextActiveColor() {

            // Return the active color for the next position.

            var nextActiveColor = "";
            nextActiveColor = (the_position.activeColor === chess.white)
                ? chess.black
                : chess.white;
            return nextActiveColor;
        }

        function getNextAllowedCastles(move) {

            // Return the allowed castles for the next position.

            var arrivalSquare = "";
            var newAllowedCastles = "";
            var playedPiece = "";
            var startSquare = "";
            if (!regexMove.test(move)) {
                throw new SyntaxError(error.invalidParameter);
            }
            if (allowedCastles === fenNoDataChar) {
                return allowedCastles;
            }
            newAllowedCastles = allowedCastles;
            startSquare = move.substr(0, 2);
            playedPiece = occupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            if (allowedCastles.search(/[kq]/) !== -1) {
                if (playedPiece === chess.blackKing) {
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
                if (playedPiece === chess.whiteKing) {
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
                newAllowedCastles = fenNoDataChar;
            }
            return newAllowedCastles;
        }

        function getNextEnPassant(move) {

            // Return the en passant square for the next position.

            var arrivalRowNumber = 0;
            var arrivalSquare = "";
            var nextEnPassantTarget = fenNoDataChar;
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
            if (playedPiece === chess.blackPawn || playedPiece === chess.whitePawn) {
                if (arrivalRowNumber - startRowNumber === 2) {
                    nextEnPassantTarget = startSquare[0] + "3";
                }
                if (startRowNumber - arrivalRowNumber === 2) {
                    nextEnPassantTarget = startSquare[0] + "6";
                }
            }
            return nextEnPassantTarget;
        }

        function getNextFullmoveNumber() {

            // Return the fullmove number for the next position.

            var nextFullmoveNumber = 0;
            nextFullmoveNumber = (the_position.activeColor === chess.black)
                ? fullmoveNumber + 1
                : fullmoveNumber;
            return nextFullmoveNumber;
        }

        function getNextHalfmoveClock(move) {

            // Return the halfmove clock for the next position.

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
            if (playedPiece === chess.blackPawn || playedPiece === chess.whitePawn || takenPiece) {
                nextHalfmoveClock = 0;
            } else {
                nextHalfmoveClock = halfmoveClock + 1;
            }
            return nextHalfmoveClock;
        }

        function getNextPosition(move, promotion) {

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
            if (playedPiece.toLowerCase() === chess.blackKing && regexCastle.test(move)) {
                rookStart = (arrivalSquare[0] === columns[2])
                    ? columns[0] + arrivalSquare[1]
                    : columns[7] + arrivalSquare[1];
                rookArrival = (arrivalSquare[0] === columns[2])
                    ? columns[3] + arrivalSquare[1]
                    : columns[5] + arrivalSquare[1];
                delete newOccupiedSquares[rookStart];
                if (startSquare === "e1") {
                    newOccupiedSquares[rookArrival] = chess.whiteRook;
                } else {
                    newOccupiedSquares[rookArrival] = chess.blackRook;
                }
            } else if (playedPiece.toLowerCase() === chess.blackPawn) {
                if (arrivalSquare === enPassantSquare && regexEnPassant.test(move)) {
                    enPassantCapture = enPassantSquare[0] + startSquare[1];
                    delete newOccupiedSquares[enPassantCapture];
                }
                if (regexPromotion.test(move)) {
                    promotion = promotion || chess.blackQueen;
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
        }

        function getPGNMove(move, promotion, stringToAdd) {

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
            start = move.substr(0, 2);
            playedPiece = occupiedSquares[start];
            arrival = move.substr(3, 2);
            if (regexCastle.test(move)) {
                if (arrival[0] === columns[2]) {
                    pgnMove += chess.castleQueenSymbol;
                } else {
                    pgnMove += chess.castleKingSymbol;
                }
            } else {
                isCapture = occupiedSquares.hasOwnProperty(arrival);
                switch (playedPiece.toLowerCase()) {
                    case chess.blackBishop:
                    case chess.blackKing:
                    case chess.blackKnight:
                    case chess.blackQueen:
                    case chess.blackRook:
                        pgnMove += playedPiece.toUpperCase();
                        break;
                    case chess.blackPawn:
                        if (isCapture || arrival === enPassantSquare) {
                            pgnMove += start[0];
                            isCapture = true;
                        }
                        isPromotion = regexPromotion.test(move);
                        break;
                }

                if (playedPiece.toLowerCase() !== chess.blackPawn &&
                    playedPiece.toLowerCase() !== chess.blackKing) {
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
                    pgnMove += chess.captureSymbol;
                }
                pgnMove += arrival;
                if (isPromotion) {
                    pgnMove += chess.promotionSymbol + promotion.toUpperCase();
                }
            }
            stringToAdd = stringToAdd || "";
            pgnMove += stringToAdd;
            return pgnMove;
        }

        function getPiecesPlaces(color) {

            // Return an array of the names of the squares where are placed
            // the pieces of a specific color.

            var placements = [];
            Object.keys(occupiedSquares).forEach(function (square) {
                var piece = occupiedSquares[square];
                if ((color === chess.white && piece === piece.toUpperCase())
                    || (color === chess.black && piece === piece.toLowerCase())) {
                    placements.push(square);
                }
            });
            return placements;
        }

        function getSimpleNotation(pgnMove) {

            // Convert a PGN move in a simple notation.

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
                if (matches[1] === chess.castleKingSymbol ||
                    matches[1] === chess.castleQueenSymbol) {
                    rowNumber = (activeColor === chess.black)
                        ? 8
                        : 1;
                    start = columns[4] + rowNumber;
                    arrival = (matches[1] === chess.castleKingSymbol)
                        ? columns[6] + rowNumber
                        : columns[2] + rowNumber;
                    return start + moveSeparator + arrival;
                }
                playedPiece = chess.whiteKing;
                arrival = matches[2];
            } else if (regexPawn.test(pgnMove)) {
                playedPiece = chess.whitePawn;
                matches = regexPawn.exec(pgnMove);
                ambiguity = matches[1];
                arrival = matches[2];
                if (pgnMove.indexOf(chess.promotionSymbol) !== -1) {
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
            return start + moveSeparator + arrival + promotion;
        }

        function getTargets(start, onlyOffensive) {

            // Return the targets a specific piece can reach.
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
                ? chess.black
                : chess.white;
            switch (piece) {
                case chess.blackBishop:
                case chess.whiteBishop:
                    targets = the_position.getTargets_bishop(start, color);
                    break;
                case chess.blackKing:
                case chess.whiteKing:
                    targets = the_position.getTargets_kingFull(start, color, onlyOffensive);
                    break;
                case chess.blackKnight:
                case chess.whiteKnight:
                    targets = the_position.getTargets_knight(start, color);
                    break;
                case chess.blackPawn:
                case chess.whitePawn:
                    targets = the_position.getTargets_pawn(start, color, onlyOffensive);
                    break;
                case chess.blackQueen:
                case chess.whiteQueen:
                    targets = the_position.getTargets_queen(start, color);
                    break;
                case chess.blackRook:
                case chess.whiteRook:
                    targets = the_position.getTargets_rook(start, color);
                    break;
            }
            return targets;
        }

        function getTargets_bishop(start, color) {

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
            colNumber = columns.indexOf(start[0]) + 1;
            testColNumber = colNumber + 1;
            rowNumber = Number(start[1]);
            testRowNumber = rowNumber + 1;
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chess.black)
                ? chess.white
                : chess.black;
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
        }

        function getTargets_king(start, color) {

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
        }

        function getTargets_kingFull(start, color, noCastles) {

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
            ennemiesColor = (color === chess.black)
                ? chess.white
                : chess.black;
            ennemyKingSquare = the_position.getKingSquare(ennemiesColor);
            ennemyKingTargets = the_position.getTargets_king(ennemyKingSquare, ennemiesColor);
            targets = normalTargets.filter(function (target) {
                return (ennemyKingTargets.indexOf(target) === -1);
            });
            if (noCastles) {
                return targets;
            }
            if (start === "e1" && !the_position.isControlledBy("e1", chess.black)) {
                if (allowedCastles.indexOf(chess.whiteQueen) !== -1 && !the_position.isControlledBy("d1", chess.black)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + "1";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("c1");
                    }
                }
                if (allowedCastles.indexOf(chess.whiteKing) !== -1 && !the_position.isControlledBy("f1", chess.black)) {
                    if (kingSideCastle.every(function (column) {
                        testSquare = column + "1";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("g1");
                    }
                }
            } else if (start === "e8" && !the_position.isControlledBy("e8", chess.white)) {
                if (allowedCastles.indexOf(chess.blackQueen) !== -1 && !the_position.isControlledBy("d8", chess.white)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + "8";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("c8");
                    }
                }
                if (allowedCastles.indexOf(chess.blackKing) !== -1 && !the_position.isControlledBy("f8", chess.white)) {
                    if (kingSideCastle.every(function (column) {
                        testSquare = column + "8";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("g8");
                    }
                }
            }
            return targets;
        }

        function getTargets_knight(start, color) {

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
        }

        function getTargets_pawn(start, color, onlyOffensive) {

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
            colNumber = columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            direction = (color === chess.black)
                ? -1
                : 1;
            testRowNumber = rowNumber + direction;
            ennemiesColor = (color === chess.black)
                ? chess.white
                : chess.black;
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
        }

        function getTargets_queen(start, color) {

            // Return an array of squares a queen
            // on a specific square can reach.

            return the_position.getTargets_bishop(start, color).concat(the_position.getTargets_rook(start, color));
        }

        function getTargets_rook(start, color) {

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
            colNumber = columns.indexOf(start[0]) + 1;
            testColNumber = colNumber + 1;
            rowNumber = Number(start[1]);
            testRowNumber = rowNumber;
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chess.black)
                ? chess.white
                : chess.black;
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
        }

        function hasLegalMoves() {

            // Return true if the position is playable.

            var piecesPlaces = [];
            piecesPlaces = the_position.getPiecesPlaces(activeColor);
            return piecesPlaces.some(function (square) {
                var legalSquares = [];
                legalSquares = the_position.getLegalSquares(square);
                return (legalSquares.length > 0);
            });
        }

        function isCheckmate() {

            // Return true if the active king is checkmated.

            var isCheck = false;
            isCheck = the_position.isInCheck(activeColor);
            if (!isCheck) {
                return false;
            }
            return !the_position.hasLegalMoves();
        }

        function isControlledBy(square, color) {

            // Check if the desired square is controlled
            // by a specified color.

            var ennemies = [];
            ennemies = the_position.getPiecesPlaces(color);
            return ennemies.some(function (ennemy) {
                var targets = the_position.getTargets(ennemy, true);
                return (targets.indexOf(square) > -1);
            });
        }

        function isDrawBy50MovesRule() {

            // Check if the position is draw by the 50 moves rule.

            return (halfmoveClock > 99);
        }

        function isDrawByInsufficientMaterial() {

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
            blackPieces = the_position.getPiecesPlaces(chess.black);
            if (blackPieces.length > 3) {
                return false;
            }
            if (blackPieces.length > 1) {
                blackPieces.forEach(function (key) {
                    var piece = occupiedSquares[key];
                    if (piece !== chess.blackKing) {
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
            whitePieces = the_position.getPiecesPlaces(chess.white);
            if (whitePieces.length > 3) {
                return false;
            }
            if (whitePieces.length === 1) {
                return true;
            }
            testArray = [];
            whitePieces.forEach(function (key) {
                var piece = occupiedSquares[key];
                if (piece !== chess.whiteKing) {
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
        }

        function isInCheck(color) {

            // Check if the desired king is in check.

            var ennemiesColor = "";
            var kingSquare = "";
            ennemiesColor = (color === chess.white)
                ? chess.black
                : chess.white;
            kingSquare = the_position.getKingSquare(color);
            return the_position.isControlledBy(kingSquare, ennemiesColor);
        }

        the_position.checkMoveLegality = checkMoveLegality;
        the_position.getKingSquare = getKingSquare;
        the_position.getLegalMoves = getLegalMoves;
        the_position.getLegalSquares = getLegalSquares;
        the_position.getNextActiveColor = getNextActiveColor;
        the_position.getNextAllowedCastles = getNextAllowedCastles;
        the_position.getNextEnPassant = getNextEnPassant;
        the_position.getNextFullmoveNumber = getNextFullmoveNumber;
        the_position.getNextHalfmoveClock = getNextHalfmoveClock;
        the_position.getNextPosition = getNextPosition;
        the_position.getPGNMove = getPGNMove;
        the_position.getPiecesPlaces = getPiecesPlaces;
        the_position.getSimpleNotation = getSimpleNotation;
        the_position.getTargets = getTargets;
        the_position.getTargets_bishop = getTargets_bishop;
        the_position.getTargets_king = getTargets_king;
        the_position.getTargets_kingFull = getTargets_kingFull;
        the_position.getTargets_knight = getTargets_knight;
        the_position.getTargets_pawn = getTargets_pawn;
        the_position.getTargets_queen = getTargets_queen;
        the_position.getTargets_rook = getTargets_rook;
        the_position.hasLegalMoves = hasLegalMoves;
        the_position.isCheckmate = isCheckmate;
        the_position.isControlledBy = isControlledBy;
        the_position.isDrawBy50MovesRule = isDrawBy50MovesRule;
        the_position.isDrawByInsufficientMaterial = isDrawByInsufficientMaterial;
        the_position.isInCheck = isInCheck;
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
                    name = columns[colNumber - 1] + rowNumber;
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

        var regexFENRow = /^[bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8$/i;
        var rows = [];
        rows = fen.replace(/\s.*/, "").split("/");
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
        // The chess image is set with CSS backgroundImage url.

        var div = null;         // DIV element of the piece
        var the_piece = {};     // piece object
        div = document.createElement("DIV");
        div.className = css.squarePiece;
        div.style.backgroundImage = "url('" + url + "')";
        div.setAttribute("draggable", "true");
        the_piece = {
            div: div,
            name: name,
            square: null,
            url: url
        };

        function dragEndHandler(e) {

            // Drag end handler.

            var activeSquare = "";
            if (!the_piece.square.board.isDragging) {
                return;
            }
            the_piece.square.board.isDragging = false;
            if (typeof the_piece.square.board.onPieceDragEnd === "function") {
                activeSquare = the_piece.square.name;
                the_piece.square.board.onPieceDragEnd(activeSquare, e);
            }
        }

        function dragStartHandler(e) {

            // Drag start handler.

            var activeSquare = "";
            if (!the_piece.square.board.draggablePieces) {
                return;
            }
            e.dataTransfer.effectAllowed = "move";
            the_piece.square.board.isDragging = true;
            if (typeof the_piece.square.board.onPieceDragStart === "function") {
                activeSquare = the_piece.square.name;
                the_piece.square.board.onPieceDragStart(activeSquare);
            }
        }

        function initEventListeners() {

            // Add the event listeners.

            div.addEventListener("dragstart", the_piece.dragStartHandler);
            div.addEventListener("dragend", the_piece.dragEndHandler);
        }

        function put(square) {

            // Put the piece on a square.

            if (!square.isEmpty()) {
                square.piece.remove();
            }
            square.div.appendChild(the_piece.div);
            square.piece = the_piece;
            the_piece.square = square;
        }

        function remove() {

            // Remove the piece from the square.

            if (the_piece.square === null) {
                return;
            }
            the_piece.square.div.removeChild(the_piece.div);
            the_piece.square.piece = null;
        }

        the_piece.dragEndHandler = dragEndHandler;
        the_piece.dragStartHandler = dragStartHandler;
        the_piece.initEventListeners = initEventListeners;
        the_piece.put = put;
        the_piece.remove = remove;
        return the_piece;
    }


    // -------------------------------------------------------------------------

    function Square(name) {

        // The Square class constructs a HTML DIV element
        // named with its coordinate.

        var colNumber = 0;
        var isWhite = false;
        var rowNumber = 0;
        var the_square = {};
        colNumber = columns.indexOf(name[0]) + 1;
        rowNumber = Number(name[1]);
        isWhite = (rowNumber % 2 === 0)
            ? (colNumber % 2 === 1)
            : (colNumber % 2 === 0);
        the_square = {
            board: null,            // the parent board
            canvas: null,           // canvas to draw shapes
            div: null,              // DIV element of the square
            hasCircle: false,       // has currently a circle
            isHighlighted: false,   // is currently highlighted
            isMarked: false,        // is marked
            isOverflown: false,     // is overflown
            isSelected: false,      // is selected
            isWhite: isWhite,       // is light or dark
            name: name,             // square name
            piece: null             // piece object
        };

        function clickHandler() {

            // Click event handler.

            if (!the_square.board.clickablePieces) {
                return;
            }
            if (typeof the_square.board.onSquareClick === "function") {
                the_square.board.onSquareClick(the_square.name);
            }
        }

        function dragEnterHandler(e) {

            // Drag enter handler.

            if (the_square.board.isDragging) {
                e.preventDefault();
                if (the_square.board.markOverflownSquare) {
                    the_square.overfly();
                }
            }
        }

        function dragLeaveHandler() {

            // Drag leave handler.

            if (the_square.board.isDragging) {
                if (the_square.board.markOverflownSquare) {
                    the_square.overfly();
                }
            }
        }

        function dragOverHandler(e) {

            // Drag over handler.

            if (the_square.board.isDragging) {
                e.preventDefault();
            }
        }

        function drawDisc(x, y, radius, cssColor) {

            // Draw a disc on the square.

            var context = the_square.canvas.getContext("2d");
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fillStyle = cssColor;
            context.fill();
        }

        function dropHandler(e) {

            // Drop event handler.

            if (!the_square.board.isDragging) {
                return;
            }
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (the_square.board.markOverflownSquare) {
                the_square.overfly();
            }
            if (typeof the_square.board.onSquareDrop === "function") {
                the_square.board.onSquareDrop(the_square.name);
            }
        }

        function getClassName() {

            // Return the css class name of the square.

            var initialClass = css.square + " ";
            initialClass += (isWhite)
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
        }

        function highlight() {

            // Highlight the square.
            // Cancel if already highlighted.

            var className = "";
            the_square.isHighlighted = !the_square.isHighlighted;
            className = the_square.getClassName();
            requestAF(function () {
                the_square.div.className = className;
            });
        }

        function isEmpty() {

            // Check whether the square is empty.

            return (the_square.piece === null);
        }

        function mark() {

            // Mark the square.
            // Cancel if already marked.

            var className = "";
            the_square.isMarked = !the_square.isMarked;
            className = the_square.getClassName();
            requestAF(function () {
                the_square.div.className = className;
            });
        }

        function overfly() {

            // Overfly the square.
            // Cancel if already overflown.

            var className = "";
            the_square.isOverflown = !the_square.isOverflown;
            className = the_square.getClassName();
            requestAF(function () {
                the_square.div.className = className;
            });
        }

        function select() {

            // Select the square.
            // Cancel if already selected.

            var className = "";
            the_square.isSelected = !the_square.isSelected;
            className = the_square.getClassName();
            requestAF(function () {
                the_square.div.className = className;
            });
        }

        the_square.clickHandler = clickHandler;
        the_square.dragEnterHandler = dragEnterHandler;
        the_square.dragLeaveHandler = dragLeaveHandler;
        the_square.dragOverHandler = dragOverHandler;
        the_square.drawDisc = drawDisc;
        the_square.dropHandler = dropHandler;
        the_square.getClassName = getClassName;
        the_square.highlight = highlight;
        the_square.isEmpty = isEmpty;
        the_square.mark = mark;
        the_square.overfly = overfly;
        the_square.select = select;
        return the_square;
    }


    // -------------------------------------------------------------------------

    function Chessboard(containerId, config) {

        // Chessboard class to build an HTML chessboard.

        var the_board = {
            legalMarksColor: config.legalMarksColor,
            clickablePieces: config.clickable,
            container: document.getElementById(containerId),
            draggablePieces: config.draggable,
            notationBorder: config.notationBorder,
            imagesExtension: config.imagesExtension,
            imagesPath: config.imagesPath,
            isDragging: false,
            isFlipped: config.flipped,
            markOverflownSquare: config.markOverflownSquare,
            onPieceDragEnd: null,
            onPieceDragStart: null,
            onPromotionChose: null,
            onSquareClick: null,
            onSquareDrop: null,
            pendingMove: null,
            promotionDiv: document.createElement("DIV"),
            selectedSquare: null,
            squares: {},
            width: config.width
        };

        function clearMarks() {

            // Remove all the marks of the squares.

            Object.keys(the_board.squares).forEach(function (key) {
                var currentSquare = the_board.squares[key];
                if (currentSquare.isHighlighted) {
                    currentSquare.highlight();
                }
                if (currentSquare.isMarked) {
                    currentSquare.mark();
                }
                if (currentSquare.isOverflown) {
                    currentSquare.overfly();
                }
                if (currentSquare.isSelected) {
                    currentSquare.select();
                }
            });
        }

        function clickPromotionHandler(e) {

            // Event handler for click on a promotion button.

            var choice = e.target.name;
            if (typeof the_board.onPromotionChose === "function") {
                the_board.onPromotionChose(choice);
            }
            the_board.pendingMove = null;
            the_board.unlock();
            requestAF(function () {
                the_board.promotionDiv.style.display = "none";
            });
        }

        function createSquares() {

            // Create the squares property.

            var canvas = null;
            var canvasWidth = "";
            var colNumber = 0;
            var column = "";
            var cssClass = "";
            var div = null;
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
                    column = columns[colNumber - 1];
                    name = column + rowNumber;
                    canvas = document.createElement("CANVAS");
                    canvas.className = css.squareCanvas;
                    canvas.setAttribute("height", canvasWidth);
                    canvas.setAttribute("width", canvasWidth);
                    square = new Square(name);
                    square.canvas = canvas;
                    square.drawDisc(xy, xy, radius, the_board.legalMarksColor);
                    square.board = the_board;
                    div = document.createElement("DIV");
                    cssClass = (square.isWhite)
                        ? css.square + " " + css.whiteSquare
                        : css.square + " " + css.blackSquare;
                    div.className = cssClass;
                    square.div = div;
                    div.addEventListener("click", square.clickHandler);
                    div.addEventListener("dragenter", square.dragEnterHandler);
                    div.addEventListener("dragleave", square.dragLeaveHandler);
                    div.addEventListener("dragover", square.dragOverHandler);
                    div.addEventListener("drop", square.dropHandler);
                    squares[name] = square;
                    colNumber += 1;
                }
                rowNumber += 1;
            }
            the_board.squares = squares;
        }

        function draw() {

            // Draw the empty chessboard.

            var borderFragment;
            var bottomBorder;
            var colNumber = 0;
            var column = "";
            var index = 0;
            var rightBorder;
            var rowNumber = 0;
            var square;
            var squaresDiv;
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
            squaresDiv.appendChild(the_board.promotionDiv);
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
                    borderFragment.innerHTML = columns[index].toUpperCase();
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
                    borderFragment.style.lineHeight = Math.floor(the_board.width / 8) + "px";
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
        }

        function drawDisc(squares) {

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
        }

        function empty() {

            // Remove all the pieces of the board.

            Object.keys(the_board.squares).forEach(function (key) {
                var currentSquare = the_board.squares[key];
                if (!currentSquare.isEmpty()) {
                    currentSquare.piece.remove();
                }
            });
        }

        function getPositionObject() {

            // Return a position object of the pieces places.

            var occupiedSquares = {};
            Object.keys(the_board.squares).forEach(function (key) {
                var pieceChar = "";
                var pieceName = "";
                var square = the_board.squares[key];
                if (!square.isEmpty()) {
                    pieceName = square.piece.name;
                    pieceChar = (pieceName[0] === chess.white)
                        ? pieceName[1].toUpperCase()
                        : pieceName[1].toLowerCase();
                    occupiedSquares[key] = pieceChar;
                }
            });
            return occupiedSquares;
        }

        function highlightSquares(squares) {

            // Highlight an array of squares.

            squares.forEach(function (square) {
                the_board.squares[square].highlight();
            });
        }

        function loadFEN(fen) {

            // Load a position from a FEN string.

            var squares = {};
            fen = fen || chess.defaultFEN;
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
                    ? chess.black + char
                    : chess.white + char.toLowerCase();
                url = the_board.imagesPath + pieceName + the_board.imagesExtension;
                piece = new Piece(pieceName, url);
                piece.initEventListeners();
                square = the_board.squares[squareName];
                piece.put(square);
            });
        }

        function lock() {

            // Lock the pieces.

            the_board.clickablePieces = false;
            the_board.draggablePieces = false;
        }

        function markSquares(squares) {

            // Mark an array of squares.

            squares.forEach(function (square) {
                the_board.squares[square].mark();
            });
        }

        function play(move, promotion) {

            // Play the desired move on the board. Manage special moves.

            var arrival = "";
            var arrivalSquare = {};
            var emptyArrival = false;
            var enPassant = "";
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
            playedPiece.remove();
            arrival = move.substr(3, 2);
            arrivalSquare = the_board.squares[arrival];
            playedPiece.put(arrivalSquare);
            if (regexCastle.test(move) && playedPiece.name[1] === chess.blackKing) {
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
            } else if (playedPiece.name[1] === chess.blackPawn) {
                emptyArrival = arrivalSquare.isEmpty();
                if (regexEnPassant.test(move) && emptyArrival && start[0] !== arrival[0]) {
                    enPassant = arrival[0];
                    switch (arrival[1]) {
                        case "3":
                            enPassant += "4";
                            break;
                        case "6":
                            enPassant += "5";
                            break;
                    }
                    if (!the_board.squares[enPassant].isEmpty()) {
                        the_board.squares[enPassant].piece.remove();
                    }
                } else if (regexPromotion.test(move)) {
                    promotion = promotion || chess.blackQueen;
                    newPieceColor = (arrival[1] === "1")
                        ? chess.black
                        : chess.white;
                    newPieceName = newPieceColor + promotion.toLowerCase();
                    url = the_board.imagesPath + newPieceName + the_board.imagesExtension;
                    newPiece = new Piece(newPieceName, url);
                    newPiece.initEventListeners();
                    playedPiece.remove();
                    newPiece.put(arrivalSquare);
                }
            }
        }

        function showPromotionDiv(color) {

            // Display the promotion div to complete a move.

            var buttons = the_board.promotionDiv.childNodes;
            var pieces = [
                chess.blackQueen, chess.blackRook,
                chess.blackBishop, chess.blackKnight
            ];
            while (buttons.length > 0) {
                the_board.promotionDiv.removeChild(the_board.promotionDiv.lastChild);
            }
            pieces.forEach(function (piece) {
                var promotionButton;
                var url = the_board.imagesPath + color + piece + the_board.imagesExtension;
                promotionButton = document.createElement("INPUT");
                promotionButton.className = css.promotionButton;
                promotionButton.setAttribute("type", "button");
                promotionButton.setAttribute("name", piece);
                promotionButton.style.backgroundImage = "url('" + url + "')";
                promotionButton.addEventListener("click", the_board.clickPromotionHandler);
                the_board.promotionDiv.appendChild(promotionButton);
            });
            the_board.lock();
            requestAF(function () {
                the_board.promotionDiv.style.display = "block";
            });
        }

        function unlock() {

            // Unlock the pieces.

            the_board.clickablePieces = config.clickable;
            the_board.draggablePieces = config.draggable;
        }

        the_board.clearMarks = clearMarks;
        the_board.clickPromotionHandler = clickPromotionHandler;
        the_board.createSquares = createSquares;
        the_board.draw = draw;
        the_board.drawDisc = drawDisc;
        the_board.empty = empty;
        the_board.getPositionObject = getPositionObject;
        the_board.highlightSquares = highlightSquares;
        the_board.loadFEN = loadFEN;
        the_board.lock = lock;
        the_board.markSquares = markSquares;
        the_board.play = play;
        the_board.showPromotionDiv = showPromotionDiv;
        the_board.unlock = unlock;
        return the_board;
    }


    // -------------------------------------------------------------------------

    function Variation(parent, firstFEN, firstPGN) {

        // Variation constructor.
        // A variation is an object with the properties :
        // - id : its place in the variations tree.
        // - startIndex : where it begins.
        // - an array of moves.
        // - an array of PGN moves.
        // - an array of fen strings.
        // - length.
        // How does the tree work :
        // - the main game can have variations.
        // - 1st level of variations have id : 1, ..., n
        // - Each variation can have children with id : 11, 12, ..., n1, n2
        // - This is infinitely recursive.

        var firstMove = "";
        var firstPosition = {};
        var idArray = [];
        var secondFEN = "";
        var secondPosition = {};
        var startIndex = 0;
        var the_variation = {};
        firstPosition = new Position(firstFEN);
        firstMove = firstPosition.getSimpleNotation(firstPGN);
        secondPosition = firstPosition.getNextPosition(firstMove);
        secondFEN = secondPosition.fenString;
        startIndex = (firstPosition.activeColor === chess.white)
            ? firstPosition.fullmoveNumber * 2 - 2
            : firstPosition.fullmoveNumber * 2 - 1;
        if (parent.idArray === undefined) {
            idArray = [startIndex];
        } else {
            idArray = parent.idArray.slice(0);
            idArray.push(startIndex);
        }
        the_variation = {
            fenStrings: [firstFEN, secondFEN],
            idArray: idArray,
            length: 1,
            startIndex: startIndex,
            moves: [firstMove],
            parent: parent,
            pgnMoves: [firstPGN],
            variations: []
        };

        function addMove(move, pgnMove, fen) {

            // Add a move to the variation.

            the_variation.fenStrings.push(fen);
            the_variation.moves.push(move);
            the_variation.pgnMoves.push(pgnMove);
            the_variation.length += 1;
        }

        function addPGNMove(pgnMove) {

            // Add a move PGN to the variation.

            var lastFEN = "";
            var lastIndex = 0;
            var lastPosition = {};
            var newFEN = "";
            var nextPosition = {};
            var simpleMove = "";
            lastIndex = the_variation.length;
            lastFEN = the_variation.fenStrings[lastIndex];
            lastPosition = new Position(lastFEN);
            simpleMove = lastPosition.getSimpleNotation(pgnMove);
            nextPosition = lastPosition.getNextPosition(simpleMove);
            newFEN = nextPosition.fenString;
            the_variation.length += 1;
            the_variation.pgnMoves.push(pgnMove);
            the_variation.fenStrings.push(newFEN);
            the_variation.moves.push(simpleMove);
        }

        function getVariation(startIndex) {

            // Return a child variation from a start index.
            // Return null if not existing.

            var variation = {};
            var some = false;
            some = the_variation.variations.some(function (value) {
                if (value.startIndex === startIndex) {
                    variation = value;
                    return true;
                }
                return false;
            });
            if (some) {
                return variation;
            }
            return null;
        }

        function toString() {

            // Return the PGN string of the variation.

            var str = "(";
            the_variation.pgnMoves.forEach(function (pgnMove, index) {
                var moveIndex = 0;
                var moveNumber = 0;
                var strNumber = "";
                moveIndex = the_variation.startIndex + index;
                if (moveIndex % 2 === 0) {
                    moveNumber = moveIndex / 2 + 1;
                    strNumber = moveNumber + ". ";
                } else if (index === 0) {
                    moveNumber = (moveIndex + 1) / 2;
                    strNumber = moveNumber + "... ";
                }
                str += strNumber + pgnMove + " ";
                the_variation.variations.forEach(function (variation) {
                    if (moveIndex === variation.startIndex) {
                        str += variation.toString() + " ";
                    }
                });
            });
            str = str.substr(0, str.length - 1) + ") ";
            return str;
        }

        the_variation.addMove = addMove;
        the_variation.addPGNMove = addPGNMove;
        the_variation.getVariation = getVariation;
        the_variation.toString = toString;
        return the_variation;
    }


    // -------------------------------------------------------------------------

    function Pgn(pgn) {

        // Pgn parser, class to import / export a game.

        var the_pgn = {};
        the_pgn = {
            pgn: pgn
        };

        function loadPGN(game) {

            // Create and return the game object.
            // - Add tags
            // - Add moves
            // - Add variations
            // - Add comments

            var comments = [];
            var pgnMoves = [];
            var tags = [];
            var variations = [];
            tags = the_pgn.getTags();
            Object.keys(tags).forEach(function (key) {
                var value = tags[key];
                game.setTag(key, value);
            });
            pgnMoves = the_pgn.getMainMoves();
            pgnMoves.forEach(function (pgnMove) {
                game.addPGNMove(pgnMove);
            });
            variations = the_pgn.getVariations(game);
            game.variations = variations;
            game.comments = comments;
            return game;
        }

        function getMainMoves() {

            // Decompose the pgn string in tokens of moves.
            // Return an array of these tokens.

            var currentFragment = "";
            var level = 0;
            var mainMoves = [];
            var movesSection = "";
            var parseLength = 0;
            var parseStartIndex = 0;
            var pgnMove = "";
            var tokenFound = false;
            movesSection = pgn.replace(regexPGNTagPairsSection, "");
            movesSection = movesSection.replace(regexPGNComment, "");
            while (parseStartIndex < movesSection.length) {
                parseLength = 0;
                tokenFound = false;
                while (!tokenFound) {
                    parseLength += 1;
                    currentFragment = movesSection.substr(parseStartIndex, parseLength);
                    if (level === 0 && regexPGNMove.test(currentFragment)) {
                        pgnMove = currentFragment.match(regexPGNMove)[0];
                        pgnMove = pgnMove.replace(regexPGNMoveNumber, "");
                        mainMoves.push(pgnMove);
                        tokenFound = true;
                    } else if (level === 0 && regexPGNResult.test(currentFragment)) {
                        tokenFound = true;
                    } else if (currentFragment.indexOf("(") > -1) {
                        level += 1;
                        tokenFound = true;
                    } else if (currentFragment.indexOf(")") > -1) {
                        level -= 1;
                        tokenFound = true;
                    }
                }
                parseStartIndex += parseLength;
            }
            return mainMoves;
        }

        function getTags() {

            // Return the tags pairs.

            var matches = [];
            var tagsPairs = {};
            matches = the_pgn.pgn.match(regexPGNTagPair);
            matches.forEach(function (pair) {
                var tag = "";
                var value = "";
                tag = regexPGNTag.exec(pair)[1];
                value = regexPGNTagValue.exec(pair)[1];
                tagsPairs[tag] = value;
            });
            return tagsPairs;
        }

        function getVariations(game) {

            // Return an array of the variations moves with the tokens.

            var currentFragment = "";
            var currentVariation = {};
            var firstFEN = "";
            var level = 0;
            var movesSection = "";
            var parentVariation = {};
            var parseLength = 0;
            var parseStartIndex = 0;
            var pgnMove = "";
            var mainMovesCount = 0;
            var startingVariation = false;
            var tokenFound = false;
            var variations = [];
            movesSection = pgn.replace(regexPGNTagPairsSection, "");
            movesSection = movesSection.replace(regexPGNComment, "");
            while (parseStartIndex < movesSection.length) {
                parseLength = 0;
                tokenFound = false;
                while (!tokenFound) {
                    parseLength += 1;
                    currentFragment = movesSection.substr(parseStartIndex, parseLength);
                    if (level === 0 && regexPGNMove.test(currentFragment)) {
                        mainMovesCount += 1;
                        tokenFound = true;
                    } else if (level > 0 && regexPGNMove.test(currentFragment)) {
                        pgnMove = currentFragment.match(regexPGNMove)[0];
                        pgnMove = pgnMove.replace(regexPGNMoveNumber, "");
                        if (startingVariation) {
                            firstFEN = (level === 1)
                                ? game.fenStrings[mainMovesCount - 1]
                                : parentVariation.fenStrings[parentVariation.length - 1];
                            currentVariation = new Variation(parentVariation, firstFEN, pgnMove);
                            if (level > 1) {
                                parentVariation.variations.push(currentVariation);
                            } else {
                                variations.push(currentVariation);
                            }
                            startingVariation = false;
                        } else {
                            currentVariation.addPGNMove(pgnMove);
                        }
                        tokenFound = true;
                    } else if (level === 0 && regexPGNResult.test(currentFragment)) {
                        tokenFound = true;
                    } else if (currentFragment.indexOf("(") > -1) {
                        level += 1;
                        startingVariation = true;
                        parentVariation = currentVariation;
                        tokenFound = true;
                    } else if (currentFragment.indexOf(")") > -1) {
                        level -= 1;
                        currentVariation = currentVariation.parent;
                        tokenFound = true;
                    }
                }
                parseStartIndex += parseLength;
            }
            return variations;
        }

        the_pgn.getGame = loadPGN;
        the_pgn.getMainMoves = getMainMoves;
        the_pgn.getTags = getTags;
        the_pgn.getVariations = getVariations;
        return the_pgn;
    }


    // -------------------------------------------------------------------------

    function Chessgame() {

        // The Chessgame class constructs a full chess game.
        // We assume a chessgame is an ordered collection
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
            fenStrings: [chess.defaultFEN],
            moves: [],
            pgnMoves: [],
            tags: tags,
            variations: []
        };

        function addMove(move, promotion) {

            // Add and store a move.
            // - Test legality
            // - Store the move
            // - Store resulting FEN
            // - Check resulting game result
            // - Store move PGN
            // Return the new FEN.

            var currentPosition = {};
            var isCheck = false;
            var isDrawn = false;
            var isOver = false;
            var n = 0;
            var nextPosition = {};
            var pgnMove = "";
            var resultTagName = "Result";
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
                isCheck = nextPosition.isInCheck(nextPosition.activeColor);
                isOver = !nextPosition.hasLegalMoves();
                isDrawn = (nextPosition.isDrawByInsufficientMaterial() ||
                    nextPosition.isDrawBy50MovesRule());
                if (isCheck) {
                    if (isOver) {
                        stringToAdd = chess.checkmateSymbol;
                        if (nextPosition.activeColor === chess.black) {
                            the_game.setTag(resultTagName, chess.resultWhite);
                        } else {
                            the_game.setTag(resultTagName, chess.resultBlack);
                        }
                    } else {
                        stringToAdd = chess.checkSymbol;
                    }
                } else if (isOver) {
                    the_game.setTag(resultTagName, chess.resultDraw);
                } else if (isDrawn) {
                    the_game.setTag(resultTagName, chess.resultDraw);
                }
                pgnMove = currentPosition.getPGNMove(move, promotion, stringToAdd);
                the_game.pgnMoves.push(pgnMove);
                return nextPosition.fenString;
            } else {
                throw new Error(error.illegalMove);
            }
        }

        function addPGNMove(pgnMove) {

            // Add and store a PGN move.
            // - Test legality
            // - Store the PGN move
            // - Store move
            // - Store resulting FEN
            // Return the new FEN.

            var currentPosition = {};
            var simpleMove = "";
            var n = 0;
            var nextPosition = {};
            var promotion = "";
            n = the_game.fenStrings.length - 1;
            currentPosition = the_game.getNthPosition(n);
            simpleMove = currentPosition.getSimpleNotation(pgnMove);
            if (currentPosition.checkMoveLegality(simpleMove)) {
                if (simpleMove.indexOf(chess.promotionSymbol) > -1) {
                    promotion = simpleMove[simpleMove.length - 1];
                    simpleMove = simpleMove.replace(/\=[BNQR]$/, "");
                }
                nextPosition = currentPosition.getNextPosition(simpleMove, promotion);
                the_game.fenStrings.push(nextPosition.fenString);
                the_game.moves.push(simpleMove);
                the_game.pgnMoves.push(pgnMove);
                return nextPosition.fenString;
            } else {
                throw new Error(error.illegalMove);
            }
        }

        function checkMoveExistence(id, moveIndex, move) {

            // Check if a move exists in the game or in a variation.

            var moveToCompare = "";
            var variation = {};
            if (id === "0") {
                moveToCompare = the_game.moves[moveIndex];
            } else {
                variation = the_game.getVariation(id);
                if (moveIndex < variation.moveIndex ||
                    moveIndex > variation.moveIndex + variation.length) {
                    throw new Error(error.invalidParameter);
                }
                moveToCompare = variation.moves[moveIndex];
            }
            return (moveToCompare === move);
        }

        function checkVariationExistence(idArray) {

            // Return true if a variation exists in the game.

            return the_game.variations.some(function (variation) {
                return (variation.idArray === idArray);
            });
        }

        function getNthPosition(indexes) {

            // Return the n-th position object.

            var fen = "";
            var fenIndex = 0;
            var lastIndex = 0;
            var length = 0;
            var variation = {};
            if (!Array.isArray(indexes) && typeof indexes !== "number") {
                throw new Error(error.invalidParameter);
            }
            if (typeof indexes === "number") {
                lastIndex = the_game.fenStrings.length - 1;
                if (indexes < 0 || indexes > lastIndex) {
                    throw new Error(error.invalidParameter);
                }
                fen = the_game.fenStrings[indexes];
            } else {
                lastIndex = indexes.pop();
                length = indexes.length;
                fenIndex = lastIndex - indexes[length - 1];
                indexes.forEach(function (moveIndex, arrayIndex) {
                if (variation === null) {
                    return;
                }
                if (arrayIndex === 0) {
                    variation = abGame.getVariation(moveIndex);
                } else {
                    variation = variation.getVariation(moveIndex);
                }
                });
                if (variation === null) {
                    throw new Error(error.invalidParameter);
                }
                fen = variation.fenStrings[fenIndex];
            }
            return new Position(fen);
        }

        function getPGN() {

            // Return the PGN string.

            var charRowCount = 0;
            var limit = 80;
            var lineFeed = "\n";
            var pgn = "";
            var result = "";
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
                the_game.variations.forEach(function (variation) {
                    if (index === variation.startIndex) {
                        pgn += variation.toString();
                    }
                });
            });
            result = the_game.getInfo("Result");
            pgn += result;
            return pgn;
        }

        function getInfo(tag) {

            // Return the value of a tag.

            return tags[tag];
        }

        function getVariationFromStartIndex(startIndex) {

            // Return a variation from a start index.
            // Return null if not existing.

            var variation = {};
            var some = false;
            some = the_game.variations.some(function (value) {
                if (value.startIndex === startIndex) {
                    variation = value;
                    return true;
                }
                return false;
            });
            if (some) {
                return variation;
            }
            return null;
        }

        function isInCheck(n) {

            // Check if the active player is in check in the n-th position.

            var activeColor = "";
            var position = {};
            position = the_game.getNthPosition(n);
            activeColor = position.activeColor;
            return position.isInCheck(activeColor);
        }

        function isLegal(n, move) {

            // Check if a move is legal in the n-th position.

            var position = {};
            if (!regexMove.test(move)) {
                return false;
            }
            position = the_game.getNthPosition(n);
            return position.checkMoveLegality(move);
        }

        function setPGN(pgn) {

            // Load a PGN string. To proceed :
            // - Validate.
            // - Reset the game object.
            // - Set game informations.
            // - Delete comments.
            // - Include variations.
            // - Store the pgn moves, simple moves, then fen strings.

            var pgnObject = {};
            if (!Chessgame.isValidPGN(pgn)) {
                throw new SyntaxError(error.invalidPGN);
            }
            pgnObject = new Pgn(pgn);
            pgnObject.getGame(the_game);
        }

        function setTag(tag, value) {

            // Set a game tag.

            tags[tag] = value;
        }

        the_game.addMove = addMove;
        the_game.addPGNMove = addPGNMove;
        the_game.checkMoveExistence = checkMoveExistence;
        the_game.checkVariationExistence = checkVariationExistence;
        the_game.getPGN = getPGN;
        the_game.getInfo = getInfo;
        the_game.getNthPosition = getNthPosition;
        the_game.getPGN = getPGN;
        the_game.getVariation = getVariationFromStartIndex;
        the_game.isInCheck = isInCheck;
        the_game.isLegal = isLegal;
        the_game.setPGN = setPGN;
        the_game.setTag = setTag;
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
        if (!regexPGNTagPairsSection.test(pgn)) {
            return false;
        }
        pgn = pgn.replace(regexPGNTagPairsSection, "");
        while (regexPGNComment.test(pgn)) {
            pgn = pgn.replace(regexPGNComment, "");
        }
        function hasMoveSection(str) {
            return regexPGNMove.test(str);
        }
        while (regexPGNVariation.test(pgn)) {
            variations = pgn.match(regexPGNVariation);
            if (!variations.every(hasMoveSection)) {
                return false;
            }
            pgn = pgn.replace(regexPGNVariation, "");
        }
        moves = pgn.match(regexPGNMove);
        if (moves.length < 1) {
            return false;
        }
        pgn = pgn.replace(regexPGNMove, "");
        return regexPGNResult.test(pgn);
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

    function navigate(indexes, updatePosition) {

        // Navigate through the game to the desired position.
        // Update the board.
        // Version 0.2.0 :
        // Navigate to a position. The position is determined by a path of
        // move indexes.
        // 0 => navigate to start position.
        // [5, 2] => navigate to move 2 in the variation of the 5th move.

        var fen = "";
        var kingSquare = "";
        var lastMove = "";
        var lastMoveArrival = "";
        var lastMoveStart = "";
        var maxIndex = 0;
        var position = {};
        if (!Array.isArray(indexes) && typeof indexes !== "number") {
            throw new Error(error.invalidParameter);
        }
        maxIndex = abGame.fenStrings.length - 1;
        if (indexes < 0 || indexes > maxIndex) {
            throw new Error(error.invalidParameter);
        }
        position = abGame.getNthPosition(indexes);
        if (updatePosition) {
            fen = position.fenString;
            abBoard.loadFEN(fen);
            // if (indexes < maxIndex) {
            //     abBoard.lock();
            // } else {
            //     abBoard.unlock();
            // }
        }
        if (abConfig.markLastMove) {
            abBoard.clearMarks();
            // if (indexes > 0) {
            //     lastMove = abGame.moves[indexes - 1];
            //     lastMoveStart = lastMove.substr(0, 2);
            //     lastMoveArrival = lastMove.substr(3, 2);
            //     abBoard.highlightSquares([lastMoveStart, lastMoveArrival]);
            // }
        }
        if (abConfig.markKingInCheck && position.isInCheck(position.activeColor)) {
            abBoard.clearMarks();
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
            abBoard.drawDisc(legalSquares);
        }
    }

    function playMove(move, promotion) {

        // Play a move on the board and store it in the game.

        var indexes = 0;
        abBoard.play(move, promotion);
        abGame.addMove(move, promotion);
        indexes = abGame.fenStrings.length - 1;
        navigate(indexes, false);
        if (typeof event.onMovePlayed === "function") {
            setTimeout(event.onMovePlayed, 0);
        }
    }

    function finishMove(arrival, selectArrival) {

        // Perform the second step of a move once the arrival square is defined.
        // Test the legality.
        // Show promotion div.
        // Remove old legal squares.

        var color = "";
        var move = "";
        var n = 0;
        var playedPiece = "";
        var position = {};
        var start = "";
        start = abBoard.selectedSquare;
        move = start + "-" + arrival;
        if (!regexMove.test(move)) {
            throw new Error(error.invalidParameter);
        }
        selectPiece(start);
        n = abGame.fenStrings.length - 1;
        if (abGame.isLegal(n, move)) {
            position = abGame.getNthPosition(n);
            playedPiece = position.occupiedSquares[start];
            if (regexPromotion.test(move) && playedPiece.toLowerCase() === chess.blackPawn) {
                abBoard.pendingMove = move;
                color = (arrival[1] === "8")
                    ? chess.white
                    : chess.black;
                abBoard.showPromotionDiv(color);
            } else {
                playMove(move);
            }
        } else if (selectArrival && arrival !== start && !abBoard.squares[arrival].isEmpty()) {
            selectPiece(arrival);
        }
    }

    // Board events initialization.

    abBoard.onPieceDragEnd = function (start, e) {
        if (e.dataTransfer.dropEffect === "none") {
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


    // -------------------------------------------------------------------------
    // Public api.

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

        navigate: function (indexes) {

            // Navigate to a position.

            return navigate(indexes, true);
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

            return playMove(move, promotion);
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
        },

        getVariationMovesPGN: function (indexes) {

            // Return an array of variation moves from a start indexes path.

            var variation = {};
            indexes.forEach(function (moveIndex, arrayIndex) {
                if (variation === null) {
                    return;
                }
                if (arrayIndex === 0) {
                    variation = abGame.getVariation(moveIndex);
                } else {
                    variation = variation.getVariation(moveIndex);
                }
            });
            if (variation === null) {
                return [];
            }
            return variation.pgnMoves;
        }

    };
};
