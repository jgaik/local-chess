import {
  getNonNullable,
  getTypedObjectEntries,
  nilFilter,
  Nullable,
} from "@yamori-shared/react-utilities";

export type ChessPlayer = "white" | "black";

export type ChessPiece = "K" | "Q" | "R" | "B" | "N" | "P";

type ChessCastlingStatus = boolean | "short" | "long";

type Shift = [number, number];

export const PROMOTION_PIECES = [
  "B",
  "N",
  "Q",
  "R",
] satisfies ChessMove["promotion"][];

export const CHESSBOARD_FILES = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
] as const;

export const CHESSBOARD_RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type ChessSquareString =
  `${(typeof CHESSBOARD_FILES)[number]}${(typeof CHESSBOARD_RANKS)[number]}`;

export type ChessMove = {
  piece: ChessPiece;
  startingSquare: ChessSquareString;
  destinationSquare: ChessSquareString;
  notation?: string;
  isCapture?: boolean;
  isCheck?: boolean;
  promotion?: Exclude<ChessPiece, "K" | "P">;
};

export type ChessSquareValue = ChessPiece | Lowercase<ChessPiece>;

export type ChessPosition = Partial<
  Record<ChessSquareString, ChessSquareValue>
>;

export type ChessGameState = {
  activePlayer: ChessPlayer;
  availableMoves: Partial<Record<ChessSquareString, ChessMove[]>>;
  currentPosition: ChessPosition;
  moves: ChessMove[];
};

const STARTING_POSITION: ChessPosition = {
  a1: "R",
  b1: "N",
  c1: "B",
  d1: "Q",
  e1: "K",
  f1: "B",
  g1: "N",
  h1: "R",
  a2: "P",
  b2: "P",
  c2: "P",
  d2: "P",
  e2: "P",
  f2: "P",
  g2: "P",
  h2: "P",
  a7: "p",
  b7: "p",
  c7: "p",
  d7: "p",
  e7: "p",
  f7: "p",
  g7: "p",
  h7: "p",
  a8: "r",
  b8: "n",
  c8: "b",
  d8: "q",
  e8: "k",
  f8: "b",
  g8: "n",
  h8: "r",
};

const PIECE_DIRECTIONS = {
  B: [-1, 1].flatMap((x) => [
    [x, x],
    [-x, x],
  ]),
  R: [-1, 1].flatMap((x) => [
    [x, 0],
    [0, x],
  ]),
  Q: [-1, 1].flatMap((x) => [
    [x, 0],
    [0, x],
    [x, x],
    [-x, x],
  ]),
} satisfies Partial<Record<ChessPiece, Array<Shift>>>;

class ChessSquare {
  constructor(private fileIndex: number, private rankIndex: number) {}

  static fromString(squareString: ChessSquareString) {
    return new ChessSquare(
      CHESSBOARD_FILES.indexOf(
        squareString[0] as (typeof CHESSBOARD_FILES)[number]
      ),
      Number(squareString[1]) - 1
    );
  }

  static fromFileRank(
    fileIndex: number,
    rankIndex: number
  ): ChessSquare | null {
    if (fileIndex > 7 || rankIndex > 7 || fileIndex < 0 || rankIndex < 0)
      return null;

    return new ChessSquare(fileIndex, rankIndex);
  }

  static difference(
    a: ChessSquareString | ChessSquare,
    b: ChessSquareString | ChessSquare
  ): [fileDiff: number, rankDiff: number] {
    const getChessSquare = (input: ChessSquareString | ChessSquare) =>
      typeof input === "string" ? ChessSquare.fromString(input) : input;
    const aSquare = getChessSquare(a);
    const bSquare = getChessSquare(b);
    return [
      aSquare.fileIndex - bSquare.fileIndex,
      aSquare.rankIndex - bSquare.rankIndex,
    ];
  }

  public get file() {
    return CHESSBOARD_FILES[this.fileIndex];
  }

