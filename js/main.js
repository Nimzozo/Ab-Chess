window.addEventListener('load', function () {

    var abChess = new AbChess('abc');
    var checkInfo = document.getElementById('checkInfo');
    var container = document.getElementById('abc');
    var fenInput = document.getElementById('fenInput');
    var flipButton = document.getElementById('flipButton');
    var lastMoveInfo = document.getElementById('lastMoveInfo');
    var pgnButton = document.getElementById('pgnButton');
    var pgnTextarea = document.getElementById('pgn');
    var turnInfo = document.getElementById('turnInfo');
    function updateInfo() {
        var lastIndex = 0;
        var lastMove = '';
        var moves = [];
        var pgn = abChess.getPGN(true);
     //   pgnDiv.innerText = pgn;
        moves = abChess.getMoves();
        lastIndex = moves.length - 1;
        if (lastIndex >= 0) {
            lastMove = moves[lastIndex];
        }
        fenInput.value = abChess.getFEN();
        checkInfo.innerText = '';
        if (abChess.isInCheck()) {
            if (abChess.isCheckmate()) {
                checkInfo.innerText = 'Checkmate !';
            } else {
                checkInfo.innerText = 'Check !';
            }
        } else if (abChess.isStalemate()) {
                checkInfo.innerText = 'Stalemate !';
        }
        lastMoveInfo.innerText = 'Last move : ' + lastMove;
        turnInfo.innerText = (abChess.getActiveColor() === 'w')
            ? 'White to move.'
            : 'Black to move.';
    }
    flipButton.addEventListener('click', function () {
        abChess.flip();
    });
    container.addEventListener('click', function () {
        requestAnimationFrame(updateInfo);
    });
    container.addEventListener('dragend', function () {
        requestAnimationFrame(updateInfo);
    });
    pgnButton.addEventListener('click', function () {
        var pgn = pgnTextarea.value;
        abChess.isValidPGN(pgn);
    });
    abChess.draw();
    abChess.setFEN();
    requestAnimationFrame(updateInfo);
});
