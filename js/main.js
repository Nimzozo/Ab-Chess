window.addEventListener('load', function () {
    var config = {};
    var abc = new AbChess('abc', config);
    var fenInput = document.getElementById('fenInput');
    var lastMoveInfo = document.getElementById('lastMoveInfo');
    var moveInput = document.getElementById('moveInput');
    var turnInfo = document.getElementById('turnInfo');
    var checkInfo = document.getElementById('checkInfo');
    abc.board.draw();
    abc.board.fen.set();
    updateInfo();
    document.getElementById('startButton').addEventListener('click', function () {
        abc.board.fen.set();
        fenInput.value = abc.board.fen.get();
    });
    document.getElementById('emptyButton').addEventListener('click', function () {
        abc.board.fen.set('8/8/8/8/8/8/8/8');
        fenInput.value = abc.board.fen.get();
    });
    document.getElementById('flipButton').addEventListener('click', function () {
        abc.board.flip();
    });
    document.getElementById('abc').addEventListener('drop', function () {
        fenInput.value = abc.game.getFEN();
        updateInfo();
    });
    document.getElementById('moveButton').addEventListener('click', function () {
        var inputMove = moveInput.value;
        var isLegal = abc.game.isLegal(inputMove);
        if (isLegal) {
            fenInput.value = abc.game.play(inputMove);
            updateInfo();
        }
    });
    function updateInfo() {
        turnInfo.innerText = (abc.game.getActiveColor() === 'w')
            ? 'White to move.'
            : 'Black to move.';
        checkInfo.innerText = (abc.game.isInCheck())
            ? 'Check !'
            : '';
    }
});
