import {
  ComponentRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChessGame,
  ChessGameState,
  ChessMove,
  ChessSquareString,
  SAVED_CHESS_GAME_STATE_STORAGE_KEY,
  SavedChessGameState,
} from "../chess-game-service";
import { ChessGameContextValue, ChessGameContext } from "../contexts";
import { assertNonNullable } from "@yamori-shared/react-utilities";
import { ChessPromotionDialog } from "./chess-promotion-dialog";
import { useDialog } from "@yamori-design/react-components";

type ChessGameProviderProps = PropsWithChildren<{
  onReset: () => void;
}>;

export const ChessGameProvider: React.FC<ChessGameProviderProps> = ({
  children,
  onReset,
}) => {
  const { showConfirmationDialog } = useDialog();

  const chessGame = useMemo(() => {
    const savedGameState = localStorage.getItem(
      SAVED_CHESS_GAME_STATE_STORAGE_KEY
    );

    return new ChessGame(savedGameState && JSON.parse(savedGameState));
  }, []);

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

  const makeMove = useCallback(
    (move: ChessMove) => {
      const newState = chessGame.makeMove(move);
      setGameState(newState);
      localStorage.setItem(
        SAVED_CHESS_GAME_STATE_STORAGE_KEY,
        JSON.stringify({
          position: newState.position,
          moves: newState.moves,
          lastMove: move,
        } satisfies SavedChessGameState)
      );
    },
    [chessGame]
  );

  const chessGameContextValue = useMemo<ChessGameContextValue>(
    () => ({
      ...gameState,
      activeSquares: hoveredMove
        ? [hoveredMove.destinationSquare]
        : activeSquares,
      selectedSquare: hoveredMove?.startingSquare ?? selectedSquare,
      onMoveClick: makeMove,
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
            if (move) makeMove(move);
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
      makeMove,
      showPromotionDialog,
    ]
  );

  useEffect(() => {
    if (gameState.result === undefined) return;

    showConfirmationDialog(
      gameState.result
        ? `Winner: ${gameState.result.toUpperCase()}`
        : "Game ended with a DRAW",
      {
        confirmLabel: "New game",
        withCancel: true,
      },
      { closeOnOutsideClick: true }
    ).then((confirmed) => {
      if (confirmed) onReset();
    });
  }, [gameState.result, onReset, showConfirmationDialog]);

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
