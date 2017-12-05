window.addEventListener("load", function () {
    "use strict";

    var abChess = {};
    var index = 0;
    var lastIndex = 0;
    var options = {
        clickable: false,
        draggable: false,
        width: 480
    }
    var gameCode = document.getElementById("game-code");
    var pgn = gameCode.innerText;
    abChess = new AbChess("chessboard", options)
    abChess.setPGN(pgn);
    lastIndex = abChess.getMovesPGN().length;

    (function viewNext() {
        if (index > lastIndex) {
            return;
        }
        abChess.view(index);
        index += 1;
        requestAnimationFrame(function () {
            setTimeout(viewNext, 2000);
        });
    }())
});
