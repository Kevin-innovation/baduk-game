import { BoardState, Position, StoneColor } from '../types/game';
import { getAdjacentPositions, findGroup, isValidMove } from './gameLogic';

const BOARD_SIZE = 19;

export type Difficulty = 'easy' | 'medium' | 'hard';

// 가중치 맵 - 기본적인 좋은 위치들
const WEIGHT_MAP = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(1));

// 천원과 그 주변
[3, 15].forEach(row => {
  [3, 15].forEach(col => {
    WEIGHT_MAP[row][col] = 5;
    // 천원 주변
    [[row-1, col], [row+1, col], [row, col-1], [row, col+1]].forEach(([r, c]) => {
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        WEIGHT_MAP[r][c] = 3;
      }
    });
  });
});

// 중앙점과 그 주변
WEIGHT_MAP[9][9] = 6;
[[8, 9], [10, 9], [9, 8], [9, 10]].forEach(([r, c]) => {
  WEIGHT_MAP[r][c] = 4;
});

// 난이도별 가중치 설정
const DIFFICULTY_WEIGHTS = {
  easy: {
    capture: 5,
    defense: 3,
    connection: 2,
    territory: 1,
    influence: 1,
    center: 1,
    randomness: 0.3
  },
  medium: {
    capture: 8,
    defense: 6,
    connection: 4,
    territory: 3,
    influence: 2,
    center: 2,
    randomness: 0.15
  },
  hard: {
    capture: 10,
    defense: 8,
    connection: 6,
    territory: 5,
    influence: 4,
    center: 3,
    randomness: 0.05
  }
};

export const findAIMove = (
  board: BoardState, 
  color: StoneColor, 
  difficulty: Difficulty = 'medium'
): Position => {
  const weights = DIFFICULTY_WEIGHTS[difficulty];
  const moves: { pos: Position; score: number }[] = [];

  // 모든 가능한 수를 평가
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const pos = { row, col };
      if (!isValidMove(board, pos, color)) continue;

      let score = 0;

      // 1. 기본 위치 가중치
      score += WEIGHT_MAP[row][col] * weights.center;

      // 2. 돌 잡기 평가
      const captureScore = evaluateCapture(board, pos, color);
      score += captureScore * weights.capture;

      // 3. 방어 평가
      const defenseScore = evaluateDefense(board, pos, color);
      score += defenseScore * weights.defense;

      // 4. 연결 평가
      const connectionScore = evaluateConnection(board, pos, color);
      score += connectionScore * weights.connection;

      // 5. 영역 평가
      const territoryScore = evaluateTerritory(board, pos, color);
      score += territoryScore * weights.territory;

      // 6. 영향력 평가
      const influenceScore = evaluateInfluence(board, pos, color);
      score += influenceScore * weights.influence;

      // Hard 난이도에서만 사용하는 추가 전략
      if (difficulty === 'hard') {
        // 7. 패턴 인식
        const patternScore = evaluatePatterns(board, pos, color);
        score += patternScore * 5;

        // 8. 위험한 형태 회피
        const shapeScore = evaluateShape(board, pos, color);
        score += shapeScore * 4;

        // 9. 잠재적 이익 평가
        const potentialScore = evaluatePotential(board, pos, color);
        score += potentialScore * 3;

        // 10. 전체 보드 상황 평가
        const globalScore = evaluateGlobalPosition(board, pos, color);
        score += globalScore * 4;
      }

      // 약간의 무작위성 추가
      score += Math.random() * weights.randomness * 10;

      moves.push({ pos, score });
    }
  }

  // 가장 높은 점수의 수 선택
  moves.sort((a, b) => b.score - a.score);
  
  // 난이도에 따라 상위 n개 중에서 선택
  const topCount = difficulty === 'easy' ? 5 : (difficulty === 'medium' ? 3 : 1);
  const topMoves = moves.slice(0, Math.min(topCount, moves.length));
  return topMoves[Math.floor(Math.random() * topMoves.length)].pos;
};

