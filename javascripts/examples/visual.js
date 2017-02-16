window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([0, 1]);
    var example = {
        func: function () {
            var abChess = {};
            var options = {
                imagesPath: "images/alpha/",
                legalMarksColor: "lightgreen",
                width: 280
            };
            abChess = new AbChess("chessboard", options);
            abChess.draw();
            abChess.setFEN();
        },
        html: "<div id=\"chessboard\"></div>",
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