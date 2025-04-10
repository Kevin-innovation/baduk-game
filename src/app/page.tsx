'use client';

import React from 'react';
import { useState } from 'react';
import Image from 'next/image';
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
    <main className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="flex items-center space-x-2 mt-4">
        <Image 
          src="/kevin.png" 
          alt="DLAB Kevin Logo" 
          width={40} 
          height={40} 
          className="rounded"
        />
        <h1 className="text-2xl font-bold text-gray-800">DLAB_Kevin</h1>
      </div>
      
      <div className="flex flex-col items-center space-y-4 mt-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsAIEnabled(true)}
            className={`px-4 py-2 rounded ${
              isAIEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            AI Mode
          </button>
          <button
            onClick={() => setIsAIEnabled(false)}
            className={`px-4 py-2 rounded ${
              !isAIEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            2P Mode
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-center text-lg font-semibold mb-2">
            Current Player: {gameState.currentPlayer === 'black' ? '⚫' : '⚪'}
            {isAIThinking && ' (AI 생각 중...)'}
          </p>
          <p className="text-center">
            Captured Black: {gameState.capturedBlack} | Captured White: {gameState.capturedWhite}
          </p>
          <p className="text-center text-sm text-gray-600">
            {isAIEnabled ? 'AI Mode: ON' : '2P Mode: ON'}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Board
          isAIMode={isAIEnabled}
          currentPlayer={gameState.currentPlayer}
          setCurrentPlayer={(player) => setGameState({ ...gameState, currentPlayer: player })}
          capturedBlack={gameState.capturedBlack}
          setCapturedBlack={(captured) => setGameState({ ...gameState, capturedBlack: captured })}
          capturedWhite={gameState.capturedWhite}
          setCapturedWhite={(captured) => setGameState({ ...gameState, capturedWhite: captured })}
          onMove={handleMove}
          lastMove={gameState.lastMove}
        />
      </div>
    </main>
  );
} 