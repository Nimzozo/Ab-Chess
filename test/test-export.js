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

    var fenSpan = document.getElementById("fen-span");
    var pgnParagraph = document.getElementById("pgn-paragraph");

    abc.board.onMovePlayed(function () {
        fenSpan.innerText = abc.board.getFEN();
        pgnParagraph.innerText = abc.game.getPGN();
    });

});