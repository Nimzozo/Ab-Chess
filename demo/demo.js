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

       // selectSpan(index);
        abChess.navigate(index);
    }

    function addPGNMove(pgnMove, moveIndex, startVariation, endVariation, navIndexes) {

        // Update the PGN by adding a move.

        var fullmoveNumber = 0;
        var moveSpan;
        var textNode;
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
        //selectSpan(moveIndex);
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
                var isEnd = (i === subMoves.length - 1);
                var isStart = (i === 0);
                addPGNMove(m, subMoveIndex + i, isStart, isEnd, indexes);
                checkSubMoves(m, i, indexes);
            });
            indexes.pop();
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
                var isEnd = (index === variationMoves.length - 1);
                var isStart = (index === 0);
                addPGNMove(move, index + moveIndex, isStart, isEnd, [moveIndex, index + moveIndex]);
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