window.AbChess=window.AbChess||function(e,t){"use strict";function n(e){var t="",a="",r="",i=[],o=0,s=0,c={},u={};if(!n.isValidFEN(e))throw new Error(v.invalidFEN);return i=P.exec(e),t=i[1],a=i[2],r=i[3],o=Number(i[5]),s=Number(i[4]),c=n.fenToObject(e),u={activeColor:t,allowedCastles:a,enPassantSquare:r,fenString:e,fullmoveNumber:o,halfmoveClock:s,occupiedSquares:c},u.checkMoveLegality=function(e){var n="",a="",r="",i=[],o={};return y.test(e)?(r=e.substr(0,2),c.hasOwnProperty(r)?(a=c[r]===c[r].toLowerCase()?h.black:h.white,t!==a?!1:(o=u.getNextPosition(e),o.isInCheck(t)?!1:(i=u.getTargets(r,!1),n=e.substr(3,2),i.some(function(e){return e===n})))):!1):!1},u.getKingSquare=function(e){var t="",n="";return t=e===h.black?h.blackKing:h.whiteKing,Object.keys(c).every(function(e){var a=c[e];return a===t?(n=e,!1):!0}),n},u.getLegalMoves=function(){var e=[],n=[];return n=u.getPiecesPlaces(t),n.forEach(function(t){var n=u.getLegalSquares(t);n.forEach(function(n){var a=t+"-"+n;e.push(a)})}),e},u.getLegalSquares=function(e){var t=[],n=[];return n=u.getTargets(e,!1),n.forEach(function(n){var a=e+"-"+n;u.checkMoveLegality(a)&&t.push(n)}),t},u.getNextActiveColor=function(){var e="";return e=u.activeColor===h.white?h.black:h.white},u.getNextAllowedCastles=function(e){var t="",n="",r="",i="";if(!y.test(e))throw new SyntaxError(v.invalidParameter);return"-"===a?a:(n=a,i=e.substr(0,2),r=c[i],t=e.substr(3,2),-1!==a.search(/[kq]/)&&(r===h.blackKing&&(n=a.replace(/[kq]/g,"")),("a8"===i||"a8"===t)&&(n=a.replace(/q/,"")),("h8"===i||"h8"===t)&&(n=a.replace(/k/,""))),-1!==a.search(/[KQ]/)&&(r===h.whiteKing&&(n=a.replace(/[KQ]/g,"")),("a1"===i||"a1"===t)&&(n=a.replace(/Q/,"")),("h1"===i||"h1"===t)&&(n=a.replace(/K/,""))),""===n&&(n="-"),n)},u.getNextEnPassant=function(e){var t=0,n="",a="-",r="",i=0,o="";if(!y.test(e))throw new SyntaxError(v.invalidParameter);return n=e.substr(3,2),t=Number(n[1]),o=e.substr(0,2),i=Number(o[1]),r=c[o],(r===h.blackPawn||r===h.whitePawn)&&(t-i===2&&(a=o[0]+"3"),i-t===2&&(a=o[0]+"6")),a},u.getNextFullmoveNumber=function(){var e=0;return e=u.activeColor===h.black?o+1:o},u.getNextHalfmoveClock=function(e){var t="",n="",a=0,r="",i=!1;if(!y.test(e))throw new SyntaxError(v.invalidParameter);return r=e.substr(0,2),n=c[r],t=e.substr(3,2),i=c.hasOwnProperty(t),a=n===h.blackPawn||n===h.whitePawn||i?0:s+1},u.getNextPosition=function(e,t){var a="",i="",o="",s="",c="",l="",f=0,g=0,d={},m="",p="",k="",P="",q="";if(!y.test(e))throw new SyntaxError(v.invalidParameter);return d=n.fenToObject(u.fenString),q=e.substr(0,2),m=d[q],a=e.substr(3,2),m.toLowerCase()===h.blackKing&&w.test(e)?(P=a[0]===h.columns[2]?h.columns[0]+a[1]:h.columns[7]+a[1],k=a[0]===h.columns[2]?h.columns[3]+a[1]:h.columns[5]+a[1],delete d[P],"e1"===q?d[k]=h.whiteRook:d[k]=h.blackRook):m.toLowerCase()===h.blackPawn&&(a===r&&b.test(e)&&(i=r[0]+q[1],delete d[i]),C.test(e)&&(t=t||h.blackQueen,"1"===a[1]&&(m=t.toLowerCase()),"8"===a[1]&&(m=t.toUpperCase()))),delete d[q],d[a]=m,p=n.objectToFEN(d),o=u.getNextActiveColor(),s=u.getNextAllowedCastles(e),c=u.getNextEnPassant(e),g=u.getNextHalfmoveClock(e),f=u.getNextFullmoveNumber(),l=p+" "+o+" "+s+" "+c+" "+g+" "+f,new n(l)},u.getPGNMove=function(e,n,a,i){var s=!1,l=!1,f="",g="",d=!1,m=!1,p="",k="",b="";if(!y.test(e))throw new SyntaxError(v.invalidParameter);if(a&&(p=t===h.white?o+". ":o+"... "),b=e.substr(0,2),k=c[b],f=e.substr(3,2),w.test(e))p+=f[0]===h.columns[2]?h.castleQueenSymbol:h.castleKingSymbol;else{switch(d=c.hasOwnProperty(f),k.toLowerCase()){case h.blackBishop:case h.blackKing:case h.blackKnight:case h.blackQueen:case h.blackRook:p+=k.toUpperCase();break;case h.blackPawn:(d||f===r)&&(p+=b[0],d=!0),m=C.test(e)}k.toLowerCase()!==h.blackPawn&&k.toLowerCase()!==h.blackKing&&(Object.keys(c).forEach(function(e){var t=[],n="";s&&l||(n=c[e],n===k&&e!==b&&(t=u.getLegalSquares(e),-1!==t.indexOf(f)&&(e[0]===b[0]?s=!0:e[1]===b[1]?l=!0:g=b[0])))}),s&&(g+=b[1]),l&&(g+=b[0]),p+=g),d&&(p+=h.captureSymbol),p+=f,m&&(p+=h.promotionSymbol+n.toUpperCase())}return i=i||"",p+=i},u.getPiecesPlaces=function(e){var t=[];return Object.keys(c).forEach(function(n){var a=c[n];(e===h.white&&a===a.toUpperCase()||e===h.black&&a===a.toLowerCase())&&t.push(n)}),t},u.getSimpleNotation=function(e){var n="",a="",r=[],i="",o="",s=/^(Kx?([a-h][1-8])|O-O(?:-O)?)(?:\+|#)?$/,l=/^([a-h]?)x?([a-h][1-8])(\=[BNQR])?(?:\+|#)?$/,f=/^[BNQR]([a-h]?[1-8]?)x?([a-h][1-8])(?:\+|#)?$/,g=0,d=[],m="";if(s.test(e)){if(r=s.exec(e),r[1]===h.castleKingSymbol||r[1]===h.castleQueenSymbol)return g=t===h.black?8:1,m="e"+g,a=r[1]===h.castleKingSymbol?"g"+g:"c"+g,m+"-"+a;i=h.whiteKing,a=r[2]}else if(l.test(e))i=h.whitePawn,r=l.exec(e),n=r[1],a=r[2],-1!==e.indexOf(h.promotionSymbol)&&(o=r[3]);else{if(!f.test(e))throw new SyntaxError(v.invalidParameter);i=e[0],r=f.exec(e),n=r[1],a=r[2]}return d=u.getPiecesPlaces(t),d=d.filter(function(e){var t=c[e];return t.toLowerCase()===i.toLowerCase()}),d=d.filter(function(e){var t=[];return t=u.getLegalSquares(e),-1!==t.indexOf(a)}),m=d.length>1?d.find(function(e){return-1!==e.indexOf(n)}):d[0],m+"-"+a+o},u.getTargets=function(e,t){var n="",a="",r=[];if(!c.hasOwnProperty(e))return r;switch(a=c[e],n=a.toLowerCase()===a?h.black:h.white,a){case h.blackBishop:case h.whiteBishop:r=u.getTargets_bishop(e,n);break;case h.blackKing:case h.whiteKing:r=u.getTargets_kingFull(e,n,t);break;case h.blackKnight:case h.whiteKnight:r=u.getTargets_knight(e,n);break;case h.blackPawn:case h.whitePawn:r=u.getTargets_pawn(e,n,t);break;case h.blackQueen:case h.whiteQueen:r=u.getTargets_queen(e,n);break;case h.blackRook:case h.whiteRook:r=u.getTargets_rook(e,n)}return r},u.getTargets_bishop=function(e,t){var n=[],a=0,r="",i=[],o=0,s=[],c=0,l=0,f="";for(a=h.columns.indexOf(e[0])+1,c=a+1,o=Number(e[1]),l=o+1,n=u.getPiecesPlaces(t),r=t===h.black?h.white:h.black,i=u.getPiecesPlaces(r);9>c&&9>l&&(f=h.columns[c-1]+l,-1===n.indexOf(f))&&(s.push(f),-1===i.indexOf(f));)c+=1,l+=1;for(c=a-1,l=o-1;c>0&&l>0&&(f=h.columns[c-1]+l,-1===n.indexOf(f))&&(s.push(f),-1===i.indexOf(f));)c-=1,l-=1;for(c=a+1,l=o-1;9>c&&l>0&&(f=h.columns[c-1]+l,-1===n.indexOf(f))&&(s.push(f),-1===i.indexOf(f));)c+=1,l-=1;for(c=a-1,l=o+1;c>0&&9>l&&(f=h.columns[c-1]+l,-1===n.indexOf(f))&&(s.push(f),-1===i.indexOf(f));)c-=1,l+=1;return s},u.getTargets_king=function(e,t){var n=[],a=[-1,0,1],r=0,i=[-1,0,1],o=0,s=[],c=0,l=0,f="";return n=u.getPiecesPlaces(t),r=h.columns.indexOf(e[0])+1,o=Number(e[1]),a.forEach(function(e){i.forEach(function(t){(0!==e||0!==t)&&(c=r+e,l=o+t,c>0&&9>c&&l>0&&9>l&&(f=h.columns[c-1]+l,-1===n.indexOf(f)&&s.push(f)))})}),s},u.getTargets_kingFull=function(e,t,n){var r="",i="",o=[],s=["f","g"],l=[],f=["b","c","d"],g=[],d="";return l=u.getTargets_king(e,t),r=t===h.black?h.white:h.black,i=u.getKingSquare(r),o=u.getTargets_king(i,r),g=l.filter(function(e){return-1===o.indexOf(e)}),n?g:("e1"!==e||u.isControlledBy("e1",h.black)?"e8"!==e||u.isControlledBy("e8",h.white)||(-1===a.indexOf(h.blackQueen)||u.isControlledBy("d8",h.white)||f.every(function(e){return d=e+"8",!c.hasOwnProperty(d)})&&g.push("c8"),-1===a.indexOf(h.blackKing)||u.isControlledBy("f8",h.white)||s.every(function(e){return d=e+"8",!c.hasOwnProperty(d)})&&g.push("g8")):(-1===a.indexOf(h.whiteQueen)||u.isControlledBy("d1",h.black)||f.every(function(e){return d=e+"1",!c.hasOwnProperty(d)})&&g.push("c1"),-1===a.indexOf(h.whiteKing)||u.isControlledBy("f1",h.black)||s.every(function(e){return d=e+"1",!c.hasOwnProperty(d)})&&g.push("g1")),g)},u.getTargets_knight=function(e,t){var n=[],a=[-2,-1,1,2],r=0,i=[-2,-1,1,2],o=0,s=[],c=0,l=0,f="";return n=u.getPiecesPlaces(t),r=h.columns.indexOf(e[0])+1,o=Number(e[1]),a.forEach(function(e){i.forEach(function(t){Math.abs(e)!==Math.abs(t)&&(c=r+e,l=o+t,c>0&&9>c&&l>0&&9>l&&(f=h.columns[c-1]+l,-1===n.indexOf(f)&&s.push(f)))})}),s},u.getTargets_pawn=function(e,t,n){var a=[],i=[-1,1],o=0,s=0,c="",l=[],f=0,g=[],d=0,m=0,v="";return o=h.columns.indexOf(e[0])+1,f=Number(e[1]),s=t===h.black?-1:1,m=f+s,c=t===h.black?h.white:h.black,l=u.getPiecesPlaces(c),i.forEach(function(e){d=o+e,v=h.columns[d-1]+m,-1!==l.indexOf(v)||r===v?g.push(v):n&&g.push(v)}),n||(d=o,v=h.columns[d-1]+m,a=u.getPiecesPlaces(t),-1===a.indexOf(v)&&-1===l.indexOf(v)&&(g.push(v),(2===f&&1===s||7===f&&-1===s)&&(m=f+2*s,v=h.columns[d-1]+m,-1===a.indexOf(v)&&-1===l.indexOf(v)&&g.push(v)))),g},u.getTargets_queen=function(e,t){return u.getTargets_bishop(e,t).concat(u.getTargets_rook(e,t))},u.getTargets_rook=function(e,t){var n=[],a=0,r="",i=[],o=0,s=[],c=0,l=0,f="";for(a=h.columns.indexOf(e[0])+1,c=a+1,o=Number(e[1]),l=o,n=u.getPiecesPlaces(t),r=t===h.black?h.white:h.black,i=u.getPiecesPlaces(r);9>c&&(f=h.columns[c-1]+l,-1===n.indexOf(f))&&(s.push(f),-1===i.indexOf(f));)c+=1;for(c=a-1;c>0&&(f=h.columns[c-1]+l,-1===n.indexOf(f))&&(s.push(f),-1===i.indexOf(f));)c-=1;for(c=a,l=o+1;9>l&&(f=h.columns[c-1]+l,-1===n.indexOf(f))&&(s.push(f),-1===i.indexOf(f));)l+=1;for(l=o-1;l>0&&(f=h.columns[c-1]+l,!(n.indexOf(f)>-1))&&(s.push(f),!(i.indexOf(f)>-1));)l-=1;return s},u.hasLegalMoves=function(){var e=[];return e=u.getPiecesPlaces(t),e.some(function(e){var t=[];return t=u.getLegalSquares(e),t.length>0})},u.isCheckmate=function(){var e=!1;return e=u.isInCheck(t),e?!u.hasLegalMoves():!1},u.isControlledBy=function(e,t){var n=[];return n=u.getPiecesPlaces(t),n.some(function(t){var n=u.getTargets(t,!0);return n.indexOf(e)>-1})},u.isDrawBy50MovesRule=function(){return s>99},u.isDrawByInsufficientMaterial=function(){var e=[],t=[],n=[],a=[["b"],["n"],["n","n"]],r=!1;return e=u.getPiecesPlaces(h.black),e.length>3?!1:e.length>1&&(e.forEach(function(e){var n=c[e];n!==h.blackKing&&t.push(n)}),r=a.some(function(e){var n=!1;return e.length!==t.length?!1:n=e.every(function(e,n){return t[n]===e})}),!r)?!1:(n=u.getPiecesPlaces(h.white),n.length>3?!1:1===n.length?!0:(t=[],n.forEach(function(e){var n=c[e];n!==h.whiteKing&&t.push(n.toLowerCase())}),r=a.some(function(e){var n=!1;return e.length!==t.length?!1:n=e.every(function(e,n){return t[n]===e})})))},u.isInCheck=function(e){var t="",n="";return t=e===h.white?h.black:h.white,n=u.getKingSquare(e),u.isControlledBy(n,t)},u}function a(e,t){var n="url('"+t+"')",a={},r={},i={};return a=document.createElement("DIV"),a.className=d.squarePiece,a.style.backgroundImage=n,r=document.createElement("DIV"),r.className=d.ghostPiece,r.style.backgroundImage=n,i={div:a,ghost:r,name:e,square:null,url:t},i.animatePut=function(e){O(function(){e.div.appendChild(i.div)})},i.animateRemove=function(){O(function(){var e=i.div.parentElement;e.removeChild(i.div)})},i.fadingPlace=function(e){var t=Number(i.div.style.opacity);0===t&&i.animatePut(e),t+=.05,i.div.style.opacity=t,1>t&&O(function(){i.fadingPlace(e)})},i.fadingRemove=function(){var e=i.div.style.opacity;""===e&&(e=1),e-=.05,i.div.style.opacity=e,e>0?O(i.fadingRemove):i.animateRemove()},i.getGhostCoordinate=function(){var e=Math.round(r.getBoundingClientRect().left+window.pageXOffset),t=Math.round(r.getBoundingClientRect().top+window.pageYOffset);return[e,t]},i.mouseDownHandler=function(e){"function"==typeof i.square.board.onPieceMouseDown&&i.square.board.onPieceMouseDown(e,i)},i.put=function(e){e.isEmpty()||e.piece.remove(),e.piece=i,i.square=e},i.remove=function(){null!==i.square&&(i.square.piece=null)},a.addEventListener("mousedown",i.mouseDownHandler),i}function r(e){var t="",n=document.createElement("DIV"),a=r.isWhite(e),i={board:null,canvas:null,div:n,hasCircle:!1,isHighlighted:!1,isMarked:!1,isOverflown:!1,isSelected:!1,name:e,piece:null};return t=a?d.square+" "+d.whiteSquare:d.square+" "+d.blackSquare,n.className=t,i.clickHandler=function(){"function"==typeof i.board.onSquareClick&&i.board.onSquareClick(i.name)},i.drawFilledCircle=function(e,t,n,a){var r=i.canvas.getContext("2d");r.beginPath(),r.arc(e,t,n,0,2*Math.PI),r.fillStyle=a,r.fill()},i.mouseEnterHandler=function(){"function"==typeof i.board.onSquareEnter&&i.board.onSquareEnter(i)},i.mouseLeaveHandler=function(){"function"==typeof i.board.onSquareLeave&&i.board.onSquareLeave(i)},i.mouseUpHandler=function(){"function"==typeof i.board.onSquareMouseUp&&i.board.onSquareMouseUp(i)},i.getClassName=function(){var e=d.square+" ";return e+=r.isWhite(i.name)?d.whiteSquare:d.blackSquare,i.isHighlighted&&(e+=" "+d.highlightedSquare),i.isMarked&&(e+=" "+d.markedSquare),i.isOverflown&&(e+=" "+d.overflownSquare),i.isSelected&&(e+=" "+d.selectedSquare),e},i.getCoordinate=function(){var e=Math.round(i.div.getBoundingClientRect().left+window.pageXOffset),t=Math.round(i.div.getBoundingClientRect().top+window.pageYOffset);return[e,t]},i.highlight=function(){var e="";i.isHighlighted=!i.isHighlighted,e=i.getClassName(),O(function(){i.div.className=e})},i.isEmpty=function(){return null===i.piece},i.mark=function(){var e="";i.isMarked=!i.isMarked,e=i.getClassName(),O(function(){i.div.className=e})},i.overfly=function(){var e="";i.isOverflown=!i.isOverflown,e=i.getClassName(),O(function(){i.div.className=e})},i.select=function(){var e="";i.isSelected=!i.isSelected,e=i.getClassName(),O(function(){i.div.className=e})},i.div.addEventListener("click",i.clickHandler),i.div.addEventListener("mouseenter",i.mouseEnterHandler),i.div.addEventListener("mouseleave",i.mouseLeaveHandler),i.div.addEventListener("mouseup",i.mouseUpHandler),i}function i(e,t){var i={animationSpeed:t.animationSpeed,clickablePieces:t.clickable,container:document.getElementById(e),draggablePieces:t.draggable,imagesExtension:t.imagesExtension,imagesPath:t.imagesPath,hasDraggedClickedSquare:!1,isDragging:!1,isFlipped:t.flipped,isNavigating:!1,legalMarksColor:t.legalMarksColor,markOverflownSquare:t.markOverflownSquare,notationBorder:t.notationBorder,onMouseMove:null,onMouseUp:null,onPieceMouseDown:null,onPromotionChose:null,onSquareClick:null,onSquareEnter:null,onSquareMouseUp:null,onSquareLeave:null,pendingMove:null,promotionDiv:document.createElement("DIV"),selectedSquare:null,squares:{},width:t.width};return i.addNavigationData=function(e,t){Object.keys(i.squares).forEach(function(e){var t=i.squares[e];t.piece=null}),t.forEach(function(e){e.square.piece=e}),e.forEach(function(e){var t=e.arrival,n=e.piece,a=e.start;void 0!==t&&(void 0===a?(t.piece=n,n.square=t):(t.piece=n,n.square=t))})},i.animateGhost=function(e,t,n){var a=0,r=0,o=0,s=0,c=0,u=0,l=e.ghost,f=t[0],g=t[1],h=0;switch(i.isNavigating=!0,i.animationSpeed){case"slow":h=.1;break;case"normal":h=.25;break;case"fast":h=.5;break;case"instant":h=1;break;default:h=.25}return f===n[0]&&g===n[1]?(null!==l.parentElement&&document.body.removeChild(l),e.div.style.opacity="1",void(i.isNavigating=!1)):(f<n[0]?(o=n[0]-f,c=1):(o=f-n[0],c=-1),g<n[1]?(s=n[1]-g,u=1):(s=g-n[1],u=-1),a=Math.ceil(o*h),r=Math.ceil(s*h),t[0]=f+c*a,t[1]=g+u*r,l.style.left=t[0]+"px",l.style.top=t[1]+"px",void O(function(){i.animateGhost(e,t,n)}))},i.animateNavigation=function(e){e.forEach(function(e){var t=e.arrival,n=e.piece,a=e.start;void 0===t?n.fadingRemove():void 0===a?n.fadingPlace(t):i.movePiece(n,a,t)})},i.askPromotion=function(e){for(var t=i.promotionDiv.childNodes,n=[h.blackQueen,h.blackRook,h.blackBishop,h.blackKnight];t.length>0;)i.promotionDiv.removeChild(i.promotionDiv.lastChild);n.forEach(function(t){var n,a=i.imagesPath+e+t+i.imagesExtension;n=document.createElement("INPUT"),n.className=d.promotionButton,n.setAttribute("type","button"),n.setAttribute("name",t),n.style.backgroundImage="url('"+a+"')",n.addEventListener("click",i.clickPromotionHandler),i.promotionDiv.appendChild(n)}),i.lock(),O(function(){i.promotionDiv.style.display="block"})},i.clearMarks=function(){Object.keys(i.squares).forEach(function(e){var n=i.squares[e];t.markLastMove&&n.isHighlighted&&n.highlight(),t.markKingInCheck&&n.isMarked&&n.mark(),t.markOverflownSquare&&n.isOverflown&&n.overfly(),n.isSelected&&n.select()})},i.clickPromotionHandler=function(e){var t=e.target.name;"function"==typeof i.onPromotionChose&&i.onPromotionChose(t),i.pendingMove=null,i.unlock(),O(function(){i.promotionDiv.style.display="none"})},i.createSquares=function(){var e={},t="",n=0,a="",o="",s=0,c=0,u={},l={},f=0;for(t=Math.floor(i.width/8)+"px",s=Math.floor(i.width/62),f=Math.floor(i.width/16),c=1;9>c;){for(n=1;9>n;)a=h.columns[n-1],o=a+c,e=document.createElement("CANVAS"),e.className=d.squareCanvas,e.setAttribute("height",t),e.setAttribute("width",t),u=new r(o),u.canvas=e,u.drawFilledCircle(f,f,s,i.legalMarksColor),u.board=i,l[o]=u,n+=1;c+=1}i.squares=l},i.displayCanvas=function(e){e.forEach(function(e){var t=i.squares[e];O(function(){t.hasCircle?t.div.removeChild(t.canvas):t.div.appendChild(t.canvas),t.hasCircle=!t.hasCircle})})},i.draw=function(){var e,t={},n={},a=0,r="",o=0,s=0,c={},u={};if(i.promotionDiv.className=d.promotionDiv,u=document.createElement("DIV"),u.style.width=i.width+"px",u.style.height=i.width+"px",u.className=d.squaresDiv,i.isFlipped)for(s=1;9>s;){for(a=8;a>0;)r=h.columns[a-1],c=i.squares[r+s],u.appendChild(c.div),a-=1;s+=1}else for(s=8;s>0;){for(a=1;9>a;)r=h.columns[a-1],c=i.squares[r+s],u.appendChild(c.div),a+=1;s-=1}if(O(function(){u.appendChild(i.promotionDiv),i.container.appendChild(u)}),i.notationBorder){for(n=document.createElement("DIV"),n.className=d.bottomBorder,n.style.width=i.width+"px",a=1;9>a;)t=document.createElement("DIV"),t.className=d.bottomBorderFragment,o=i.isFlipped?8-a:a-1,t.innerHTML=h.columns[o].toUpperCase(),n.appendChild(t),a+=1;for(e=document.createElement("DIV"),e.className=d.rightBorder,e.style.height=i.width+"px",s=1;9>s;)t=document.createElement("DIV"),t.className=d.rightBorderFragment,t.style.lineHeight=Math.floor(i.width/8)+"px",o=i.isFlipped?s:9-s,t.innerHTML=o,e.appendChild(t),s+=1;O(function(){i.container.appendChild(e),i.container.appendChild(n)})}},i.empty=function(){Object.keys(i.squares).forEach(function(e){var t=i.squares[e];t.isEmpty()||(t.piece.animateRemove(),t.piece.remove())})},i.getAnimations=function(e){var t=[],n=[],r=e.occupiedSquares,o=i.getPositionObject(),s=[],c=[];return Object.keys(o).forEach(function(e){r[e]!==o[e]&&c.push(e)}),Object.keys(r).forEach(function(e){o[e]!==r[e]&&s.push(e)}),s.forEach(function(e){var a=!1,s=0,u=r[e];a=c.some(function(n,a){var r={},c={},l=o[n],f={},g={};return u===l?(g=i.squares[n],c=i.squares[e],f=g.piece,r.start=g,r.arrival=c,r.piece=f,t.push(r),s=a,!0):!1}),a?c.splice(s,1):n.push(e)}),c.forEach(function(e){var n={},a={},r=i.squares[e];a=r.piece,n.start=r,n.piece=a,t.push(n)}),n.forEach(function(e){var n={},o=i.squares[e],s=r[e],c={},u="",l="";u=s.toLowerCase()===s?h.black+s:h.white+s.toLowerCase(),l=i.imagesPath+u+i.imagesExtension,c=new a(u,l),n.arrival=o,n.piece=c,t.push(n)}),t},i.getPositionObject=function(){var e={};return Object.keys(i.squares).forEach(function(t){var n="",a="",r=i.squares[t];r.isEmpty()||(a=r.piece.name,n=a[0]===h.white?a[1].toUpperCase():a[1].toLowerCase(),e[t]=n)}),e},i.getSimilarPieces=function(e){var t=e.occupiedSquares,n=i.getPositionObject(),a=[];return Object.keys(t).forEach(function(e){var r=t[e],o=n[e],s={};o===r&&(s=i.squares[e].piece,a.push(s))}),a},i.highlightSquares=function(e){e.forEach(function(e){i.squares[e].highlight()})},i.loadFEN=function(e){var t={};if(e=e||h.defaultFEN,!n.isValidFEN(e,!0))throw new SyntaxError(v.invalidFEN);i.empty(),t=n.fenToObject(e),Object.keys(t).forEach(function(e){var n="",r={},o="",s={},c="";n=t[e],o=n.toLowerCase()===n?h.black+n:h.white+n.toLowerCase(),c=i.imagesPath+o+i.imagesExtension,r=new a(o,c),s=i.squares[e],r.animatePut(s),r.put(s)})},i.lock=function(){i.clickablePieces=!1,i.draggablePieces=!1},i.markSquares=function(e){e.forEach(function(e){i.squares[e].mark()})},i.movePiece=function(e,t,n,a,r,o){var s=n.getCoordinate(),c=0,u=t.getCoordinate();"boolean"!=typeof a&&(a=!1),"boolean"!=typeof r&&(r=!1),c=Math.floor(f.width/8),O(function(){var t={};a||(t=e.ghost,e.div.style.opacity="0",t.style.height=c+"px",t.style.width=c+"px",t.style.left=u[0]+"px",t.style.top=u[1]+"px",document.body.appendChild(t),i.animateGhost(e,u,s)),r&&o.fadingRemove(),e.animateRemove(),e.animatePut(n)})},i.play=function(e,t,n){var r="",o={},s={},c=!1,u="",l={},f={},g="",d="",m={},p={},k="",P="",q="",S={},E="";if(!y.test(e))throw new SyntaxError(v.invalidParameter);if(q=e.substr(0,2),S=i.squares[q],S.isEmpty())throw new Error(v.illegalMove);if(m=S.piece,r=e.substr(3,2),o=i.squares[r],c=o.isEmpty(),c||(s=o.piece),i.movePiece(m,S,o,n,!c,s),m.remove(),m.put(o),w.test(e)&&m.name[1]===h.blackKing){switch(r[0]){case h.columns[2]:P=h.columns[0],k=h.columns[3];break;case h.columns[6]:P=h.columns[7],k=h.columns[5]}k+=r[1],P+=r[1],i.squares[P].isEmpty()||(p=i.squares[P].piece,i.movePiece(p,i.squares[P],i.squares[k]),p.remove(),p.put(i.squares[k]))}else if(m.name[1]===h.blackPawn)if(b.test(e)&&c&&q[0]!==r[0]){switch(u=r[0],r[1]){case"3":u+="4";break;case"6":u+="5"}l=i.squares[u],l.isEmpty()||(l.piece.fadingRemove(),l.piece.remove())}else C.test(e)&&(t=t||h.blackQueen,g="1"===r[1]?h.black:h.white,d=g+t.toLowerCase(),E=i.imagesPath+d+i.imagesExtension,f=new a(d,E),m.fadingRemove(),m.remove(),f.fadingPlace(o),f.put(o))},i.unlock=function(){i.clickablePieces=t.clickable,i.draggablePieces=t.draggable},i}function o(){var e={Event:"?",Site:"?",Date:"????.??.??",Round:"?",White:"?",Black:"?",Result:"*"},t={},a={};return Object.keys(e).forEach(function(n){t[n]=e[n]}),a={comments:[],fenStrings:[h.defaultFEN],moves:[],pgnMoves:[],tags:t},a.getNthPosition=function(e){var t="",r=0;if(r=a.fenStrings.length-1,"number"!=typeof e||0>e||e>r)throw new Error(v.invalidParameter);return t=a.fenStrings[e],new n(t)},a.getPGN=function(){var e=0,n="\n",r="",i="";return Object.keys(t).forEach(function(e){var a=t[e];r+="["+e+' "'+a+'"]'+n}),r+=n,a.pgnMoves.forEach(function(t,a){var i=80,o="";a%2===0&&(o=a/2+1+"."),e+=o.length+1,e>i&&(r+=n,e=0),r+=o+" ",e+=t.length+1,e>i&&(r+=n,e=0),r+=t+" "}),i=a.getInfo("Result"),r+=i},a.getInfo=function(e){return t[e]},a.isInCheck=function(e){var t="",n={};return n=a.getNthPosition(e),t=n.activeColor,n.isInCheck(t)},a.isLegal=function(e,t){var n={};return y.test(t)?(n=a.getNthPosition(e),n.checkMoveLegality(t)):!1},a.play=function(e,t){var n={},r=!1,i=!1,o=!1,s=0,c={},u="",l="";if(!y.test(e))throw new SyntaxError(v.invalidParameter);if(s=a.fenStrings.length-1,n=a.getNthPosition(s),n.checkMoveLegality(e))return t=t||"",c=n.getNextPosition(e,t),a.fenStrings.push(c.fenString),a.moves.push(e),i=c.isInCheck(c.activeColor),o=!c.hasLegalMoves(),r=c.isDrawByInsufficientMaterial()||c.isDrawBy50MovesRule(),i?o?(l=h.checkmateSymbol,c.activeColor===h.black?a.setTag("Result",h.resultWhite):a.setTag("Result",h.resultBlack)):l=h.checkSymbol:o?a.setTag("Result",h.resultDraw):r&&a.setTag("Result",h.resultDraw),u=n.getPGNMove(e,t,!1,l),a.pgnMoves.push(u),c.fenString;throw new Error(v.illegalMove)},a.setPGN=function(n){var r=[],i=[];if(!o.isValidPGN(n))throw new SyntaxError(v.invalidPGN);for(Object.keys(e).forEach(function(n){t[n]=e[n]}),a.fenStrings=[h.defaultFEN],a.moves=[],a.pgnMoves=[],a.tags=t,i=n.match(E),i.forEach(function(e){var t=[],n=/\[([^]+)\s"([^]*)"/gm;t=n.exec(e),a.setTag(t[1],t[2])});k.test(n);)n=n.replace(k,"");for(;N.test(n);)n=n.replace(N,"");n=n.replace(/\s{2,}/gm," "),r=n.match(S),r.forEach(function(e){e=e.replace(/[1-9][0-9]*\.(?:\.\.)?\s?/,""),a.pgnMoves.push(e)}),a.pgnMoves.forEach(function(e){var t={},n=0,r="",i={},o="",s="";n=a.fenStrings.length-1,t=a.getNthPosition(n),s=t.getSimpleNotation(e),-1!==s.indexOf(h.promotionSymbol)&&(o=s[s.length-1],s=s.replace(/\=[BNQR]$/,"")),i=t.getNextPosition(s,o),r=i.fenString,a.moves.push(s),a.fenStrings.push(r)})},a.setTag=function(e,n){t[e]=n},a}function s(e,n){var a=[],r="",i="",o="",s="",c=0,u={},l=[];if(!f.isNavigating){if(c=g.fenStrings.length-1,0>e||e>c)throw new Error(v.invalidParameter);u=g.getNthPosition(e),n&&(a=f.getAnimations(u),l=f.getSimilarPieces(u),f.addNavigationData(a,l),f.animateNavigation(a),c>e?f.lock():f.unlock()),f.clearMarks(),t.markLastMove&&e>0&&(i=g.moves[e-1],s=i.substr(0,2),o=i.substr(3,2),f.highlightSquares([s,o])),t.markKingInCheck&&u.isInCheck(u.activeColor)&&(r=u.getKingSquare(u.activeColor),f.markSquares([r]))}}function c(e){var n=[],a={},r=0;null===f.selectedSquare?f.selectedSquare=e:f.selectedSquare=null,t.markSelectedSquare&&f.squares[e].select(),t.markLegalSquares&&(r=g.fenStrings.length-1,a=g.getNthPosition(r),n=a.getLegalSquares(e),f.displayCanvas(n))}function u(e,t,n){var a=0;f.play(e,n,t),g.play(e,n),a=g.fenStrings.length-1,s(a,!1),"function"==typeof p.onMovePlayed&&O(p.onMovePlayed)}function l(e,t,n){var a="",r="",i=0,o="",s={};if("boolean"!=typeof n&&(n=!1),r=e+"-"+t,!y.test(r))throw new Error(v.invalidParameter);return i=g.fenStrings.length-1,g.isLegal(i,r)?(s=g.getNthPosition(i),o=s.occupiedSquares[e],C.test(r)&&o.toLowerCase()===h.blackPawn?(f.pendingMove=r,a="8"===t[1]?h.white:h.black,f.askPromotion(a)):u(r,n),!0):!1}var f={},g={},h={black:"b",blackBishop:"b",blackKing:"k",blackKnight:"n",blackPawn:"p",blackQueen:"q",blackRook:"r",captureSymbol:"x",castleKingSymbol:"O-O",castleQueenSymbol:"O-O-O",checkSymbol:"+",checkmateSymbol:"#",columns:"abcdefgh",defaultFEN:"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",promotionSymbol:"=",resultBlack:"0-1",resultDraw:"1/2-1/2",resultWhite:"1-0",white:"w",whiteBishop:"B",whiteKing:"K",whiteKnight:"N",whitePawn:"P",whiteQueen:"Q",whiteRook:"R"},d={blackSquare:"square_black",bottomBorder:"bottom-border",bottomBorderFragment:"bottom-border__fragment",ghostPiece:"ghost_piece",highlightedSquare:"square_highlighted",markedSquare:"square_marked",overflownSquare:"square_overflown",promotionButton:"promotion-button",promotionDiv:"promotion-div",rightBorder:"right-border",rightBorderFragment:"right-border__fragment",selectedSquare:"square_selected",square:"square",squareCanvas:"square__canvas",squarePiece:"square__piece",squaresDiv:"squares-div",whiteSquare:"square_white"},m={animationSpeed:"normal",clickable:!0,draggable:!0,flipped:!1,imagesExtension:".png",imagesPath:"images/wikipedia/",legalMarksColor:"steelblue",markKingInCheck:!0,markLastMove:!0,markLegalSquares:!0,markOverflownSquare:!0,markSelectedSquare:!0,notationBorder:!0,width:360},v={illegalMove:"Illegal move.",invalidFEN:"Invalid FEN string.",invalidParameter:"Invalid parameter.",invalidPGN:"Invalid PGN."},p={onMovePlayed:null},w=/^e(?:1-c1|1-g1|8-c8|8-g8)$/,k=/\{[^]+?\}/gm,b=/^[a-h]4-[a-h]3|[a-h]5-[a-h]6$/,P=/^(?:[bBkKnNpPqQrR1-8]{1,8}\/){7}[bBkKnNpPqQrR1-8]{1,8}\s(w|b)\s(KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q|-)\s([a-h][36]|-)\s(0|[1-9]\d*)\s([1-9]\d*)$/,q=/^[bknpqr1]{8}|[bknpqr12]{7}|[bknpqr1-3]{6}|[bknpqr1-4]{5}|[bknpqr1-5]{4}|[bknpqr1-6]{3}|[bknpqr]7|7[bknpqr]|8$/i,y=/^[a-h][1-8]-[a-h][1-8]$/,S=/(?:[1-9][0-9]*\.{1,3}\s*)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm,C=/^[a-h]2-[a-h]1|[a-h]7-[a-h]8$/,E=/\[[A-Z][^]+?\s"[^]+?"\]/gm,N=/\([^()]*?\)/gm,O=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||function(e){return window.setTimeout(e,1e3/60)};return n.fenToObject=function(e){var t={},n=/[1-8]/,a=/[bknpqr]/i,r="",i=[];return r=e.replace(/\s.*/,""),i=r.split("/"),i.forEach(function(e,r){var i=1,o=8-r;e.split("").forEach(function(e){var r="";if(a.test(e))r=h.columns[i-1]+o,t[r]=e,i+=1;else{if(!n.test(e))throw new Error(v.invalidFEN);i+=Number(e)}})}),t},n.isValidFEN=function(e,t){var n=e.replace(/\s.*/,"").split("/");return t=t||!1,t||P.test(e)?n.every(function(e){return q.test(e)}):!1},n.objectToFEN=function(e){var t=0,n=0,a="",r=0,i="";for(r=8;r>0;){for(t=1,n=0;9>t;)i=h.columns[t-1]+r,e.hasOwnProperty(i)?(n>0&&(a+=n,n=0),a+=e[i]):n+=1,8===t&&(n>0&&(a+=n),r>1&&(a+="/")),t+=1;r-=1}return a},r.isWhite=function(e){var t=0,n=0;return t=h.columns.indexOf(e[0])+1,n=Number(e[1]),n%2===0?t%2===1:t%2===0},o.isValidPGN=function(e){function t(e){return a.test(e)}var n=[],a=/(?:[1-9][0-9]*\.(?:\.\.)?\s*)?(?:O-O(?:-O)?|(?:[BNQR][a-h]?[1-8]?|K)x?[a-h][1-8]|(?:[a-h]x)?[a-h][1-8](?:\=[BNQR])?)(?:\+|#)?/gm,r=/1-0|0-1|1\/2-1\/2|\*/,i=/(?:\[[^]+?\s"[^]+?"\]\s+){7,}\s+/gm,o=[];if(!i.test(e))return!1;for(e=e.replace(i,"");k.test(e);)e=e.replace(k,"");for(;N.test(e);){if(o=e.match(N),!o.every(t))return!1;e=e.replace(N,"")}return n=e.match(a),n.length<1?!1:(e=e.replace(a,""),r.test(e))},t=t||{},Object.keys(m).forEach(function(e){t.hasOwnProperty(e)||(t[e]=m[e])}),f=new i(e,t),g=new o,f.onMouseMove=function(e){var t={},n={},a=0,r=0,i=0;f.isDragging&&(t=f.squares[f.selectedSquare],n=t.piece.ghost,a=Math.floor(f.width/8),r=e.clientX+window.pageXOffset-a/2,i=e.clientY+window.pageYOffset-a/2,n.style.left=r+"px",n.style.top=i+"px")},f.onMouseUp=function(){var e=[],t=[],n={};f.isDragging&&(n=f.squares[f.selectedSquare],t=n.piece.getGhostCoordinate(),e=n.getCoordinate(),f.animateGhost(n.piece,t,e),null!==f.selectedSquare&&c(f.selectedSquare),f.isDragging=!1)},f.onPieceMouseDown=function(e,t){var n=0,a=0,r=0;if(e.preventDefault(),f.draggablePieces&&0===e.button){if(f.isDragging=!0,t.div.style.opacity="0",n=Math.floor(f.width/8),t.ghost.style.height=n+"px",t.ghost.style.width=n+"px",a=e.clientX+window.pageXOffset-n/2,r=e.clientY+window.pageYOffset-n/2,t.ghost.style.left=a+"px",t.ghost.style.top=r+"px",document.body.appendChild(t.ghost),f.markOverflownSquare&&t.square.overfly(),f.selectedSquare===t.square.name)return void(f.hasDraggedClickedSquare=!0);null!==f.selectedSquare&&c(f.selectedSquare),c(t.square.name)}},f.onPromotionChose=function(e){var t=f.pendingMove;u(t,!1,e)},f.onSquareClick=function(e){var t=f.squares[e].isEmpty(),n=f.selectedSquare;f.clickablePieces&&(e===n?c(n):null===n?t||f.hasDraggedClickedSquare||c(e):(c(n),l(n,e)||t||c(e)),f.hasDraggedClickedSquare=!1)},f.onSquareEnter=function(e){f.isDragging&&f.markOverflownSquare&&e.overfly()},f.onSquareLeave=function(e){f.isDragging&&f.markOverflownSquare&&e.overfly()},f.onSquareMouseUp=function(e){var t=[],n=[],a={},r=[],i={};f.isDragging&&(f.markOverflownSquare&&e.overfly(),i=f.squares[f.selectedSquare],c(i.name),a=i.piece,n=i.piece.getGhostCoordinate(),e.name!==i.name&&l(i.name,e.name,!0)?(t=e.getCoordinate(),f.animateGhost(a,n,t)):(r=i.getCoordinate(),f.animateGhost(a,n,r)),f.isDragging=!1)},document.addEventListener("mousemove",f.onMouseMove),document.addEventListener("mouseup",f.onMouseUp),{DEFAULT_FEN:h.defaultFEN,draw:function(){f.createSquares(),f.draw()},flip:function(){var e=f.container;for(f.isFlipped=!f.isFlipped;e.hasChildNodes();)e.removeChild(e.lastChild);f.draw()},getActiveColor:function(e){var t={};return t=g.getNthPosition(e),t.activeColor},getFEN:function(e){var t=0;if(t=g.fenStrings.length-1,"number"!=typeof e||0>e||e>t)throw new Error(v.invalidParameter);return g.fenStrings[e]},getGameInfo:function(e){return g.getInfo(e)},getGameMoves:function(){return g.moves},getGameMovesPGN:function(){return g.pgnMoves},getLastPositionIndex:function(){return g.fenStrings.length-1},getLegalMoves:function(e){var t={};return t=g.getNthPosition(e),t.getLegalMoves()},getPGN:function(){return g.getPGN()},is50MovesDraw:function(e){var t={};return t=g.getNthPosition(e),t.isDrawBy50MovesRule()},isCheckmate:function(e){var t={};return t=g.getNthPosition(e),t.isCheckmate()},isInCheck:function(e){var t="",n={};return n=g.getNthPosition(e),t=n.activeColor,n.isInCheck(t)},isInsufficientMaterialDraw:function(e){var t={};return t=g.getNthPosition(e),t.isDrawByInsufficientMaterial()},isLegal:function(e,t){return g.isLegal(e,t)},isStalemate:function(e){var t="",n={};return n=g.getNthPosition(e),t=n.activeColor,!n.isInCheck(t)&&!n.hasLegalMoves()},isValidFEN:function(e,t){return n.isValidFEN(e,t)},isValidPGN:function(e){return o.isValidPGN(e)},navigate:function(e){return s(e,!0)},onMovePlayed:function(e){if("function"!=typeof e)throw new Error(v.invalidParameter);p.onMovePlayed=e},play:function(e,t){return u(e,!1,t)},reset:function(){f.loadFEN(),f.clearMarks(),g=new o},setFEN:function(e){f.loadFEN(e)},setGameInfo:function(e,t){return g.setTag(e,t)},setPGN:function(e){g.setPGN(e)}}};