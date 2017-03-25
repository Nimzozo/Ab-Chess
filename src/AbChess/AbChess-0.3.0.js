// AbChess.js
// 2017-03-25
// Copyright (c) 2017 Nimzozo

/*global
    window
*/

/*jslint
    browser, white
*/

/**
 * TODO
 * 
 * Chess logic :
 * - pieces basic movements : OK
 * - special moves :
 *   - en passant
 *   - promotion
 *   - castling
 * - check
 * - kings opposition
 * - legal moves
 * FEN validation
 * PGN parsing
 */

/**
 * Abchess
 */
window.AbChess = window.AbChess || function (abId, abOptions) {
    "use strict";

    /**
     * The board used for the API.
     */
    var abBoard = {};

    /**
     * Chess constants.
     */
    var chess = {
        bishop: "b",
        bishopVectors: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
        black: "b",
        columns: "abcdefgh",
        defaultFEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        king: "k",
        knight: "n",
        pawn: "p",
        queen: "q",
        rook: "r",
        rookVectors: [[-1, 0], [0, -1], [0, 1], [1, 0]],
        rows: "12345678",
        white: "w"
    };

    /**
     * Css classes / ids.
     */
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
        squareCanvas: "square__canvas",
        squarePiece: "square__piece",
        squares: "squares",
        startSquare: "square_selected",
        whiteSquare: "square_white"
    };

    /**
     * Options default values.
     */
    var defaultOptions = {
        animationSpeed: 10,
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
        markStartSquare: true,
        notationBorder: true,
        width: 400
    };

    /**
     * Raf
     */
    var raf = window.requestAnimationFrame;

    /**
     * Regular expressions.
     */
    var regExp = {
        fen: /^(?:[bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(b|w)\s(K?Q?k?q?|-)\s([a-h][36]|-)\s(0|[1-9]\d{0,2})\s([1-9]\d{0,2})$/
    };

    /**
     * Convert a FEN string to a position object.
     * @param {string} fen The FEN string to convert.
     */
    function fenToObject(fen) {
        var position = {};
        var rows = [];
        var str = fen.replace(/\s.*/, "");
        rows = str.split("/");
        rows.forEach(function (row, rowIndex) {
            var chars = row.split("");
            var columnIndex = 0;
            chars.forEach(function (char) {
                var square = "";
                if (/\d/.test(char)) {
                    columnIndex += Number(char);
                } else {
                    square = chess.columns[columnIndex] +
                        chess.rows[7 - rowIndex];
                    position[square] = char;
                    columnIndex += 1;
                }
            });
        });
        return position;
    }

    /**
     * Return the coordinates of an element.
     * @param {HTMLElement} element 
     */
    function getCoordinates(element) {
        var x = element.getBoundingClientRect().left + window.pageXOffset;
        var y = element.getBoundingClientRect().top + window.pageXOffset;
        return [x, y];
    }

    /**
     * The class to create a chess position.
     * @param {string} fen The FEN string representing the position.
     */
    function Position(fen) {
        var position = {
            activeColor: "",
            allowedCastles: "",
            enPassant: "",
            fen: fen,
            fullMoveNumber: 0,
            halfMoveClock: 0,
            squares: {}
        };

        /**
         * Initialize and return the position.
         */
        position.create = function () {
            var result = regExp.fen.exec(fen);
            position.activeColor = result[1];
            position.allowedCastles = result[2];
            position.enPassant = result[3];
            position.halfMoveClock = result[4];
            position.fullMoveNumber = result[5];
            position.squares = fenToObject(fen);
            return position;
        };

        return position.create();
    }

    /**
     * The Piece class to build chess pieces.
     * @param {string} name The character representing the piece.
     * @param {string} color The character representing the color.
     */
    function Piece(name, color, board) {
        var piece = {
            board: board,
            color: color,
            element: {},
            ghost: {},
            isAnimated: false,
            name: name,
            url: "",
            width: 0
        };

        /**
         * Animate the piece movement.
         */
        piece.animate = function (animation) {
            var speed = board.options.animationSpeed;
            var x = animation.translates[0] * animation.iteration * speed;
            var y = animation.translates[1] * animation.iteration * speed;
            if (Math.abs(x) < animation.max && Math.abs(y) < animation.max) {
                piece.ghost.style.transform = "translate(" + x + "px, " +
                    y + "px)";
                animation.iteration += 1;
                raf(function () {
                    piece.animate(animation);
                });
            } else {
                raf(piece.endAnimation);
            }
        };

        /**
         * Initialize the piece animation.
         */
        piece.animateStart = function (start, destination) {
            var animation = {};
            var max = 0;
            var norms = [];
            var translates = [];
            start.forEach(function (value, index) {
                var direction = (destination[index] >= value)
                    ? 1
                    : -1;
                var distance = Math.abs(value - destination[index]);
                var norm = direction * distance;
                norms.push(norm);
            });
            max = Math.max(Math.abs(norms[0]), Math.abs(norms[1]));
            norms.forEach(function (norm) {
                translates.push(norm / max);
            });
            animation.translates = translates;
            animation.iteration = 1;
            animation.max = max;
            raf(function () {
                piece.isAnimated = true;
                piece.element.style.opacity = 0;
                piece.ghost.style.left = start[0] + "px";
                piece.ghost.style.top = start[1] + "px";
                document.body.appendChild(piece.ghost);
                piece.animate(animation);
            });
        };

        /**
         * Make the piece appear.
         */
        piece.appear = function () {
            var opacity = Number(piece.element.style.opacity) + 0.1;
            piece.element.style.opacity = opacity;
            if (opacity < 1) {
                raf(piece.appear);
            }
        };

        /**
         * Initialize and return the piece.
         */
        piece.create = function () {
            var image = "";
            piece.url = board.options.imagesPath + color + name +
                board.options.imagesExtension;
            image = "url('" + piece.url + "')";
            piece.element = document.createElement("div");
            piece.element.className = css.squarePiece;
            piece.element.style.backgroundImage = image;
            piece.ghost = document.createElement("div");
            piece.ghost.className = css.pieceGhost;
            piece.ghost.style.backgroundImage = image;
            piece.width = board.options.width / 8;
            piece.ghost.style.height = piece.width + "px";
            piece.ghost.style.width = piece.width + "px";
            return piece;
        };

        /**
         * Make the piece disappear.
         */
        piece.disappear = function (square) {
            var opacity = Number(piece.element.style.opacity) - 0.1;
            piece.element.style.opacity = opacity;
            if (opacity > 0) {
                raf(function () {
                    piece.disappear(square);
                });
            } else {
                raf(function () {
                    square.removePiece(piece);
                });
            }
        };

        /**
         * End the piece animation.
         */
        piece.endAnimation = function () {
            document.body.removeChild(piece.ghost);
            piece.ghost.style.transform = "";
            piece.element.style.opacity = 1;
            piece.isAnimated = false;
        };

        /**
         * Return the moves for bishop, queen, rook.
         */
        piece.getBQRMoves = function (position, start, vectors) {
            var moves = [];
            var startColumn = chess.columns.indexOf(start[0]);
            var startRow = chess.rows.indexOf(start[1]);
            vectors.forEach(function (vector) {
                var columnIndex = startColumn + vector[0];
                var rowIndex = startRow + vector[1];
                var pieceChar = "";
                var pieceColor = "";
                var square = "";
                while (columnIndex >= 0 && columnIndex < 8 &&
                    rowIndex >= 0 && rowIndex < 8) {
                    square = chess.columns[columnIndex] + chess.rows[rowIndex];
                    if (position.hasOwnProperty(square)) {
                        pieceChar = position[square];
                        pieceColor = (pieceChar.toLowerCase() === pieceChar)
                            ? chess.black
                            : chess.white;
                        if (pieceColor !== piece.color) {
                            moves.push(square);
                        }
                        return;
                    }
                    moves.push(square);
                    columnIndex += vector[0];
                    rowIndex += vector[1];
                }
            });
            return moves;
        }

        /**
         * Grab the piece.
         */
        piece.grab = function (e) {
            var left = e.clientX + window.pageXOffset - piece.width / 2;
            var top = e.clientY + window.pageYOffset - piece.width / 2;
            piece.ghost.style.left = left + "px";
            piece.ghost.style.top = top + "px";
            document.body.appendChild(piece.ghost);
            piece.element.style.opacity = 0;
        };

        /**
         * Move a piece from a square to another.
         */
        piece.moveFromTo = function (oldSquare, newSquare) {
            var char = piece.name;
            raf(function () {
                oldSquare.removePiece(piece);
                newSquare.placePiece(piece);
            });
            delete board.position[oldSquare.name];
            if (piece.color === chess.white) {
                char = char.toUpperCase();
            }
            board.position[newSquare.name] = char;
        };

        return piece.create();
    }

    function Bishop(color, board) {
        var bishop = new Piece(chess.bishop, color, board);

        /**
         * Return the possible moves in a position.
         */
        bishop.getMoves = function (position, start) {
            return bishop.getBQRMoves(position, start, chess.bishopVectors);
        };

        return bishop;
    }

    function King(color, board) {
        var king = new Piece(chess.king, color, board);

        /**
         * Return the possible moves in a position.
         */
        king.getMoves = function (position, start) {
            var moves = [];
            var startColumn = chess.columns.indexOf(start[0]);
            var startRow = chess.rows.indexOf(start[1]);
            var vectors = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            vectors.forEach(function (vector) {
                var columnIndex = startColumn + vector[0];
                var rowIndex = startRow + vector[1];
                var piece = "";
                var pieceColor = "";
                var square = "";
                if (columnIndex < 0 || columnIndex > 7 ||
                    rowIndex < 0 || rowIndex > 7) {
                    return;
                }
                square = chess.columns[columnIndex] + chess.rows[rowIndex];
                if (position.hasOwnProperty(square)) {
                    piece = position[square];
                    pieceColor = (piece.toLowerCase() === piece)
                        ? chess.black
                        : chess.white;
                    if (pieceColor === king.color) {
                        return;
                    }
                }
                moves.push(square);
            });
            return moves;
        };

        return king.create();
    }

    function Knight(color, board) {
        var knight = new Piece(chess.knight, color, board);

        /**
         * Return the possible moves in a position.
         */
        knight.getMoves = function (position, start) {
            var moves = [];
            var startColumn = chess.columns.indexOf(start[0]);
            var startRow = chess.rows.indexOf(start[1]);
            var vectors = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            vectors.forEach(function (vector) {
                var columnIndex = startColumn + vector[0];
                var rowIndex = startRow + vector[1];
                var piece = "";
                var pieceColor = "";
                var square = "";
                if (columnIndex < 0 || columnIndex > 7 ||
                    rowIndex < 0 || rowIndex > 7) {
                    return;
                }
                square = chess.columns[columnIndex] + chess.rows[rowIndex];
                if (position.hasOwnProperty(square)) {
                    piece = position[square];
                    pieceColor = (piece.toLowerCase() === piece)
                        ? chess.black
                        : chess.white;
                    if (pieceColor === knight.color) {
                        return;
                    }
                }
                moves.push(square);
            });
            return moves;
        };

        return knight.create();
    }

    function Pawn(color, board) {
        var pawn = new Piece(chess.pawn, color, board);

        /**
         * Return the possible moves in a position.
         */
        pawn.getMoves = function (position, start) {
            var direction = 1;
            var moves = [];
            var square = "";
            var startColumn = chess.columns.indexOf(start[0]);
            var startRow = chess.rows.indexOf(start[1]);
            var vectors = [];
            if (pawn.color === chess.black) {
                direction = -1;
            }
            vectors = [[-1, direction], [1, direction]];
            vectors.forEach(function (vector) {
                var columnIndex = startColumn + vector[0];
                var rowIndex = startRow + vector[1];
                var piece = "";
                var pieceColor = "";
                if (columnIndex < 0 || columnIndex > 7 ||
                    rowIndex < 0 || rowIndex > 7) {
                    return;
                }
                square = chess.columns[columnIndex] + chess.rows[rowIndex];
                if (!position.hasOwnProperty(square)) {
                    return;
                }
                piece = position[square];
                pieceColor = (piece.toLowerCase() === piece)
                    ? chess.black
                    : chess.white;
                if (pieceColor !== pawn.color) {
                    moves.push(square);
                }
            });
            square = chess.columns[startColumn] +
                chess.rows[startRow + direction];
            if (!position.hasOwnProperty(square)) {
                moves.push(square);
                if ((startRow === 1 && pawn.color === chess.white) ||
                    (startRow === 6 && pawn.color === chess.black)) {
                    square = chess.columns[startColumn] +
                        chess.rows[startRow + direction * 2];
                    moves.push(square);
                }
            }
            return moves;
        };

        return pawn.create();
    }

    function Queen(color, board) {
        var queen = new Piece(chess.queen, color, board);

        /**
         * Return the possible moves in a position.
         */
        queen.getMoves = function (position, start) {
            var vectors = chess.bishopVectors.concat(chess.rookVectors);
            return queen.getBQRMoves(position, start, vectors);
        };

        return queen.create();
    }

    function Rook(color, board) {
        var rook = new Piece(chess.rook, color, board);

        /**
         * Return the possible moves in a position.
         */
        rook.getMoves = function (position, start) {
            return rook.getBQRMoves(position, start, chess.rookVectors);
        };

        return rook.create();
    }

    /**
     * The Square class to build the chessboard squares.
     */
    function Square(column, row, board) {
        var square = {
            board: board,
            canvas: {},
            column: column,
            element: {},
            hasCanvas: false,
            name: "",
            piece: null,
            row: row
        };

        /**
         * Initialize and return the square.
         */
        square.create = function () {
            var columnIndex = chess.columns.indexOf(square.column);
            var context = {};
            var rowIndex = chess.rows.indexOf(square.row);
            var width = board.options.width / 8;
            square.element = document.createElement("div");
            square.element.className = (columnIndex % 2 === rowIndex % 2)
                ? css.blackSquare
                : css.whiteSquare;
            square.name = column + row;
            square.canvas = document.createElement("canvas");
            square.canvas.setAttribute("height", width + "px");
            square.canvas.setAttribute("width", width + "px");
            square.canvas.className = css.squareCanvas;
            context = square.canvas.getContext("2d");
            context.beginPath();
            context.arc(width / 2, width / 2, width / 8, 0, 2 * Math.PI);
            context.fillStyle = "green";
            context.fill();
            if (board.options.clickable) {
                square.element.addEventListener("click", square.onClick);
            }
            if (board.options.draggable) {
                square.element.addEventListener("mousedown",
                    square.onMouseDown);
                square.element.addEventListener("mouseenter",
                    square.onMouseEnterLeave);
                square.element.addEventListener("mouseleave",
                    square.onMouseEnterLeave);
                square.element.addEventListener("mouseup", square.onMouseUp);
            }
            return square;
        };

        /**
         * Deselect the start square of the board.
         */
        square.deselect = function () {
            board.startSquare = null;
            raf(function () {
                square.element.classList.remove(css.startSquare);
            });
            if (board.options.markLegalSquares) {
                board.hideCanvas();
            }
        };

        /**
         * Square click event handler.
         */
        square.onClick = function () {
            if (board.startSquare !== null) {
                if (board.startSquare !== square) {
                    board.move(board.startSquare.name, square.name);
                }
                board.startSquare.deselect();
            } else if (square.piece !== null && !board.hasDraggedStart &&
                !square.piece.isAnimated) {
                square.select();
            }
            board.hasDraggedStart = false;
        };

        /**
         * Square mousedown event handler.
         */
        square.onMouseDown = function (e) {
            var piece = square.piece;
            e.preventDefault();
            if (piece === null || e.button !== 0 || piece.isAnimated) {
                return;
            }
            board.isDragging = true;
            raf(function () {
                square.element.classList.add(css.overflownSquare);
                piece.grab(e);
            });
            if (board.startSquare !== null) {
                if (square === board.startSquare) {
                    board.hasDraggedStart = true;
                    return;
                }
                board.startSquare.deselect();
            }
            square.select();
        };

        /**
         * Square mouseenter mouseleave event handler.
         */
        square.onMouseEnterLeave = function () {
            if (board.isDragging) {
                square.element.classList.toggle(css.overflownSquare);
            }
        };

        /**
         * Square mouseup event handler.
         */
        square.onMouseUp = function () {
            var end = [];
            var piece = {};
            var start = [];
            if (!board.isDragging) {
                return;
            }
            piece = board.startSquare.piece;
            start = getCoordinates(piece.ghost);
            end = getCoordinates(square.element);
            piece.animateStart(start, end);
            if (square !== board.startSquare) {
                piece.moveFromTo(board.startSquare, square);
            }
            raf(function () {
                square.element.classList.remove(css.overflownSquare);
            });
            board.startSquare.deselect();
            board.isDragging = false;
        };

        /**
         * Place a piece on the square.
         */
        square.placePiece = function (piece) {
            if (square.piece !== null) {
                square.removePiece(square.piece);
            }
            square.piece = piece;
            square.element.appendChild(piece.element);
        };

        /**
         * Remove a piece of the square.
         */
        square.removePiece = function (piece) {
            if (piece === square.piece) {
                square.element.removeChild(piece.element);
                square.piece = null;
            }
        };

        /**
         * Select the piece on the square.
         */
        square.select = function () {
            var moves = [];
            board.startSquare = square;
            raf(function () {
                square.element.classList.add(css.startSquare);
            });
            if (board.options.markLegalSquares) {
                moves = square.piece.getMoves(board.position,
                    square.name);
                moves.forEach(board.showCanvas);
            }
        };

        return square.create();
    }

    /**
     * The Board class to build HTML chessboards.
     * @param {string} id
     * @param {object} options
     */
    function Board(id, options) {
        var board = {
            columnsBorder: {},
            container: {},
            element: {},
            hasDraggedStart: false,
            hasNotation: false,
            isDragging: false,
            isFlipped: false,
            options: options,
            position: {},
            rowsBorder: {},
            startSquare: null,
            squares: []
        };

        /**
         * Initialize and return the board.
         */
        board.create = function () {
            board.element = document.createElement("div");
            board.element.className = css.squares;
            chess.columns.split("").forEach(function (column) {
                chess.rows.split("").forEach(function (row) {
                    var square = new Square(column, row, board);
                    board.squares.push(square);
                });
            });
            board.container = document.getElementById(id);
            if (options.draggable) {
                document.addEventListener("mousemove", board.onMouseMove);
                document.addEventListener("mouseup", board.onMouseUp);
            }
            return board;
        };

        /**
         * Create the notation border.
         */
        board.createBorder = function () {
            var border = {};
            var className = "";
            var columns = chess.columns.split("");
            var rows = chess.rows.split("");
            if (board.isFlipped) {
                columns = columns.reverse();
            } else {
                rows = rows.reverse();
            }
            function createFragment(text) {
                var fragment = document.createElement("div");
                fragment.innerText = text;
                fragment.className = className;
                border.appendChild(fragment);
            }
            board.columnsBorder = document.createElement("div");
            board.columnsBorder.className = css.columnsBorder;
            border = board.columnsBorder;
            className = css.columnsBorderFragment;
            columns.forEach(createFragment);
            board.rowsBorder = document.createElement("div");
            board.rowsBorder.className = css.rowsBorder;
            border = board.rowsBorder;
            className = css.rowsBorderFragment;
            rows.forEach(createFragment);
        };

        /**
         * Draw the board.
         */
        board.draw = function () {
            var columns = chess.columns.split("");
            var rows = chess.rows.split("");
            if (board.isFlipped) {
                columns = columns.reverse();
            } else {
                rows = rows.reverse();
            }
            rows.forEach(function (row) {
                columns.forEach(function (column) {
                    var square = board.getSquare(column + row);
                    board.element.appendChild(square.element);
                });
            });
            board.container.appendChild(board.element);
            if (board.hasNotation) {
                board.createBorder();
                board.container.insertBefore(board.rowsBorder, board.element);
                board.container.appendChild(board.columnsBorder);
            }
        };

        /**
         * Return the animations to do between two positions.
         */
        board.getAnimations = function (position) {
            var animations = [];
            var columns = chess.columns.split("");
            var futureSquares = [];
            var pastSquares = [];
            var rows = chess.rows.split("");
            rows.forEach(function (row) {
                columns.forEach(function (column) {
                    var square = column + row;
                    if (board.position[square] === position[square]) {
                        return;
                    }
                    if (!board.position.hasOwnProperty(square)) {
                        futureSquares.push(square);
                        return;
                    }
                    if (!position.hasOwnProperty(square)) {
                        pastSquares.push(square);
                        return;
                    }
                    futureSquares.push(square);
                    pastSquares.push(square);
                });
            });
            futureSquares.forEach(function (futureSquare) {
                var animation = {};
                var char = position[futureSquare];
                var color = "";
                var endSquare = {};
                var existsInPast = false;
                var start = "";
                var startSquare = {};
                existsInPast = pastSquares.some(function (pastSquare, i) {
                    start = pastSquare;
                    if (board.position[pastSquare] === char) {
                        pastSquares.splice(i, 1);
                        return true;
                    }
                    return false;
                });
                endSquare = board.getSquare(futureSquare);
                if (existsInPast) {
                    startSquare = board.getSquare(start);
                    animation.piece = startSquare.piece;
                    animation.start = startSquare;
                } else {
                    animation.start = null;
                    color = (char.toUpperCase() === char)
                        ? chess.white
                        : chess.black;
                    char = char.toLowerCase();
                    switch (char) {
                        case chess.bishop:
                            animation.piece = new Bishop(color, board);
                            break;
                        case chess.king:
                            animation.piece = new King(color, board);
                            break;
                        case chess.knight:
                            animation.piece = new Knight(color, board);
                            break;
                        case chess.pawn:
                            animation.piece = new Pawn(color, board);
                            break;
                        case chess.queen:
                            animation.piece = new Queen(color, board);
                            break;
                        case chess.rook:
                            animation.piece = new Rook(color, board);
                            break;
                    }
                }
                animation.end = endSquare;
                animations.push(animation);
            });
            pastSquares.forEach(function (square) {
                var animation = {};
                var startSquare = board.getSquare(square);
                animation.piece = startSquare.piece;
                animation.start = startSquare;
                animation.end = null;
                animations.push(animation);
            });
            return animations;
        };

        /**
         * Return the current FEN string.
         */
        board.getFEN = function () {
            var columns = chess.columns.split("");
            var fen = "";
            var rows = chess.rows.split("").reverse();
            rows.forEach(function (row, rowIndex) {
                var emptyCount = 0;
                columns.forEach(function (column, columnIndex) {
                    var pieceChar = "";
                    var square = board.getSquare(column + row);
                    if (square.piece === null) {
                        emptyCount += 1;
                        if (columnIndex > 6) {
                            fen += emptyCount;
                        }
                    } else {
                        if (emptyCount > 0) {
                            fen += emptyCount;
                            emptyCount = 0;
                        }
                        pieceChar = (square.piece.color === chess.white)
                            ? square.piece.name.toUpperCase()
                            : square.piece.name.toLowerCase();
                        fen += pieceChar;
                    }
                });
                if (rowIndex < 7) {
                    fen += "/";
                }
            });
            return fen;
        };

        /**
         * Return a square by giving its name.
         */
        board.getSquare = function (name) {
            var square = {};
            board.squares.some(function (item) {
                if (item.name === name) {
                    square = item;
                    return true;
                }
                return false;
            });
            return square;
        };

        /**
         * Hide all the canvas.
         */
        board.hideCanvas = function () {
            board.squares.forEach(function (square) {
                if (square.hasCanvas) {
                    raf(function () {
                        square.element.removeChild(square.canvas);
                        square.hasCanvas = false;
                    });
                }
            });
        };

        /**
         * Move a piece.
         */
        board.move = function (start, destination) {
            var endCoordinates = [];
            var endSquare = board.getSquare(destination);
            var startCoordinates = [];
            var startSquare = board.getSquare(start);
            startCoordinates = getCoordinates(startSquare.element);
            endCoordinates = getCoordinates(endSquare.element);
            startSquare.piece.animateStart(startCoordinates, endCoordinates);
            startSquare.piece.moveFromTo(startSquare, endSquare);

        };

        /**
         * Document mousemove event handler.
         */
        board.onMouseMove = function (e) {
            var ghost = {};
            var left = 0;
            var top = 0;
            if (!board.isDragging) {
                return;
            }
            ghost = board.startSquare.piece.ghost;
            raf(function () {
                left = e.clientX + window.pageXOffset - options.width / 16;
                top = e.clientY + window.pageYOffset - options.width / 16;
                ghost.style.left = left + "px";
                ghost.style.top = top + "px";
            });
        };

        /**
         * Document mouseup event handler.
         */
        board.onMouseUp = function () {
            var destination = [];
            var start = [];
            if (!board.isDragging) {
                return;
            }
            start = getCoordinates(board.startSquare.piece.ghost);
            destination = getCoordinates(board.startSquare.element);
            board.startSquare.piece.animateStart(start, destination);
            board.startSquare.deselect();
            board.isDragging = false;
        };

        /**
         * Perform the animations.
         */
        board.performAnimations = function (animations) {
            animations.forEach(function (animation) {
                if (animation.end === null) {
                    raf(function () {
                        animation.piece.disappear(animation.start);
                    });
                }
            });
            animations.forEach(function (animation) {
                var end = [];
                var start = [];
                if (animation.start === null || animation.end === null) {
                    return;
                }
                start = getCoordinates(animation.start.element);
                end = getCoordinates(animation.end.element);
                animation.piece.animateStart(start, end);
                animation.piece.moveFromTo(animation.start, animation.end);
            });
            animations.forEach(function (animation) {
                if (animation.start !== null) {
                    return;
                }
                raf(function () {
                    animation.end.placePiece(animation.piece);
                    animation.piece.appear();
                });
            });
        };

        /**
         * Show the canvas of the square.
         */
        board.showCanvas = function (squareName) {
            var square = board.getSquare(squareName);
            raf(function () {
                square.element.appendChild(square.canvas);
                square.hasCanvas = true;
            });
        };

        /**
         * Set a position from a FEN string.
         * @param {string} fen
         */
        board.setPosition = function (fen) {
            var animations = [];
            var position = fenToObject(fen);
            if (board.startSquare !== null) {
                board.startSquare.deselect();
            }
            animations = board.getAnimations(position);
            board.performAnimations(animations);
            board.position = position;
        };

        return board.create();
    }

    (function () {
        if (typeof abOptions === "object") {
            Object.keys(defaultOptions).forEach(function (key) {
                if (!abOptions.hasOwnProperty(key)) {
                    abOptions[key] = defaultOptions[key];
                }
            });
        } else {
            abOptions = defaultOptions;
        }
        abBoard = new Board(abId, abOptions);
    }());

    return {
        board: {
            draw: function (flipped, notation) {
                if (typeof flipped !== "boolean") {
                    flipped = false;
                }
                if (typeof notation !== "boolean") {
                    notation = true;
                }
                abBoard.hasNotation = notation;
                abBoard.isFlipped = flipped;
                abBoard.draw();
            },
            flip: function () {
                while (abBoard.container.hasChildNodes()) {
                    abBoard.container.removeChild(abBoard.container.lastChild);
                }
                abBoard.isFlipped = !abBoard.isFlipped;
                abBoard.draw();
            },
            getFEN: function () {
                return abBoard.getFEN();
            },
            move: function (start, destination) {
                abBoard.move(start, destination);
            },
            setFEN: function (fen) {
                fen = fen || chess.defaultFEN;
                abBoard.setPosition(fen);
            }
        }
    };

};
