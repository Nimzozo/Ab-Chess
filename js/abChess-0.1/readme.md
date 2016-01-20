#abChess documentation


####ChessBoard(containerId, width)

**Properties**
```
clickablePieces
container
containerId
draggablePieces
fen
game
hasBorder
isFlipped
squares
width
```
**Methods**
```
bindEventHandlers()
createSquares()
draw()
empty()
loadFEN(fen)
```
**Static methods**
```
isValidFEN(fen)
```

####Square(name)

**Properties**
```
div
isEmpty
isSelected
isWhite
name
piece
```
**Methods**
```
dragDropHandler()
dragEnterHandler()
dragLeaveHandler()
dragOverHandler()
highlight()
putPiece(piece)
removePiece()
```
**Static methods**
```
isWhite(name)
```

####Piece(name)

**Properties**
```
div
isSelected
name
```
**Methods**
```
clickHandler()
dragEndHandler()
dragStartHandler()
```

####Chessgame()

**Properties**
```
turn
```
**Methods**
```
getFEN()
getPGN()
```
**Static methods**
```
isValidPGN(pgn)
```