  public get rank() {
    return (this.rankIndex + 1) as (typeof CHESSBOARD_RANKS)[number];
  }
  public toString(): ChessSquareString {
    return `${this.file}${this.rank}`;
  }

  public toShifted(fileShift: number, rankShift: number): ChessSquare | null {
    return ChessSquare.fromFileRank(
      this.fileIndex + fileShift,
      this.rankIndex + rankShift
    );
  }
}

export class ChessGame {
  static getSquareValuePlayer(
    squareValue: Nullable<ChessSquareValue>
  ): ChessPlayer | undefined {
    if (!squareValue) return;
    return squareValue === squareValue.toLowerCase() ? "black" : "white";
  }

  public get gameState(): ChessGameState {
    return {
      activePlayer: this.activePlayer,
      currentPosition: this.currentPosition,
      availableMoves: this.availableMoves,
      moves: this.moves,
    };
  }

  public makeMove(move: ChessMove) {
    this.updateCastlingStatus(move);

    const nextPosition = this.getNextPosition(move);

    this.positions.push(nextPosition);
    this.moves.push(move);

    return this.gameState;
  }

  private positions: Array<ChessPosition> = [STARTING_POSITION];

  private moves: Array<ChessMove> = [];

  private castlingStatus: Record<ChessPlayer, ChessCastlingStatus> = {
    white: true,
    black: true,
  };

  private get activePlayer(): ChessPlayer {
    return this.moves.length % 2 === 0 ? "white" : "black";
  }

  private get inactivePlayer(): ChessPlayer {
    return this.moves.length % 2 === 0 ? "black" : "white";
  }

