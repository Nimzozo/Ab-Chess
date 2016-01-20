#abChess documentation text file


Class :
    ChessBoard(containerId, width)
    
Properties :
   - clickablePieces
   - container
   - containerId
   - draggablePieces
   - fen
   - game
   - hasBorder
   - isFlipped
   - squares
   - width
    
Methods :
   - bindEventHandlers()
   - createSquares()
   - draw()
   - empty()
   - loadFEN(fen)
    
Static methods :
   - isValidFEN(fen)


Class :
    Square(name)
    
Properties :
   - div
   - isEmpty
   -  isSelected
   - isWhite
   - name
   - piece
    
Methods :
   - dragDropHandler()
   - dragEnterHandler()
   - dragLeaveHandler()
   - dragOverHandler()
   - highlight()
   - putPiece(piece)
   - removePiece()
    
Static methods :
   - isWhite(name)


Class :
    Piece(name)
    
Properties :
   - div
   - isSelected
   - name
    
Methods :
   - clickHandler()
   - dragEndHandler()
   - dragStartHandler()


Class :
    Chessgame()
    
Properties :
   - turn
    
Methods :
   - getFEN()
   - getPGN()
    
Static methods :
   - isValidPGN(pgn)
