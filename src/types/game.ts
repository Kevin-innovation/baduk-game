export type StoneColor = 'black' | 'white' | null;

export type Position = {
  row: number;
  col: number;
};

export type BoardState = StoneColor[][];

export type GameState = {
  board: BoardState;
  currentPlayer: StoneColor;
  capturedBlack: number;
  capturedWhite: number;
  history: BoardState[];
  lastMove: Position | null;
};

export type Liberty = {
  position: Position;
  count: number;
};

export type Group = {
  stones: Position[];
  liberties: Position[];
}; 