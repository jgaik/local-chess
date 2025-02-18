import { getNonNullable } from "@yamori-shared/react-utilities";
import { useChessGame } from "../contexts";
import { Fragment } from "react/jsx-runtime";
import "./chess-history.scss";

type Move = {
  index: number;
  white: string;
  black?: string;
};

const ChessHistoryMove: React.FC<Move> = (move) => (
  <Fragment>
    <span>{move.index}.</span>
    <span>{move.white}</span>
    <span>{move.black}</span>
  </Fragment>
);

export const ChessHistory: React.FC = () => {
  const { moves } = useChessGame();

  const movesList = moves?.reduce<Array<Move>>((acc, currentMove, index) => {
    const newAcc = [...acc];
    if (index % 2 === 0) {
      const move: Move = {
        index: Math.floor(index / 2) + 1,
        white: currentMove,
      };
      newAcc.push(move);
    } else {
      const lastMove = getNonNullable(
        newAcc.at(-1),
        "last move for uneven index"
      );
      lastMove.black = currentMove;
    }
    return newAcc;
  }, []);

  return (
    <div className="chess-history">
      <h6>Moves history</h6>
      {movesList.map((move) => (
        <ChessHistoryMove key={move.index} {...move} />
      ))}
    </div>
  );
};
