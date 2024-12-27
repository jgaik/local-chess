import { Button, Details, List } from "@yamori-design/react-components";
import { useChessGame } from "../contexts";
import "./chess-moves.scss";

export const ChessMoves: React.FC = () => {
  const { availableMoves, onMoveClick, onMoveHover } = useChessGame();

  return (
    <Details className="chess-moves" summary="Available Moves">
      <List>
        {Object.values(availableMoves)
          .flat()
          .map((move) => (
            <List.Item
              key={move.notation}
              label={
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
              }
            />
          ))}
      </List>
    </Details>
  );
};
