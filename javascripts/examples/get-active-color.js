window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([1, 1]);
    var example = {
        func: function () {
            var abChess = {};
            var black = "Black to move.";
            var colorParagraph = document.getElementById("colorParagraph");
            var movesCount = 0;
            var white = "White to move.";
            abChess = new AbChess("chessboard");
            abChess.draw();
            abChess.setFEN();
            abChess.onMovePlayed(function () {
                movesCount += 1;
                colorParagraph.innerText = (abChess.getActiveColor(movesCount) === "w")
                    ? white
                    : black;
            });
        },
        html: "<p id=\"colorParagraph\">White to move.</p>\n<div id=\"chessboard\"></div>"
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