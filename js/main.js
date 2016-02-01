window.addEventListener('load', function () {
    var abc = new AbChess('abc', 350);
    var fenInput = document.getElementById('fenInput');
    var lastMoveInfo = document.getElementById('lastMoveInfo');
    var moveInput = document.getElementById('moveInput');
    var testList = document.getElementById('testList');
    var turnInfo = document.getElementById('turnInfo');
    var checkInfo = document.getElementById('checkInfo');
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
    fenInput.addEventListener('change', function () {
        abc.fen.set(fenInput.value);
    });
    document.getElementById('abc').addEventListener('drop', function () {
        fenInput.value = abc.fen.get();
    });
    document.getElementById('moveButton').addEventListener('click', function () {
        var inputMove = moveInput.value;
        var isLegal = abc.game.isLegal(inputMove);
        if (isLegal) {
            fenInput.value = abc.game.play(inputMove);
        }
        lastMoveInfo.innerText = (abc.game.getActiveColor() === 'w')
            ? 'White to move'
            : 'Black to move';
        checkInfo.innerText = (abc.game.isInCheck())
            ? 'Check !'
            : '';
        abc.fen.set(fenInput.value);
        tester('testList', isLegal, inputMove + ' is legal.');
    });
});
