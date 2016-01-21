# abChess documentation


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
|`bindEventHandlers()`|
|`createSquares()`|
|`draw()`|
|`empty()`|
|`loadPosition(fen)`|

| Static methods | Description |
|------------|-------------|
|`isValidFEN(fen)`|


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
|`put(square)`
|`remove()`

##Chessgame()

| Properties | Description |
|------------|-------------|
|`pgn`
|`positions`
|`turn`

| Methods | Description |
|------------|-------------|
|`getFEN()`
|`getPGN()`

| Static methods | Description |
|------------|-------------|
|`isValidPGN(pgn)`
