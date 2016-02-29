## Square(name)

| Properties
|---------------
|`board`
|`div`
|`hasCircle`
|`isHighlighted`
|`isOverflown`
|`isSelected`
|`name`
|`piece`

| Methods
|---------------
|`clickHandler()`
|`dragEnterHandler()`
|`dragLeaveHandler()`
|`dragOverHandler()`
|`drawCircle()`
|`dropHandler()`
|`getClassName()`
|`highlight()`
|`isEmpty()`
|`isWhite(name)`
|`select()`


## Piece(name)

| Properties
|---------------
|`div`
|`name`
|`square`

| Methods
|---------------
|`dragEndHandler()`
|`dragStartHandler()`
|`initEventListeners()`
|`put(square)`
|`remove()`


## ChessBoard(containerId, config)

| Properties
|---------------
|`activeSquareName`
|`circleColor`
|`clickablePieces`
|`container`
|`draggablePieces`
|`hasBorder`
|`isFlipped`
|`onPieceDragEnd`
|`onPieceDragStart`
|`onPromotionChose`
|`onSquareClick`
|`onSquareDrop`
|`pendingMove`
|`promotionDiv`
|`squares`
|`selectedSquare`
|`width`

| Methods
|---------------
|`createSquares()`
|`draw()`
|`drawCircles(squares)`
|`empty()`
|`getPositionObject()`
|`highlightSquares(squares)`
|`loadFEN(fen)`
|`play(move, promotion)`
|`showPromotionDiv(color)`


## Position(fen)

| Properties
|---------------
|`activeColor`
|`allowedCastles`
|`enPassantSquare`
|`fenString`
|`fullmoveNumber`
|`halfmoveClock`
|`occupiedSquares`

| Methods
|---------------
|`checkMoveLegality(move)`
|`fenToObject(fen)`
|`getKingSquare(color)`
|`getLegalMoves()`
|`getLegalSquares(start)`
|`getNewActiveColor()`
|`getNewAllowedCastles(move)`
|`getNewEnPassant(move)`
|`getNewFullmoveNumber()`
|`getNewHalfmoveClock(move)`
|`getNewPosition(move, promotion)`
|`getPGN(move, promotion, withNumber, stringToAdd)`
|`getPiecesPlaces(color)`
|`getTargets(start, onlyAttack)`
|`getTargets_bishop(start, color)`
|`getTargets_king(start, color)`
|`getTargets_king_special(start, color)`
|`getTargets_knight(start, color)`
|`getTargets_pawn(start, color, onlyAttack)`
|`getTargets_queen(start, color)`
|`getTargets_rook(start, color)`
|`isControlledBy(square, color)`
|`isInCheck(color)`
|`isValidFEN(fen, onlyRows)`
|`objectToFEN(position)`


## Chessgame(pgn)

| Properties
|---------------
|`fenStrings`
|`moves`

| Methods
|---------------
|`getLastPosition()`
|`getPGN()`
|`getTag(tag)`
|`isInCheck()`
|`isLegal(move)`
|`isValidPGN(pgn)`
|`loadPGN(pgn)`
|`play(move, promotion)`
