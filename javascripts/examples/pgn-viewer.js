window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([2, 2]);
    var example = {
        func: function () {
            var abChess = {};
            var config = {
                clickable: false,
                draggable: false
            };
            var currentIndex = 0;
            var firstButton = document.getElementById("first-button");
            var lastButton = document.getElementById("last-button");
            var lastIndex = 0;
            var moves = [];
            var movesDiv = document.getElementById("moves-div");
            var nextButton = document.getElementById("next-button");
            var pgnImportButton = document.getElementById("pgn-button");
            var pgnTextarea = document.getElementById("pgn-textarea");
            var previousButton = document.getElementById("previous-button");
            abChess = new AbChess("chessboard", config);
            abChess.draw();
            abChess.setFEN();

            function navigate(index) {
                var selectedSpan = document.getElementById("move-span_selected");
                var spans = document.getElementsByClassName("move-span");
                if (index < 0 || index > lastIndex) {
                    return;
                }
                currentIndex = index;
                abChess.navigate(currentIndex);
                if (selectedSpan !== null) {
                    selectedSpan.removeAttribute("id");
                }
                if (index > 0 && spans.length > 0) {
                    spans[index - 1].id = "move-span_selected";
                }
            }
            function addMoveSpan(move, i) {
                var span = document.createElement("SPAN");
                span.className = "move-span";
                span.innerHTML = move;
                span.addEventListener("click", function () {
                    navigate(i + 1);
                });
                movesDiv.appendChild(span);
            }
            function clearSpans() {
                while (movesDiv.hasChildNodes()) {
                    movesDiv.removeChild(movesDiv.lastElementChild);
                }
            }
            function importPGN() {
                var pgn = pgnTextarea.value;
                abChess.setPGN(pgn);
                clearSpans();
                moves = abChess.getGameMovesPGN();
                moves.forEach(addMoveSpan);
                lastIndex = abChess.getLastPositionIndex();
                navigate(lastIndex);
            }
            firstButton.addEventListener("click", function () {
                navigate(0);
            });
            lastButton.addEventListener("click", function () {
                navigate(lastIndex);
            });
            nextButton.addEventListener("click", function () {
                navigate(currentIndex + 1);
            });
            previousButton.addEventListener("click", function () {
                navigate(currentIndex - 1);
            });
            pgnImportButton.addEventListener("click", importPGN);
        },
        html: "<div id=\"chessboard\"></div>\n" +
        "<div id=\"moves-div\"></div>\n" +
        "<button id=\"pgn-button\" class=\"commands__button\">Import</button>\n" +
        "<button id=\"first-button\" class=\"commands__button\">|<</button>\n" +
        "<button id=\"previous-button\" class=\"commands__button\"><</button>\n" +
        "<button id=\"next-button\" class=\"commands__button\">></button>\n" +
        "<button id=\"last-button\" class=\"commands__button\">>|</button>\n" +
        "<textarea id=\"pgn-textarea\" placeholder=\"Paste a PGN here and click Import.\"></textarea>"
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
        navigation.appendChild(accordeon);
        htmlCode.innerHTML = colorize(replaceSpecials(example.html));
        jsCode.innerHTML = colorize(example.func.toString(), true);
        result.innerHTML = example.html;
        example.func();
    });

});