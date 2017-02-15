window.addEventListener("load", function () {
    "use strict";

    var abChess = new AbChess("chessboard");
    abChess.draw();
    abChess.setFEN();
});