// 돌 잡기 평가
const evaluateCapture = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const tempBoard = board.map(row => [...row]);
  tempBoard[pos.row][pos.col] = color;

  getAdjacentPositions(pos).forEach(adj => {
    if (board[adj.row][adj.col] === (color === 'black' ? 'white' : 'black')) {
      const group = findGroup(tempBoard, adj, board[adj.row][adj.col]);
      if (group.liberties.length === 1) {
        score += group.stones.length * 2;  // 크기가 큰 그룹을 잡는 것이 더 가치있음
      } else if (group.liberties.length === 2) {
        score += group.stones.length;  // 잡을 수 있는 가능성이 있는 그룹
      }
    }
  });

  return score;
};

// 방어 평가
const evaluateDefense = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const oppositeColor = color === 'black' ? 'white' : 'black';

  // 자신의 돌 보호
  getAdjacentPositions(pos).forEach(adj => {
    if (board[adj.row][adj.col] === color) {
      const group = findGroup(board, adj, color);
      if (group.liberties.length <= 2) {
        score += (3 - group.liberties.length) * group.stones.length;
      }
    }
  });

  // 상대방 공격 방어
  getAdjacentPositions(pos).forEach(adj => {
    if (board[adj.row][adj.col] === oppositeColor) {
      const group = findGroup(board, adj, oppositeColor);
      if (group.liberties.length === 2) {
        score += group.stones.length;
      }
    }
  });

  return score;
};

// 연결 평가
const evaluateConnection = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const tempBoard = board.map(row => [...row]);
  tempBoard[pos.row][pos.col] = color;

  // 주변 2칸까지 확인
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === color) {
          // 거리에 따른 가중치
          const distance = Math.max(Math.abs(dr), Math.abs(dc));
          score += (3 - distance);

          // 대각선 연결은 약간 덜 선호
          if (dr !== 0 && dc !== 0) {
            score -= 0.5;
          }
        }
      }
    }
  }

  return score;
};

// 영역 평가
const evaluateTerritory = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const visited = new Set<string>();
  const queue: Position[] = [pos];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    getAdjacentPositions(current).forEach(adj => {
      const adjKey = `${adj.row},${adj.col}`;
      if (!visited.has(adjKey) && board[adj.row][adj.col] === null) {
        score += 1;
        queue.push(adj);
      } else if (board[adj.row][adj.col] === color) {
        score += 0.5;
      }
    });
  }
  
  return score;
};

// 영향력 평가
const evaluateInfluence = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const oppositeColor = color === 'black' ? 'white' : 'black';

  // 8방향 영향력 확인
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  directions.forEach(([dr, dc]) => {
    let influence = 0;
    let r = pos.row + dr;
    let c = pos.col + dc;
    let distance = 1;

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && distance <= 4) {
      if (board[r][c] === color) {
        influence += (5 - distance);
      } else if (board[r][c] === oppositeColor) {
        influence -= (5 - distance);
        break;
      } else {
        influence += (5 - distance) * 0.5;
      }
      r += dr;
      c += dc;
      distance++;
    }

    score += influence;
  });

  return score;
};

// 패턴 인식 (고급 패턴)
const evaluatePatterns = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;

  // 1. 벽 만들기
  score += evaluateWall(board, pos, color);

  // 2. 눈 만들기
  score += evaluateEye(board, pos, color) * 2;

  // 3. 맥 만들기
  score += evaluateLine(board, pos, color);

  // 4. 모양 만들기
  score += evaluateShape(board, pos, color);

  return score;
};

// 벽 평가
const evaluateWall = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

  directions.forEach(([dr, dc]) => {
    let count = 0;
    let space = 0;
    for (let i = -2; i <= 2; i++) {
      const r = pos.row + dr * i;
      const c = pos.col + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === color) {
          count++;
        } else if (board[r][c] === null) {
          space++;
        }
      }
    }
    if (count >= 3 && space > 0) {
      score += count + space * 0.5;
    }
  });

  return score;
};

// 눈 평가
const evaluateEye = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const adjacentEmpty = getAdjacentPositions(pos).filter(p => board[p.row][p.col] === null);
  
  adjacentEmpty.forEach(empty => {
    const surroundingPoints = getAdjacentPositions(empty);
    const surroundingColors = surroundingPoints.map(p => board[p.row][p.col]);
    const colorCount = surroundingColors.filter(c => c === color).length;
    
    if (colorCount >= 3) {
      score += colorCount - 2;
      // 완전한 눈이면 추가 점수
      if (colorCount === 4) {
        score += 2;
      }
    }
  });

  return score;
};

