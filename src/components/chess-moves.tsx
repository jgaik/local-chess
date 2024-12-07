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
              <button
                onMouseEnter={() => onMoveHover(move)}
                onMouseLeave={() => onMoveHover(null)}
                onClick={() => onMoveClick(move)}
              >
                {move.notation}
              </button>
            </li>
          ))}
      </ul>
    </details>
  );
};
