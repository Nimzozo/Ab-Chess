window.addEventListener("load", function () {
    var abChess;
    var blackSpan = document.getElementById("blackPlayer");
    var checkInfo = document.getElementById("checkInfo");
    var currentPositionIndex = 0;
    var downloadButton = document.getElementById("downloadButton");
    var fenInput = document.getElementById("fenInput");
    var firstButton = document.getElementById("firstButton");
    var flipButton = document.getElementById("flipButton");
    var lastButton = document.getElementById("lastButton");
    var lastMoveInfo = document.getElementById("lastMoveInfo");
    var moves = [];
    var nextButton = document.getElementById("nextButton");
    var options = {
        imagesPath: "../images/wikipedia/"
    };
    var pgnButton = document.getElementById("pgnButton");
    var pgnMoves = [];
    var previousButton = document.getElementById("previousButton");
    var resetButton = document.getElementById("resetButton");
    var scoresheet = document.getElementById("scoresheet");
    var scheduled_raf = false;
    var turnInfo = document.getElementById("turnInfo");
    var whiteSpan = document.getElementById("whitePlayer");

    abChess = new AbChess("chessboard", options);

    function addMove(pgnMove, index) {

        // Add a move to the scoresheet.

        var td;
        var tdNum;
        var tr;
        if (index % 2 === 0) {
            tdNum = document.createElement("td");
            tdNum.innerText = index / 2 + 1;
            tr = document.createElement("tr");
            tr.appendChild(tdNum);
            scoresheet.appendChild(tr);
        } else {
            tr = scoresheet.lastElementChild;
        }
        td = document.createElement("td");
        td.innerText = pgnMove;
        td.className = "move";
        td.addEventListener("click", function (e) {
            var moveIndex = index;
            navigate(moveIndex + 1);
        });
        tr.appendChild(td);
    }

    function navigate(index) {

        // Navigate in the scoresheet on the desired position index.

        var id = "selectedMove";
        var rowHeight = 0;
        var rowsCount = 0;
        var selectedMove;
        var td;
        if (typeof index !== "number" || index < 0 || index > pgnMoves.length) {
            return;
        }
        currentPositionIndex = index;
        selectedMove = document.getElementById(id);
        if (selectedMove !== null) {
            selectedMove.removeAttribute("id");
        }
        if (index > 0) {
            td = document.getElementsByClassName("move")[index - 1];
            td.id = id;
        }
        rowsCount = scoresheet.childElementCount;
        rowHeight = Math.ceil(scoresheet.scrollHeight / rowsCount);
        scoresheet.parentElement.scrollTop = Math.ceil(Math.ceil(index / 2) * rowHeight - scoresheet.parentElement.clientHeight / 2 - rowHeight / 2);
        updateBoardInfo();
    }

    function updateBoardInfo() {

        // Update the board info.

        var fen = "";
        var fullMoveNumber = "";
        var lastMove = "";
        if (abChess.isInCheck(currentPositionIndex)) {
            if (abChess.isCheckmate(currentPositionIndex)) {
                checkInfo.innerText = "Checkmate !";
            } else {
                checkInfo.innerText = "Check !";
            }
        } else if (abChess.isStalemate(currentPositionIndex)) {
            checkInfo.innerText = "Stalemate !";
        } else {
            checkInfo.innerText = "";
        }
        moves = abChess.getGameMoves();
        lastMove = moves[currentPositionIndex - 1];
        if (lastMove === undefined) {
            lastMoveInfo.innerText = "Last move : -";
        } else {
            fullMoveNumber = (currentPositionIndex % 2 === 1)
                ? ((currentPositionIndex - 1) / 2 + 1) + ". "
                : (currentPositionIndex / 2) + "... ";
            lastMoveInfo.innerText = "Last move : " + fullMoveNumber + lastMove;
        }
        turnInfo.style.backgroundColor = (abChess.getActiveColor(currentPositionIndex) === "w")
            ? "white"
            : "black";
        abChess.navigate(currentPositionIndex);
        fen = abChess.getFEN(currentPositionIndex);
        fenInput.value = fen;
    }

    function reset() {

        // Reset the game object, the UI and the board position.

        var confirm = false;
        confirm = window.confirm("You will lose the game progress. Confirm ?");
        if (!confirm) {
            return false;
        }
        abChess.reset();
        while (scoresheet.hasChildNodes()) {
            scoresheet.removeChild(scoresheet.lastChild);
        }
        checkInfo.innerText = "";
        lastMoveInfo.innerText = "";
        fenInput.value = abChess.DEFAULT_FEN;
        blackSpan.innerText = "b";
        whiteSpan.innerText = "w";
        return true;
    }

    function downloadPGN() {

        var black = "";
        var body;
        var day = "";
        var month = "";
        var pgnNode;
        var pgn = "";
        var pgnWindow;
        var strDate = "";
        var today = new Date();
        var white = "";
        pgnNode = document.createElement("code");
        abChess.setGameInfo("Event", "AbChess demo");
        abChess.setGameInfo("Site", "demo.html");
        month = (today.getMonth() + 1).toString();
        month = month.replace(/^(\d)$/, "0$1");
        day = today.getDate().toString();
        day = day.replace(/^(\d)$/, "0$1");
        strDate = today.getFullYear() + "." + month + "." + day;
        abChess.setGameInfo("Date", strDate);
        white = window.prompt("Enter the white player name.", "White");
        abChess.setGameInfo("White", white);
        black = window.prompt("Enter the black player name.", "Black");
        abChess.setGameInfo("Black", black);
        pgn = abChess.getPGN();
        pgnNode.innerText = pgn;
        pgnWindow = window.open();
        try {
            pgnWindow.document.write(pgnNode.outerHTML);
        } catch (err) {
            alert(err.name);
        }
    }

    downloadButton.addEventListener("click", downloadPGN);
    resetButton.addEventListener("click", reset);

    flipButton.addEventListener("click", function () {
        abChess.flip();
    });

    pgnButton.addEventListener("click", function () {
        var count = 0;
        var pgn = "";
        var pgnTextarea = document.getElementById("pgnTextarea");
        pgn = pgnTextarea.value;
        if (pgn.trim() === "") {
            return;
        }
        if (!reset()) {
            return;
        }
        abChess.setPGN(pgn);
        pgnMoves = abChess.getGameMovesPGN();
        pgnMoves.forEach(function (move, index) {
            count += 1;
            // requestAnimationFrame(function () {
            addMove(move, index);
            // });
        });
        whiteSpan.innerText = abChess.getGameInfo("White");
        blackSpan.innerText = abChess.getGameInfo("Black");
        // requestAnimationFrame(function () {
        navigate(count);
        // });
    });

    firstButton.addEventListener("click", function () {
        navigate(0);
    });

    previousButton.addEventListener("click", function () {
        navigate(currentPositionIndex - 1);
    });

    nextButton.addEventListener("click", function () {
        navigate(currentPositionIndex + 1);
    });

    lastButton.addEventListener("click", function () {
        navigate(moves.length);
    });

    window.addEventListener("keydown", function (e) {
        var index = 0;
        switch (e.code) {
            case "ArrowLeft":
                index = currentPositionIndex - 1;
                break;
            case "ArrowRight":
                index = currentPositionIndex + 1;
                break;
            default:
                return;
        }
        if (scheduled_raf) {
            //return;
        }
        scheduled_raf = true;
        // requestAnimationFrame(function () {
        navigate(index);
        // });
    });

    abChess.onMovePlayed(function () {
        var index = 0;
        var pgnMove = "";
        pgnMoves = abChess.getGameMovesPGN();
        index = pgnMoves.length - 1;
        pgnMove = pgnMoves[index];
        addMove(pgnMove, index);
        navigate(index + 1);
    });

    abChess.draw();
    updateBoardInfo();

});