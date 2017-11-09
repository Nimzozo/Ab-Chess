window.addEventListener("load", function () {
    "use strict";

    var options = {
        clickable: true,
        draggable: true,
        imagesPath: "../src/images/wikipedia/",
        markLegalSquares: true
    };
    var abc = new AbChess("chessboard", options);
    abc.board.draw();
    abc.board.setFEN();

});