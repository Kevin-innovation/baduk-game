import { BoardState, Position, StoneColor, Group } from '../types/game';

const BOARD_SIZE = 19;

export const createEmptyBoard = (): BoardState => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
};

export const getAdjacentPositions = (pos: Position): Position[] => {
  const { row, col } = pos;
  return [
    { row: row - 1, col: col },
    { row: row + 1, col: col },
    { row: row, col: col - 1 },
    { row: row, col: col + 1 }
  ].filter(
    (p) =>
      p.row >= 0 && p.row < BOARD_SIZE && p.col >= 0 && p.col < BOARD_SIZE
  );
};

export const findGroup = (
  board: BoardState,
  pos: Position,
  color: StoneColor
): Group => {
  const stones: Position[] = [];
  const liberties: Position[] = [];
  const visited = new Set<string>();

  const explore = (current: Position) => {
    const key = `${current.row},${current.col}`;
    if (visited.has(key)) return;
    visited.add(key);

    if (board[current.row][current.col] === color) {
      stones.push(current);
      getAdjacentPositions(current).forEach((adj) => {
        const adjColor = board[adj.row][adj.col];
        if (adjColor === null) {
          liberties.push(adj);
        } else if (adjColor === color) {
          explore(adj);
        }
      });
    }
  };

  explore(pos);
  return { stones, liberties };
};

export const isValidMove = (
  board: BoardState,
  pos: Position,
  color: StoneColor
): boolean => {
  if (board[pos.row][pos.col] !== null) return false;

  // Place stone temporarily to check the result
  const tempBoard = board.map((row) => [...row]);
  tempBoard[pos.row][pos.col] = color;

  // Check if the move captures any opponent stones
  let hasCaptures = false;
  getAdjacentPositions(pos).forEach((adj) => {
    if (
      board[adj.row][adj.col] &&
      board[adj.row][adj.col] !== color
    ) {
      const group = findGroup(tempBoard, adj, board[adj.row][adj.col]);
      if (group.liberties.length === 0) {
        hasCaptures = true;
      }
    }
  });

  // If the move captures opponent stones, it's valid
  if (hasCaptures) return true;

  // Check if the placed stone has liberties
  const group = findGroup(tempBoard, pos, color);
  return group.liberties.length > 0;
};

export const makeMove = (
  board: BoardState,
  pos: Position,
  color: StoneColor
): { newBoard: BoardState; captured: number } => {
  if (!isValidMove(board, pos, color)) {
    throw new Error('Invalid move');
  }

  const newBoard = board.map((row) => [...row]);
  newBoard[pos.row][pos.col] = color;
  let captured = 0;

  // Check and remove captured stones
  getAdjacentPositions(pos).forEach((adj) => {
    const adjColor = board[adj.row][adj.col];
    if (adjColor && adjColor !== color) {
      const group = findGroup(newBoard, adj, adjColor);
      if (group.liberties.length === 0) {
        group.stones.forEach((stone) => {
          newBoard[stone.row][stone.col] = null;
          captured++;
        });
      }
    }
  });

  return { newBoard, captured };
}; 