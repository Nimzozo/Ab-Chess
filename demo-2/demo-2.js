window.addEventListener("load", function () {
    "use strict";

    var abChess;
    var options = {
        imagesPath: "../images/wikipedia/"
    };
    var pgnButton;
    var pgnNotation;
    var pgnSpanClass = "pgn-move";
    var pgnText;
    var pgnTextarea;

    abChess = new AbChess("chessboard", options);
    abChess.draw();
    abChess.setFEN();

    pgnNotation = document.getElementById("pgn-notation");

    function selectSpan(index) {

        // Select a span.

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

    function updatePGNText() {

        // Update the text PGN.

        pgnText = document.getElementById("pgn-text");
        pgnText.innerText = abChess.getPGN();
    }

    abChess.onMovePlayed(function () {
        var lastIndex = 0;
        var lastMove = "";
        var pgnMoves = [];
        pgnMoves = abChess.getGameMovesPGN();
        lastIndex = pgnMoves.length - 1;
        lastMove = pgnMoves[lastIndex];
        addPGNMove(lastMove, lastIndex);
        updatePGNText();
    });

    function importPGN(pgn) {

        // Import a PGN.

        var pgnMoves = [];

        function checkSubMoves(move, index, indexes) {
            var startIndex = 0;
            var subMoveIndex = 0;
            var subMoves = [];
            startIndex = indexes[indexes.length - 1];
            subMoveIndex = startIndex + index;
            indexes.push(subMoveIndex);
            subMoves = abChess.getVariationMovesPGN(indexes);
            subMoves.forEach(function (m, i) {
                checkSubMoves(m, i, indexes);
            });
            indexes.pop();
            alert((subMoveIndex) + ". move = " + move);
        }

        abChess.setPGN(pgn);
        pgnMoves = abChess.getGameMovesPGN();
        pgnMoves.forEach(function (mainMove, moveIndex) {
            var indexArray = [];
            var variationMoves = [];
            addPGNMove(mainMove, moveIndex);
            indexArray.push(moveIndex);
            variationMoves = abChess.getVariationMovesPGN(indexArray);
            variationMoves.forEach(function (move, index) {
                checkSubMoves(move, index, indexArray);
            });
        });
        updatePGNText();
    }

    pgnButton = document.getElementById("pgn-button");
    pgnTextarea = document.getElementById("pgn-textarea");
    pgnButton.addEventListener("click", function () {
        var pgn = pgnTextarea.value;
        importPGN(pgn);
    });




});