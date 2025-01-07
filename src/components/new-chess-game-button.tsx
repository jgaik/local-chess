import { Button, useDialog } from "@yamori-design/react-components";
import { useChessGame } from "../contexts";

type NewChessGameButtonProps = {
  className: string;
  onReset: () => void;
};

export const NewChessGameButton: React.FC<NewChessGameButtonProps> = ({
  className,
  onReset,
}) => {
  const { showConfirmationDialog } = useDialog();
  const { moves } = useChessGame();

  return (
    <Button
      className={className}
      disabled={moves.length === 0}
      onClick={() => {
        showConfirmationDialog(
          "This will reset the current board state. Do You want to continue?",
          { confirmLabel: "Continue", withCancel: true },
          { closeOnOutsideClick: true }
        ).then((confirmed) => {
          if (confirmed) onReset();
        });
      }}
    >
      New game
    </Button>
  );
};
