export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface GamePiece {
  id: string;
  type: 'white' | 'black' | 'queen' | 'striker';
  position: Position;
  velocity: Velocity;
  radius: number;
  active: boolean;
  pocketed: boolean;
  player?: 1 | 2;
}

export interface Player {
  id: 1 | 2;
  name: string;
  score: number;
  color: 'white' | 'black';
  hasQueen: boolean;
  queenCovered: boolean;
}

export interface GameState {
  players: [Player, Player];
  currentPlayer: 1 | 2;
  pieces: GamePiece[];
  striker: GamePiece;
  gamePhase: 'setup' | 'aiming' | 'shooting' | 'moving' | 'ended';
  winner: 1 | 2 | null;
  turnCount: number;
  fouls: { player1: number; player2: number };
}

export interface AimState {
  isAiming: boolean;
  startPosition: Position;
  currentPosition: Position;
  power: number;
  angle: number;
}

export interface GameSettings {
  boardSize: number;
  pocketRadius: number;
  pieceRadius: number;
  strikerRadius: number;
  friction: number;
  maxPower: number;
  minPower: number;
}