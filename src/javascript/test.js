window.addEventListener("load", function () {
    "use strict";

    var abChess = {};
    var firstButton = document.getElementById("firstButton");
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

    function addPGNMove(pgnMove, moveIndex, startVariation, endVariation,
        navIndexes) {

        // Update the PGN by adding a move.

        var fullmoveNumber = 0;
        var moveSpan = {};
        var pgnNotation = document.getElementById("pgn-notation");
        var pgnSpanClass = "pgn-move";
        var textNode = {};
        fullmoveNumber = (moveIndex % 2 === 0)
            ? moveIndex / 2 + 1
            : (moveIndex + 1) / 2;
        textNode = document.createTextNode(" ");
        if (startVariation) {
            textNode.data += "(";
            textNode.data += (moveIndex % 2 === 0)
                ? fullmoveNumber + ". "
                : fullmoveNumber + "... ";
        } else if (moveIndex % 2 === 0) {
            textNode.data += fullmoveNumber + ". ";
        }
        pgnNotation.appendChild(textNode);

        moveSpan = document.createElement("SPAN");
        moveSpan.className = pgnSpanClass;
        moveSpan.innerText = pgnMove;
        if (navIndexes === undefined) {
            navIndexes = moveIndex + 1;
        }
        moveSpan.addEventListener("click", function () {
            navigate(navIndexes);
        });
        pgnNotation.appendChild(moveSpan);
        if (endVariation) {
            textNode = document.createTextNode(")");
            pgnNotation.appendChild(textNode);
        }
    }

    function updatePGNText() {

        // Update the text PGN.

        pgnText.innerText = abChess.getPGN();
    }

    abChess.onMovePlayed(function () {
        var lastIndex = 0;
        var lastMove = "";
        var pgnMoves = abChess.getGameMovesPGN();
        lastIndex = pgnMoves.length - 1;
        lastMove = pgnMoves[lastIndex];
        addPGNMove(lastMove, lastIndex);
        updatePGNText();
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