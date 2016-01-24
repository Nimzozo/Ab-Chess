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
|`getPGN()`
|`isValidPGN(pgn)`


##Position(fen)

| Properties | Description |
|------------|----
|`fen`

| Methods  | Description |
|------------|-------------|
|`getAllowedCastles()`
|`getEnPassantTarget()`
|`getFullmoveNumber()`
|`getHalfmoveClock()`
|`getOccupiedSquares()`
|`isValidFEN(fen)`
|`isWhiteTurn()`
