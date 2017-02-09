window.addEventListener("load", function () {
    "use strict";

    var interval = 0;

    function loadExample(exampleNumber) {
        var description = document.getElementById("description");
        var example = {};

        var example11 = {
            description: "Build a chessboard with the default options.",
            func: function () {
                var abChess;
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();
            },
            html: "<div id=\"chessboard\"></div>",
            title: "Default options"
        };

        var example12 = {
            description: "Build a chessboard with some visual changes.",
            func: function () {
                var abChess;
                var options = {
                    imagesPath: "images/simple/",
                    legalMarksColor: "red",
                    width: 240
                };
                abChess = new AbChess("chessboard", options);
                abChess.draw();
                abChess.setFEN();
            },
            html: "<div id=\"chessboard\"></div>",
            title: "Visual changes"
        };

        var example13 = {
            description: "Build a chessboard with the pieces locked.",
            func: function () {
                var abChess;
                var options = {
                    clickable: false,
                    draggable: false
                };
                abChess = new AbChess("chessboard", options);
                abChess.draw();
                abChess.setFEN();
            },
            html: "<div id=\"chessboard\"></div>",
            title: "Locked pieces"
        };

        var example14 = {
            description: "Build a flipped chessboard without the notation border.",
            func: function () {
                var abChess;
                var options = {
                    flipped: true,
                    notationBorder: false
                };
                abChess = new AbChess("chessboard", options);
                abChess.draw();
                abChess.setFEN();
            },
            html: "<div id=\"chessboard\"></div>",
            title: "Orientation / Border"
        };

        var example15 = {
            description: "Build a chessboard with disabled highlighting.",
            func: function () {
                var abChess;
                var options = {
                    markKingInCheck: false,
                    markLastMove: false,
                    markLegalSquares: false,
                    markOverflownSquare: false,
                    markSelectedSquare: false
                };
                abChess = new AbChess("chessboard", options);
                abChess.draw();
                abChess.setFEN();
            },
            html: "<div id=\"chessboard\"></div>",
            title: "Disable highlighting"
        };

        var example21 = {
            description: "Build a chessboard with a flip command button.",
            func: function () {
                var abChess;
                var flipButton = document.getElementById("flipButton");
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();
                flipButton.addEventListener("click", abChess.flip);
            },
            html: "<div id=\"chessboard\"></div>\n<div>\n  <input type=\"button\" value=\"Flip\" id=\"flipButton\">\n</div>",
            title: "Flip"
        };

        var example22 = {
            description: "Build a chessboard with two buttons. The buttons play a 3-moves serie of two different chess openings.",
            func: function () {
                var abChess;
                var qGambitButton = document.getElementById("qGambitButton");
                var sicilianButton = document.getElementById("sicilianButton");
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();
                qGambitButton.addEventListener("click", function () {
                    abChess.reset();
                    abChess.play("d2-d4");
                    abChess.play("d7-d5");
                    abChess.play("c2-c4");
                });
                sicilianButton.addEventListener("click", function () {
                    abChess.reset();
                    abChess.play("e2-e4");
                    abChess.play("c7-c5");
                    abChess.play("g1-f3");
                });
            },
            html: "<div id=\"chessboard\"></div>\n<div>\n  <input type=\"button\" value=\"Play queen's gambit\" id=\"qGambitButton\">\n  <input type=\"button\" value=\"Play sicilian\" id=\"sicilianButton\">\n</div>",
            title: "Play / Reset"
        };

        var example23 = {
            description: "Build a chessboard with an input field. Set a position on the board by pasting a FEN string.",
            func: function () {
                var abChess;
                var fenInput = document.getElementById("fenInput");
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();
                fenInput.addEventListener("change", function () {
                    abChess.setFEN(fenInput.value);
                });
            },
            html: "<div id=\"chessboard\"></div>\n<div>\n  <input type=\"text\" placeholder=\"Paste a FEN string here.\" id=\"fenInput\" size=\"60\">\n</div>",
            title: "Set FEN"
        };

        var example24 = {
            description: "Build a chessboard with an input field. When a move is played, get the current FEN string and display it.",
            func: function () {
                var abChess;
                var fenParagraph = document.getElementById("fenParagraph");
                var movesCount = 0;
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();
                fenParagraph.innerText = abChess.getFEN(movesCount);
                abChess.onMovePlayed(function () {
                    movesCount += 1;
                    fenParagraph.innerText = abChess.getFEN(movesCount);
                });
            },
            html: "<p id=\"fenParagraph\"></p>\n<div id=\"chessboard\"></div>",
            title: "Get FEN / On Move Played"
        };

        var example31 = {
            description: "Build a chessboard. Each time a move is played, display the active color.",
            func: function () {
                var abChess;
                var black = "Black to move.";
                var colorParagraph = document.getElementById("colorParagraph");
                var movesCount = 0;
                var white = "White to move.";
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();
                abChess.onMovePlayed(function () {
                    movesCount += 1;
                    colorParagraph.innerText = (abChess.getActiveColor(movesCount) === "w")
                        ? white
                        : black;
                });
            },
            html: "<p id=\"colorParagraph\">White to move.</p>\n<div id=\"chessboard\"></div>",
            title: "Get Active Color"
        };

        var example32 = {
            description: "Build a chessboard with a select input. Each time a move is played, get and display the legal moves in the position.",
            func: function () {
                var abChess;
                var countLabel = document.getElementById("countLabel");
                var movesCount = 0;
                var moveSelect = document.getElementById("moveSelect");
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();

                function update() {
                    var moves = [];
                    while (moveSelect.hasChildNodes()) {
                        moveSelect.removeChild(moveSelect.lastChild);
                    }
                    moves = abChess.getLegalMoves(movesCount, true);
                    countLabel.innerText = moves.length + " legal moves :";
                    moves.forEach(function (move) {
                        var option = document.createElement("OPTION");
                        option.innerText = move;
                        moveSelect.appendChild(option);
                    });
                }

                abChess.onMovePlayed(function () {
                    movesCount += 1;
                    update();
                });

                update();
            },
            html: "<div id=\"chessboard\"></div>\n<div>\n  <label id=\"countLabel\" for=\"moveSelect\"></label>\n  <select id=\"moveSelect\"></select>\n</div>",
            title: "Get Legal Moves"
        };

        var example33 = {
            description: "Build a chessboard with two buttons [Previous] and [Next]. Play some moves, then the buttons allow to navigate through the moves.",
            func: function () {
                var abChess;
                var movesCount = 0;
                var navigateIndex = 0;
                var nextInput = document.getElementById("nextInput");
                var previousInput = document.getElementById("previousInput");
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();
                abChess.onMovePlayed(function () {
                    movesCount += 1;
                    navigateIndex = movesCount;
                });
                nextInput.addEventListener("click", function () {
                    if (navigateIndex < movesCount) {
                        navigateIndex += 1;
                        abChess.navigate(navigateIndex);
                    }
                });
                previousInput.addEventListener("click", function () {
                    if (navigateIndex > 0) {
                        navigateIndex -= 1;
                        abChess.navigate(navigateIndex);
                    }
                });
            },
            html: "<div id=\"chessboard\"></div>\n<div>\n  <input type=\"button\" id=\"previousInput\" value=\"Previous\">\n  <input type=\"button\" id=\"nextInput\" value=\"Next\">\n</div>",
            title: "Navigate"
        };

        var example34 = {
            description: "Build a chessboard. Each time a move is played, display the current PGN string.",
            func: function () {
                var abChess;
                var pgnParagraph = document.getElementById("pgnParagraph");
                abChess = new AbChess("chessboard");
                abChess.draw();
                abChess.setFEN();
                abChess.onMovePlayed(function () {
                    pgnParagraph.innerText = abChess.getPGN();
                });
            },
            html: "<div id=\"chessboard\"></div>\n<div>\n  <p id=\"pgnParagraph\"></p>\n</div>",
            title: "Get PGN"
        };

        var example35 = {
            description: "Build a chessboard with a textarea and two buttons. A game can be loaded by pasting a PGN in the textarea. The buttons then allow to navigate through the loaded game.",
            func: function () {
                var abChess;
                var config = {
                    clickable: false,
                    draggable: false
                };
                var moves = [];
                var movesCount = 0;
                var navigateIndex = 0;
                var nextInput = document.getElementById("nextInput");
                var pgnInput = document.getElementById("pgnInput");
                var previousInput = document.getElementById("previousInput");
                abChess = new AbChess("chessboard", config);
                abChess.draw();
                abChess.setFEN();

                pgnInput.addEventListener("change", function () {
                    abChess.reset();
                    abChess.setPGN(pgnInput.value);
                    moves = abChess.getGameMoves();
                    movesCount = moves.length;
                });

                nextInput.addEventListener("click", function () {
                    if (navigateIndex < movesCount) {
                        navigateIndex += 1;
                        abChess.navigate(navigateIndex);
                    }
                });

                previousInput.addEventListener("click", function () {
                    if (navigateIndex > 0) {
                        navigateIndex -= 1;
                        abChess.navigate(navigateIndex);
                    }
                });
            },
            html: "<div id=\"chessboard\"></div>\n<div>\n  <input type=\"button\" id=\"previousInput\" value=\"Previous\">\n  <input type=\"button\" id=\"nextInput\" value=\"Next\">\n</div>\n<textarea id=\"pgnInput\" cols=\"32\"rows=\"4\" placeholder=\"Paste a PGN string here.\"></textarea>",
            title: "Set PGN"
        };

        var example36 = {
            description: "Build a chessboard and play randomly chosen legal moves.",
            func: function () {
                var abChess;
                var config = {
                    clickable: false,
                    draggable: false
                };
                var fenParagraph = document.getElementById("fenParagraph");
                var movesCount = 0;
                var pgnParagraph = document.getElementById("pgnParagraph");
                var promotions = ["b", "n", "q", "r"];
                abChess = new AbChess("chessboard", config);
                abChess.draw();
                abChess.setFEN();

                function chooseRandom(array) {
                    var random = 0;
                    random = Math.floor(Math.random() * array.length);
                    return array[random];
                }

                function playRandomMove(index) {
                    var legalMoves = [];
                    var randomMove = "";
                    var randomPromotion = "";
                    legalMoves = abChess.getLegalMoves(index);
                    if (legalMoves.length === 0) {
                        clearInterval(interval);
                        alert("game over");
                        return;
                    }
                    if (abChess.isInsufficientMaterialDraw(index)) {
                        clearInterval(interval);
                        alert("draw : insufficient material");
                        return;
                    }
                    if (abChess.is50MovesDraw(index)) {
                        clearInterval(interval);
                        alert("draw : 50 moves");
                        return;
                    }
                    randomMove = chooseRandom(legalMoves);
                    randomPromotion = chooseRandom(promotions);
                    abChess.play(randomMove, randomPromotion);
                    fenParagraph.innerText = abChess.getFEN(index + 1);
                    pgnParagraph.innerText = abChess.getPGN();
                }

                interval = setInterval(function () {
                    playRandomMove(movesCount);
                    movesCount += 1;
                }, 500);
            },
            html: "<p id=\"fenParagraph\"></p>\n<div id=\"chessboard\"></div>\n<p id=\"pgnParagraph\"></p>",
            title: "Random moves"
        };

        var htmlCode = document.getElementById("html-code");
        var jsCode = document.getElementById("js-code");
        var result = document.getElementById("result");
        var title = document.getElementById("title");

        switch (exampleNumber) {
            case 11:
                example = example11;
                break;
            case 12:
                example = example12;
                break;
            case 13:
                example = example13;
                break;
            case 14:
                example = example14;
                break;
            case 15:
                example = example15;
                break;
            case 21:
                example = example21;
                break;
            case 22:
                example = example22;
                break;
            case 23:
                example = example23;
                break;
            case 24:
                example = example24;
                break;
            case 31:
                example = example31;
                break;
            case 32:
                example = example32;
                break;
            case 33:
                example = example33;
                break;
            case 34:
                example = example34;
                break;
            case 35:
                example = example35;
                break;
            case 36:
                example = example36;
                break;
            default:
                throw new Error("Example does not exist.");
        }

        function replaceSpecials(str) {
            var specials = {
                "&lt;": /</g,
                "&gt;": />/g
            };
            Object.keys(specials).forEach(function (key) {
                var special = specials[key];
                str = str.replace(special, key);
            });
            return str;
        }

        title.innerHTML = example.title;
        description.innerHTML = example.description;
        htmlCode.innerHTML = colorize(replaceSpecials(example.html));
        jsCode.innerHTML = colorize(example.func.toString(), true);
        result.innerHTML = example.html;
        example.func();
    }

    function getExampleNumber() {
        var hash = window.location.hash;
        if (hash === "") {
            return 11;
        } else {
            return Number(hash.substr(1));
        }
    }

    window.addEventListener("hashchange", function () {
        var exampleNumber = getExampleNumber();
        if (interval !== 0) {
            clearInterval(interval);
        }
        loadExample(exampleNumber);
    });

    loadExample(getExampleNumber());
});

