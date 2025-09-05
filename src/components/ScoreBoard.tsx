'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameState } from '@/types/carrom';

interface ScoreBoardProps {
  gameState: GameState;
}

export default function ScoreBoard({ gameState }: ScoreBoardProps) {
  const { players, currentPlayer, turnCount, fouls } = gameState;

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Carrom Game</h2>
            <div className="text-sm text-gray-600">Turn {turnCount}</div>
          </div>
          
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  currentPlayer === player.id
                    ? 'bg-blue-50 border-2 border-blue-300 shadow-sm'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      player.color === 'white' 
                        ? 'bg-white border-gray-400' 
                        : 'bg-gray-800 border-gray-600'
                    }`}
                  />
                  <div>
                    <div className={`font-semibold ${
                      currentPlayer === player.id ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Playing {player.color} pieces
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      currentPlayer === player.id ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {player.score}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                  
                  {player.hasQueen && (
                    <Badge 
                      variant={player.queenCovered ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      👑 {player.queenCovered ? 'Covered' : 'Needs Cover'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Current Turn Indicator */}
          <div className="mt-4 text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Current Turn
            </div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
              <div
                className={`w-3 h-3 rounded-full ${
                  players[currentPlayer - 1].color === 'white' 
                    ? 'bg-white border-2 border-gray-400' 
                    : 'bg-gray-800'
                }`}
              />
              <span className="text-sm font-semibold text-blue-700">
                {players[currentPlayer - 1].name}
              </span>
            </div>
          </div>
          
          {/* Game Statistics */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-700">{turnCount}</div>
                <div className="text-xs text-gray-500">Turns</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {fouls.player1 + fouls.player2}
                </div>
                <div className="text-xs text-gray-500">Total Fouls</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {gameState.pieces.filter(p => p.pocketed).length}
                </div>
                <div className="text-xs text-gray-500">Pocketed</div>
              </div>
            </div>
          </div>
          
          {/* Individual Foul Count */}
          {(fouls.player1 > 0 || fouls.player2 > 0) && (
            <div className="mt-3 flex justify-center space-x-4 text-sm">
              <div className="text-red-600">
                P1 Fouls: {fouls.player1}
              </div>
              <div className="text-red-600">
                P2 Fouls: {fouls.player2}
              </div>
            </div>
          )}
          
          {/* Pieces Remaining */}
          <div className="mt-3 flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-white border border-gray-400 rounded-full"></div>
              <span className="text-gray-600">
                {gameState.pieces.filter(p => p.type === 'white' && !p.pocketed).length} left
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
              <span className="text-gray-600">
                {gameState.pieces.filter(p => p.type === 'black' && !p.pocketed).length} left
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-gray-600">
                {gameState.pieces.filter(p => p.type === 'queen' && !p.pocketed).length ? '👑' : '❌'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}