import React, { useState } from "react";
import {
  Chessboard,
  ChessGameProvider,
  ChessHistory,
  ChessMoves,
} from "./components";
import "./app.scss";
import { BemClassNamesCreator } from "@yamori-shared/react-utilities";
import { Button, NavigationBarLayout } from "@yamori-design/react-components";

export const App: React.FC = () => {
  const [gameId, setGameId] = useState<number>(0);
  const bemClassNames = BemClassNamesCreator.create(
    "app",
    undefined,
    "controls",
    "button"
  );

  return (
    <NavigationBarLayout
      links={[]}
      githubHref="https://github.com/jgaik/local-chess"
    >
      <div className={bemClassNames["app"]}>
        <ChessGameProvider key={gameId}>
          <Chessboard />
          <div className={bemClassNames["controls"]}>
            <ChessHistory />
            <ChessMoves />
            <Button
              className={bemClassNames["button"]}
              onClick={() => setGameId(gameId + 1)}
            >
              New game
            </Button>
          </div>
        </ChessGameProvider>
      </div>
    </NavigationBarLayout>
  );
};
