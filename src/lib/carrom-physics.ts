import { GamePiece, Position, Velocity } from '@/types/carrom';
import { 
  BOARD_SIZE, 
  BORDER_WIDTH, 
  POCKET_POSITIONS, 
  POCKET_RADIUS, 
  PHYSICS_SETTINGS 
} from './carrom-constants';

export class CarromPhysics {
  private boardBounds = {
    left: -BOARD_SIZE/2 + BORDER_WIDTH,
    right: BOARD_SIZE/2 - BORDER_WIDTH,
    top: -BOARD_SIZE/2 + BORDER_WIDTH,
    bottom: BOARD_SIZE/2 - BORDER_WIDTH,
  };

  updatePiece(piece: GamePiece, deltaTime: number = 1): GamePiece {
    if (!piece.active || piece.pocketed) return piece;

    // Apply friction
    const friction = PHYSICS_SETTINGS.friction;
    piece.velocity.x *= friction;
    piece.velocity.y *= friction;

    // Stop very slow pieces
    if (Math.abs(piece.velocity.x) < PHYSICS_SETTINGS.minVelocity && 
        Math.abs(piece.velocity.y) < PHYSICS_SETTINGS.minVelocity) {
      piece.velocity.x = 0;
      piece.velocity.y = 0;
    }

    // Update position
    piece.position.x += piece.velocity.x * deltaTime;
    piece.position.y += piece.velocity.y * deltaTime;

    // Check wall collisions
    this.handleWallCollisions(piece);

    // Check pocket collisions
    this.checkPocketCollision(piece);

    return piece;
  }

  private handleWallCollisions(piece: GamePiece): void {
    const { left, right, top, bottom } = this.boardBounds;

    // Left wall
    if (piece.position.x - piece.radius < left) {
      piece.position.x = left + piece.radius;
      piece.velocity.x = -piece.velocity.x * PHYSICS_SETTINGS.restitution;
    }

    // Right wall
    if (piece.position.x + piece.radius > right) {
      piece.position.x = right - piece.radius;
      piece.velocity.x = -piece.velocity.x * PHYSICS_SETTINGS.restitution;
    }

    // Top wall
    if (piece.position.y - piece.radius < top) {
      piece.position.y = top + piece.radius;
      piece.velocity.y = -piece.velocity.y * PHYSICS_SETTINGS.restitution;
    }

    // Bottom wall
    if (piece.position.y + piece.radius > bottom) {
      piece.position.y = bottom - piece.radius;
      piece.velocity.y = -piece.velocity.y * PHYSICS_SETTINGS.restitution;
    }
  }

  private checkPocketCollision(piece: GamePiece): boolean {
    for (const pocket of POCKET_POSITIONS) {
      const distance = this.getDistance(piece.position, pocket);
      if (distance < POCKET_RADIUS) {
        piece.pocketed = true;
        piece.active = false;
        piece.velocity.x = 0;
        piece.velocity.y = 0;
        return true;
      }
    }
    return false;
  }

  checkPieceCollision(piece1: GamePiece, piece2: GamePiece): boolean {
    if (!piece1.active || !piece2.active || piece1.pocketed || piece2.pocketed) {
      return false;
    }

    const distance = this.getDistance(piece1.position, piece2.position);
    const minDistance = piece1.radius + piece2.radius;

    if (distance < minDistance) {
      // Collision detected, resolve it
      this.resolvePieceCollision(piece1, piece2, distance, minDistance);
      return true;
    }

    return false;
  }

  private resolvePieceCollision(
    piece1: GamePiece, 
    piece2: GamePiece, 
    distance: number, 
    minDistance: number
  ): void {
    // Calculate collision normal
    const normal = {
      x: (piece2.position.x - piece1.position.x) / distance,
      y: (piece2.position.y - piece1.position.y) / distance,
    };

    // Separate pieces
    const overlap = minDistance - distance;
    const separation = overlap / 2;

    piece1.position.x -= normal.x * separation;
    piece1.position.y -= normal.y * separation;
    piece2.position.x += normal.x * separation;
    piece2.position.y += normal.y * separation;

    // Calculate relative velocity
    const relativeVelocity = {
      x: piece1.velocity.x - piece2.velocity.x,
      y: piece1.velocity.y - piece2.velocity.y,
    };

    // Calculate relative velocity along the collision normal
    const velocityAlongNormal = 
      relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

    // Do not resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Calculate restitution (bounciness)
    const restitution = PHYSICS_SETTINGS.restitution;

    // Calculate impulse scalar
    const impulse = -(1 + restitution) * velocityAlongNormal;

    // Apply impulse
    piece1.velocity.x += impulse * normal.x;
    piece1.velocity.y += impulse * normal.y;
    piece2.velocity.x -= impulse * normal.x;
    piece2.velocity.y -= impulse * normal.y;
  }

  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isMoving(pieces: GamePiece[]): boolean {
    return pieces.some(piece => 
      piece.active && 
      !piece.pocketed && 
      (Math.abs(piece.velocity.x) > PHYSICS_SETTINGS.minVelocity || 
       Math.abs(piece.velocity.y) > PHYSICS_SETTINGS.minVelocity)
    );
  }

  calculateTrajectory(
    position: Position, 
    velocity: Velocity, 
    steps: number = 50
  ): Position[] {
    const trajectory: Position[] = [];
    let pos = { ...position };
    let vel = { ...velocity };

    for (let i = 0; i < steps; i++) {
      // Apply friction
      vel.x *= PHYSICS_SETTINGS.friction;
      vel.y *= PHYSICS_SETTINGS.friction;

      // Update position
      pos.x += vel.x;
      pos.y += vel.y;

      // Check boundaries and bounce
      if (pos.x < this.boardBounds.left || pos.x > this.boardBounds.right) {
        vel.x = -vel.x * PHYSICS_SETTINGS.restitution;
      }
      if (pos.y < this.boardBounds.top || pos.y > this.boardBounds.bottom) {
        vel.y = -vel.y * PHYSICS_SETTINGS.restitution;
      }

      trajectory.push({ ...pos });

      // Stop if velocity is too low
      if (Math.abs(vel.x) < 0.1 && Math.abs(vel.y) < 0.1) break;
    }

    return trajectory;
  }
}

export const carromPhysics = new CarromPhysics();