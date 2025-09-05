'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { GameState } from '@/types/carrom';

interface GameControlsProps {
  gameState: GameState;
  onNewGame: () => void;
  onResetStriker: () => void;
}

export default function GameControls({ gameState, onNewGame, onResetStriker }: GameControlsProps) {
  const { gamePhase, winner } = gameState;
  
  const GameRulesContent = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div>
        <h3 className="font-semibold text-lg mb-2">Objective</h3>
        <p className="text-sm text-gray-600">
          Pocket all pieces of your assigned color (white or black) and cover the queen 
          (red piece) by pocketing one of your own pieces immediately after pocketing the queen.
        </p>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">Game Setup</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Player 1 plays white pieces, Player 2 plays black pieces</li>
          <li>• 9 white pieces, 9 black pieces, and 1 red queen</li>
          <li>• Each player uses the striker to shoot pieces</li>
          <li>• Players alternate turns</li>
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">How to Play</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Drag the striker to position it on your baseline</li>
          <li>• Click and drag from the striker to aim and set power</li>
          <li>• Release to shoot the striker</li>
          <li>• Yellow dotted line shows trajectory preview</li>
          <li>• Red line shows power and direction</li>
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">Scoring</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Pocket your own pieces to score points</li>
          <li>• Each pocketed piece = 1 point</li>
          <li>• Continue playing if you score on your turn</li>
          <li>• Turn switches if you miss or commit a foul</li>
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">Queen Rules</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Queen can be pocketed by any player</li>
          <li>• Must be &quot;covered&quot; by pocketing your own piece next</li>
          <li>• If not covered, queen returns to the board</li>
          <li>• Queen must be covered to win the game</li>
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">Fouls</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Pocketing the striker</li>
          <li>• Pocketing opponent&apos;s pieces (gives them points)</li>
          <li>• Not hitting any piece with the striker</li>
          <li>• Fouls end your turn and may give opponent an advantage</li>
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">Winning</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Pocket all your pieces</li>
          <li>• If you took the queen, it must be covered</li>
          <li>• First player to achieve this wins</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Game Status */}
      <Card>
        <CardContent className="p-4 text-center">
          {winner ? (
            <div className="space-y-2">
              <div className="text-xl font-bold text-green-600">
                🎉 Game Over! 🎉
              </div>
              <div className="text-lg">
                <Badge variant="default" className="text-lg px-4 py-2">
                  {gameState.players[winner - 1].name} Wins!
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Final Score: {gameState.players[0].score} - {gameState.players[1].score}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                {gamePhase === 'setup' && 'Game Ready to Start'}
                {gamePhase === 'aiming' && 'Aim and Shoot'}
                {gamePhase === 'shooting' && 'Striker Moving...'}
                {gamePhase === 'moving' && 'Pieces Moving...'}
              </div>
              
              {gamePhase === 'aiming' && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>1. Position striker on baseline by dragging</p>
                  <p>2. Click and drag from striker to aim</p>
                  <p>3. Release to shoot</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={onNewGame}
          variant="default"
          className="font-semibold"
        >
          {winner ? 'New Game' : 'Restart'}
        </Button>
        
        <Button 
          onClick={onResetStriker}
          variant="outline"
          disabled={gamePhase !== 'aiming'}
          className="font-semibold"
        >
          Reset Striker
        </Button>
      </div>

      {/* Rules Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full font-semibold">
            📖 Game Rules
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Carrom Game Rules</DialogTitle>
          </DialogHeader>
          <GameRulesContent />
        </DialogContent>
      </Dialog>

      {/* Game Phase Indicator */}
      <div className="flex justify-center">
        <Badge 
          variant={gamePhase === 'moving' || gamePhase === 'shooting' ? 'secondary' : 'default'}
          className="px-3 py-1"
        >
          {gamePhase === 'setup' && '⚡ Ready'}
          {gamePhase === 'aiming' && '🎯 Aiming'}
          {gamePhase === 'shooting' && '🚀 Shooting'}
          {gamePhase === 'moving' && '⚪ Moving'}
          {gamePhase === 'ended' && '🏁 Finished'}
        </Badge>
      </div>

      {/* Tips */}
      {gamePhase === 'aiming' && (
        <Card className="bg-blue-50">
          <CardContent className="p-3">
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-1">💡 Pro Tips:</div>
              <ul className="space-y-1">
                <li>• Use bank shots to reach difficult pieces</li>
                <li>• Control power with drag distance</li>
                <li>• Yellow line shows trajectory preview</li>
                <li>• Plan queen coverage in advance</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}