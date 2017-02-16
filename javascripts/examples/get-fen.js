window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([1, 3]);
    var example = {
        func: function () {
            var abChess = {};
            var fenParagraph = document.getElementById("fenParagraph");
            var movesCount = 0;
            abChess = new AbChess("chessboard");
            abChess.draw();
            abChess.setFEN();
            fenParagraph.innerText = abChess.getFEN(movesCount);
            abChess.onMovePlayed(function () {
                movesCount += 1;
                fenParagraph.innerText = abChess.getFEN(movesCount);
            });
        },
        html: "<p id=\"fenParagraph\"></p>\n<div id=\"chessboard\"></div>"
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