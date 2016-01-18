window.addEventListener('load', function () {
    var abc = abChess('abc', 400);
    var fenInput = document.getElementById('fenInput');
    abc.draw();
    document.getElementById('startButton').addEventListener('click', function () {
        abc.fen.set();
        fenInput.value = abc.fen.get();
    });
    document.getElementById('emptyButton').addEventListener('click', function () {
        abc.fen.set('8/8/8/8/8/8/8/8');
        fenInput.value = abc.fen.get();
    });
    document.getElementById('flipButton').addEventListener('click', function () {
        abc.flip();
    });
    fenInput.addEventListener('change', function (e) {
        abc.fen.set(e.target.value);
    });

});
