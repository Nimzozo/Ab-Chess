window.addEventListener('load', function () {
    var test = abChess('abc', 400);
    test.draw();
    test.fen.set();

    var flipHandler = function () {
        test.flip();
    };
    document.getElementById('flipButton').addEventListener('click', flipHandler);

});
