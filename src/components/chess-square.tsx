import { Nullable, BemClassNamesCreator } from "@yamori-shared/react-utilities";
import {
  ComponentPropsWithoutRef,
  memo,
  useRef,
  ComponentRef,
  useMemo,
  useLayoutEffect,
} from "react";
import { ChessPlayer, ChessSquareValue } from "../chess-game-service";
import "./chess-square.scss";

type ChessSquareProps = {
  color: ChessPlayer | undefined;
  value: Nullable<ChessSquareValue>;
  isActive?: ChessPlayer | undefined;
  isSelected?: boolean;
  observeSize?: boolean;
} & Omit<ComponentPropsWithoutRef<"button">, "value" | "style">;

export const ChessSquare: React.FC<ChessSquareProps> = memo(function ({
  color,
  value,
  isActive,
  isSelected,
  observeSize,
  ...buttonProps
}) {
  const buttonRef = useRef<ComponentRef<"button">>(null);
  const buttonContentRef = useRef<ComponentRef<"div">>(null);

  const bemClassNames = useMemo(
    () =>
      BemClassNamesCreator.create(
        ["chess-square", { selected: isSelected }],
        undefined,
        ["content", { active: isActive }]
      ),
    [isActive, isSelected]
  );

  useLayoutEffect(() => {
    if (!observeSize || !buttonRef.current || !buttonContentRef.current) return;

    const buttonNode = buttonRef.current;
    const buttonContentNode = buttonContentRef.current;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const blockSize = entry.borderBoxSize[0].blockSize;

      document.documentElement.style.setProperty(
        "--chess-piece-font-size",
        `${Math.floor(blockSize / 2)}px`
      );

      document.documentElement.style.setProperty(
        "--chess-square-size",
        `${blockSize}px`
      );

      // buttonNode.style.fontSize = `${Math.floor(blockSize / 2)}px`;
      buttonContentNode.style.borderWidth = `${Math.max(
        Math.floor(blockSize / 20),
        1
      )}px`;
    });

    resizeObserver.observe(buttonNode);

    return () => {
      resizeObserver.disconnect();
    };
  }, [observeSize]);

  return (
    <button
      ref={buttonRef}
      className={bemClassNames["chess-square"]}
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