  private get availableMoves(): Partial<
    Record<ChessSquareString, ChessMove[]>
  > {
    const pieceSquareGetters = this.getPieceDestinationSquaresGetters(
      this.currentPosition
    );

    const notationMap: Record<string, ChessMove[]> = {};

    const movesMap = getTypedObjectEntries(this.currentPosition).reduce<
      Partial<Record<ChessSquareString, ChessMove[]>>
    >((acc, [startingSquare, squareValue]) => {
      const newAcc = { ...acc };
      if (ChessGame.getSquareValuePlayer(squareValue) === this.activePlayer) {
        const piece = getNonNullable(
          this.currentPosition[startingSquare],
          "squareValue"
        ).toUpperCase() as ChessPiece;

        const square = ChessSquare.fromString(startingSquare);

        const destinationSquares = pieceSquareGetters[piece](square).filter(
          (destinationSquare) =>
            !this.isInCheck(
              this.getNextPosition({
                piece,
                startingSquare,
                destinationSquare,
              })
            )
        );

        if (destinationSquares.length > 0) {
          const isCapture = (destinationSquare: ChessSquare) => {
            const hasCaptured =
              ChessGame.getSquareValuePlayer(
                this.currentPosition[destinationSquare.toString()]
              ) === this.inactivePlayer;

            if (piece === "P" && !hasCaptured) {
              return ChessSquare.difference(square, destinationSquare)[0] !== 0;
            }

            return hasCaptured;
          };

          const isCheck = (
            destinationSquare: ChessSquare,
            promotion?: ChessMove["promotion"]
          ) => {
            if (piece === "K") return false;

            const opponentKingValue = this.getSquareValueForPiece(
              "K",
              this.inactivePlayer
            );

            const pieceToCheck = promotion ?? piece;

            switch (pieceToCheck) {
              case "P": {
                const shifts: Shift[] =
                  this.activePlayer === "black"
                    ? [
                        [-1, -1],
                        [1, -1],
                      ]
                    : [
                        [-1, 1],
                        [-1, 1],
                      ];

                return shifts.some((shift) => {
                  const shifted = destinationSquare.toShifted(...shift);

                  return (
                    shifted &&
                    this.currentPosition[shifted.toString()] ===
                      opponentKingValue
                  );
                });
              }
              case "N": {
                return pieceSquareGetters[pieceToCheck](destinationSquare).some(
                  (square) => this.currentPosition[square] === opponentKingValue
                );
              }
              case "Q":
              case "R":
              case "B": {
                return PIECE_DIRECTIONS[pieceToCheck].some((direction) =>
                  this.traversePosition(
                    this.currentPosition,
                    destinationSquare,
                    direction,
                    (_, squareValue) => [
                      !squareValue,
                      squareValue === opponentKingValue,
                    ],
                    false
                  )
                );
              }
            }
          };

          newAcc[startingSquare] = destinationSquares.flatMap<ChessMove>(
            (destinationSquare) => {
              const destSquare = ChessSquare.fromString(destinationSquare);

              const moveBase = {
                piece,
                startingSquare,
                destinationSquare,
                isCapture: isCapture(destSquare),
              } satisfies Partial<ChessMove>;

              const moves: ChessMove[] = [];

              if (piece === "P" && [1, 8].includes(destSquare.rank)) {
                moves.push(
                  ...PROMOTION_PIECES.map((promotion) => ({
                    ...moveBase,
                    isCheck: isCheck(destSquare, promotion),
                    promotion,
                  }))
                );
              } else {
                moves.push({
                  ...moveBase,
                  isCheck: isCheck(destSquare),
                });
              }

              return moves.map((move) => {
                const newMove = {
                  ...move,
                  notation: this.getMoveNotation(move),
                };
                if (!["K", "P"].includes(move.piece)) {
                  if (notationMap[newMove.notation]) {
                    notationMap[newMove.notation].push(move);
                  } else {
                    notationMap[newMove.notation] = [move];
                  }
                }
                return newMove;
              });
            }
          );
        }
      }
      return newAcc;
    }, {});

    Object.values(notationMap).forEach((moves) => {
      const updateNotation =
        (disambiguation: Array<"file" | "rank">) => (move: ChessMove) => {
          const mappedMoves = getNonNullable(
            movesMap[move.startingSquare],
            "mapped moves for notation map move"
          );
          movesMap[move.startingSquare] = mappedMoves.map((mappedMove) =>
            mappedMove.destinationSquare !== move.destinationSquare
              ? mappedMove
              : {
                  ...mappedMove,
                  notation: this.getMoveNotation(move, disambiguation),
                }
          );
        };

      switch (moves.length) {
        case 1:
          break;
        case 2: {
          const movesDifference = ChessSquare.difference(
            moves[0].startingSquare,
            moves[1].startingSquare
          );
          moves.forEach(
            updateNotation([movesDifference[0] !== 0 ? "file" : "rank"])
          );
          break;
        }
        default: {
          moves.forEach(updateNotation(["file", "rank"]));
          break;
        }
      }
    });

    return movesMap;
  }

  private get currentPosition() {
    return getNonNullable(this.positions.at(-1), "currentPosition");
  }

  private get lastMove() {
    return this.moves.at(-1);
  }

  private getNextPosition(move: ChessMove): ChessPosition {
    const nextPosition = { ...this.currentPosition };

    switch (move.piece) {
      case "P": {
        // check en passant
        if (move.isCapture && !nextPosition[move.destinationSquare]) {
          delete nextPosition[
            ChessSquare.fromString(
              `${ChessSquare.fromString(move.destinationSquare).file}${
                ChessSquare.fromString(move.startingSquare).rank
              }`
            ).toString()
          ];
        }
        break;
      }
      case "K": {
        // check castling
        const fileShift = ChessSquare.difference(
          move.destinationSquare,
          move.startingSquare
        )[0];

        if (Math.abs(fileShift) > 1) {
          delete nextPosition[
            ChessSquare.fromString(
              `${fileShift > 0 ? "h" : "a"}${
                ChessSquare.fromString(move.destinationSquare).rank
              }`
            ).toString()
          ];

          nextPosition[
            getNonNullable(
              ChessSquare.fromString(move.startingSquare).toShifted(
                fileShift / 2,
                0
              ),
              "chess square for rook when castling"
            ).toString()
          ] = this.getSquareValueForPiece("R", this.activePlayer);
        }
        break;
      }
      default:
        break;
    }

    delete nextPosition[move.startingSquare];

    nextPosition[move.destinationSquare] = this.getSquareValueForPiece(
      move.promotion ?? move.piece,
      this.activePlayer
    );

    return nextPosition;
  }

