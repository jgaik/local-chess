import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./chessboard.scss";
import {
  CHESSBOARD_FILES,
  CHESSBOARD_RANKS,
  ChessGame,
  ChessPlayer,
  ChessSquareString,
  ChessSquareValue,
} from "../chess-game-service";
import { useChessGame } from "../contexts";
import { BemClassNamesCreator, Nullable } from "@yamori-shared/react-utilities";

const CHESSBOARD_SQUARES = new Array(64)
  .fill(null)
  .map(
    (_, index) =>
      `${CHESSBOARD_FILES[index % 8]}${
        8 - Math.floor(index / 8)
      }` as ChessSquareString
  );

const ChessboardSquareButton: React.FC<
  {
    color: ChessPlayer | undefined;
    value: Nullable<ChessSquareValue>;
    isActive: ChessPlayer | undefined;
    isSelected: boolean;
  } & Omit<ComponentPropsWithoutRef<"button">, "value" | "style">
> = memo(function ({ color, value, isActive, isSelected, ...buttonProps }) {
  const buttonRef = useRef<ElementRef<"button">>(null);
  const buttonContentRef = useRef<ElementRef<"div">>(null);

  const bemClassNames = useMemo(
    () =>
      BemClassNamesCreator.create(
        ["chessboard-square-button", { selected: isSelected }],
        undefined,
        ["content", { active: isActive }]
      ),
    [isActive, isSelected]
  );

  useLayoutEffect(() => {
    if (!buttonRef.current || !buttonContentRef.current) return;

    const buttonNode = buttonRef.current;
    const buttonContentNode = buttonContentRef.current;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const blockSize = entry.borderBoxSize[0].blockSize;

      buttonNode.style.fontSize = `${Math.floor(blockSize / 2)}px`;
      buttonContentNode.style.borderWidth = `${Math.max(
        Math.floor(blockSize / 20),
        1
      )}px`;
    });

    resizeObserver.observe(buttonRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      className={bemClassNames["chessboard-square-button"]}
      style={{
        color,
      }}
      {...buttonProps}
    >
      <div
        ref={buttonContentRef}
        className={bemClassNames["content"]}
        style={{
          borderColor: isActive,
        }}
      >
        {value?.toUpperCase()}
      </div>
    </button>
  );
});

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
    <ChessboardSquareButton
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
    />
  );
};

export const Chessboard: React.FC = () => {
  const [flipped, setFlipped] = useState(false);

  const bemClassNames = BemClassNamesCreator.create(
    "chessboard",
    undefined,
    "switch",
    "files",
    ["ranks", { flipped }],
    "squares"
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
