export const BOARD_SIZE = 600;
export const POCKET_RADIUS = 25;
export const PIECE_RADIUS = 12;
export const STRIKER_RADIUS = 15;
export const FRICTION = 0.98;
export const MAX_POWER = 15;
export const MIN_POWER = 1;
export const BORDER_WIDTH = 40;

// Board colors
export const BOARD_COLOR = '#D2B48C';
export const BORDER_COLOR = '#8B4513';
export const LINE_COLOR = '#654321';
export const POCKET_COLOR = '#2C1810';

// Piece colors
export const WHITE_PIECE_COLOR = '#FFFEF7';
export const BLACK_PIECE_COLOR = '#2C2C2C';
export const QUEEN_COLOR = '#DC143C';
export const STRIKER_COLOR = '#FFE4B5';

// Game pieces setup
export const INITIAL_PIECES = [
  // Center formation
  { type: 'queen' as const, x: 0, y: 0 },
  
  // White pieces
  { type: 'white' as const, x: -25, y: 0 },
  { type: 'white' as const, x: 25, y: 0 },
  { type: 'white' as const, x: 0, y: -25 },
  { type: 'white' as const, x: 0, y: 25 },
  { type: 'white' as const, x: -18, y: -18 },
  { type: 'white' as const, x: 18, y: -18 },
  { type: 'white' as const, x: -18, y: 18 },
  { type: 'white' as const, x: 18, y: 18 },
  { type: 'white' as const, x: -35, y: -12 },
  
  // Black pieces
  { type: 'black' as const, x: -12, y: -35 },
  { type: 'black' as const, x: 12, y: -35 },
  { type: 'black' as const, x: 35, y: -12 },
  { type: 'black' as const, x: 35, y: 12 },
  { type: 'black' as const, x: 12, y: 35 },
  { type: 'black' as const, x: -12, y: 35 },
  { type: 'black' as const, x: -35, y: 12 },
  { type: 'black' as const, x: -40, y: 0 },
  { type: 'black' as const, x: 40, y: 0 },
];

// Pocket positions (relative to center)
export const POCKET_POSITIONS = [
  { x: -BOARD_SIZE/2 + BORDER_WIDTH, y: -BOARD_SIZE/2 + BORDER_WIDTH },
  { x: BOARD_SIZE/2 - BORDER_WIDTH, y: -BOARD_SIZE/2 + BORDER_WIDTH },
  { x: -BOARD_SIZE/2 + BORDER_WIDTH, y: BOARD_SIZE/2 - BORDER_WIDTH },
  { x: BOARD_SIZE/2 - BORDER_WIDTH, y: BOARD_SIZE/2 - BORDER_WIDTH },
];

// Striker baseline positions
export const STRIKER_BASELINES = {
  player1: { y: BOARD_SIZE/2 - BORDER_WIDTH - 30 },
  player2: { y: -BOARD_SIZE/2 + BORDER_WIDTH + 30 },
};

export const PHYSICS_SETTINGS = {
  friction: FRICTION,
  restitution: 0.8,
  minVelocity: 0.1,
  maxCollisionIterations: 5,
};