// 맥 평가
const evaluateLine = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

  directions.forEach(([dr, dc]) => {
    let line = '';
    for (let i = -4; i <= 4; i++) {
      const r = pos.row + dr * i;
      const c = pos.col + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === color) line += 'O';
        else if (board[r][c] === null) line += '.';
        else line += 'X';
      }
    }

    // 좋은 패턴 찾기
    if (line.includes('OO.O') || line.includes('O.OO')) score += 3;
    if (line.includes('O.O.O')) score += 4;
    if (line.includes('OO..O') || line.includes('O..OO')) score += 2;
  });

  return score;
};

// 전체 보드 상황 평가
const evaluateGlobalPosition = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;

  // 1. 중앙 지향성 평가
  const centerDistance = Math.sqrt(
    Math.pow(pos.row - 9, 2) + Math.pow(pos.col - 9, 2)
  );
  score -= centerDistance * 0.5;

  // 2. 상대방 돌과의 거리 평가
  const oppositeColor = color === 'black' ? 'white' : 'black';
  let minDistance = 19;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === oppositeColor) {
        const distance = Math.sqrt(
          Math.pow(pos.row - r, 2) + Math.pow(pos.col - c, 2)
        );
        minDistance = Math.min(minDistance, distance);
      }
    }
  }
  if (minDistance < 3) score += 2;
  else if (minDistance < 5) score += 1;

  // 3. 전체적인 돌의 밀집도 평가
  let density = 0;
  for (let dr = -3; dr <= 3; dr++) {
    for (let dc = -3; dc <= 3; dc++) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] !== null) density++;
      }
    }
  }
  score += (density > 10) ? -1 : 1;

  return score;
};

// 잠재적 이익 평가
const evaluatePotential = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;

  // 1. 미래의 눈 자리 평가
  const potentialEyes = evaluatePotentialEyes(board, pos, color);
  score += potentialEyes * 2;

  // 2. 확장 가능성 평가
  const expansion = evaluateExpansion(board, pos, color);
  score += expansion;

  // 3. 절단 가능성 평가
  const cut = evaluateCutting(board, pos, color);
  score += cut * 3;

  return score;
};

// 잠재적인 눈 자리 평가
const evaluatePotentialEyes = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const visited = new Set<string>();
  const queue: Position[] = [pos];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);

    const adjacent = getAdjacentPositions(current);
    let emptyCount = 0;
    let friendlyCount = 0;

    adjacent.forEach(adj => {
      if (board[adj.row][adj.col] === null) {
        emptyCount++;
        queue.push(adj);
      } else if (board[adj.row][adj.col] === color) {
        friendlyCount++;
      }
    });

    if (emptyCount === 1 && friendlyCount >= 2) score += 2;
    else if (emptyCount === 2 && friendlyCount >= 1) score += 1;
  }

  return score;
};

// 확장 가능성 평가
const evaluateExpansion = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  directions.forEach(([dr, dc]) => {
    let r = pos.row + dr;
    let c = pos.col + dc;
    let emptyCount = 0;

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && emptyCount < 3) {
      if (board[r][c] === null) {
        emptyCount++;
        score += 1 / (emptyCount + 1);
      } else {
        break;
      }
      r += dr;
      c += dc;
    }
  });

  return score;
};

// 절단 가능성 평가
const evaluateCutting = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;
  const oppositeColor = color === 'black' ? 'white' : 'black';

  // 상대방 돌 사이에 끼어들어 절단하는 경우 평가
  const directions = [
    [[-1, 0], [1, 0]],   // 수직
    [[0, -1], [0, 1]],   // 수평
    [[-1, -1], [1, 1]],  // 대각선 1
    [[-1, 1], [1, -1]]   // 대각선 2
  ];

  directions.forEach(([dir1, dir2]) => {
    const r1 = pos.row + dir1[0];
    const c1 = pos.col + dir1[1];
    const r2 = pos.row + dir2[0];
    const c2 = pos.col + dir2[1];

    if (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE &&
        r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE) {
      if (board[r1][c1] === oppositeColor && board[r2][c2] === oppositeColor) {
        score += 3;  // 상대방 돌을 절단
      }
    }
  });

  return score;
};