  private getSquareValueForPiece(
    piece: ChessPiece,
    player: ChessPlayer
  ): ChessSquareValue {
    return player === "white"
      ? piece
      : (piece.toLowerCase() as Lowercase<ChessPiece>);
  }

  private updateCastlingStatus(newMove: ChessMove) {
    let activePlayerCastlingStatus = this.castlingStatus[this.activePlayer];
    if (!activePlayerCastlingStatus) return;

    switch (newMove.piece) {
      case "K":
        activePlayerCastlingStatus = false;
        break;
      case "R": {
        const startingFile = ChessSquare.fromString(
          newMove.startingSquare
        ).file;
        if (startingFile === "a") {
          if (activePlayerCastlingStatus === true) {
            activePlayerCastlingStatus = "short";
          }
          if (activePlayerCastlingStatus === "short") {
            activePlayerCastlingStatus = false;
          }
        } else if (startingFile === "h") {
          if (activePlayerCastlingStatus === true) {
            activePlayerCastlingStatus = "long";
          }
          if (activePlayerCastlingStatus === "long") {
            activePlayerCastlingStatus = false;
          }
        }
        break;
      }
      default:
        break;
    }
    this.castlingStatus[this.activePlayer] = activePlayerCastlingStatus;
  }

  private isInCheck(position: ChessPosition): boolean {
    const kingSquare = ChessSquare.fromString(
      getNonNullable(
        getTypedObjectEntries(position).find(
          ([, squareValue]) =>
            this.getSquareValueForPiece("K", this.activePlayer) === squareValue
        )?.[0],
        "king square for active player"
      )
    );

    const pieceDestinationSquaresGetters =
      this.getPieceDestinationSquaresGetters(position);

    const getSquareCheck =
      (piece: ChessPiece) => (squareString: ChessSquareString) =>
        position[squareString] ===
        this.getSquareValueForPiece(piece, this.inactivePlayer);

    const getTraverseCheck = (piece: "B" | "R") =>
      PIECE_DIRECTIONS[piece].map((direction) =>
        this.traversePosition(
          position,
          kingSquare,
          direction,
          (_, currentSquareValue) => {
            if (!currentSquareValue) {
              return [true, false];
            }
            return [
              false,
              [piece, "Q" as const].some(
                (p) =>
                  this.getSquareValueForPiece(p, this.inactivePlayer) ===
                  currentSquareValue
              ),
            ];
          },
          false
        )
      );

    const pawnDestinationSquares = (
      this.activePlayer === "black"
        ? [
            [-1, -1],
            [1, -1],
          ]
        : [
            [-1, 1],
            [1, 1],
          ]
    )
      .map(([fileShift, rankShift]) =>
        kingSquare.toShifted(fileShift, rankShift)
      )
      .filter(nilFilter)
      .map((square) => square.toString());

    return [
      pawnDestinationSquares.some(getSquareCheck("P")),
      pieceDestinationSquaresGetters["N"](kingSquare).some(getSquareCheck("N")),
      ...getTraverseCheck("B"),
      ...getTraverseCheck("R"),
    ].some(Boolean);
  }

