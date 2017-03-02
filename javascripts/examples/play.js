window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([1, 6]);
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
        html: "<div id=\"chessboard\"></div>\n<div>\n  <input type=\"button\" value=\"Queen's gambit\" id=\"qGambitButton\" class=\"commands__button\">\n  <input type=\"button\" value=\"Sicilian Najdorf\" id=\"sicilianButton\" class=\"commands__button\">\n</div>"
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