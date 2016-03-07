window.addEventListener("load", function () {
    "use strict";

    var abChess;
    var options = {
        imagesPath: "../images/wikipedia/"
    };
    var pgnNotation;
    var pgnSpanClass = "pgn-move";

    abChess = new AbChess("chessboard", options);
    abChess.draw();
    abChess.setFEN();

    pgnNotation = document.getElementById("pgn-notation");

    function selectSpan(index) {

        //

        var selectedSpan;
        var selectedSpanClass = "pgn-move_selected";
        var spans;
        selectedSpan = document.getElementById(selectedSpanClass);
        if (selectedSpan !== null) {
            selectedSpan.removeAttribute("ID");
        }
        spans = document.getElementsByClassName(pgnSpanClass);
        spans[index].id = selectedSpanClass;
    }

    function navigate(index) {

        // Navigate on the desired move index.

        selectSpan(index);
        abChess.navigate(index + 1);
    }

    function addPGNMove(pgnMove, moveIndex) {

        // Update the PGN by adding a move.

        var fullmoveNumber = 0;
        var moveSpan;
        var textNode;

        textNode = document.createTextNode(" ");
        if (moveIndex % 2 === 0) {
            fullmoveNumber = moveIndex / 2 + 1;
            textNode.data += fullmoveNumber + ". ";
        }
        pgnNotation.appendChild(textNode);

        moveSpan = document.createElement("SPAN");
        moveSpan.className = pgnSpanClass;
        moveSpan.innerText = pgnMove;
        moveSpan.addEventListener("click", function () {
            navigate(moveIndex);
        });
        pgnNotation.appendChild(moveSpan);

        selectSpan(moveIndex);
    }

    abChess.onMovePlayed(function () {
        var lastIndex = 0;
        var lastMove = "";
        var pgnMoves = [];
        pgnMoves = abChess.getGameMovesPGN();
        lastIndex = pgnMoves.length - 1;
        lastMove = pgnMoves[lastIndex];
        addPGNMove(lastMove, lastIndex);

    });


});