  private getPieceDestinationSquaresGetters(
    position: ChessPosition
  ): Record<ChessPiece, (startingSquare: ChessSquare) => ChessSquareString[]> {
    const getDestinationSquaresFromDirections = (
      startingSquare: ChessSquare,
      directions: Array<Shift>
    ) =>
      directions.reduce<ChessSquareString[]>(
        (acc, direction) => [
          ...acc,
          ...this.traversePosition<ChessSquareString[]>(
            position,
            startingSquare,
            direction,
            (currentSquareString, currentSquareValue, traverseAcc) => {
              const newTraverseAcc = [...traverseAcc];
              let shouldContinue = false;
              if (!currentSquareValue) {
                newTraverseAcc.push(currentSquareString);
                shouldContinue = true;
              } else if (
                ChessGame.getSquareValuePlayer(currentSquareValue) ===
                this.inactivePlayer
              ) {
                newTraverseAcc.push(currentSquareString);
              }
              return [shouldContinue, newTraverseAcc];
            },
            []
          ),
        ],
        []
      );

    const getDestinationSquaresFromShifts = (
      startingSquare: ChessSquare,
      shifts: Array<Shift>
    ) =>
      shifts
        .map((shift) => startingSquare.toShifted(...shift))
        .filter(nilFilter)
        .filter((square) => {
          const destinationSquareValue = position[square.toString()];

          return (
            !destinationSquareValue ||
            ChessGame.getSquareValuePlayer(destinationSquareValue) ===
              this.inactivePlayer
          );
        })
        .map<ChessSquareString>((square) => square.toString());

    return {
      P: (startingSquare) => {
        const [rankShift, rankCheck] =
          this.activePlayer === "black" ? [-1, 7] : [1, 2];

        const possibleDestinationSquares: Array<ChessSquare | null> = [];
        const possibleCapturesSquares: Array<ChessSquare | null> = [
          startingSquare.toShifted(1, rankShift),
          startingSquare.toShifted(-1, rankShift),
        ];

        const standardMoveDestination = startingSquare.toShifted(0, rankShift);

        possibleDestinationSquares.push(standardMoveDestination);

        if (
          startingSquare.rank === rankCheck &&
          standardMoveDestination &&
          !position[standardMoveDestination.toString()]
        ) {
          possibleDestinationSquares.push(
            standardMoveDestination.toShifted(0, rankShift)
          );
        }

        if (this.lastMove?.piece === "P") {
          const [, lastMoveRankDiff] = ChessSquare.difference(
            this.lastMove.startingSquare,
            this.lastMove.destinationSquare
          );

          if (Math.abs(lastMoveRankDiff) === 2) {
            possibleDestinationSquares.push(
              ...[-1, 1]
                .filter(
                  (fileShift) =>
                    startingSquare.toShifted(fileShift, 0)?.toString() ===
                    this.lastMove?.destinationSquare
                )
                .map((fileShift) =>
                  startingSquare.toShifted(fileShift, lastMoveRankDiff / 2)
                )
            );
          }
        }

        return [
          ...possibleDestinationSquares
            .filter(nilFilter)
            .filter((square) => !position[square.toString()]),
          ...possibleCapturesSquares.filter(nilFilter).filter((square) => {
            const captureSquareValue = position[square.toString()];

            if (!captureSquareValue) return false;

            return (
              ChessGame.getSquareValuePlayer(captureSquareValue) ===
              this.inactivePlayer
            );
          }),
        ].map((square) => square.toString());
      },
      N: (startingSquare) =>
        getDestinationSquaresFromShifts(
          startingSquare,
          [-1, 1].flatMap((x) =>
            [-2, 2].flatMap<Shift>((y) => [
              [x, y],
              [y, x],
            ])
          )
        ),
      B: (startingSquare) =>
        getDestinationSquaresFromDirections(
          startingSquare,
          PIECE_DIRECTIONS["B"]
        ),

      R: (startingSquare) =>
        getDestinationSquaresFromDirections(
          startingSquare,
          PIECE_DIRECTIONS["R"]
        ),
      K: (startingSquare) => {
        const destinationSquares = getDestinationSquaresFromShifts(
          startingSquare,
          [-1, 1].flatMap((x) => [
            [x, 0],
            [0, x],
            [x, x],
            [-x, x],
          ])
        );

        const castlingStatus = this.castlingStatus[this.activePlayer];

        if (castlingStatus && !this.isInCheck(position)) {
          const castles: Exclude<ChessCastlingStatus, boolean>[] =
            typeof castlingStatus === "boolean"
              ? ["long", "short"]
              : [castlingStatus];
          const castlingDirections = {
            long: [-1, 0],
            short: [1, 0],
          } satisfies Record<string, Shift>;

          castles.forEach((castle) => {
            const direction = castlingDirections[castle];
            const isCastlingDirectionEmpty = this.traversePosition(
              position,
              startingSquare,
              direction,
              (_, currentSquareValue) => [
                !currentSquareValue,
                !currentSquareValue ||
                  currentSquareValue ===
                    this.getSquareValueForPiece("R", this.activePlayer),
              ],
              false
            );

            if (isCastlingDirectionEmpty) {
              const squaresToCheck = new Array(2)
                .fill(null)
                .reduce<ChessSquare[]>(
                  (prevSquares) => [
                    ...prevSquares,
                    getNonNullable(
                      (prevSquares.at(-1) ?? startingSquare).toShifted(
                        ...direction
                      ),
                      "squareToCheck for castling"
                    ),
                  ],
                  []
                );

              if (
                squaresToCheck.every((squareToCheck) => {
                  const positionToCheck = { ...position };
                  delete positionToCheck[startingSquare.toString()];
                  positionToCheck[squareToCheck.toString()] =
                    this.getSquareValueForPiece("K", this.activePlayer);
                  return !this.isInCheck(positionToCheck);
                })
              )
                destinationSquares.push(
                  getNonNullable(
                    squaresToCheck.at(-1),
                    "destinationSquare for castling"
                  ).toString()
                );
            }
          });
        }

        return destinationSquares;
      },
      Q: (startingSquare) =>
        getDestinationSquaresFromDirections(
          startingSquare,
          PIECE_DIRECTIONS["Q"]
        ),
    };
  }

