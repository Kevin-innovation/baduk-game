export type StoneColor = 'black' | 'white';

export interface Position {
  row: number;
  col: number;
}

export type BoardState = (StoneColor | null)[][];

export interface GameState {
  board: BoardState;
  currentPlayer: StoneColor;
  capturedBlack: number;
  capturedWhite: number;
  history: BoardState[];
  lastMove: Position | null;
  isAIMode: boolean;
}

export type Liberty = {
  position: Position;
  count: number;
};

export type Group = {
  stones: Position[];
  liberties: Position[];
}; 