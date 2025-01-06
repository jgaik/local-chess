import {
  ComponentRef,
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
} from "../chess-game-service";
import { ChessGameContextValue, ChessGameContext } from "../contexts";
import { assertNonNullable } from "@yamori-shared/react-utilities";
import { ChessPromotionDialog } from "./chess-promotion-dialog";

export const ChessGameProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const chessGame = useMemo(() => new ChessGame(), []);

  const dialogRef = useRef<ComponentRef<typeof ChessPromotionDialog>>(null);
  const promotionPromiseResolve =
    useRef<(value: ChessMove["promotion"]) => void>(undefined);

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

        const moves = gameState.availableMoves[selectedSquare]?.filter(
          (availableMove) =>
            availableMove.destinationSquare === destinationSquare
        );

        Promise.resolve(
          moves?.length === 1
            ? moves[0]
            : showPromotionDialog().then((promotion) =>
                promotion
                  ? moves?.find((move) => move.promotion === promotion)
                  : undefined
              )
        )
          .then((move) => {
            if (move) setGameState(chessGame.makeMove(move));
          })
          .finally(() => setSelectedSquare(null));
      },
      setSelectedSquare,
    }),
    [
      gameState,
      hoveredMove,
      activeSquares,
      selectedSquare,
      chessGame,
      showPromotionDialog,
    ]
  );

  return (
    <ChessGameContext.Provider value={chessGameContextValue}>
      {children}
      <ChessPromotionDialog
        activePlayer={gameState.activePlayer}
        onPromotion={(promotion) =>
          promotionPromiseResolve.current?.(promotion)
        }
        ref={dialogRef}
      />
    </ChessGameContext.Provider>
  );
};
