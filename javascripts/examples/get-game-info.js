window.addEventListener("load", function () {
    "use strict";

    var accordeon = new Accordeon([1, 3]);
    var example = {
        func: function () {
            var abChess = {};
            var blackName = "";
            var blackParagraph = document.getElementById("black-name");
            var options = {
                clickable: false,
                draggable: false
            };
            var pgnTextarea = document.getElementById("pgn-textarea");
            var whiteName = "";
            var whiteParagraph = document.getElementById("white-name");
            abChess = new AbChess("chessboard", options);
            abChess.draw();
            abChess.setFEN();
            abChess.setPGN(pgnTextarea.value);
            abChess.navigate(abChess.getLastPositionIndex());
            blackName = abChess.getGameInfo("Black");
            whiteName = abChess.getGameInfo("White");
            blackParagraph.innerHTML = blackName;
            whiteParagraph.innerHTML = whiteName;
        },
        html: "<p id=\"black-name\"></p>\n" +
        "<div id=\"chessboard\"></div>\n" +
        "<p id=\"white-name\"></p>"
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