window.addEventListener("load", function () {
    "use strict";

    var accordeon = {};
    var data = {
        "items": [
            {
                "name": "Basics",
                "items": [
                    {
                        "name": "Default options",
                        "href": "examples/basics/default.html"
                    },
                    {
                        "name": "Visual changes",
                        "href": "examples/basics/visual.html"
                    },
                    {
                        "name": "Locked pieces",
                        "href": "examples/basics/locked.html"
                    },
                    {
                        "name": "Orientation",
                        "href": "examples/basics/orientation.html"
                    },
                    {
                        "name": "Squares highlighting",
                        "href": "examples/basics/highlighting.html"
                    }
                ]
            },
            {
                "name": "Methods",
                "items": [
                    {
                        "name": "Flip",
                        "href": "examples/methods/flip.html"
                    },
                    {
                        "name": "Get active color",
                        "href": "examples/methods/get-active-color.html"
                    },
                    {
                        "name": "Get FEN",
                        "href": "examples/methods/get-fen.html"
                    },
                    {
                        "name": "Get game info",
                        "href": "examples/methods/get-game-info.html"
                    },
                    {
                        "name": "Set FEN",
                        "href": "examples/methods/set-fen.html"
                    },
                    {
                        "name": "Set PGN",
                        "href": "examples/methods/set-pgn.html"
                    },
                    {
                        "name": "Play",
                        "href": "examples/methods/play.html"
                    }
                ]
            },
            {
                "name": "Advanced",
                "items": [
                    {
                        "name": "Random moves",
                        "href": "examples/advanced/random-moves.html",
                        "selected": true
                    },
                    {
                        "name": "PGN reader",
                        "href": "examples/advanced/pgn-reader.html"
                    },
                    {
                        "name": "PGN viewer",
                        "href": "examples/advanced/pgn-viewer.html"
                    }
                ],
                "open": true
            }
        ]
    };
    var example = {
        func: function () {
            var abChess = {};
            var config = {
                clickable: false,
                draggable: false
            };
            var fenParagraph = document.getElementById("fenParagraph");
            var interval = 0;
            var movesCount = 0;
            var pgnParagraph = document.getElementById("pgnParagraph");
            var promotions = ["b", "n", "q", "r"];

            abChess = new AbChess("chessboard", config);
            abChess.draw();
            abChess.setFEN();
            abChess.setGameInfo("White", "Math.random()");
            abChess.setGameInfo("Black", "Math.random()");

            function chooseRandom(array) {
                var random = 0;
                random = Math.floor(Math.random() * array.length);
                return array[random];
            }

            function playRandomMove(index, interval) {
                var legalMoves = [];
                var randomMove = "";
                var randomPromotion = "";
                legalMoves = abChess.getLegalMoves(index);
                randomMove = chooseRandom(legalMoves);
                randomPromotion = chooseRandom(promotions);
                abChess.play(randomMove, randomPromotion);
                requestAnimationFrame(function () {
                    fenParagraph.innerText = abChess.getFEN(index + 1);
                    pgnParagraph.innerText = abChess.getPGN();
                });
                if (abChess.isInsufficientMaterialDraw(index + 1) ||
                    abChess.is50MovesDraw(index + 1) ||
                    abChess.isCheckmate(index + 1) ||
                    abChess.isStalemate(index + 1)) {
                    clearInterval(interval);
                    return;
                }
            }

            interval = setInterval(function () {
                playRandomMove(movesCount, interval);
                movesCount += 1;
            }, 500);
        },
        html: "<div id=\"chessboard\"></div>\n<p id=\"fenParagraph\"></p>\n<p id=\"pgnParagraph\"></p>"
    };
    var htmlCode = document.getElementById("html-code");
    var jsCode = document.getElementById("js-code");
    var navigation = document.getElementById("navigation_fixed");
    var result = document.getElementById("result");

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
        accordeon = new Accordeon("navigation", data);
        htmlCode.innerHTML = colorize(replaceSpecials(example.html));
        jsCode.innerHTML = colorize(example.func.toString(), true);
        result.innerHTML = example.html;
        example.func();
    });

});