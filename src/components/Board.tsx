'use client';

import React, { useState } from 'react';
import { Position, StoneColor } from '../types/game';
import { isValidMove, checkCaptures } from '../utils/gameLogic';
import { findBestMove } from '../utils/aiLogic';

interface BoardProps {
  isAIMode: boolean;
  currentPlayer: StoneColor;
  setCurrentPlayer: (player: StoneColor) => void;
  capturedBlack: number;
  setCapturedBlack: (count: number) => void;
  capturedWhite: number;
  setCapturedWhite: (count: number) => void;
  onMove: (pos: Position) => void;
  lastMove: Position | null;
}

export default function Board({
  isAIMode,
  currentPlayer,
  setCurrentPlayer,
  capturedBlack,
  setCapturedBlack,
  capturedWhite,
  setCapturedWhite,
  onMove,
  lastMove,
}: BoardProps) {
  const [board, setBoard] = useState<(StoneColor | null)[][]>(
    Array(19).fill(null).map(() => Array(19).fill(null))
  );

  const handleCellClick = async (row: number, col: number) => {
    if (board[row][col] !== null) return;
    
    if (!isValidMove(board, { row, col }, currentPlayer)) return;

    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;

    const captures = checkCaptures(newBoard, { row, col }, currentPlayer);
    captures.forEach(pos => {
      newBoard[pos.row][pos.col] = null;
    });

    if (currentPlayer === 'black') {
      setCapturedWhite(capturedWhite + captures.length);
    } else {
      setCapturedBlack(capturedBlack + captures.length);
    }

    setBoard(newBoard);
    onMove({ row, col });
    
    if (isAIMode && currentPlayer === 'black') {
      setCurrentPlayer('white');
      // AI 차례
      setTimeout(() => {
        const aiMove = findBestMove(newBoard, 'white', 'medium');
        if (aiMove) {
          const aiBoard = [...newBoard.map(row => [...row])];
          aiBoard[aiMove.row][aiMove.col] = 'white';
          
          const aiCaptures = checkCaptures(aiBoard, aiMove, 'white');
          aiCaptures.forEach(pos => {
            aiBoard[pos.row][pos.col] = null;
          });
          
          setCapturedBlack(capturedBlack + aiCaptures.length);
          setBoard(aiBoard);
          setCurrentPlayer('black');
          onMove(aiMove);
        }
      }, 500);
    } else {
      // 2P 모드: 플레이어 전환
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    }
  };

  const renderCell = (row: number, col: number) => {
    const stone = board[row][col];
    const isLastMove = lastMove?.row === row && lastMove?.col === col;
    const isStarPoint = (row === 3 || row === 9 || row === 15) && 
                       (col === 3 || col === 9 || col === 15);

    return (
      <div
        key={`${row}-${col}`}
        className={`
          w-8 h-8 relative
          before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-full before:h-px before:bg-black
          after:content-[''] after:absolute after:left-1/2 after:top-0 after:h-full after:w-px after:bg-black
          ${(row === 0 || row === 18) && 'before:top-1/2'}
          ${(col === 0 || col === 18) && 'after:left-1/2'}
          cursor-pointer
        `}
        onClick={() => handleCellClick(row, col)}
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
        {isStarPoint && !stone && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full z-5" />
        )}
      </div>
    );
  };

  return (
    <div className="inline-block bg-[#DEB887] p-4 rounded-lg shadow-lg">
      <div className="relative border-2 border-black">
        <div className="flex flex-col">
          {Array(19).fill(null).map((_, row) => (
            <div key={row} className="flex flex-row">
              {Array(19).fill(null).map((_, col) => renderCell(row, col))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 