window.addEventListener("load", function () {
    "use strict";

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
                        "href": "examples/advanced/random-moves.html"
                    },
                    {
                        "name": "PGN reader",
                        "href": "examples/advanced/pgn-reader.html",
                        "selected": true
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
            var firstButton = document.getElementById("first-button");
            var games = document.getElementsByClassName("game");
            var gamesSelect = document.getElementById("games-select");
            var index = 0;
            var lastButton = document.getElementById("last-button");
            var lastIndex = 0;
            var nextButton = document.getElementById("next-button");
            var previousButton = document.getElementById("previous-button");

            function importPGN(pgn) {
                abChess.setPGN(pgn);
                lastIndex = abChess.getLastPositionIndex();
                clickLastButton();
            }
            
            Object.keys(games).forEach(function (key, i) {
                var option = document.createElement("OPTION");
                option.innerHTML = "Game " + (i + 1);
                option.addEventListener("dblclick", function () {
                    importPGN(games[key].innerHTML);
                });
                gamesSelect.appendChild(option);
            });
            abChess = new AbChess("chessboard", config);
            abChess.draw();
            abChess.setFEN();

            function clickFirstButton() {
                index = 0;
                abChess.navigate(index);
            }

            function clickLastButton() {
                index = lastIndex;
                abChess.navigate(index);
            }

            function clickNextButton() {
                if (index >= lastIndex) {
                    return;
                }
                index += 1;
                abChess.navigate(index);
            }

            function clickPreviousButton() {
                if (index < 1) {
                    return;
                }
                index -= 1;
                abChess.navigate(index);
            }

            firstButton.addEventListener("click", clickFirstButton);
            lastButton.addEventListener("click", clickLastButton);
            nextButton.addEventListener("click", clickNextButton);
            previousButton.addEventListener("click", clickPreviousButton);
        },
        html: "<select id=\"games-select\" size=\"4\"></select>\n" +
        "<div id=\"chessboard\"></div>\n" +
        "<div>\n" +
        "  <button id=\"first-button\" class=\"commands__button\">|<</button>\n" +
        "  <button id=\"previous-button\" class=\"commands__button\"><</button>\n" +
        "  <button id=\"next-button\" class=\"commands__button\">></button>\n" +
        "  <button id=\"last-button\" class=\"commands__button\">>|</button>\n" +
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
        new Accordeon("navigation", data);
        htmlCode.innerHTML = colorize(replaceSpecials(example.html));
        jsCode.innerHTML = colorize(example.func.toString(), true);
        result.innerHTML = example.html;
        example.func();
    });

});