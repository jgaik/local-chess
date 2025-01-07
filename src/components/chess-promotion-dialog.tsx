import { Dialog } from "@yamori-design/react-components";
import { Ref } from "react";
import {
  ChessMove,
  ChessPlayer,
  PROMOTION_PIECES,
} from "../chess-game-service";
import { ChessSquare } from "./chess-square";
import "./chess-promotion-dialog.scss";

type ChessPromotionDialogProps = {
  onPromotion: (promotion: ChessMove["promotion"]) => void;
  activePlayer: ChessPlayer;
  ref?: Ref<HTMLDialogElement>;
};

export const ChessPromotionDialog: React.FC<ChessPromotionDialogProps> = ({
  activePlayer,
  onPromotion,
  ref,
}) => (
  <Dialog
    ref={ref}
    onClose={() => onPromotion(undefined)}
    closeOnOutsideClick
    className="chess-promotion-dialog"
  >
    {PROMOTION_PIECES.map((promotionPiece) => (
      <ChessSquare
        onClick={() => onPromotion(promotionPiece)}
        key={promotionPiece}
        color={activePlayer}
        value={promotionPiece}
      />
    ))}
  </Dialog>
);
