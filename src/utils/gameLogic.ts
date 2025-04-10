import { BoardState, Position, StoneColor, Group } from '../types/game';

const BOARD_SIZE = 19;

export function createEmptyBoard(): BoardState {
  return Array(19).fill(null).map(() => Array(19).fill(null));
}

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

export function isValidMove(
  board: BoardState,
  pos: Position,
  color: StoneColor
): boolean {
  // 범위 체크
  if (pos.row < 0 || pos.row >= 19 || pos.col < 0 || pos.col >= 19) {
    return false;
  }

  // 이미 돌이 있는 경우
  if (board[pos.row][pos.col] !== null) {
    return false;
  }

  // 임시 보드에 돌을 놓아보기
  const tempBoard = board.map(row => [...row]);
  tempBoard[pos.row][pos.col] = color;

  // 착수 후 자유도 확인
  const adjacentPositions = getAdjacentPositions(pos);
  const hasLiberty = adjacentPositions.some(
    adj => tempBoard[adj.row][adj.col] === null
  );

  if (hasLiberty) {
    return true;
  }

  // 자유도가 없는 경우, 상대방 돌을 잡을 수 있는지 확인
  const opponent = color === 'black' ? 'white' : 'black';
  
  for (const adj of adjacentPositions) {
    if (tempBoard[adj.row][adj.col] === opponent) {
      // 상대방 돌 주변의 자유도 확인
      const opponentAdjacent = getAdjacentPositions(adj);
      const opponentHasOnlyOneLiberty = opponentAdjacent.filter(
        p => tempBoard[p.row][p.col] === null
      ).length === 1;

      if (opponentHasOnlyOneLiberty) {
        return true;
      }
    }
  }

  return false;
}

export function findConnectedStones(
  board: BoardState,
  pos: Position
): Position[] {
  const color = board[pos.row][pos.col];
  if (color === null) return [];

  const connected: Position[] = [];
  const visited = new Set<string>();
  const queue: Position[] = [pos];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.row},${current.col}`;

    if (visited.has(key)) continue;
    visited.add(key);
    connected.push(current);

    // 상하좌우 확인
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of directions) {
      const newRow = current.row + dx;
      const newCol = current.col + dy;

      if (
        newRow >= 0 && newRow < 19 &&
        newCol >= 0 && newCol < 19 &&
        board[newRow][newCol] === color &&
        !visited.has(`${newRow},${newCol}`)
      ) {
        queue.push({ row: newRow, col: newCol });
      }
    }
  }

  return connected;
}

export function hasLiberties(
  board: BoardState,
  stones: Position[]
): boolean {
  const visited = new Set<string>();
  
  for (const stone of stones) {
    // 상하좌우 확인
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of directions) {
      const newRow = stone.row + dx;
      const newCol = stone.col + dy;
      const key = `${newRow},${newCol}`;

      if (
        newRow >= 0 && newRow < 19 &&
        newCol >= 0 && newCol < 19 &&
        !visited.has(key)
      ) {
        visited.add(key);
        if (board[newRow][newCol] === null) {
          return true;
        }
      }
    }
  }

  return false;
}

export function findCapturedGroups(
  board: BoardState,
  pos: Position,
  color: StoneColor
): Position[][] {
  const capturedGroups: Position[][] = [];
  const opponent = color === 'black' ? 'white' : 'black';

  // 상하좌우 확인
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const checked = new Set<string>();

  for (const [dx, dy] of directions) {
    const newRow = pos.row + dx;
    const newCol = pos.col + dy;
    const key = `${newRow},${newCol}`;

    if (
      newRow >= 0 && newRow < 19 &&
      newCol >= 0 && newCol < 19 &&
      board[newRow][newCol] === opponent &&
      !checked.has(key)
    ) {
      const group = findConnectedStones(board, { row: newRow, col: newCol });
      const groupKey = group.map(p => `${p.row},${p.col}`).join('|');
      
      if (!checked.has(groupKey) && !hasLiberties(board, group)) {
        capturedGroups.push(group);
        group.forEach(p => checked.add(`${p.row},${p.col}`));
      }
    }
  }

  return capturedGroups;
}

export function makeMove(
  board: BoardState,
  pos: Position,
  color: StoneColor
): { newBoard: BoardState; captured: number } {
  const newBoard = board.map(row => [...row]);
  newBoard[pos.row][pos.col] = color;

  // 상대 돌 잡기
  const capturedGroups = findCapturedGroups(newBoard, pos, color);
  let captured = 0;

  capturedGroups.forEach(group => {
    group.forEach(stone => {
      newBoard[stone.row][stone.col] = null;
      captured++;
    });
  });

  return { newBoard, captured };
}

export function checkCaptures(
  board: (StoneColor | null)[][],
  pos: Position,
  color: StoneColor
): Position[] {
  const captures: Position[] = [];
  const opponent = color === 'black' ? 'white' : 'black';

  // 상하좌우 체크
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (const [dx, dy] of directions) {
    const newRow = pos.row + dx;
    const newCol = pos.col + dy;
    
    if (
      newRow >= 0 && newRow < 19 &&
      newCol >= 0 && newCol < 19 &&
      board[newRow][newCol] === opponent
    ) {
      const group = findGroup(board, { row: newRow, col: newCol }, opponent);
      if (!hasLiberties(board, group.stones)) {
        captures.push(...group.stones);
      }
    }
  }

  return captures;
}

function getCaptures(
  board: (StoneColor | null)[][],
  pos: Position,
  color: StoneColor
): Position[] {
  const opponent = color === 'black' ? 'white' : 'black';
  const captures: Position[] = [];

  // 상하좌우 체크
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dx, dy] of directions) {
    const newRow = pos.row + dx;
    const newCol = pos.col + dy;
    
    if (
      newRow >= 0 && newRow < 19 &&
      newCol >= 0 && newCol < 19 &&
      board[newRow][newCol] === opponent
    ) {
      const group = findGroup(board, { row: newRow, col: newCol }, opponent);
      if (!hasLiberties(board, group.stones)) {
        captures.push(...group.stones);
      }
    }
  }

  return captures;
} 