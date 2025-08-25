import React, { useCallback, useState } from "react";
import {
  Chessboard,
  ChessGameProvider,
  ChessHistory,
  ChessMoves,
} from "./components";
import "./app.scss";
import { BemClassNamesCreator } from "@yamori-shared/react-utilities";
import {
  Button,
  NavigationBarLayout,
  useDialog,
} from "@yamori-design/react-components";
import { SAVED_CHESS_GAME_STATE_STORAGE_KEY } from "./chess-game-service";

export const App: React.FC = () => {
  const { showConfirmationDialog } = useDialog();

  const [gameId, setGameId] = useState<number>(0);
  const bemClassNames = BemClassNamesCreator.create(
    "app",
    undefined,
    "controls"
  );

  const onReset = useCallback(() => {
    localStorage.removeItem(SAVED_CHESS_GAME_STATE_STORAGE_KEY);
    setGameId((prev) => prev + 1);
  }, []);

  return (
    <NavigationBarLayout
      controls={
        <Button
          variant="text"
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
      }
      githubHref="https://github.com/jgaik/local-chess"
    >
      <div className={bemClassNames["app"]}>
        <ChessGameProvider key={gameId} onReset={onReset}>
          <Chessboard />
          <div className={bemClassNames["controls"]}>
            <ChessHistory />
            <ChessMoves />
          </div>
        </ChessGameProvider>
      </div>
    </NavigationBarLayout>
  );
};
