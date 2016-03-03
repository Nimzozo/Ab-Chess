window.addEventListener("load", function () {
    var abChess;
    abChess = new AbChess("chessboard");
    abChess.draw();
    abChess.setFEN();
});
