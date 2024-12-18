import React, { useMemo, useState } from "react";
import "./chessboard.scss";
import {
  CHESSBOARD_FILES,
  CHESSBOARD_RANKS,
  ChessGame,
  ChessSquareString,
} from "../chess-game-service";
import { useChessGame } from "../contexts";
import { BemClassNamesCreator } from "@yamori-shared/react-utilities";
import { ChessSquare } from "./chess-square";

const CHESSBOARD_SQUARES = new Array(64)
  .fill(null)
  .map(
    (_, index) =>
      `${CHESSBOARD_FILES[index % 8]}${
        8 - Math.floor(index / 8)
      }` as ChessSquareString
  );

const ChessboardSquare: React.FC<{ squareString: ChessSquareString }> = ({
  squareString,
}) => {
  const {
    activePlayer,
    activeSquares,
    currentPosition,
    selectedSquare,
    onActiveSquareClick,
    setSelectedSquare,
  } = useChessGame();

  const value = currentPosition[squareString];
  const player = ChessGame.getSquareValuePlayer(value);
  const isActive = activeSquares.some(
    (activeSquare) => activeSquare === squareString
  );
  const isSelected = selectedSquare === squareString;
  const disabled = !isActive && (!value || activePlayer !== player);

  return (
    <ChessSquare
      color={player}
      aria-disabled={disabled}
      value={value}
      isActive={isActive ? activePlayer : undefined}
      isSelected={isSelected}
      onClick={() => {
        if (isActive) {
          onActiveSquareClick(squareString);
          return;
        }
        if (isSelected || disabled) setSelectedSquare(null);
        else setSelectedSquare(squareString);
      }}
      id={squareString}
      observeSize
    />
  );
};

export const Chessboard: React.FC = () => {
  const [flipped, setFlipped] = useState(false);

  const bemClassNames = useMemo(
    () =>
      BemClassNamesCreator.create(
        "chessboard",
        undefined,
        "switch",
        "files",
        ["ranks", { flipped }],
        "squares"
      ),
    [flipped]
  );

  const squares = useMemo(
    () => (flipped ? CHESSBOARD_SQUARES.toReversed() : CHESSBOARD_SQUARES),
    [flipped]
  );

  return (
    <div className={bemClassNames["chessboard"]}>
      <button
        className={bemClassNames["switch"]}
        onClick={() => setFlipped(!flipped)}
        role="switch"
        aria-checked={flipped}
      >
        <div />
        <div />
      </button>
      <div className={bemClassNames["files"]}>
        {CHESSBOARD_FILES.map((file) => (
          <span key={file}>{file}</span>
        ))}
      </div>
      <div className={bemClassNames["ranks"]}>
        {CHESSBOARD_RANKS.map((rank) => (
          <span key={rank}>{rank}</span>
        ))}
      </div>
      <div className={bemClassNames["squares"]}>
        {squares.map((square) => (
          <ChessboardSquare key={square} squareString={square} />
        ))}
      </div>
    </div>
  );
};
