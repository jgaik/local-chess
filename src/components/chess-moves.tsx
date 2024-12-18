import { Button } from "@yamori-design/react-components";
import { useChessGame } from "../contexts";
import "./chess-moves.scss";

export const ChessMoves: React.FC = () => {
  const { availableMoves, onMoveClick, onMoveHover } = useChessGame();

  return (
    <details className="chess-moves">
      <summary>Available Moves</summary>
      <ul>
        {Object.values(availableMoves)
          .flat()
          .map((move) => (
            <li key={move.notation}>
              <Button
                onMouseEnter={() => onMoveHover(move)}
                onMouseLeave={() => onMoveHover(null)}
                onClick={() => {
                  onMoveClick(move);
                  onMoveHover(null);
                }}
                variant="text"
              >
                {move.notation}
              </Button>
            </li>
          ))}
      </ul>
    </details>
  );
};
