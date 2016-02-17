// AbChess-0.1.js
// 2016-02-17
// Copyright (c) 2016 Nimzozo

// TODO :
// - find the best way to fix "forced sync layout"
// - squares highlighting to fix
// - (import / export variations / comments) => v 0.2

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
    var columns = "abcdefgh";

    // Chess values.

    var chess_value = {
        black: "b",
        black_bishop: "b",
        black_king: "k",
        black_knight: "n",
        black_pawn: "p",
        black_queen: "q",
        black_rook: "r",
        white: "w",
        white_bishop: "B",
        white_king: "K",
        white_knight: "N",
        white_pawn: "P",
        white_queen: "Q",
        white_rook: "R"
    };

    // Css class and ids.

    var css = {
        black_square: "blackSquare",
        bottom_border: "bottomBorder",
        inline_block: "inlineBlock",
        right_border: "rightBorder",
        highlighted_square: "highlightedSquare",
        marked_square: "markedSquare",
        overflown_square: "overflownSquare",
        promotion_div: "promotionDiv",
        selected_square: "selectedSquare",
        square: "square",
        squares_div: "squaresDiv",
        white_square: "whiteSquare"
    };

    // Config default values.

    var default_config = {
        circleColor: "steelblue",
        clickable: true,
        draggable: true,
        flipped: false,
        hasBorder: true,
        imagesExtension: ".png",
        imagesPath: "../images/wikipedia/",
        onMovePlayed: null,
        showKingInCheck: true,
        showLastMove: true,
        showLegalMoves: true,
        width: 360
    };
    var default_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    // Error messages.

    var error = {
        illegal_move: "Illegal move.",
        invalid_fen: "Invalid FEN string.",
        invalid_parameter: "Invalid parameter.",
        invalid_pgn: "Invalid PGN."
    };

    // Regular expressions.

    var regex_castle = /^e(?:1-c1|1-g1|8-c8|8-g8)$/;
    var regex_comment = /\{[^]+?\}/gm;
    var regex_en_passant = /^[a-h]4-[a-h]3|[a-h]5-[a-h]6$/;
    var regex_fen = /^(?:[bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q|-)\s([a-h][36]|-)\s(0|[1-9]\d*)\s([1-9]\d*)$/;
    var regex_fen_row = /^[bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8$/i;
    var regex_move = /^[a-h][1-8]-[a-h][1-8]$/;
    var regex_pgn_move = /(?:[1-9][0-9]*\.{1,3}\s*)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm;
    var regex_promotion = /^[a-h]2-[a-h]1|[a-h]7-[a-h]8$/;
    var regex_tagPair = /\[[A-Z][^]+?\s"[^]+?"\]/gm;
    var regex_variation = /\([^()]*?\)/gm;

    // RAF

    // var requestAF = window.requestAnimationFrame ||
    //     window.webkitRequestAnimationFrame ||
    //     window.mozRequestAnimationFrame ||
    //     window.oRequestAnimationFrame ||
    //     function (callback) {
    //         return window.setTimeout(callback, 1000 / 60);
    //     };

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
            throw new Error(error.invalid_fen);
        }
        fenMatches = regex_fen.exec(fen);
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
            if (!regex_move.test(move)) {
                return false;
            }
            start = move.substr(0, 2);
            if (!occupiedSquares.hasOwnProperty(start)) {
                return false;
            }
            pieceColor = (occupiedSquares[start] === occupiedSquares[start].toLowerCase())
                ? chess_value.black
                : chess_value.white;
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
            desiredKing = (color === chess_value.black)
                ? chess_value.black_king
                : chess_value.white_king;
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
            nextActiveColor = (the_position.activeColor === chess_value.white)
                ? chess_value.black
                : chess_value.white;
            return nextActiveColor;
        };

        the_position.getNextAllowedCastles = function (move) {
            var arrivalSquare = "";
            var newAllowedCastles = "";
            var playedPiece = "";
            var startSquare = "";
            if (!regex_move.test(move)) {
                throw new SyntaxError(error.invalid_parameter);
            }
            if (allowedCastles === "-") {
                return allowedCastles;
            }
            newAllowedCastles = allowedCastles;
            startSquare = move.substr(0, 2);
            playedPiece = occupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            if (allowedCastles.search(/[kq]/) !== -1) {
                if (playedPiece === chess_value.black_king) {
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
                if (playedPiece === chess_value.white_king) {
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
            if (!regex_move.test(move)) {
                throw new SyntaxError(error.invalid_parameter);
            }
            arrivalSquare = move.substr(3, 2);
            arrivalRowNumber = Number(arrivalSquare[1]);
            startSquare = move.substr(0, 2);
            startRowNumber = Number(startSquare[1]);
            playedPiece = occupiedSquares[startSquare];
            if (playedPiece === chess_value.black_pawn || playedPiece === chess_value.white_pawn) {
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
            nextFullmoveNumber = (the_position.activeColor === chess_value.black)
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
            if (!regex_move.test(move)) {
                throw new SyntaxError(error.invalid_parameter);
            }
            startSquare = move.substr(0, 2);
            playedPiece = occupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            takenPiece = occupiedSquares.hasOwnProperty(arrivalSquare);
            if (playedPiece === chess_value.black_pawn || playedPiece === chess_value.white_pawn || takenPiece) {
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
            if (!regex_move.test(move)) {
                throw new SyntaxError(error.invalid_parameter);
            }
            newOccupiedSquares = Position.fenToObject(the_position.fenString);
            startSquare = move.substr(0, 2);
            playedPiece = newOccupiedSquares[startSquare];
            arrivalSquare = move.substr(3, 2);
            if (playedPiece.toLowerCase() === chess_value.black_king && regex_castle.test(move)) {
                rookStart = (arrivalSquare[0] === columns[2])
                    ? columns[0] + arrivalSquare[1]
                    : columns[7] + arrivalSquare[1];
                rookArrival = (arrivalSquare[0] === columns[2])
                    ? columns[3] + arrivalSquare[1]
                    : columns[5] + arrivalSquare[1];
                delete newOccupiedSquares[rookStart];
                if (startSquare === "e1") {
                    newOccupiedSquares[rookArrival] = chess_value.white_rook;
                } else {
                    newOccupiedSquares[rookArrival] = chess_value.black_rook;
                }
            } else if (playedPiece.toLowerCase() === chess_value.black_pawn) {
                if (arrivalSquare === enPassantSquare && regex_en_passant.test(move)) {
                    enPassantCapture = enPassantSquare[0] + startSquare[1];
                    delete newOccupiedSquares[enPassantCapture];
                }
                if (regex_promotion.test(move)) {
                    promotion = promotion || chess_value.black_queen;
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

        the_position.getPGNMove = function (move, promotion, withNumber, stringToAdd) {

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
            if (!regex_move.test(move)) {
                throw new SyntaxError(error.invalid_parameter);
            }
            if (withNumber) {
                pgnMove = (activeColor === chess_value.white)
                    ? fullmoveNumber + ". "
                    : fullmoveNumber + "... ";
            }
            start = move.substr(0, 2);
            playedPiece = occupiedSquares[start];
            arrival = move.substr(3, 2);
            if (regex_castle.test(move)) {
                if (arrival[0] === columns[2]) {
                    pgnMove += "O-O-O";
                } else {
                    pgnMove += "O-O";
                }
            } else {
                isCapture = occupiedSquares.hasOwnProperty(arrival);
                switch (playedPiece.toLowerCase()) {
                    case chess_value.black_bishop:
                    case chess_value.black_king:
                    case chess_value.black_knight:
                    case chess_value.black_queen:
                    case chess_value.black_rook:
                        pgnMove += playedPiece.toUpperCase();
                        break;
                    case chess_value.black_pawn:
                        if (isCapture || arrival === enPassantSquare) {
                            pgnMove += start[0];
                            isCapture = true;
                        }
                        isPromotion = regex_promotion.test(move);
                        break;
                }
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
                if (isCapture) {
                    pgnMove += "x";
                }
                pgnMove += arrival;
                if (isPromotion) {
                    pgnMove += "=" + promotion.toUpperCase();
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
                if ((color === chess_value.white && piece === piece.toUpperCase())
                    || (color === chess_value.black && piece === piece.toLowerCase())) {
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
            var regex_king = /^(Kx?([a-h][1-8])|O-O(?:-O)?)(?:\+|#)?$/;
            var regex_pawn = /^([a-h]?)x?([a-h][1-8])(\=[BNQR])?(?:\+|#)?$/;
            var regex_piece = /^[BNQR]([a-h]?[1-8]?)x?([a-h][1-8])(?:\+|#)?$/;
            var rowNumber = 0;
            var samePieces = [];
            var start = "";
            if (regex_king.test(pgnMove)) {
                matches = regex_king.exec(pgnMove);
                if (matches[1] === "O-O" || matches[1] === "O-O-O") {
                    rowNumber = (activeColor === chess_value.black)
                        ? 8
                        : 1;
                    start = "e" + rowNumber;
                    arrival = (matches[1] === "O-O")
                        ? "g" + rowNumber
                        : "c" + rowNumber;
                    return start + "-" + arrival;
                }
                playedPiece = chess_value.white_king;
                arrival = matches[2];
            } else if (regex_pawn.test(pgnMove)) {
                playedPiece = chess_value.white_pawn;
                matches = regex_pawn.exec(pgnMove);
                ambiguity = matches[1];
                arrival = matches[2];
                if (pgnMove.indexOf("=") !== -1) {
                    promotion = matches[3];
                }
            } else if (regex_piece.test(pgnMove)) {
                playedPiece = pgnMove[0];
                matches = regex_piece.exec(pgnMove);
                ambiguity = matches[1];
                arrival = matches[2];
            } else {
                throw new SyntaxError(error.invalid_parameter);
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
                ? chess_value.black
                : chess_value.white;
            switch (piece) {
                case chess_value.black_bishop:
                case chess_value.white_bishop:
                    targets = the_position.getTargets_bishop(start, color);
                    break;
                case chess_value.black_king:
                case chess_value.white_king:
                    if (!onlyOffensive) {
                        targets = the_position.getTargets_king_special(start, color);
                    }
                    break;
                case chess_value.black_knight:
                case chess_value.white_knight:
                    targets = the_position.getTargets_knight(start, color);
                    break;
                case chess_value.black_pawn:
                case chess_value.white_pawn:
                    targets = the_position.getTargets_pawn(start, color, onlyOffensive);
                    break;
                case chess_value.black_queen:
                case chess_value.white_queen:
                    targets = the_position.getTargets_queen(start, color);
                    break;
                case chess_value.black_rook:
                case chess_value.white_rook:
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
            colNumber = columns.indexOf(start[0]) + 1;
            testColNumber = colNumber + 1;
            rowNumber = Number(start[1]);
            testRowNumber = rowNumber + 1;
            alliesPlaces = the_position.getPiecesPlaces(color);
            ennemiesColor = (color === chess_value.black)
                ? chess_value.white
                : chess_value.black;
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
        };

        the_position.getTargets_king_special = function (start, color) {

            // Return an array of squares a king on a specific square can reach.
            // Only for : castles,  filter ennemy king opposition.

            var ennemiesColor = "";
            var ennemyKingSquare = "";
            var ennemyKingTargets = [];
            var kingSideCastle = ["f", "g"];
            var normalTargets = [];
            var queenSideCastle = ["b", "c", "d"];
            var targets = [];
            var testSquare = "";
            normalTargets = the_position.getTargets_king(start, color);
            ennemiesColor = (color === chess_value.black)
                ? chess_value.white
                : chess_value.black;
            ennemyKingSquare = the_position.getKingSquare(ennemiesColor);
            ennemyKingTargets = the_position.getTargets_king(ennemyKingSquare, ennemiesColor);
            targets = normalTargets.filter(function (target) {
                return (ennemyKingTargets.indexOf(target) === -1);
            });
            if (start === "e1" && !the_position.isControlledBy("e1", chess_value.black)) {
                if (allowedCastles.indexOf(chess_value.white_queen) !== -1 && !the_position.isControlledBy("d1", chess_value.black)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + "1";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("c1");
                    }
                }
                if (allowedCastles.indexOf(chess_value.white_king) !== -1 && !the_position.isControlledBy("f1", chess_value.black)) {
                    if (kingSideCastle.every(function (column) {
                        testSquare = column + "1";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("g1");
                    }
                }
            } else if (start === "e8" && !the_position.isControlledBy("e8", chess_value.white)) {
                if (allowedCastles.indexOf(chess_value.black_queen) !== -1 && !the_position.isControlledBy("d8", chess_value.white)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + "8";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("c8");
                    }
                }
                if (allowedCastles.indexOf(chess_value.black_king) !== -1 && !the_position.isControlledBy("f8", chess_value.white)) {
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
            var ennemiesColor = "";
            var ennemiesPlaces = [];
            var rowNumber = 0;
            var targets = [];
            var testColNumber = 0;
            var testRowNumber = 0;
            var testSquare = "";
            colNumber = columns.indexOf(start[0]) + 1;
            rowNumber = Number(start[1]);
            direction = (color === chess_value.black)
                ? -1
                : 1;
            testRowNumber = rowNumber + direction;
            ennemiesColor = (color === chess_value.black)
                ? chess_value.white
                : chess_value.black;
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
            ennemiesColor = (color === chess_value.black)
                ? chess_value.white
                : chess_value.black;
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
                return (targets.indexOf(square) !== -1);
            });
        };

        the_position.isInCheck = function (color) {

            // Check if the desired king is in check.

            var ennemiesColor = "";
            var kingSquare = "";
            ennemiesColor = (color === chess_value.white)
                ? chess_value.black
                : chess_value.white;
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
                    name = columns[colNumber - 1] + rowNumber;
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

        var rows = fen.replace(/\s.*/, "").split("/");
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
        // The chess image is set with css backgroundImage url.

        var div;
        var the_piece;
        div = document.createElement("DIV");
        div.style.backgroundImage = "url('" + url + "')";
        div.setAttribute("draggable", "true");

        the_piece = {
            div: div,
            name: name,
            square: null,
            url: url
        };

        the_piece.dragEndHandler = function (e) {
            var activeSquare = "";
            if (!the_piece.square.board.isDragging) {
                return;
            }
            the_piece.square.board.isDragging = false;
            if (typeof the_piece.square.board.onPieceDragEnd === "function") {
                activeSquare = the_piece.square.name;
                the_piece.square.board.onPieceDragEnd(activeSquare, e);
            }
        };

        the_piece.dragStartHandler = function (e) {
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
        };

        the_piece.initEventListeners = function () {
            div.addEventListener("dragstart", the_piece.dragStartHandler);
            div.addEventListener("dragend", the_piece.dragEndHandler);
        };

        the_piece.put = function (square) {

            // Put the piece on a square.

            if (!square.isEmpty()) {
                square.piece.remove();
            }
            // requestAF(function () {
            square.div.appendChild(the_piece.div);
            square.piece = the_piece;
            the_piece.square = square;
            // });
        };

        the_piece.remove = function () {

            // Remove the piece from the square.

            // requestAF(function () {
            if (the_piece.square === null) {
                return;
            }
            the_piece.square.div.removeChild(the_piece.div);
            the_piece.square.piece = null;
            // });
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
            isOverflown: false,
            isSelected: false,
            name: name,
            piece: null
        };

        the_square.clickHandler = function () {
            if (!the_square.board.clickablePieces) {
                return;
            }
            if (typeof the_square.board.onSquareClick === "function") {
                the_square.board.onSquareClick(the_square.name);
            }
        };

        the_square.dragEnterHandler = function (e) {
            if (the_square.board.isDragging) {
                e.preventDefault();
                the_square.overfly();
            }
        };

        the_square.dragLeaveHandler = function () {
            if (the_square.board.isDragging) {
                the_square.overfly();
            }
        };

        the_square.dragOverHandler = function (e) {
            if (the_square.board.isDragging) {
                e.preventDefault();
            }
        };

        the_square.drawFilledCircle = function (x, y, radius, cssColor) {
            var context = the_square.canvas.getContext("2d");
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
            e.dataTransfer.dropEffect = "move";
            the_square.overfly();
            if (typeof the_square.board.onSquareDrop === "function") {
                the_square.board.onSquareDrop(the_square.name);
            }
        };

        the_square.getClassName = function () {

            // Return the css class name of the square.

            var initialClass = css.square + " ";
            initialClass += (Square.isWhite(the_square.name))
                ? css.white_square
                : css.black_square;
            if (the_square.isHighlighted) {
                initialClass += " " + css.highlighted_square;
            }
            if (the_square.isMarked) {
                initialClass += " " + css.marked_square;
            }
            if (the_square.isOverflown) {
                initialClass += " " + css.overflown_square;
            }
            if (the_square.isSelected) {
                initialClass += " " + css.selected_square;
            }
            return initialClass;
        };

        the_square.highlight = function () {

            // Highlight the square.
            // Cancel if already highlighted.

            var className = "";
            the_square.isHighlighted = !the_square.isHighlighted;
            className = the_square.getClassName();
            // requestAF(function () {
            the_square.div.className = className;
            // });
        };

        the_square.isEmpty = function () {

            // Check whether the square is empty.

            return (the_square.piece === null);
        };

        the_square.mark = function () {

            // Mark the square.
            // Cancel if already marked.

            var className = "";
            the_square.isMarked = !the_square.isMarked;
            className = the_square.getClassName();
            // requestAF(function () {
            the_square.div.className = className;
            // });
        };

        the_square.overfly = function () {

            // Overfly the square.
            // Cancel if already overflown.

            var className = "";
            the_square.isOverflown = !the_square.isOverflown;
            className = the_square.getClassName();
            // requestAF(function () {
            the_square.div.className = className;
            // });
        };

        the_square.select = function () {

            // Select the square.
            // Cancel if already selected.

            var className = "";
            the_square.isSelected = !the_square.isSelected;
            className = the_square.getClassName();
            // requestAF(function () {
            the_square.div.className = className;
            // });
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
            imagesExtension: config.imagesExtension,
            imagesPath: config.imagesPath,
            isDragging: false,
            isFlipped: config.flipped,
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

        the_board.clickPromotionHandler = function (e) {
            var choice = e.target.name;
            if (typeof the_board.onPromotionChose === "function") {
                the_board.onPromotionChose(choice);
            }
            the_board.pendingMove = null;
            the_board.clickablePieces = config.clickable;
            the_board.draggablePieces = config.draggable;
            // requestAF(function () {
            the_board.promotionDiv.style.display = "none";
            // });
        };

        the_board.createSquares = function () {

            // Create the squares property.

            var canvas;
            var canvasWidth = "";
            var colNumber = 0;
            var column = "";
            var cssClass = "";
            var div;
            var isWhiteSquare = false;
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
                    isWhiteSquare = Square.isWhite(name);
                    canvas = document.createElement("CANVAS");
                    canvas.setAttribute("height", canvasWidth);
                    canvas.setAttribute("width", canvasWidth);
                    div = document.createElement("DIV");
                    cssClass = (isWhiteSquare)
                        ? css.square + " " + css.white_square
                        : css.square + " " + css.black_square;
                    div.className = cssClass;
                    square = new Square(name);
                    square.canvas = canvas;
                    square.drawFilledCircle(xy, xy, radius, the_board.circleColor);
                    square.board = the_board;
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
        };

        the_board.draw = function () {

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
            the_board.promotionDiv.className = css.promotion_div;
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
            // requestAF(function () {
            the_board.container.appendChild(squaresDiv);
            squaresDiv.appendChild(the_board.promotionDiv);
            // });
            if (the_board.hasBorder) {
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
                rightBorder = document.createElement("DIV");
                rightBorder.className = css.right_border;
                rightBorder.style.height = the_board.width + "px";
                rowNumber = 1;
                while (rowNumber < 9) {
                    borderFragment = document.createElement("DIV");
                    borderFragment.style.lineHeight = Math.floor(the_board.width / 8) + "px";
                    index = (the_board.isFlipped)
                        ? rowNumber
                        : 9 - rowNumber;
                    borderFragment.innerHTML = index;
                    rightBorder.appendChild(borderFragment);
                    rowNumber += 1;
                }
                // requestAF(function () {
                the_board.container.appendChild(rightBorder);
                the_board.container.appendChild(bottomBorder);
                // });
            }
        };

        the_board.drawCircles = function (squares) {

            // Draw circles for an array of squares.

            squares.forEach(function (name) {
                var square = the_board.squares[name];
                // requestAF(function () {
                if (square.hasCircle) {
                    square.div.removeChild(square.canvas);
                } else {
                    square.div.appendChild(square.canvas);
                }
                square.hasCircle = !square.hasCircle;
                // });
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
                var pieceChar = "";
                var pieceName = "";
                var square = the_board.squares[key];
                if (!square.isEmpty()) {
                    pieceName = square.piece.name;
                    pieceChar = (pieceName[0] === chess_value.white)
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
                var char = "";
                var piece = {};
                var pieceName = "";
                var square = {};
                var url = "";
                char = squares[squareName];
                pieceName = (char.toLowerCase() === char)
                    ? chess_value.black + char
                    : chess_value.white + char.toLowerCase();
                url = the_board.imagesPath + pieceName + the_board.imagesExtension;
                piece = new Piece(pieceName, url);
                piece.initEventListeners();
                square = the_board.squares[squareName];
                piece.put(square);
            });
        };

        the_board.markSquares = function (squares) {

            // Mark an array of squares.

            squares.forEach(function (square) {
                the_board.squares[square].mark();
            });
        };

        the_board.overflySquares = function (squares) {

            // Overfly an array of squares.

            squares.forEach(function (square) {
                the_board.squares[square].overfly();
            });
        };

        the_board.play = function (move, promotion) {

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
            if (!regex_move.test(move)) {
                throw new SyntaxError(error.invalid_parameter);
            }
            start = move.substr(0, 2);
            startSquare = the_board.squares[start];
            if (startSquare.isEmpty()) {
                throw new Error(error.illegal_move);
            }
            playedPiece = startSquare.piece;
            playedPiece.remove();
            arrival = move.substr(3, 2);
            arrivalSquare = the_board.squares[arrival];
            playedPiece.put(arrivalSquare);
            if (regex_castle.test(move) && playedPiece.name[1] === chess_value.black_king) {
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
            } else if (playedPiece.name[1] === chess_value.black_pawn) {
                emptyArrival = arrivalSquare.isEmpty();
                if (regex_en_passant.test(move) && emptyArrival && start[0] !== arrival[0]) {
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
                } else if (regex_promotion.test(move)) {
                    promotion = promotion || chess_value.black_queen;
                    newPieceColor = (arrival[1] === "1")
                        ? chess_value.black
                        : chess_value.white;
                    newPieceName = newPieceColor + promotion.toLowerCase();
                    url = the_board.imagesPath + newPieceName + the_board.imagesExtension;
                    newPiece = new Piece(newPieceName, url);
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
                chess_value.black_queen, chess_value.black_rook,
                chess_value.black_bishop, chess_value.black_knight
            ];
            while (buttons.length > 0) {
                the_board.promotionDiv.removeChild(the_board.promotionDiv.lastChild);
            }
            pieces.forEach(function (piece) {
                var promotionButton;
                var url = the_board.imagesPath + color + piece + the_board.imagesExtension;
                promotionButton = document.createElement("INPUT");
                promotionButton.setAttribute("type", "button");
                promotionButton.setAttribute("name", piece);
                promotionButton.style.backgroundImage = "url('" + url + "')";
                promotionButton.addEventListener("click", the_board.clickPromotionHandler);
                the_board.promotionDiv.appendChild(promotionButton);
            });
            the_board.clickablePieces = false;
            the_board.draggablePieces = false;
            // requestAF(function () {
            the_board.promotionDiv.style.display = "block";
            // });
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

        var requiredTags = [
            "Event", "Site", "Date", "Round", "White", "Black", "Result"
        ];
        var tags = {};
        var the_game = {};
        requiredTags.forEach(function (tag) {
            tags[tag] = "";
        });
        the_game = {
            comments: [],
            fenStrings: [default_fen],
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
                throw new Error(error.invalid_parameter);
            }
            fen = the_game.fenStrings[n];
            return new Position(fen);
        };

        the_game.getPGN = function (noTag) {

            // Return the PGN string.

            var charRowCount = 0;
            var lineFeed = "\n";
            var pgn = "";
            var result = "";
            if (!noTag) {
                Object.keys(tags).forEach(function (tag) {
                    var value = tags[tag];
                    pgn += "[" + tag +  " \"" + value + "\"]" + lineFeed;
                });
                pgn += lineFeed;
            }
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
            if (!regex_move.test(move)) {
                return false;
            }
            position = the_game.getNthPosition(n);
            return position.checkMoveLegality(move);
        };

        the_game.play = function (move, promotion) {

            // Play a move and store the new FEN in the Chessgame object
            // if it's legal. Then returns the new FEN.

            var lastPosition = {};
            var n = 0;
            var nextPosition = {};
            var pgnMove = "";
            var stringToAdd = "";
            if (!regex_move.test(move)) {
                throw new SyntaxError(error.invalid_parameter);
            }
            n = the_game.fenStrings.length - 1;
            lastPosition = the_game.getNthPosition(n);
            if (lastPosition.checkMoveLegality(move)) {
                promotion = promotion || "";
                nextPosition = lastPosition.getNextPosition(move, promotion);
                the_game.fenStrings.push(nextPosition.fenString);
                if (the_game.isInCheck(n + 1)) {
                    stringToAdd = (nextPosition.hasLegalMoves())
                        ? "+"
                        : "#";
                }
                pgnMove = lastPosition.getPGNMove(move, promotion, false, stringToAdd);
                the_game.pgnMoves.push(pgnMove);
                the_game.moves.push(move);
                return nextPosition.fenString;
            } else {
                throw new Error(error.illegal_move);
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
                throw new SyntaxError(error.invalid_pgn);
            }
            requiredTags.forEach(function (tag) {
                tags[tag] = "";
            });
            the_game.fenStrings = [default_fen];
            the_game.moves = [];
            the_game.pgnMoves = [];
            the_game.tags = tags;
            importedTags = pgn.match(regex_tagPair);
            importedTags.forEach(function (tagPair) {
                var matches = [];
                var regex = /\[([^]+)\s"([^]*)"/gm;
                matches = regex.exec(tagPair);
                the_game.setTag(matches[1], matches[2]);
            });
            while (regex_comment.test(pgn)) {
                pgn = pgn.replace(regex_comment, "");
            }
            while (regex_variation.test(pgn)) {
                pgn = pgn.replace(regex_variation, "");
            }
            pgn = pgn.replace(/\s{2,}/gm, " ");
            importedMoves = pgn.match(regex_pgn_move);
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
                if (simpleMove.indexOf("=") !== -1) {
                    promotion = simpleMove[simpleMove.length - 1];
                    simpleMove = simpleMove.replace(/\=[BNQR]$/, "");
                }
                nextPosition = lastPosition.getNextPosition(simpleMove, promotion);
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
        var regex_moveSection = /(?:[1-9][0-9]*\.(?:\.\.)?\s*)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm;
        var regex_result = /1-0|0-1|1\/2-1\/2|\*/;
        var regex_tagPairsSection = /(?:\[[^]+?\s"[^]+?"\]\s+){7,}\s+/gm;
        var variations = [];
        if (!regex_tagPairsSection.test(pgn)) {
            return false;
        }
        pgn = pgn.replace(regex_tagPairsSection, "");
        while (regex_comment.test(pgn)) {
            pgn = pgn.replace(regex_comment, "");
        }
        function hasMoveSection(str) {
            return regex_moveSection.test(str);
        }
        while (regex_variation.test(pgn)) {
            variations = pgn.match(regex_variation);
            if (!variations.every(hasMoveSection)) {
                return false;
            }
            pgn = pgn.replace(regex_variation, "");
        }
        moves = pgn.match(regex_moveSection);
        if (moves.length < 1) {
            return false;
        }
        pgn = pgn.replace(regex_moveSection, "");
        return regex_result.test(pgn);
    };

    // -------------------------------------------------------------------------
    // Application

    // Load default configuration for empty properties.

    abConfig = abConfig || {};
    Object.keys(default_config).forEach(function (key) {
        if (!abConfig.hasOwnProperty(key)) {
            abConfig[key] = default_config[key];
        }
    });

    // Create the objects board and game. Set default behaviour.

    abBoard = new Chessboard(containerId, abConfig);
    abGame = new Chessgame();

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
        abBoard.squares[square].select();
        if (abConfig.showLegalMoves) {
            n = abGame.fenStrings.length - 1;
            lastPosition = abGame.getNthPosition(n);
            legalSquares = lastPosition.getLegalSquares(square);
            abBoard.drawCircles(legalSquares);
        }
    }

    function playMove(move, promotion) {

        // Play a move on the board and in the game objects.

        var arrival = "";
        var color = "";
        var kingSquare = "";
        var n = 0;
        var position = {};
        var start = "";
        if (abConfig.showKingInCheck) {
            n = abGame.fenStrings.length - 1;
            position = abGame.getNthPosition(n);
            color = position.activeColor;
            kingSquare = position.getKingSquare(color);
            if (abBoard.squares[kingSquare].isMarked) {
                abBoard.markSquares([kingSquare]);
            }
        }
        abBoard.play(move, promotion);
        abGame.play(move, promotion);
        n += 1;
        if (abConfig.showKingInCheck && abGame.isInCheck(n)) {
            position = abGame.getNthPosition(n);
            color = position.activeColor;
            kingSquare = position.getKingSquare(color);
            abBoard.markSquares([kingSquare]);
        }
        if (abConfig.showLastMove) {
            Object.keys(abBoard.squares).forEach(function (key) {
                var square = abBoard.squares[key];
                if (square.isHighlighted) {
                    square.highlight();
                }
            });
            start = move.substr(0, 2);
            arrival = move.substr(3, 2);
            abBoard.highlightSquares([start, arrival]);
        }
        if (typeof abConfig.onMovePlayed === "function") {
            abConfig.onMovePlayed();
        }
    }

    function finishMove(arrival, selectArrival) {

        // Perform the second step of a move once the arrival square is defined.
        // Test the legality. Show promotion div. Remove old legal squares.

        var color = "";
        var move = "";
        var n = 0;
        var playedPiece = "";
        var position = {};
        var start = "";
        start = abBoard.selectedSquare;
        move = start + "-" + arrival;
        if (!regex_move.test(move)) {
            throw new Error(error.invalid_parameter);
        }
        selectPiece(start);
        n = abGame.fenStrings.length - 1;
        if (abGame.isLegal(n, move)) {
            position = abGame.getNthPosition(n);
            playedPiece = position.occupiedSquares[start];
            if (regex_promotion.test(move) && playedPiece.toLowerCase() === chess_value.black_pawn) {
                abBoard.pendingMove = move;
                color = (arrival[1] === "8")
                    ? chess_value.white
                    : chess_value.black;
                abBoard.showPromotionDiv(color);
            } else {
                playMove(move);
            }
        } else if (selectArrival && arrival !== start && !abBoard.squares[arrival].isEmpty()) {
            selectPiece(arrival);
        }
    }

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
        DEFAULT_FEN: default_fen,

        draw: function () {

            // Draw the chessboard.

            abBoard.createSquares();
            abBoard.draw();
        },

        flip: function () {

            // Flip the board.

            abBoard.isFlipped = !abBoard.isFlipped;
            // requestAF(function () {
            while (abBoard.container.hasChildNodes()) {
                abBoard.container.removeChild(abBoard.container.lastChild);
            }
            // });
            abBoard.draw();
        },

        getActiveColor: function (n) {

            // Return the active color b|w in the n-th position.

            var position = {};
            position = abGame.getNthPosition(n);
            return position.activeColor;
        },

        getFEN: function (n) {

            // Get the n-th FEN string.

            var lastIndex = 0;
            lastIndex = abGame.fenStrings.length - 1;
            if (typeof n !== "number" || n < 0 || n > lastIndex) {
                throw new Error(error.invalid_parameter);
            }
            return abGame.fenStrings[n];
        },

        getGameInfo: function (info) {

            // Return the desired information.

            return abGame.getInfo(info);
        },

        getGameMoves: function (pgnStyled) {

            // Return an array of the moves of the game.
            // If pgnStyled is set to true, the moves will be styled as PGN.

            return (pgnStyled)
                ? abGame.pgnMoves
                : abGame.moves;
        },

        getLegalMoves: function (n) {

            // Return an array of the legal moves in the n-th position.

            var position = {};
            position = abGame.getNthPosition(n);
            return position.getLegalMoves();
        },

        getPGN: function (noTag) {

            // Return the full PGN string.
            // If noTag is set to true, the game info will not be included.

            return abGame.getPGN(noTag);
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

        isValidPGN: function (pgn) {

            // Check if a PGN string is valid.

            return Chessgame.isValidPGN(pgn);
        },

        onMovePlayed: function (callback) {

            // Event fired when a move has been played.

            if (typeof callback === "function") {
                abConfig.onMovePlayed = callback;
            }
        },

        play: function (move, promotion) {

            // Play the desired move and return the resulting FEN string.

            return playMove(move, promotion);
        },

        reset: function () {

            // Reset the game and the board.

            abBoard.loadFEN();
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
