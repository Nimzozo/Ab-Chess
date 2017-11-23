window.addEventListener("load", function () {
    "use strict";

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
                        "href": "examples/advanced/random-moves.html"
                    },
                    {
                        "name": "PGN reader",
                        "href": "examples/advanced/pgn-reader.html",
                        selected: true
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

            abChess = new AbChess("chessboard", config);
            abChess.setFEN();

            function importPGN(pgn) {
                abChess.setPGN(pgn);
                lastIndex = abChess.getMovesPGN().length;
                clickLastButton();
            }

            Object.keys(games).forEach(function (key, i) {
                var option = document.createElement("OPTION");
                var pgn = games[key].innerText;
                abChess.setPGN(pgn, false);
                option.innerText = abChess.getInfo("White") + " vs " +
                    abChess.getInfo("Black") +
                    " | " + abChess.getInfo("Event") +
                    " (" + abChess.getInfo("Round") + ")";
                option.addEventListener("dblclick", function () {
                    importPGN(pgn);
                });
                gamesSelect.appendChild(option);
            });

            function clickFirstButton() {
                index = 0;
                abChess.view(index);
            }

            function clickLastButton() {
                index = lastIndex;
                abChess.view(index);
            }

            function clickNextButton() {
                if (index >= lastIndex) {
                    return;
                }
                index += 1;
                abChess.view(index);
            }

            function clickPreviousButton() {
                if (index < 1) {
                    return;
                }
                index -= 1;
                abChess.view(index);
            }

            firstButton.addEventListener("click", clickFirstButton);
            lastButton.addEventListener("click", clickLastButton);
            nextButton.addEventListener("click", clickNextButton);
            previousButton.addEventListener("click", clickPreviousButton);
        },
        html: "<select id=\"games-select\" size=\"4\"></select>\n" +
        "<div class=\"commands\">\n" +
        "  <button id=\"first-button\" class=\"commands__button\">|&lt;</button>\n" +
        "  <button id=\"previous-button\" class=\"commands__button\">&lt;</button>\n" +
        "  <button id=\"next-button\" class=\"commands__button\">&gt;</button>\n" +
        "  <button id=\"last-button\" class=\"commands__button\">&gt;|</button>\n" +
        "</div>\n" +
        "<div id=\"chessboard\"></div>"
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
