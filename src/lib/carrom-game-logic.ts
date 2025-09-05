import { GameState, GamePiece, Player, Position } from '@/types/carrom';
import { 
  INITIAL_PIECES, 
  BOARD_SIZE, 
  BORDER_WIDTH, 
  PIECE_RADIUS, 
  STRIKER_RADIUS,
  STRIKER_BASELINES 
} from './carrom-constants';

export class CarromGameLogic {
  initializeGame(): GameState {
    const players: [Player, Player] = [
      {
        id: 1,
        name: 'Player 1',
        score: 0,
        color: 'white',
        hasQueen: false,
        queenCovered: false,
      },
      {
        id: 2,
        name: 'Player 2',
        score: 0,
        color: 'black',
        hasQueen: false,
        queenCovered: false,
      },
    ];

    const pieces: GamePiece[] = INITIAL_PIECES.map((piece, index) => ({
      id: `piece-${index}`,
      type: piece.type,
      position: { x: piece.x, y: piece.y },
      velocity: { x: 0, y: 0 },
      radius: PIECE_RADIUS,
      active: true,
      pocketed: false,
      player: piece.type === 'white' ? 1 : piece.type === 'black' ? 2 : undefined,
    }));

    const striker: GamePiece = {
      id: 'striker',
      type: 'striker',
      position: { x: 0, y: STRIKER_BASELINES.player1.y },
      velocity: { x: 0, y: 0 },
      radius: STRIKER_RADIUS,
      active: true,
      pocketed: false,
    };

    return {
      players,
      currentPlayer: 1,
      pieces,
      striker,
      gamePhase: 'setup',
      winner: null,
      turnCount: 0,
      fouls: { player1: 0, player2: 0 },
    };
  }

  processMove(gameState: GameState): GameState {
    const newState = { ...gameState };
    let pocketedPieces: GamePiece[] = [];
    let strikerPocketed = false;

    // Check for pocketed pieces
    newState.pieces = newState.pieces.map(piece => {
      if (!piece.pocketed && piece.active) {
        return piece;
      } else if (piece.pocketed && !pocketedPieces.find(p => p.id === piece.id)) {
        pocketedPieces.push(piece);
      }
      return piece;
    });

    // Check if striker was pocketed
    if (newState.striker.pocketed) {
      strikerPocketed = true;
      // Return striker to baseline
      newState.striker = {
        ...newState.striker,
        position: { 
          x: 0, 
          y: newState.currentPlayer === 1 
            ? STRIKER_BASELINES.player1.y 
            : STRIKER_BASELINES.player2.y 
        },
        velocity: { x: 0, y: 0 },
        pocketed: false,
        active: true,
      };
    }

    // Process scoring
    const { scoredThisTurn, foul } = this.calculateScore(
      newState, 
      pocketedPieces, 
      strikerPocketed
    );

    // Check for game end
    const gameEnded = this.checkGameEnd(newState);
    if (gameEnded) {
      newState.gamePhase = 'ended';
      newState.winner = this.determineWinner(newState);
    }

    // Switch turns if no score or foul
    if (!scoredThisTurn || foul || gameEnded) {
      newState.currentPlayer = newState.currentPlayer === 1 ? 2 : 1;
    }

    newState.turnCount++;
    newState.gamePhase = gameEnded ? 'ended' : 'aiming';

    return newState;
  }