// 모양 평가
const evaluateShape = (board: BoardState, pos: Position, color: StoneColor): number => {
  let score = 0;

  // 1. 나쁜 모양 체크 (예: 빈 삼각형)
  if (isEmptyTriangle(board, pos, color)) {
    score -= 3;
  }

  // 2. 좋은 모양 체크
  if (isGoodShape(board, pos, color)) {
    score += 2;
  }

  // 3. 단수 체크
  const libertyCount = countLiberties(board, pos, color);
  if (libertyCount <= 1) {
    score -= 5;
  } else if (libertyCount >= 4) {
    score += 2;
  }

  return score;
};

// 빈 삼각형 체크
const isEmptyTriangle = (board: BoardState, pos: Position, color: StoneColor): boolean => {
  const patterns = [
    [[-1, 0], [0, -1]],  // 좌상
    [[-1, 0], [0, 1]],   // 우상
    [[1, 0], [0, -1]],   // 좌하
    [[1, 0], [0, 1]]     // 우하
  ];

  return patterns.some(([dir1, dir2]) => {
    const r1 = pos.row + dir1[0];
    const c1 = pos.col + dir1[1];
    const r2 = pos.row + dir2[0];
    const c2 = pos.col + dir2[1];

    return (
      r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE &&
      r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE &&
      board[r1][c1] === color && board[r2][c2] === color
    );
  });
};

// 좋은 모양 체크
const isGoodShape = (board: BoardState, pos: Position, color: StoneColor): boolean => {
  // 1. 대마 형태
  if (isHorseShape(board, pos, color)) return true;

  // 2. 호구 형태
  if (isTigerMouth(board, pos, color)) return true;

  // 3. 한칸 건너뛰기 형태
  if (isOnePointJump(board, pos, color)) return true;

  return false;
};

// 대마 형태 체크
const isHorseShape = (board: BoardState, pos: Position, color: StoneColor): boolean => {
  const patterns = [
    [[-1, 0], [-1, 1]],
    [[-1, 0], [-1, -1]],
    [[1, 0], [1, 1]],
    [[1, 0], [1, -1]],
    [[0, -1], [1, -1]],
    [[0, -1], [-1, -1]],
    [[0, 1], [1, 1]],
    [[0, 1], [-1, 1]]
  ];

  return patterns.some(([dir1, dir2]) => {
    const r1 = pos.row + dir1[0];
    const c1 = pos.col + dir1[1];
    const r2 = pos.row + dir2[0];
    const c2 = pos.col + dir2[1];

    return (
      r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE &&
      r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE &&
      board[r1][c1] === color && board[r2][c2] === color
    );
  });
};

// 호구 형태 체크
const isTigerMouth = (board: BoardState, pos: Position, color: StoneColor): boolean => {
  const patterns = [
    [[-1, -1], [-1, 0], [-1, 1]],
    [[1, -1], [1, 0], [1, 1]],
    [[-1, -1], [0, -1], [1, -1]],
    [[-1, 1], [0, 1], [1, 1]]
  ];

  return patterns.some(pattern => {
    return pattern.every(([dr, dc]) => {
      const r = pos.row + dr;
      const c = pos.col + dc;
      return (
        r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE &&
        board[r][c] === color
      );
    });
  });
};

// 한칸 건너뛰기 형태 체크
const isOnePointJump = (board: BoardState, pos: Position, color: StoneColor): boolean => {
  const patterns = [
    [[-2, 0], [-1, 0]],
    [[2, 0], [1, 0]],
    [[0, -2], [0, -1]],
    [[0, 2], [0, 1]]
  ];

  return patterns.some(([dir1, dir2]) => {
    const r1 = pos.row + dir1[0];
    const c1 = pos.col + dir1[1];
    const r2 = pos.row + dir2[0];
    const c2 = pos.col + dir2[1];

    return (
      r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE &&
      r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE &&
      board[r1][c1] === color && board[r2][c2] === null
    );
  });
};

// 자유도 계산
const countLiberties = (board: BoardState, pos: Position, color: StoneColor): number => {
  const tempBoard = board.map(row => [...row]);
  tempBoard[pos.row][pos.col] = color;
  const group = findGroup(tempBoard, pos, color);
  return group.liberties.length;
}; 