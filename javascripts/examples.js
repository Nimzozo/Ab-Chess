window.addEventListener("load", function () {
    "use strict";

    var interval = 0;

    function loadExample(exampleNumber) {
        var description = document.getElementById("description");
        var example = {};

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

        requestAnimationFrame(function () {
            var htmlCode = document.getElementById("html-code");
            var jsCode = document.getElementById("js-code");
            var result = document.getElementById("result");
            var title = document.getElementById("title");
            title.innerHTML = example.title;
            description.innerHTML = example.description;
            htmlCode.innerHTML = colorize(replaceSpecials(example.html));
            jsCode.innerHTML = colorize(example.func.toString(), true);
            result.innerHTML = example.html;
            example.func();
        });
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

