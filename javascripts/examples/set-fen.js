window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([1, 2]);
    var example = {
        func: function () {
            var abChess = {};
            var fenInput = document.getElementById("fenInput");
            abChess = new AbChess("chessboard");
            abChess.draw();
            abChess.setFEN();
            fenInput.addEventListener("change", function () {
                abChess.setFEN(fenInput.value);
            });
        },
        html: "<div id=\"chessboard\"></div>\n<div>\n  <input type=\"text\" placeholder=\"Paste a FEN string here.\" id=\"fenInput\" size=\"60\">\n</div>"
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