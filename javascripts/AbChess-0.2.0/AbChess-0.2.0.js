// AbChess-0.2.0.js
// 2017-01-31
// Copyright (c) 2017 Nimzozo

/*global
    window
*/

/*jslint
    browser, white
*/

// TODO :
// Animations 
// - after a DND operation
//   - special moves + captures
// - during a game navigation

window.AbChess = window.AbChess || function (containerId, abConfig) {
    "use strict";

    var abBoard = {};
    var abGame = {};
    var columns = "abcdefgh";

    // Chess constants.

    var chess_value = {
        black: "b",
        black_bishop: "b",
        black_king: "k",
        black_knight: "n",
        black_pawn: "p",
        black_queen: "q",
        black_rook: "r",
        capture_symbol: "x",
        castle_king_symbol: "O-O",
        castle_queen_symbol: "O-O-O",
        check_symbol: "+",
        checkmate_symbol: "#",
        default_fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        promotion_symbol: "=",
        result_black: "0-1",
        result_draw: "1/2-1/2",
        result_white: "1-0",
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
        black_square: "square_black",
        bottom_border: "bottom-border",
        bottom_border_fragment: "bottom-border__fragment",
        ghost_piece: "ghost_piece",
        highlighted_square: "square_highlighted",
        marked_square: "square_marked",
        overflown_square: "square_overflown",
        promotion_button: "promotion-button",
        promotion_div: "promotion-div",
        right_border: "right-border",
        right_border_fragment: "right-border__fragment",
        selected_square: "square_selected",
        square: "square",
        square_canvas: "square__canvas",
        square_piece: "square__piece",
        squares_div: "squares-div",
        white_square: "square_white"
    };

    // Config default values.

    var default_config = {
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
        illegal_move: "Illegal move.",
        invalid_fen: "Invalid FEN string.",
        invalid_parameter: "Invalid parameter.",
        invalid_pgn: "Invalid PGN."
    };

    // Custom events.

    var event = {
        onMovePlayed: null
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
            pieceColor = (occupiedSquares[start] ===
                occupiedSquares[start].toLowerCase())
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
            if (playedPiece === chess_value.black_pawn ||
                playedPiece === chess_value.white_pawn) {
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
                (the_position.activeColor === chess_value.black)
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
            if (playedPiece === chess_value.black_pawn ||
                playedPiece === chess_value.white_pawn || takenPiece) {
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
            if (playedPiece.toLowerCase() === chess_value.black_king &&
                regex_castle.test(move)) {
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
                if (arrivalSquare === enPassantSquare &&
                    regex_en_passant.test(move)) {
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

        the_position.getPGNMove =
            function (move, promotion, withNumber, stringToAdd) {

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
                        pgnMove += chess_value.castle_queen_symbol;
                    } else {
                        pgnMove += chess_value.castle_king_symbol;
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

                    if (playedPiece.toLowerCase() !== chess_value.black_pawn &&
                        playedPiece.toLowerCase() !== chess_value.black_king) {
                        Object.keys(occupiedSquares).forEach(function (key) {
                            var legalSquares = [];
                            var piece = "";
                            if (ambiguousFile && ambiguousRow) {
                                return;
                            }
                            piece = occupiedSquares[key];
                            if (piece === playedPiece && key !== start) {
                                legalSquares =
                                    the_position.getLegalSquares(key);
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
                        pgnMove += chess_value.capture_symbol;
                    }
                    pgnMove += arrival;
                    if (isPromotion) {
                        pgnMove += chess_value.promotion_symbol +
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
                if ((color === chess_value.white &&
                    piece === piece.toUpperCase())
                    || (color === chess_value.black &&
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
            var regex_king = /^(Kx?([a-h][1-8])|O-O(?:-O)?)(?:\+|#)?$/;
            var regex_pawn = /^([a-h]?)x?([a-h][1-8])(\=[BNQR])?(?:\+|#)?$/;
            var regex_piece = /^[BNQR]([a-h]?[1-8]?)x?([a-h][1-8])(?:\+|#)?$/;
            var rowNumber = 0;
            var samePieces = [];
            var start = "";
            if (regex_king.test(pgnMove)) {
                matches = regex_king.exec(pgnMove);
                if (matches[1] === chess_value.castle_king_symbol ||
                    matches[1] === chess_value.castle_queen_symbol) {
                    rowNumber = (activeColor === chess_value.black)
                        ? 8
                        : 1;
                    start = "e" + rowNumber;
                    arrival = (matches[1] === chess_value.castle_king_symbol)
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
                if (pgnMove.indexOf(chess_value.promotion_symbol) !== -1) {
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
                    targets = the_position.getTargets_kingFull(start,
                        color, onlyOffensive);
                    break;
                case chess_value.black_knight:
                case chess_value.white_knight:
                    targets = the_position.getTargets_knight(start, color);
                    break;
                case chess_value.black_pawn:
                case chess_value.white_pawn:
                    targets = the_position.getTargets_pawn(start,
                        color, onlyOffensive);
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
                        if (testColNumber > 0 && testColNumber < 9 &&
                            testRowNumber > 0 && testRowNumber < 9) {
                            testSquare = columns[testColNumber - 1] +
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
            ennemiesColor = (color === chess_value.black)
                ? chess_value.white
                : chess_value.black;
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
                chess_value.black)) {
                if (allowedCastles.indexOf(chess_value.white_queen) !== -1 &&
                    !the_position.isControlledBy("d1", chess_value.black)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + "1";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("c1");
                    }
                }
                if (allowedCastles.indexOf(chess_value.white_king) !== -1 &&
                    !the_position.isControlledBy("f1", chess_value.black)) {
                    if (kingSideCastle.every(function (column) {
                        testSquare = column + "1";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("g1");
                    }
                }
            } else if (start === "e8" &&
                !the_position.isControlledBy("e8", chess_value.white)) {
                if (allowedCastles.indexOf(chess_value.black_queen) !== -1 &&
                    !the_position.isControlledBy("d8", chess_value.white)) {
                    if (queenSideCastle.every(function (column) {
                        testSquare = column + "8";
                        return !occupiedSquares.hasOwnProperty(testSquare);
                    })) {
                        targets.push("c8");
                    }
                }
                if (allowedCastles.indexOf(chess_value.black_king) !== -1 &&
                    !the_position.isControlledBy("f8", chess_value.white)) {
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
                        if (testColNumber > 0 && testColNumber < 9 &&
                            testRowNumber > 0 && testRowNumber < 9) {
                            testSquare = columns[testColNumber - 1] +
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
                if (ennemiesPlaces.indexOf(testSquare) !== -1 ||
                    enPassantSquare === testSquare) {
                    targets.push(testSquare);
                } else if (onlyOffensive) {
                    targets.push(testSquare);
                }
            });
            if (!onlyOffensive) {
                testColNumber = colNumber;
                testSquare = columns[testColNumber - 1] + testRowNumber;
                alliesPlaces = the_position.getPiecesPlaces(color);
                if (alliesPlaces.indexOf(testSquare) === -1 &&
                    ennemiesPlaces.indexOf(testSquare) === -1) {
                    targets.push(testSquare);
                    if ((rowNumber === 2 && direction === 1) ||
                        (rowNumber === 7 && direction === -1)) {
                        testRowNumber = rowNumber + 2 * direction;
                        testSquare = columns[testColNumber - 1] + testRowNumber;
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
            blackPieces = the_position.getPiecesPlaces(chess_value.black);
            if (blackPieces.length > 3) {
                return false;
            }
            if (blackPieces.length > 1) {
                blackPieces.forEach(function (key) {
                    var piece = occupiedSquares[key];
                    if (piece !== chess_value.black_king) {
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
            whitePieces = the_position.getPiecesPlaces(chess_value.white);
            if (whitePieces.length > 3) {
                return false;
            }
            if (whitePieces.length === 1) {
                return true;
            }
            testArray = [];
            whitePieces.forEach(function (key) {
                var piece = occupiedSquares[key];
                if (piece !== chess_value.white_king) {
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
        var ghost;
        var the_piece;
        div = document.createElement("DIV");
        div.className = css.square_piece;
        div.style.backgroundImage = "url('" + url + "')";
        ghost = document.createElement("DIV");
        ghost.className = css.ghost_piece;
        ghost.style.backgroundImage = "url('" + url + "')";

        the_piece = {
            div: div,
            ghost: ghost,
            name: name,
            square: null,
            url: url
        };

        the_piece.fade = function () {

            // Fade the piece until its opacity reaches 0.1.

            the_piece.div.style.opacity -= 0.05;
            if (the_piece.div.style.opacity > 0.1) {
                requestAF(the_piece.fade);
            }
        };

        the_piece.initEventListeners = function () {
            div.addEventListener("mousedown", the_piece.mouseDownHandler);
        };

        the_piece.mouseDownHandler = function (e) {
            if (typeof the_piece.square.board.onPieceMouseDown === "function") {
                the_piece.square.board.onPieceMouseDown(e, the_piece);
            }
        };

        the_piece.put = function (square) {

            // Put the piece on a square.

            if (!square.isEmpty()) {
                requestAF(square.piece.fade);
                square.piece.remove();
            }
            square.div.appendChild(the_piece.div);
            square.piece = the_piece;
            the_piece.square = square;
        };

        the_piece.remove = function () {

            // Remove the piece from the square.

            if (the_piece.square === null) {
                return;
            }
            the_piece.square.div.removeChild(the_piece.div);
            the_piece.square.piece = null;
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

            var className = "";
            the_square.isMarked = !the_square.isMarked;
            className = the_square.getClassName();
            requestAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.overfly = function () {

            // Overfly the square.
            // Cancel if already overflown.

            var className = "";
            the_square.isOverflown = !the_square.isOverflown;
            className = the_square.getClassName();
            requestAF(function () {
                the_square.div.className = className;
            });
        };

        the_square.select = function () {

            // Select the square.
            // Cancel if already selected.

            var className = "";
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
            onPieceMouseDown: null,
            onPromotionChose: null,
            onSquareClick: null,
            onSquareMouseUp: null,
            pendingMove: null,
            promotionDiv: document.createElement("DIV"),
            selectedSquare: null,
            squares: {},
            width: config.width
        };

        the_board.animateGhost = function (ghost, backSquare) {

            // Animate the ghost movement.

            var coeffX = 0;
            var coeffY = 0;
            var diffX = 0;
            var diffY = 0;
            var directionX = 0;
            var directionY = 0;
            var ghostX = ghost.offsetLeft;
            var ghostY = ghost.offsetTop;
            var speed = 0.1;
            var squareCoordinate = the_board.getSquareCoordinate(backSquare);
            var startSquare = the_board.squares[backSquare];
            if (ghostX === squareCoordinate[0] &&
                ghostY === squareCoordinate[1]) {
                document.body.removeChild(ghost);
                startSquare.piece.div.style.visibility = "visible";
                return;
            }
            if (ghostX < squareCoordinate[0]) {
                diffX = squareCoordinate[0] - ghostX;
                directionX = 1;
            } else {
                diffX = ghostX - squareCoordinate[0];
                directionX = -1;
            }
            if (ghostY < squareCoordinate[1]) {
                diffY = squareCoordinate[1] - ghostY;
                directionY = 1;
            } else {
                diffY = ghostY - squareCoordinate[1];
                directionY = -1;
            }
            coeffX = Math.ceil(diffX * speed);
            coeffY = Math.ceil(diffY * speed);
            ghost.style.left = (ghostX + directionX * coeffX) + "px";
            ghost.style.top = (ghostY + directionY * coeffY) + "px";
            requestAF(function () {
                the_board.animateGhost(ghost, backSquare);
            });
        };

        the_board.animateMove = function (start, arrival) {

            // Animate a move.


        };

        the_board.clearMarks = function () {

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
        };

        the_board.clickPromotionHandler = function (e) {
            var choice = e.target.name;
            if (typeof the_board.onPromotionChose === "function") {
                the_board.onPromotionChose(choice);
            }
            the_board.pendingMove = null;
            the_board.unlock();
            requestAF(function () {
                the_board.promotionDiv.style.display = "none";
            });
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
                    canvas.className = css.square_canvas;
                    canvas.setAttribute("height", canvasWidth);
                    canvas.setAttribute("width", canvasWidth);
                    div = document.createElement("DIV");
                    cssClass = (isWhiteSquare)
                        ? css.square + " " + css.white_square
                        : css.square + " " + css.black_square;
                    div.className = cssClass;
                    square = new Square(name);
                    square.canvas = canvas;
                    square.drawFilledCircle(xy, xy, radius,
                        the_board.legalMarksColor);
                    square.board = the_board;
                    square.div = div;
                    div.addEventListener("click", square.clickHandler);
                    div.addEventListener("mouseenter",
                        square.mouseEnterHandler);
                    div.addEventListener("mouseleave",
                        square.mouseLeaveHandler);
                    div.addEventListener("mouseup", square.mouseUpHandler);
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
            the_board.container.appendChild(squaresDiv);
            squaresDiv.appendChild(the_board.promotionDiv);
            if (the_board.notationBorder) {
                bottomBorder = document.createElement("DIV");
                bottomBorder.className = css.bottom_border;
                bottomBorder.style.width = the_board.width + "px";
                colNumber = 1;
                while (colNumber < 9) {
                    borderFragment = document.createElement("DIV");
                    borderFragment.className = css.bottom_border_fragment;
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
                    borderFragment.className = css.right_border_fragment;
                    borderFragment.style.lineHeight =
                        Math.floor(the_board.width / 8) + "px";
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
                    currentSquare.piece.remove();
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

        the_board.getSquareCoordinate = function (square) {

            // Returns an array of coordinate of a square.

            var htmlSquare = the_board.squares[square];
            var x = Math.floor(htmlSquare.div.getBoundingClientRect().left);
            var y = Math.floor(htmlSquare.div.getBoundingClientRect().top);
            return [x, y];
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
            fen = fen || chess_value.default_fen;
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
                url = the_board.imagesPath + pieceName +
                    the_board.imagesExtension;
                piece = new Piece(pieceName, url);
                piece.initEventListeners();
                square = the_board.squares[squareName];
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

        the_board.play = function (move, promotion) {

            // Play the desired move on the board.
            // Manage special moves (castle, en passant, promotion).

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
            emptyArrival = arrivalSquare.isEmpty();
            playedPiece.put(arrivalSquare);
            if (regex_castle.test(move) &&
                playedPiece.name[1] === chess_value.black_king) {
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
                if (regex_en_passant.test(move) &&
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
                    if (!the_board.squares[enPassant].isEmpty()) {
                        the_board.squares[enPassant].piece.remove();
                    }
                } else if (regex_promotion.test(move)) {
                    promotion = promotion || chess_value.black_queen;
                    newPieceColor = (arrival[1] === "1")
                        ? chess_value.black
                        : chess_value.white;
                    newPieceName = newPieceColor + promotion.toLowerCase();
                    url = the_board.imagesPath + newPieceName +
                        the_board.imagesExtension;
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
                the_board.promotionDiv.removeChild(
                    the_board.promotionDiv.lastChild);
            }
            pieces.forEach(function (piece) {
                var promotionButton;
                var url = the_board.imagesPath + color + piece +
                    the_board.imagesExtension;
                promotionButton = document.createElement("INPUT");
                promotionButton.className = css.promotion_button;
                promotionButton.setAttribute("type", "button");
                promotionButton.setAttribute("name", piece);
                promotionButton.style.backgroundImage = "url('" + url + "')";
                promotionButton.addEventListener("click",
                    the_board.clickPromotionHandler);
                the_board.promotionDiv.appendChild(promotionButton);
            });
            the_board.lock();
            requestAF(function () {
                the_board.promotionDiv.style.display = "block";
            });
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
            fenStrings: [chess_value.default_fen],
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
            if (!regex_move.test(move)) {
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
            if (!regex_move.test(move)) {
                throw new SyntaxError(error.invalid_parameter);
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
                        stringToAdd = chess_value.checkmate_symbol;
                        if (nextPosition.activeColor === chess_value.black) {
                            the_game.setTag("Result", chess_value.result_white);
                        } else {
                            the_game.setTag("Result", chess_value.result_black);
                        }
                    } else {
                        stringToAdd = chess_value.check_symbol;
                    }
                } else if (isOver) {
                    the_game.setTag("Result", chess_value.result_draw);
                } else if (isDrawn) {
                    the_game.setTag("Result", chess_value.result_draw);
                }
                pgnMove = currentPosition.getPGNMove(
                    move, promotion, false, stringToAdd);
                the_game.pgnMoves.push(pgnMove);
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
            Object.keys(requiredTags).forEach(function (key) {
                tags[key] = requiredTags[key];
            });
            the_game.fenStrings = [chess_value.default_fen];
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
                if (simpleMove.indexOf(chess_value.promotion_symbol) !== -1) {
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

    function navigate(index, updatePosition) {

        // Navigate through the game to the desired position.
        // Update the board.

        var fen = "";
        var kingSquare = "";
        var lastMove = "";
        var lastMoveArrival = "";
        var lastMoveStart = "";
        var maxIndex = 0;
        var position = {};
        maxIndex = abGame.fenStrings.length - 1;
        if (index < 0 || index > maxIndex) {
            throw new Error(error.invalid_parameter);
        }
        position = abGame.getNthPosition(index);
        if (updatePosition) {
            fen = position.fenString;
            abBoard.loadFEN(fen);
            if (index < maxIndex) {
                abBoard.lock();
            } else {
                abBoard.unlock();
            }
        }
        if (abConfig.markLastMove) {
            abBoard.clearMarks();
            if (index > 0) {
                lastMove = abGame.moves[index - 1];
                lastMoveStart = lastMove.substr(0, 2);
                lastMoveArrival = lastMove.substr(3, 2);
                abBoard.highlightSquares([lastMoveStart, lastMoveArrival]);
            }
        }
        if (abConfig.markKingInCheck &&
            position.isInCheck(position.activeColor)) {
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
            abBoard.drawCircles(legalSquares);
        }
    }

    function playMove(move, promotion) {

        // Play a move on the board and store it in the game.

        var index = 0;
        abBoard.play(move, promotion);
        abGame.play(move, promotion);
        index = abGame.fenStrings.length - 1;
        navigate(index, false);
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
        if (!regex_move.test(move)) {
            throw new Error(error.invalid_parameter);
        }
        selectPiece(start);
        n = abGame.fenStrings.length - 1;
        if (abGame.isLegal(n, move)) {
            position = abGame.getNthPosition(n);
            playedPiece = position.occupiedSquares[start];
            if (regex_promotion.test(move) &&
                playedPiece.toLowerCase() === chess_value.black_pawn) {
                abBoard.pendingMove = move;
                color = (arrival[1] === "8")
                    ? chess_value.white
                    : chess_value.black;
                abBoard.showPromotionDiv(color);
            } else {
                playMove(move);
            }
            return true;
        }
        if (selectArrival && arrival !== start &&
            !abBoard.squares[arrival].isEmpty()) {
            selectPiece(arrival);
        }
        return false;
    }

    // Board events initialization.

    abBoard.onMouseMove = function (e) {
        var activeSquare;
        var ghost;
        var ghostWidth = 0;
        if (!abBoard.isDragging) {
            return;
        }
        activeSquare = abBoard.squares[abBoard.selectedSquare];
        ghost = activeSquare.piece.ghost;
        ghostWidth = Math.floor(abBoard.width / 8);
        ghost.style.left = (e.clientX - ghostWidth / 2) + "px";
        ghost.style.top = (e.clientY - ghostWidth / 2) + "px";
    };

    abBoard.onMouseUp = function () {
        var ghost;
        var selectedSquare;
        if (!abBoard.isDragging) {
            return;
        }
        selectedSquare = abBoard.squares[abBoard.selectedSquare];
        ghost = selectedSquare.piece.ghost;
        abBoard.animateGhost(ghost, abBoard.selectedSquare);
        selectPiece(abBoard.selectedSquare);
        abBoard.isDragging = false;
    };

    abBoard.onPieceMouseDown = function (e, piece) {
        var ghostWidth = 0;
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
        piece.ghost.style.left = (e.clientX - ghostWidth / 2) + "px";
        piece.ghost.style.top = (e.clientY - ghostWidth / 2) + "px";
        document.body.appendChild(piece.ghost);
        if (abBoard.markOverflownSquare) {
            piece.square.overfly();
        }
        if (abBoard.selectedSquare !== null) {
            selectPiece(abBoard.selectedSquare);
        }
        selectPiece(piece.square.name);
    };

    abBoard.onPromotionChose = function (choice) {
        var move = abBoard.pendingMove;
        playMove(move, choice);
    };

    abBoard.onSquareClick = function (clickedSquare) {
        if (!abBoard.clickablePieces) {
            return;
        }
        if (abBoard.selectedSquare === null) {
            if (!abBoard.squares[clickedSquare].isEmpty()) {
                selectPiece(clickedSquare);
            }
        } else {
            finishMove(clickedSquare, true);
        }
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

    abBoard.onSquareMouseUp = function (droppedSquare) {
        var ghost;
        var startSquare;
        if (!abBoard.isDragging) {
            return;
        }
        startSquare = abBoard.squares[abBoard.selectedSquare];
        ghost = startSquare.piece.ghost;
        if (abBoard.markOverflownSquare) {
            droppedSquare.overfly();
        }
        if (finishMove(droppedSquare.name, false)) {
            abBoard.animateGhost(ghost, droppedSquare.name);
        } else {
            abBoard.animateGhost(ghost, startSquare.name);
        }
        abBoard.isDragging = false;
    };

    document.addEventListener("mousemove", abBoard.onMouseMove);
    document.addEventListener("mouseup", abBoard.onMouseUp);

    // -------------------------------------------------------------------------
    // Public api.

    return {
        DEFAULT_FEN: chess_value.default_fen,

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
                throw new Error(error.invalid_parameter);
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
                throw new Error(error.invalid_parameter);
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
        }

    };
};
