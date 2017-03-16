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
                        "href": "examples/methods/get-game-info.html",
                        "selected": true
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
            var blackName = "";
            var blackParagraph = document.getElementById("black-name");
            var options = {
                clickable: false,
                draggable: false
            };
            var pgnTextarea = document.getElementById("pgn-textarea");
            var whiteName = "";
            var whiteParagraph = document.getElementById("white-name");
            abChess = new AbChess("chessboard", options);
            abChess.draw();
            abChess.setFEN();
            abChess.setPGN(pgnTextarea.value);
            abChess.navigate(abChess.getLastPositionIndex());
            blackName = abChess.getGameInfo("Black");
            whiteName = abChess.getGameInfo("White");
            blackParagraph.innerText = blackName;
            whiteParagraph.innerText = whiteName;
        },
        html: "<p id=\"black-name\"></p>\n" +
        "<div id=\"chessboard\"></div>\n" +
        "<p id=\"white-name\"></p>"
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
