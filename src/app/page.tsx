'use client';

import React from 'react';
import { useState } from 'react';
import Board from '../components/Board';
import { GameState, Position, BoardState, StoneColor } from '../types/game';
import { createEmptyBoard, makeMove, isValidMove } from '../utils/gameLogic';
import { findAIMove, type Difficulty } from '../utils/aiLogic';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: 'black',
    capturedBlack: 0,
    capturedWhite: 0,
    history: [createEmptyBoard()],
    lastMove: null,
  });

  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isAIThinking, setIsAIThinking] = useState(false);

  // AI의 턴을 처리하는 함수
  const handleAIMove = (currentBoard: BoardState, capturedB: number, capturedW: number) => {
    const aiMove = findAIMove(currentBoard, 'white', difficulty);
    if (!isValidMove(currentBoard, aiMove, 'white')) return;

    const { newBoard, captured } = makeMove(currentBoard, aiMove, 'white');
    setGameState({
      board: newBoard,
      currentPlayer: 'black',
      capturedBlack: capturedB,
      capturedWhite: capturedW + captured,
      history: [...gameState.history, newBoard],
      lastMove: aiMove,
    });
  };

  // 플레이어의 수를 처리하는 함수
  const handleMove = (pos: Position) => {
    if (isAIThinking || gameState.currentPlayer !== 'black') return;
    if (!isValidMove(gameState.board, pos, 'black')) return;

    const { newBoard, captured } = makeMove(gameState.board, pos, 'black');
    const newCapturedWhite = gameState.capturedWhite + captured;

    // 플레이어의 수를 먼저 처리
    setGameState({
      board: newBoard,
      currentPlayer: 'white',
      capturedBlack: gameState.capturedBlack,
      capturedWhite: newCapturedWhite,
      history: [...gameState.history, newBoard],
      lastMove: pos,
    });

    // AI 턴 처리
    if (isAIEnabled) {
      setIsAIThinking(true);
      setTimeout(() => {
        try {
          handleAIMove(newBoard, gameState.capturedBlack, newCapturedWhite);
        } finally {
          setIsAIThinking(false);
        }
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      {/* 상단 상태 표시줄 */}
      <div className="w-full bg-white shadow-md p-4 mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <span className="text-xl font-semibold">
              Current Player: {gameState.currentPlayer === 'black' ? '⚫' : '⚪'}
              {isAIThinking && ' (AI 생각 중...)'}
            </span>
            <span className="text-lg">
              Captured Black: {gameState.capturedBlack}
            </span>
            <span className="text-lg">
              Captured White: {gameState.capturedWhite}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => setIsAIEnabled(!isAIEnabled)}
            >
              AI: {isAIEnabled ? 'ON' : 'OFF'}
            </button>
            {isAIEnabled && (
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* 바둑판 */}
      <div className="flex-1 flex items-center justify-center">
        <Board
          board={gameState.board}
          onMove={handleMove}
          lastMove={gameState.lastMove}
        />
      </div>
    </div>
  );
} 