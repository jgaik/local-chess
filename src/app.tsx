import React from "react";
import {
  Chessboard,
  ChessGameProvider,
  ChessHistory,
  ChessMoves,
} from "./components";
import "./app.scss";
import { BemClassNamesCreator } from "@yamori-shared/react-utilities";
import { NavigationBarLayout } from "@yamori-design/react-components";

export const App: React.FC = () => {
  const bemClassNames = BemClassNamesCreator.create(
    "app",
    undefined,
    "controls"
  );

  return (
    <NavigationBarLayout
      links={[]}
      githubHref="https://github.com/jgaik/local-chess"
    >
      <div className={bemClassNames["app"]}>
        <ChessGameProvider>
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
