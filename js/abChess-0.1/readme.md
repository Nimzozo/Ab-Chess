# AbChess code documentation


##ChessBoard(containerId, width)

| Properties | Description |
|------------|-------------|
|`clickablePieces`| 
|`container`
|`containerId`
|`draggablePieces`
|`game`
|`hasBorder`
|`isFlipped`
|`squares`
|`width`

| Methods | Description |
|------------|-------------|
|`createSquares()`|
|`draw()`|
|`empty()`|
|`getPosition()`|
|`isValidFEN(fen)`|
|`loadPosition(fen)`|


##Square(name)

| Properties | Description |
|------------|-------------|
|`div`
|`isHighlighted`
|`name`
|`piece`

| Methods | Description |
|------------|-------------|
|`dragDropHandler()`
|`dragEnterHandler()`
|`dragLeaveHandler()`
|`dragOverHandler()`
|`highlight()`
|`isEmpty()`
|`isWhite(name)`


##Piece(name)

| Properties | Description |
|------------|-------------|
|`div`
|`isSelected`
|`name`

| Methods | Description |
|------------|-------------|
|`clickHandler()`
|`dragEndHandler()`
|`dragStartHandler()`
|`put(square)`
|`remove()`


##Chessgame()

| Properties | Description |
|------------|-------------|
|`pgn`
|`fenPositions`

| Methods | Description |
|------------|-------------|
|`getFEN()`
|`getPGN()`
|`getPositionFromFEN(fen)`
|`isValidPGN(pgn)`
