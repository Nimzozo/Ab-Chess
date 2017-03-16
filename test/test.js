window.addEventListener("load", function () {
    "use strict";

    var abChess = {};
    var currentIndex = 0;
    var errorSpan = document.getElementById("errorSpan");
    var firstButton = document.getElementById("firstButton");
    var flipButton = document.getElementById("flipButton");
    var importButton = document.getElementById("importButton");
    var lastButton = document.getElementById("lastButton");
    var lastIndex = 0;
    var moves = [];
    var movesDiv = document.getElementById("moves-div");
    var nextButton = document.getElementById("nextButton");
    var options = {
        animationSpeed: "normal",
        clickable: true,
        draggable: true,
        imagesPath: "../src/images/wikipedia/"
    };
    var pgnButton = document.getElementById("pgnButton");
    var pgnSpanClass = "move-span";
    var pgnSelectedSpanId = "move-span_selected";
    var pgnTextArea = document.getElementById("pgn-textarea");
    var previousButton = document.getElementById("previousButton");
    var resetButton = document.getElementById("resetButton");

    abChess = new AbChess("chessboard", options);
    abChess.draw();
    abChess.setFEN();

    function navigate(index) {
        var selectedSpan = document.getElementById(pgnSelectedSpanId);
        var spans = document.getElementsByClassName(pgnSpanClass);
        if (index < 0 || index > lastIndex) {
            return;
        }
        currentIndex = index;
        abChess.navigate(currentIndex);
        if (selectedSpan !== null) {
            selectedSpan.removeAttribute("id");
        }
        if (index > 0 && spans.length > 0) {
            spans[index - 1].id = pgnSelectedSpanId;
        }
    }

    function addMoveSpan(move, i) {
        var numberSpan = {};
        var span = document.createElement("SPAN");
        span.className = pgnSpanClass;
        span.innerText = move;
        span.addEventListener("click", function () {
            navigate(i + 1);
        });
        if (i % 2 === 0) {
            numberSpan = document.createElement("SPAN");
            numberSpan.className = "move-number-span";
            numberSpan.innerText = i / 2 + 1;
            movesDiv.appendChild(numberSpan);
        }
        movesDiv.appendChild(span);
    }

    function clearSpans() {
        while (movesDiv.hasChildNodes()) {
            movesDiv.removeChild(movesDiv.lastElementChild);
        }
    }

    function importPGN() {
        errorSpan.innerText = "";
        if (!abChess.isValidPGN(pgnTextArea.value)) {
            errorSpan.innerText = "Invalid PGN.";
            return;
        }
        abChess.setPGN(pgnTextArea.value, true);
        clearSpans();
        moves = abChess.getGameMovesPGN();
        moves.forEach(addMoveSpan);
        lastIndex = abChess.getLastPositionIndex();
        navigate(lastIndex);
    }

    importButton.addEventListener("click", importPGN);
    resetButton.addEventListener("click", function () {
        abChess.reset();
        clearSpans();
    });
    flipButton.addEventListener("click", abChess.flip);
    firstButton.addEventListener("click", function () {
        navigate(0);
    });
    previousButton.addEventListener("click", function () {
        navigate(currentIndex - 1);
    });
    nextButton.addEventListener("click", function () {
        navigate(currentIndex + 1);
    });
    lastButton.addEventListener("click", function () {
        navigate(lastIndex);
    });
    pgnButton.addEventListener("click", function () {
        var pgn = abChess.getPGN();
        alert(pgn);
    });
});
