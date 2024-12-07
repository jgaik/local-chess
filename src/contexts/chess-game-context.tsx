import { createContext, Dispatch, SetStateAction, useContext } from "react";
import {
  ChessGameState,
  ChessMove,
  ChessSquareString,
} from "../chess-game-service";
import { getNonNullable } from "@yamori-shared/react-utilities";

export type ChessGameContextValue = ChessGameState & {
  selectedSquare: ChessSquareString | null;
  activeSquares: ChessSquareString[];
  onActiveSquareClick: (square: ChessSquareString) => void;
  setSelectedSquare: Dispatch<SetStateAction<ChessSquareString | null>>;
  onMoveClick: (move: ChessMove) => void;
  onMoveHover: (move: ChessMove | null) => void;
};

export const ChessGameContext = createContext<ChessGameContextValue | null>(
  null
);

export function useChessGame() {
  const chessGameValue = useContext(ChessGameContext);

  return getNonNullable(chessGameValue, "ChessGameContextValue");
}
