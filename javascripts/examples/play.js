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
                        "href": "examples/methods/play.html",
                        "selected": true
                    }
                ],
                "open": true
            },
            {
                "name": "Advanced",
                "items": [
                    {
                        "name": "Random moves",
                        "href": "examples/advanced/random-moves.html"
                    },
                    {
                        "name": "PGN reader",
                        "href": "examples/advanced/pgn-reader.html"
                    },
                    {
                        "name": "PGN viewer",
                        "href": "examples/advanced/pgn-viewer.html"
                    }
                ]
            }
        ]
    };
    var example = {
        func: function () {
            var abChess = {};
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
                abChess.play("d7-d6");
                abChess.play("d2-d4");
                abChess.play("c5-d4");
                abChess.play("f3-d4");
                abChess.play("g8-f6");
                abChess.play("b1-c3");
                abChess.play("a7-a6");
            });
        },
        html: "<div id=\"chessboard\"></div>\n" +
        "<div>\n" +
        "  <input type=\"button\" value=\"Queen's gambit\" id=\"qGambitButton\" class=\"commands__button\">\n" +
        "  <input type=\"button\" value=\"Sicilian Najdorf\" id=\"sicilianButton\" class=\"commands__button\">\n" +
        "</div>"
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