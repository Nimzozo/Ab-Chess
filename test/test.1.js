window.addEventListener("load", function () {
    "use strict";

    var options = {
        clickable: true,
        draggable: true,
        imagesPath: "../src/images/wikipedia/"
    };
    var abc = new AbChess("chessboard", options);
    abc.board.draw();
    abc.board.setFEN("5r2/8/8/7p/2n5/3p4/8/r2K2k1 w - - 2 140");
    var abc2 = new AbChess("chessboard2", options);
    abc2.board.draw();
    abc2.board.setFEN();
    setTimeout(function () {
        abc2.board.move("g1", "f3");
    }, 2000);
});
