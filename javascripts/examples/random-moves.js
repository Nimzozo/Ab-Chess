window.addEventListener("load", function () {
    "use strict";

    var accordeon = {};
    var data = {
        "items": [
            {
                "name": "Options",
                "items": [
                    {
                        "name": "Animated",
                        "href": "examples/options/animated.html"
                    },
                    {
                        "name": "Animation speed",
                        "href": "examples/options/animation-speed.html"
                    },
                    {
                        "name": "Clickable",
                        "href": "examples/options/clickable.html"
                    },
                    {
                        "name": "Coordinates",
                        "href": "examples/options/coordinates.html"
                    },
                    {
                        "name": "Draggable",
                        "href": "examples/options/draggable.html"
                    },
                    {
                        "name": "Images",
                        "href": "examples/options/images-path.html"
                    },
                    {
                        "name": "Legal marks color",
                        "href": "examples/options/legal-marks-color.html"
                    },
                    {
                        "name": "Mark check",
                        "href": "examples/options/mark-check.html"
                    },
                    {
                        "name": "Mark last move",
                        "href": "examples/options/mark-last-move.html"
                    },
                    {
                        "name": "Mark legal squares",
                        "href": "examples/options/mark-legal-squares.html"
                    },
                    {
                        "name": "Mark overflown square",
                        "href": "examples/options/mark-overflown-square.html"
                    },
                    {
                        "name": "Mark start square",
                        "href": "examples/options/mark-start-square.html"
                    },
                    {
                        "name": "Reversed",
                        "href": "examples/options/reversed.html"
                    },
                    {
                        "name": "Width",
                        "href": "examples/options/width.html"
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
                        "name": "Get info",
                        "href": "examples/methods/get-info.html"
                    },
                    {
                        "name": "Play",
                        "href": "examples/methods/play.html"
                    },
                    {
                        "name": "Set FEN",
                        "href": "examples/methods/set-fen.html"
                    },
                    {
                        "name": "Set PGN",
                        "href": "examples/methods/set-pgn.html"
                    }
                ]
            },
            {
                "name": "Advanced",
                "items": [
                    {
                        "name": "Random moves",
                        "href": "examples/advanced/random-moves.html",
                        selected: true
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
            abChess.setFEN();
            abChess.setInfo("Event", "Ab-Chess random game");
            abChess.setInfo("Site", "https://nimzozo.github.io/Ab-Chess/");
            abChess.setInfo("White", "Math.random()");
            abChess.setInfo("Black", "Math.random()");

            function chooseRandom(array) {
                var random = Math.floor(Math.random() * array.length);
                return array[random];
            }

            function playRandomMove(index) {
                var legalMoves = [];
                var randomMove = {};
                var randomPromotion = "";
                legalMoves = abChess.getLegalMoves(index);
                randomMove = chooseRandom(legalMoves);
                randomPromotion = chooseRandom(promotions);
                abChess.play(randomMove.start, randomMove.end, randomPromotion);
                index += 1;
                fenCode.innerText = abChess.getFEN(index);
                pgnCode.innerText = abChess.getPGN();
                if (abChess.isInsufficientMaterial(index) ||
                    abChess.is50Moves(index) || abChess.isCheckmate(index) ||
                    abChess.isStalemate(index)) {
                    return;
                }
                setTimeout(function () {
                    var i = index;
                    playRandomMove(i);
                }, 200);
            }

            setTimeout(function () {
                playRandomMove(0);
            }, 1000);
        },
        html: "<code id=\"fenCode\" class=\"code\"></code>\n" +
            "<div id=\"chessboard\"></div>\n" +
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