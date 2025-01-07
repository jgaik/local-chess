import React, { useCallback, useState } from "react";
import {
  Chessboard,
  ChessGameProvider,
  ChessHistory,
  ChessMoves,
  NewChessGameButton,
} from "./components";
import "./app.scss";
import { BemClassNamesCreator } from "@yamori-shared/react-utilities";
import { NavigationBarLayout } from "@yamori-design/react-components";
import { SAVED_CHESS_GAME_STATE_STORAGE_KEY } from "./chess-game-service";

export const App: React.FC = () => {
  const [gameId, setGameId] = useState<number>(0);
  const bemClassNames = BemClassNamesCreator.create(
    "app",
    undefined,
    "controls",
    "button"
  );

  const onReset = useCallback(() => {
    localStorage.removeItem(SAVED_CHESS_GAME_STATE_STORAGE_KEY);
    setGameId((prev) => prev + 1);
  }, []);

  return (
    <NavigationBarLayout
      links={[]}
      githubHref="https://github.com/jgaik/local-chess"
    >
      <div className={bemClassNames["app"]}>
        <ChessGameProvider key={gameId} onReset={onReset}>
          <Chessboard />
          <div className={bemClassNames["controls"]}>
            <ChessHistory />
            <ChessMoves />
            <NewChessGameButton
              className={bemClassNames["button"]}
              onReset={onReset}
            />
          </div>
        </ChessGameProvider>
      </div>
    </NavigationBarLayout>
  );
};
