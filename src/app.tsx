import React from "react";
import {
  Chessboard,
  ChessGameProvider,
  ChessHistory,
  ChessMoves,
} from "./components";
import "./app.scss";
import { BemClassNamesCreator } from "@yamori-shared/react-utilities";

export const App: React.FC = () => {
  const bemClassNames = BemClassNamesCreator.create(
    "app",
    undefined,
    "controls"
  );

  return (
    <div className={bemClassNames["app"]}>
      <ChessGameProvider>
        <Chessboard />
        <div className={bemClassNames["controls"]}>
          <ChessHistory />
          <ChessMoves />
        </div>
      </ChessGameProvider>
    </div>
  );
};
