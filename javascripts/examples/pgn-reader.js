window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([2, 1]);
    var example = {
        func: function () {
            var abChess = {};
            var config = {
                clickable: false,
                draggable: false
            };
            var firstButton = document.getElementById("first-button");
            var index = 0;
            var lastButton = document.getElementById("last-button");
            var lastIndex = 0;
            var nextButton = document.getElementById("next-button");
            var pgnImportButton = document.getElementById("pgn-button");
            var pgnTextarea = document.getElementById("pgn-textarea");
            var previousButton = document.getElementById("previous-button");
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
            function importPGN() {
                var pgn = pgnTextarea.value;
                abChess.setPGN(pgn);
                lastIndex = abChess.getLastPositionIndex();
                clickLastButton();
            }
            firstButton.addEventListener("click", clickFirstButton);
            lastButton.addEventListener("click", clickLastButton);
            nextButton.addEventListener("click", clickNextButton);
            previousButton.addEventListener("click", clickPreviousButton);
            pgnImportButton.addEventListener("click", importPGN);
        },
        html: "<div id=\"chessboard\"></div>\n" +
        "<div>\n" +
        "  <button id=\"pgn-button\" class=\"commands__button\">Import</button>\n" +
        "  <button id=\"first-button\" class=\"commands__button\">|<</button>\n" +
        "  <button id=\"previous-button\" class=\"commands__button\"><</button>\n" +
        "  <button id=\"next-button\" class=\"commands__button\">></button>\n" +
        "  <button id=\"last-button\" class=\"commands__button\">>|</button>\n" +
        "</div>\n" +
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