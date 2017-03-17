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
            var fenCode = document.getElementById("fenCode");
            var pgnCode = document.getElementById("pgnCode");
            var promotions = ["b", "n", "q", "r"];

            abChess = new AbChess("chessboard", config);
            abChess.draw();
            abChess.setFEN();
            abChess.setGameInfo("Event", "Ab-Chess random game");
            abChess.setGameInfo("White", "Math.random()");
            abChess.setGameInfo("Black", "Math.random()");

            function chooseRandom(array) {
                var random = Math.floor(Math.random() * array.length);
                return array[random];
            }

            function playRandomMove(index) {
                var legalMoves = [];
                var randomMove = "";
                var randomPromotion = "";
                legalMoves = abChess.getLegalMoves(index);
                randomMove = chooseRandom(legalMoves);
                randomPromotion = chooseRandom(promotions);
                abChess.play(randomMove, randomPromotion);
                index += 1;
                fenCode.innerText = abChess.getFEN(index);
                pgnCode.innerText = abChess.getPGN();
                if (!abChess.isInsufficientMaterialDraw(index) &&
                    !abChess.is50MovesDraw(index) &&
                    !abChess.isCheckmate(index) &&
                    !abChess.isStalemate(index)) {
                    setTimeout(function () {
                        var i = index;
                        playRandomMove(i);
                    }, 200);
                }
            }

            setTimeout(function () {
                playRandomMove(0);
            }, 1000);
        },
        html: "<div id=\"chessboard\"></div>\n" +
        "<code id=\"fenCode\" class=\"code\"></code>\n" +
        "<code id=\"pgnCode\" class=\"code\"></code>"
    };
    var htmlCode = document.getElementById("html-code");
    var jsCode = document.getElementById("js-code");
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
