# abChess documentation


##ChessBoard(containerId, width)

| Properties | Description |
|------------|-------------|
|`clickablePieces`|
|`container`
|`containerId`
|`draggablePieces`
|`fen`
|`game`
|`hasBorder`
|`isFlipped`
|`squares`
|`width`

| Methods | Description |
|------------|-------------|
|`bindEventHandlers()`
|`createSquares()`
|`draw()`
|`empty()`
|`loadFEN(fen)`

| Static methods | Description |
|------------|-------------|
|`isValidFEN(fen)`


##Square(name)

| Properties | Description |
|------------|-------------|
|`div`
|`isEmpty`
|`isSelected`
|`isWhite`
|`name`
|`piece`

| Methods | Description |
|------------|-------------|
|`dragDropHandler()`
|`dragEnterHandler()`
|`dragLeaveHandler()`
|`dragOverHandler()`
|`highlight()`
|`putPiece(piece)`
|`removePiece()`

| Static methods | Description |
|------------|-------------|
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


##Chessgame()

| Properties | Description |
|------------|-------------|
|`turn`

| Methods | Description |
|------------|-------------|
|`getFEN()`
|`getPGN()`

| Static methods | Description |
|------------|-------------|
|`isValidPGN(pgn)`
