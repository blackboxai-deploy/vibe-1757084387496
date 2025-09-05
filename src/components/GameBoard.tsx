'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GameState, AimState, Position, Velocity } from '@/types/carrom';
import { carromPhysics } from '@/lib/carrom-physics';
import {
  BOARD_SIZE,
  BORDER_WIDTH,
  POCKET_POSITIONS,
  POCKET_RADIUS,
  BOARD_COLOR,
  BORDER_COLOR,
  LINE_COLOR,
  POCKET_COLOR,
  WHITE_PIECE_COLOR,
  BLACK_PIECE_COLOR,
  QUEEN_COLOR,
  STRIKER_COLOR,
  MAX_POWER,
} from '@/lib/carrom-constants';

interface GameBoardProps {
  gameState: GameState;
  onShoot: (velocity: Velocity) => void;
  onStrikerMove: (position: Position) => void;
}

export default function GameBoard({ gameState, onShoot, onStrikerMove }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aimState, setAimState] = useState<AimState>({
    isAiming: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    power: 0,
    angle: 0,
  });
  
  const [isDraggingStriker, setIsDraggingStriker] = useState(false);

  // Convert screen coordinates to game coordinates
  const screenToGame = (screenX: number, screenY: number): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = BOARD_SIZE / canvas.width;
    const scaleY = BOARD_SIZE / canvas.height;
    
    const gameX = (screenX - rect.left) * scaleX - BOARD_SIZE / 2;
    const gameY = (screenY - rect.top) * scaleY - BOARD_SIZE / 2;
    
    return { x: gameX, y: gameY };
  };

  // Mouse/touch event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (gameState.gamePhase !== 'aiming') return;
    
    const pos = screenToGame(e.clientX, e.clientY);
    const strikerPos = gameState.striker.position;
    const distance = Math.sqrt(
      Math.pow(pos.x - strikerPos.x, 2) + Math.pow(pos.y - strikerPos.y, 2)
    );
    
    if (distance < gameState.striker.radius + 10) {
      setIsDraggingStriker(true);
    } else {
      setAimState({
        isAiming: true,
        startPosition: pos,
        currentPosition: pos,
        power: 0,
        angle: 0,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = screenToGame(e.clientX, e.clientY);
    
    if (isDraggingStriker) {
      onStrikerMove(pos);
    } else if (aimState.isAiming) {
      const dx = pos.x - aimState.startPosition.x;
      const dy = pos.y - aimState.startPosition.y;
      const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 20, MAX_POWER);
      const angle = Math.atan2(dy, dx);
      
      setAimState({
        ...aimState,
        currentPosition: pos,
        power,
        angle,
      });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingStriker) {
      setIsDraggingStriker(false);
    } else if (aimState.isAiming && aimState.power > 0) {
      const velocity: Velocity = {
        x: Math.cos(aimState.angle) * aimState.power,
        y: Math.sin(aimState.angle) * aimState.power,
      };
      
      onShoot(velocity);
      setAimState({
        ...aimState,
        isAiming: false,
        power: 0,
      });
    }
  };

  // Drawing functions
  const drawBoard = (ctx: CanvasRenderingContext2D) => {
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    
    // Draw border
    ctx.fillStyle = BORDER_COLOR;
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    
    // Draw playing area
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(BORDER_WIDTH, BORDER_WIDTH, 
      BOARD_SIZE - 2 * BORDER_WIDTH, BOARD_SIZE - 2 * BORDER_WIDTH);
    
    // Draw center circle
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw pockets
    ctx.fillStyle = POCKET_COLOR;
    for (const pocket of POCKET_POSITIONS) {
      ctx.beginPath();
      ctx.arc(
        pocket.x + centerX,
        pocket.y + centerY,
        POCKET_RADIUS,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
    
    // Draw baseline for current player
    const baselineY = gameState.currentPlayer === 1 
      ? BOARD_SIZE - BORDER_WIDTH - 30 
      : BORDER_WIDTH + 30;
    
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(BORDER_WIDTH + 20, baselineY);
    ctx.lineTo(BOARD_SIZE - BORDER_WIDTH - 20, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawPiece = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    radius: number, 
    color: string,
    strokeColor?: string
  ) => {
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + centerX, y + centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const drawAimingLine = (ctx: CanvasRenderingContext2D) => {
    if (!aimState.isAiming || aimState.power === 0) return;
    
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    const strikerX = gameState.striker.position.x + centerX;
    const strikerY = gameState.striker.position.y + centerY;
    
    // Draw power line
    ctx.strokeStyle = `rgba(255, 0, 0, ${Math.min(aimState.power / MAX_POWER, 1)})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(strikerX, strikerY);
    ctx.lineTo(
      strikerX + Math.cos(aimState.angle) * aimState.power * 10,
      strikerY + Math.sin(aimState.angle) * aimState.power * 10
    );
    ctx.stroke();
    
    // Draw trajectory preview
    if (aimState.power > 2) {
      const velocity = {
        x: Math.cos(aimState.angle) * aimState.power,
        y: Math.sin(aimState.angle) * aimState.power,
      };
      
      const trajectory = carromPhysics.calculateTrajectory(
        gameState.striker.position, 
        velocity, 
        30
      );
      
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      
      for (let i = 0; i < trajectory.length - 1; i++) {
        if (i === 0) {
          ctx.moveTo(trajectory[i].x + centerX, trajectory[i].y + centerY);
        } else {
          ctx.lineTo(trajectory[i].x + centerX, trajectory[i].y + centerY);
        }
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  // Main render function
  const render = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    
    // Draw board
    drawBoard(ctx);
    
    // Draw pieces
    gameState.pieces.forEach(piece => {
      if (!piece.pocketed) {
        let color = WHITE_PIECE_COLOR;
        let strokeColor = '#CCC';
        
        if (piece.type === 'black') {
          color = BLACK_PIECE_COLOR;
          strokeColor = '#000';
        } else if (piece.type === 'queen') {
          color = QUEEN_COLOR;
          strokeColor = '#8B0000';
        }
        
        drawPiece(ctx, piece.position.x, piece.position.y, piece.radius, color, strokeColor);
      }
    });
    
    // Draw striker
    if (!gameState.striker.pocketed) {
      drawPiece(
        ctx, 
        gameState.striker.position.x, 
        gameState.striker.position.y, 
        gameState.striker.radius, 
        STRIKER_COLOR,
        '#DEB887'
      );
    }
    
    // Draw aiming line
    drawAimingLine(ctx);
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      requestAnimationFrame(animate);
    };
    animate();
  }, [gameState, aimState]);

  return (
    <div className="flex justify-center items-center p-4">
      <canvas
        ref={canvasRef}
        width={BOARD_SIZE}
        height={BOARD_SIZE}
        className="border-2 border-gray-800 cursor-crosshair bg-amber-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDraggingStriker(false);
          setAimState({ ...aimState, isAiming: false });
        }}
      />
    </div>
  );
}