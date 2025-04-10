'use client';

import React from 'react';
import { BoardState, Position } from '../types/game';

interface BoardProps {
  board: BoardState;
  onMove: (pos: Position) => void;
  lastMove: Position | null;
}

const Board: React.FC<BoardProps> = ({ board, onMove, lastMove }) => {
  const renderCell = (row: number, col: number) => {
    const stone = board[row][col];
    const isLastMove = lastMove?.row === row && lastMove?.col === col;
    const isStarPoint = (row === 3 || row === 9 || row === 15) && 
                       (col === 3 || col === 9 || col === 15);

    return (
      <div
        key={`${row}-${col}`}
        className="relative w-8 h-8 cursor-pointer"
        onClick={() => onMove({ row, col })}
      >
        {/* 바둑판 격자 */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-[1px] bg-black top-1/2 transform -translate-y-1/2" />
          <div className="absolute h-full w-[1px] bg-black left-1/2 transform -translate-x-1/2" />
        </div>

        {/* 돌 */}
        {stone && (
          <div
            className={`
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-7 h-7 rounded-full
              ${stone === 'black' ? 'bg-black' : 'bg-white border border-black'}
              ${isLastMove ? 'ring-2 ring-red-500' : ''}
              shadow-md
              z-10
            `}
          />
        )}

        {/* 화점 */}
        {isStarPoint && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full z-5" />
        )}
      </div>
    );
  };

  const renderBoard = () => {
    const rows = [];
    for (let i = 0; i < 19; i++) {
      const cells = [];
      for (let j = 0; j < 19; j++) {
        cells.push(renderCell(i, j));
      }
      rows.push(
        <div key={i} className="flex flex-row">
          {cells}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="inline-block bg-[#DEB887] p-4 rounded-lg shadow-lg">
      <div className="relative border-2 border-black">
        <div className="flex flex-col">
          {renderBoard()}
        </div>
      </div>
    </div>
  );
};

export default Board; 