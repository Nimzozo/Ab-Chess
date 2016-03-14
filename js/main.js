window.addEventListener("load", function () {
    "use strict";

    var abChess;
    abChess = new AbChess("chessboard");
    abChess.draw();
    abChess.setFEN();
});
