import {
  ElementRef,
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChessGame,
  ChessGameState,
  ChessMove,
  ChessSquareString,
  PROMOTION_PIECES,
} from "../chess-game-service";
import { ChessGameContextValue, ChessGameContext } from "../contexts";
import {
  assertNonNullable,
  getNonNullable,
} from "@yamori-shared/react-utilities";

const chessGame = new ChessGame();

export const ChessGameProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const dialogRef = useRef<ElementRef<"dialog">>(null);
  const dialogContentRef = useRef<ElementRef<"div">>(null);
  const promotionPromiseResolve =
    useRef<(value: ChessMove["promotion"]) => void>();
  const [gameState, setGameState] = useState<ChessGameState>(
    () => chessGame.gameState
  );
  const [selectedSquare, setSelectedSquare] =
    useState<ChessSquareString | null>(null);
  const [hoveredMove, setHoveredMove] = useState<ChessMove | null>(null);

  const activeSquares = useMemo(
    () =>
      selectedSquare
        ? gameState.availableMoves[selectedSquare]?.map(
            (move) => move.destinationSquare
          ) ?? []
        : [],
    [gameState.availableMoves, selectedSquare]
  );

  const showPromotionDialog = useCallback(() => {
    dialogRef.current?.showModal();
    return new Promise<ChessMove["promotion"]>((resolve) => {
      promotionPromiseResolve.current = resolve;
    }).finally(() => {
      dialogRef.current?.close();
    });
  }, []);

  const chessGameContextValue = useMemo<ChessGameContextValue>(
    () => ({
      ...gameState,
      activeSquares: hoveredMove
        ? [hoveredMove.destinationSquare]
        : activeSquares,
      selectedSquare: hoveredMove?.startingSquare ?? selectedSquare,
      onMoveClick: (move) => setGameState(chessGame.makeMove(move)),
      onMoveHover: setHoveredMove,
      onActiveSquareClick: (destinationSquare) => {
        assertNonNullable(
          selectedSquare,
          "selectedSquare on active square click"
        );

        const moves = getNonNullable(
          gameState.availableMoves[selectedSquare]?.filter(
            (availableMove) =>
              availableMove.destinationSquare === destinationSquare
          ),
          "moves in available moves on active square click"
        );

        new Promise<ChessMove>((resolve, reject) => {
          if (moves.length === 1) {
            resolve(moves[0]);
          } else {
            showPromotionDialog().then((promotion) => {
              if (promotion)
                resolve(
                  getNonNullable(
                    moves.find((move) => move.promotion === promotion),
                    "promotion move"
                  )
                );
              else {
                reject();
              }
            });
          }
        })
          .then((move) => setGameState(chessGame.makeMove(move)))
          .finally(() => setSelectedSquare(null));
      },
      setSelectedSquare: setSelectedSquare,
    }),
    [gameState, hoveredMove, activeSquares, selectedSquare, showPromotionDialog]
  );

  return (
    <ChessGameContext.Provider value={chessGameContextValue}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={() => promotionPromiseResolve.current?.(undefined)}
        onClick={(event) => {
          if (!dialogContentRef.current?.contains(event.target as Node)) {
            dialogRef.current?.close();
          }
        }}
      >
        <div ref={dialogContentRef}>
          {PROMOTION_PIECES.map((promotionPiece) => (
            <button
              onClick={() => promotionPromiseResolve.current?.(promotionPiece)}
              key={promotionPiece}
            >
              {promotionPiece}
            </button>
          ))}
        </div>
      </dialog>
    </ChessGameContext.Provider>
  );
};
