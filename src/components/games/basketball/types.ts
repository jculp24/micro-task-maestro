export interface Point {
  x: number;
  y: number;
}

export interface TouchInfo {
  x: number;
  y: number;
  time: number;
}

export interface BallConfig {
  radius: number;
  color: string;
}

export interface HoopConfig {
  x: number;
  y: number;
  side: 'left' | 'right';
  label: string;
  rimWidth: number;
  rimDepth: number;
  rimThickness: number;
  backboardWidth: number;
  backboardHeight: number;
  poleHeight: number;
  netHeight: number;
}

export interface PhysicsConstants {
  GRAVITY: number;
  BOUNCE_DAMPING: number;
  FRICTION: number;
  FORCE_MULTIPLIER: number;
  MAX_UPWARD_VELOCITY: number;
  HOOP_MAGNET_STRENGTH: number;
}
