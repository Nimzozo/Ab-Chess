window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([1, 0]);
    var example = {
        func: function () {
            var abChess = {};
            var flipButton = document.getElementById("flipButton");
            abChess = new AbChess("chessboard");
            abChess.draw();
            abChess.setFEN();
            flipButton.addEventListener("click", abChess.flip);
        },
        html: "<div id=\"chessboard\"></div>\n" +
        "<div>\n" +
        "  <input type=\"button\" value=\"Flip\" id=\"flipButton\" class=\"commands__button\">\n" +
        "</div>"
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