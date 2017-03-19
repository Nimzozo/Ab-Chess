// AbChess.js
// 2017-03-19
// Copyright (c) 2017 Nimzozo

/*global
    window
*/

/*jslint
    browser, white
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
        black: "b",
        columns: "abcdefgh",
        defaultFEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
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
        animationSpeed: 20,
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
     * Regular expressions.
     */
    var regExp = {};

    /**
     * Convert a FEN string to a position object.
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
     * The Piece class to build chess pieces.
     * @param {string} name The character representing the piece.
     * @param {string} color The character representing the color.
     */
    function Piece(name, color, square) {
        var piece = {
            color: color,
            element: {},
            ghost: {},
            isAnimated: false,
            name: name,
            square: square,
            url: "",
            width: 0
        };

        /**
         * Animate the piece movement.
         */
        piece.animate = function (animation) {
            var speed = piece.square.board.options.animationSpeed;
            var x = animation.translates[0] * animation.iteration * speed;
            var y = animation.translates[1] * animation.iteration * speed;
            piece.ghost.style.transform = "translate(" + x + "px, " + y + "px)";
            if (Math.abs(x) < animation.max && Math.abs(y) < animation.max) {
                animation.iteration += 1;
                requestAnimationFrame(function () {
                    piece.animate(animation);
                });
            } else {
                piece.endAnimation();
            }
        };

        /**
         * Initialize and return the piece.
         */
        piece.create = function () {
            var image = "";
            piece.url = square.board.options.imagesPath + color + name +
                square.board.options.imagesExtension;
            image = "url('" + piece.url + "')";
            piece.element = document.createElement("div");
            piece.element.className = css.squarePiece;
            piece.element.style.backgroundImage = image;
            piece.ghost = document.createElement("div");
            piece.ghost.className = css.pieceGhost;
            piece.ghost.style.backgroundImage = image;
            piece.width = square.board.options.width / 8;
            piece.ghost.style.height = piece.width + "px";
            piece.ghost.style.width = piece.width + "px";
            square.piece = piece;
            square.element.appendChild(piece.element);
            return piece;
        };

        /**
         * Destroy the piece when dropped outside the board.
         */
        piece.destroy = function () {
            document.body.removeChild(piece.ghost);
            piece.square.element.removeChild(piece.element);
            piece.square.piece = null;
        };

        /**
         * Drop the piece on a square.
         */
        piece.drop = function (dropSquare) {
            document.body.removeChild(piece.ghost);
            piece.element.style.opacity = 1;
            piece.move(dropSquare);
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
         * Grab the piece.
         */
        piece.grab = function (e) {
            var left = e.clientX + window.pageXOffset -
                square.board.options.width / 16;
            var top = e.clientY + window.pageYOffset -
                square.board.options.width / 16;
            piece.ghost.style.left = left + "px";
            piece.ghost.style.top = top + "px";
            document.body.appendChild(piece.ghost);
            piece.element.style.opacity = 0;
        };

        /**
         * Move a piece to another square.
         */
        piece.move = function (newSquare) {
            piece.square.piece = null;
            piece.square = newSquare;
            if (newSquare.piece !== null) {
                newSquare.element.removeChild(newSquare.piece.element);
            }
            newSquare.element.appendChild(piece.element);
            newSquare.piece = piece;
        };

        /**
         * Initialize the piece animation.
         */
        piece.startAnimation = function (start, destination) {
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
            piece.ghost.style.left = start[0] + "px";
            piece.ghost.style.top = start[1] + "px";
            document.body.appendChild(piece.ghost);
            piece.element.style.opacity = 0;
            animation.translates = translates;
            animation.iteration = 1;
            animation.max = max;
            piece.isAnimated = true;
            piece.animate(animation);
        };

        return piece.create();
    }

    /**
     * The Square class to build the chessboard squares.
     */
    function Square(column, row, board) {
        var square = {
            board: board,
            column: column,
            element: {},
            name: "",
            piece: null,
            row: row
        };

        /**
         * Initialize and return the square.
         */
        square.create = function () {
            var columnIndex = chess.columns.indexOf(square.column);
            var rowIndex = chess.rows.indexOf(square.row);
            square.element = document.createElement("div");
            square.element.className = (columnIndex % 2 === rowIndex % 2)
                ? css.blackSquare
                : css.whiteSquare;
            square.name = column + row;
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
         * Deselect a square after a drag or after a click.
         */
        square.deselect = function () {
            square.element.classList.remove(css.startSquare);
            board.startSquare = null;
        };

        /**
         * Square click event handler.
         */
        square.onClick = function () {
            if (board.startSquare !== null) {
                if (board.startSquare !== square) {
                    board.startSquare.piece.move(square);
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
            e.preventDefault();
            if (square.piece === null || e.button !== 0 ||
                square.piece.isAnimated) {
                return;
            }
            board.isDragging = true;
            square.element.classList.add(css.overflownSquare);
            square.piece.grab(e);
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
            if (!board.isDragging) {
                return;
            }
            square.element.classList.remove(css.overflownSquare);
            board.startSquare.piece.drop(square);
            board.startSquare.deselect();
            board.isDragging = false;
        };

        /**
         * Select a square during a drag or after a click.
         */
        square.select = function () {
            square.element.classList.add(css.startSquare);
            board.startSquare = square;
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
            var columns = chess.columns.split("");
            var rows = chess.rows.split("");
            if (board.isFlipped) {
                columns = columns.reverse();
            } else {
                rows = rows.reverse();
            }
            board.columnsBorder = document.createElement("div");
            board.columnsBorder.className = css.columnsBorder;
            columns.forEach(function (column) {
                var fragment = document.createElement("div");
                fragment.className = css.columnsBorderFragment;
                fragment.innerText = column;
                board.columnsBorder.appendChild(fragment);
            });
            board.rowsBorder = document.createElement("div");
            board.rowsBorder.className = css.rowsBorder;
            rows.forEach(function (row) {
                var fragment = document.createElement("div");
                fragment.className = css.rowsBorderFragment;
                fragment.innerText = row;
                board.rowsBorder.appendChild(fragment);
            });
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
         * Move a piece.
         */
        board.move = function (start, destination) {
            var endCoordinates = [];
            var endSquare = board.getSquare(destination);
            var startCoordinates = [];
            var startSquare = board.getSquare(start);
            startCoordinates = getCoordinates(startSquare.element);
            endCoordinates = getCoordinates(endSquare.element);
            startSquare.piece.startAnimation(startCoordinates, endCoordinates);
            startSquare.piece.move(endSquare);
        };

        /**
         * Document mousemove event handler.
         */
        board.onMouseMove = function (e) {
            var ghost = {};
            var left = 0;
            var top = 0;
            if (board.isDragging) {
                ghost = board.startSquare.piece.ghost;
                left = e.clientX + window.pageXOffset - options.width / 16;
                top = e.clientY + window.pageYOffset - options.width / 16;
                ghost.style.left = left + "px";
                ghost.style.top = top + "px";
            }
        };

        /**
         * Document mouseup event handler.
         */
        board.onMouseUp = function () {
            var destination = [];
            var start = [];
            if (board.isDragging) {
                // board.startSquare.piece.destroy();
                start = getCoordinates(board.startSquare.piece.ghost);
                destination = getCoordinates(board.startSquare.element);
                board.startSquare.piece.startAnimation(start, destination);
                board.startSquare.deselect();
            }
            board.isDragging = false;
        };

        /**
         * Set a position from a FEN string.
         * @param {string} fen
         */
        board.setPosition = function (fen) {
            var position = fenToObject(fen);
            Object.keys(position).forEach(function (key) {
                var char = position[key];
                var color = (char === char.toUpperCase())
                    ? chess.white
                    : chess.black;
                var square = board.getSquare(key);
                new Piece(char.toLowerCase(), color, square);
            });
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
