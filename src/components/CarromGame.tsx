'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Position, Velocity } from '@/types/carrom';
import { carromGameLogic } from '@/lib/carrom-game-logic';
import { carromPhysics } from '@/lib/carrom-physics';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import GameControls from './GameControls';

export default function CarromGame() {
  const [gameState, setGameState] = useState<GameState>(() => 
    carromGameLogic.initializeGame()
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation loop for physics
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      if (gameState.gamePhase === 'moving' || gameState.gamePhase === 'shooting') {
        setGameState(prevState => {
          const newState = { ...prevState };
          
          // Update striker physics
          if (!newState.striker.pocketed) {
            carromPhysics.updatePiece(newState.striker);
          }
          
          // Update all pieces physics
          newState.pieces = newState.pieces.map(piece => 
            carromPhysics.updatePiece(piece)
          );
          
          // Check collisions between all pieces
          const allActivePieces = [
            newState.striker,
            ...newState.pieces.filter(p => p.active && !p.pocketed)
          ];
          
          for (let i = 0; i < allActivePieces.length; i++) {
            for (let j = i + 1; j < allActivePieces.length; j++) {
              carromPhysics.checkPieceCollision(allActivePieces[i], allActivePieces[j]);
            }
          }
          
          // Check if all pieces have stopped moving
          const movingPieces = allActivePieces.filter(piece => 
            Math.abs(piece.velocity.x) > 0.1 || Math.abs(piece.velocity.y) > 0.1
          );
          
          if (movingPieces.length === 0) {
            // All pieces stopped, process the move
            const processedState = carromGameLogic.processMove(newState);
            setIsAnimating(false);
            return carromGameLogic.resetStrikerPosition(processedState);
          }
          
          return newState;
        });
      }
      
      if (isAnimating) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    if (isAnimating) {
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAnimating, gameState.gamePhase]);

  const handleShoot = useCallback((velocity: Velocity) => {
    if (gameState.gamePhase !== 'aiming') return;
    
    // Validate shot
    if (!carromGameLogic.isValidShot(gameState, velocity)) {
      return;
    }
    
    setGameState(prevState => {
      const newState = { ...prevState };
      
      // Apply velocity to striker
      newState.striker.velocity = { ...velocity };
      newState.gamePhase = 'shooting';
      
      return newState;
    });
    
    setIsAnimating(true);
  }, [gameState]);

  const handleStrikerMove = useCallback((position: Position) => {
    if (gameState.gamePhase !== 'aiming') return;
    
    // Validate striker position
    if (!carromGameLogic.canPlaceStriker(gameState, position)) {
      return;
    }
    
    setGameState(prevState => ({
      ...prevState,
      striker: {
        ...prevState.striker,
        position: { ...position }
      }
    }));
  }, [gameState]);

  const handleNewGame = useCallback(() => {
    const newGame = carromGameLogic.initializeGame();
    setGameState(newGame);
    setIsAnimating(false);
  }, []);

  const handleResetStriker = useCallback(() => {
    if (gameState.gamePhase !== 'aiming') return;
    
    setGameState(prevState => carromGameLogic.resetStrikerPosition(prevState));
  }, [gameState.gamePhase]);

  // Update game phase when animations start/stop
  useEffect(() => {
    if (isAnimating && gameState.gamePhase === 'shooting') {
      setGameState(prevState => ({
        ...prevState,
        gamePhase: 'moving'
      }));
    }
  }, [isAnimating, gameState.gamePhase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            🎯 Carrom Game 🎯
          </h1>
          <p className="text-lg text-amber-700">
            Classic 2-Player Board Game
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Left Panel - Score and Controls */}
          <div className="lg:order-1 lg:w-80">
            <ScoreBoard gameState={gameState} />
            <GameControls 
              gameState={gameState}
              onNewGame={handleNewGame}
              onResetStriker={handleResetStriker}
            />
          </div>
          
          {/* Center - Game Board */}
          <div className="lg:order-2 flex-1 max-w-2xl">
            <GameBoard 
              gameState={gameState}
              onShoot={handleShoot}
              onStrikerMove={handleStrikerMove}
            />
            
            {/* Game Instructions */}
            <div className="mt-4 text-center">
              <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                {gameState.gamePhase === 'aiming' && (
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold mb-1">
                      {gameState.players[gameState.currentPlayer - 1].name}&apos;s Turn
                    </div>
                    <div>
                      Drag striker to position, then click and drag to aim and shoot
                    </div>
                  </div>
                )}
                
                {(gameState.gamePhase === 'moving' || gameState.gamePhase === 'shooting') && (
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold mb-1">Pieces Moving...</div>
                    <div>Wait for all pieces to stop</div>
                  </div>
                )}
                
                {gameState.gamePhase === 'ended' && gameState.winner && (
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold mb-1">Game Over!</div>
                    <div>
                      {gameState.players[gameState.winner - 1].name} wins with {' '}
                      {gameState.players[gameState.winner - 1].score} points
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Additional Info */}
          <div className="lg:order-3 lg:w-80">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Quick Guide</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white border border-gray-400 rounded-full"></div>
                  <span>White pieces - Player 1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                  <span>Black pieces - Player 2</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span>Queen - Must be covered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded-full"></div>
                  <span>Striker - Your shooter</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <h4 className="font-semibold mb-2">Controls:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🖱️ Drag striker to position</li>
                  <li>🎯 Click and drag to aim</li>
                  <li>💪 Drag distance = power</li>
                  <li>📏 Yellow line = trajectory</li>
                  <li>🔴 Red line = power/direction</li>
                </ul>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <h4 className="font-semibold mb-2">Win Condition:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Pocket all your pieces</li>
                  <li>👑 Cover the queen if you took it</li>
                  <li>🏆 First to complete wins!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}