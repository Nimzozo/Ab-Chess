window.addEventListener("load", function () {
    "use strict";

    var abChess = {};
    var firstButton = document.getElementById("firstButton");
    var flipButton = document.getElementById("flipButton");
    var index = 0;
    var lastButton = document.getElementById("lastButton");
    var nextButton = document.getElementById("nextButton");
    var options = {
        animationSpeed: "normal",
        clickable: true,
        draggable: true,
        imagesPath: "images/wikipedia/"
    };
    var pgnButton = document.getElementById("pgn-button");
    var pgnNotation = document.getElementById("pgn-notation");
    var pgnSpanClass = "pgn-move";
    var pgnText = document.getElementById("pgn-text");
    var pgnTextArea = document.getElementById("pgn-textarea");
    var previousButton = document.getElementById("previousButton");
    var resetButton = document.getElementById("resetButton");

    abChess = new AbChess("chessboard", options);
    abChess.draw();
    abChess.setFEN();

    function navigate(index) {

        // Navigate on the desired move index.

        abChess.navigate(index);
    }

    function addPGNMove(pgnMove, moveIndex) {

        // Update the PGN by adding a move.

        var fullmoveNumber = "";
        var moveSpan = {};
        var textNode = {};
        fullmoveNumber = (moveIndex % 2 === 0)
            ? " " + (moveIndex / 2 + 1) + ". "
            : " ";
        textNode = document.createTextNode(fullmoveNumber);
        pgnNotation.appendChild(textNode);
        moveSpan = document.createElement("SPAN");
        moveSpan.className = pgnSpanClass;
        moveSpan.innerText = pgnMove;
        moveSpan.addEventListener("click", function () {
            navigate(moveIndex + 1);
        });
        pgnNotation.appendChild(moveSpan);
    }

    abChess.onMovePlayed(function () {
        var lastIndex = 0;
        var lastMove = "";
        var pgnMoves = abChess.getGameMovesPGN();
        lastIndex = pgnMoves.length - 1;
        lastMove = pgnMoves[lastIndex];
        addPGNMove(lastMove, lastIndex);
        pgnText.innerText = abChess.getFEN(lastIndex + 1);
    });

    pgnButton.addEventListener("click", function () {
        abChess.reset();
        abChess.setPGN(pgnTextArea.value);
        index = abChess.getLastPositionIndex();
        abChess.navigate(index);
    });

    resetButton.addEventListener("click", function () {
        abChess.reset();
    });

    flipButton.addEventListener("click", function () {
        abChess.flip();
    });

    firstButton.addEventListener("click", function () {
        index = 0;
        abChess.navigate(index);
    });

    previousButton.addEventListener("click", function () {
        index -= 1;
        abChess.navigate(index);
    });

    nextButton.addEventListener("click", function () {
        index += 1;
        abChess.navigate(index);
    });

    lastButton.addEventListener("click", function () {
        index = abChess.getLastPositionIndex();
        abChess.navigate(index);
    });

});