  private calculateScore(
    gameState: GameState,
    pocketedPieces: GamePiece[],
    strikerPocketed: boolean
  ): { scoredThisTurn: boolean; foul: boolean } {
    let scoredThisTurn = false;
    let foul = false;
    const currentPlayerIndex = gameState.currentPlayer - 1;
    const currentPlayer = gameState.players[currentPlayerIndex];

    // Check for fouls
    if (strikerPocketed) {
      foul = true;
      if (gameState.currentPlayer === 1) {
        gameState.fouls.player1++;
      } else {
        gameState.fouls.player2++;
      }
    }

    // Process pocketed pieces
    for (const piece of pocketedPieces) {
      if (piece.type === 'queen') {
        if (!foul) {
          currentPlayer.hasQueen = true;
          scoredThisTurn = true;
        }
      } else if (piece.player === gameState.currentPlayer) {
        // Scored own piece
        currentPlayer.score++;
        scoredThisTurn = true;
        
        // If player has queen and scores own piece, queen is covered
        if (currentPlayer.hasQueen && !currentPlayer.queenCovered) {
          currentPlayer.queenCovered = true;
        }
      } else {
        // Scored opponent's piece (foul)
        foul = true;
        const opponentIndex = gameState.currentPlayer === 1 ? 1 : 0;
        gameState.players[opponentIndex].score++;
      }
    }

    // Queen penalty if player has queen but doesn't cover it
    if (currentPlayer.hasQueen && !currentPlayer.queenCovered) {
      const ownPiecesLeft = gameState.pieces.filter(
        p => p.player === gameState.currentPlayer && !p.pocketed
      ).length;
      
      if (ownPiecesLeft === 0) {
        // Player pocketed all pieces but didn't cover queen
        currentPlayer.hasQueen = false;
        // Return queen to board (simplified - in real game it goes to opponent)
        const queen = gameState.pieces.find(p => p.type === 'queen');
        if (queen && queen.pocketed) {
          queen.pocketed = false;
          queen.active = true;
          queen.position = { x: 0, y: 0 };
        }
      }
    }

    return { scoredThisTurn, foul };
  }

  private checkGameEnd(gameState: GameState): boolean {
    for (const player of gameState.players) {
      const playerPieces = gameState.pieces.filter(
        p => p.player === player.id && !p.pocketed
      );
      
      // Player wins if they pocket all their pieces and have covered the queen (if they took it)
      if (playerPieces.length === 0) {
        if (!player.hasQueen || player.queenCovered) {
          return true;
        }
      }
    }
    
    return false;
  }

  private determineWinner(gameState: GameState): 1 | 2 | null {
    for (const player of gameState.players) {
      const playerPieces = gameState.pieces.filter(
        p => p.player === player.id && !p.pocketed
      );
      
      if (playerPieces.length === 0) {
        if (!player.hasQueen || player.queenCovered) {
          return player.id;
        }
      }
    }

    // If no clear winner, return player with higher score
    if (gameState.players[0].score > gameState.players[1].score) {
      return 1;
    } else if (gameState.players[1].score > gameState.players[0].score) {
      return 2;
    }

    return null; // Draw
  }

  canPlaceStriker(gameState: GameState, position: Position): boolean {
    const baseline = gameState.currentPlayer === 1 
      ? STRIKER_BASELINES.player1.y 
      : STRIKER_BASELINES.player2.y;

    // Check if striker is on correct baseline
    const tolerance = 20;
    if (Math.abs(position.y - baseline) > tolerance) {
      return false;
    }

    // Check if striker is within bounds
    const leftBound = -BOARD_SIZE/2 + BORDER_WIDTH + STRIKER_RADIUS;
    const rightBound = BOARD_SIZE/2 - BORDER_WIDTH - STRIKER_RADIUS;

    return position.x >= leftBound && position.x <= rightBound;
  }

  isValidShot(gameState: GameState, velocity: { x: number; y: number }): boolean {
    // Check minimum power
    const power = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    return power >= 1;
  }

  getActivePieces(gameState: GameState): GamePiece[] {
    return gameState.pieces.filter(piece => piece.active && !piece.pocketed);
  }

  getPlayerPieces(gameState: GameState, playerId: 1 | 2): GamePiece[] {
    return gameState.pieces.filter(
      piece => piece.player === playerId && piece.active && !piece.pocketed
    );
  }

  resetStrikerPosition(gameState: GameState): GameState {
    const newState = { ...gameState };
    const baseline = newState.currentPlayer === 1 
      ? STRIKER_BASELINES.player1.y 
      : STRIKER_BASELINES.player2.y;

    newState.striker.position = { x: 0, y: baseline };
    newState.striker.velocity = { x: 0, y: 0 };
    newState.striker.active = true;
    newState.striker.pocketed = false;

    return newState;
  }
}

export const carromGameLogic = new CarromGameLogic();