  private getMoveNotation(
    move: ChessMove,
    disambiguate: Array<"file" | "rank"> = []
  ) {
    if (move.piece === "K") {
      const [fileDiff] = ChessSquare.difference(
        move.destinationSquare,
        move.startingSquare
      );

      if (Math.abs(fileDiff) > 1) {
        return fileDiff > 0 ? "0-0" : "0-0-0";
      }
    }

    let piece: string = move.piece;

    const capture = move.isCapture ? "x" : "";

    const check = move.isCheck ? "+" : "";

    let destination = move.destinationSquare;

    if (move.piece === "P") {
      piece = "";
      destination += move.promotion ? `=${move.promotion}` : "";
      if (move.isCapture) disambiguate.push("file");
    }

    const [startingFile, startingRank] = move.startingSquare;

    const starting = [
      disambiguate.includes("file") ? startingFile : "",
      disambiguate.includes("rank") ? startingRank : "",
    ].join("");

    return `${piece}${starting}${capture}${destination}${check}`;
  }

  private traversePosition<T>(
    position: ChessPosition,
    startingSquare: ChessSquare,
    direction: Shift,
    traverseFn: (
      currentSquareString: ChessSquareString,
      currentSquareValue: ChessPosition[ChessSquareString],
      acc: T
    ) => [boolean, T],
    initialAcc: T
  ): T {
    let currentSquare = startingSquare.toShifted(...direction);
    let currentAcc = initialAcc;

    while (currentSquare) {
      const currentSquareString = currentSquare.toString();
      const currentValue = position[currentSquareString];

      const [shouldContinue, newAcc] = traverseFn(
        currentSquareString,
        currentValue,
        currentAcc
      );

      currentAcc = newAcc;
      currentSquare = shouldContinue
        ? currentSquare.toShifted(...direction)
        : null;
    }

    return currentAcc;
  }
}
