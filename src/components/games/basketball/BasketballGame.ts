import { Ball } from './Ball';
import { Hoop } from './Hoop';
import { Point, TouchInfo, PhysicsConstants } from './types';

const PHYSICS: PhysicsConstants = {
  GRAVITY: 0.575,
  BOUNCE_DAMPING: 0.3,
  FRICTION: 0.98,
  FORCE_MULTIPLIER: 0.8,
  MAX_UPWARD_VELOCITY: -22,
  HOOP_MAGNET_STRENGTH: 0.6,
};

export class BasketballGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ball: Ball;
  private hoops: [Hoop, Hoop];
  private isDrawing: boolean = false;
  private touchStart: TouchInfo = { x: 0, y: 0, time: 0 };
  private touchEnd: TouchInfo = { x: 0, y: 0, time: 0 };
  private trajectoryPoints: Point[] = [];
  private animationFrameId: number | null = null;
  private onScore: (side: 'left' | 'right') => void;
  private scores = { left: 0, right: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    leftLabel: string,
    rightLabel: string,
    logoImage: HTMLImageElement,
    onScore: (side: 'left' | 'right') => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onScore = onScore;

    this.ball = new Ball(canvas.width / 2, canvas.height - 100, logoImage);
    
    this.hoops = [
      new Hoop(canvas.width * 0.22, 150, 'left', leftLabel),
      new Hoop(canvas.width * 0.78, 150, 'right', rightLabel),
    ];

    this.setupEventListeners();
    this.startGameLoop();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleStart);
    this.canvas.addEventListener('mousemove', this.handleMove);
    this.canvas.addEventListener('mouseup', this.handleEnd);
    this.canvas.addEventListener('touchstart', this.handleStart);
    this.canvas.addEventListener('touchmove', this.handleMove);
    this.canvas.addEventListener('touchend', this.handleEnd);
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.handleStart);
    this.canvas.removeEventListener('mousemove', this.handleMove);
    this.canvas.removeEventListener('mouseup', this.handleEnd);
    this.canvas.removeEventListener('touchstart', this.handleStart);
    this.canvas.removeEventListener('touchmove', this.handleMove);
    this.canvas.removeEventListener('touchend', this.handleEnd);
  }

  private handleStart = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault();
    if (this.ball.isActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    this.touchStart.x = clientX - rect.left;
    this.touchStart.y = clientY - rect.top;
    this.touchStart.time = Date.now();
    this.isDrawing = true;
    this.trajectoryPoints = [];
  };

  private handleMove = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault();
    if (!this.isDrawing || this.ball.isActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    const dx = currentX - this.touchStart.x;
    const dy = currentY - this.touchStart.y;

    if (dy < 0) {
      const forceX = dx * PHYSICS.FORCE_MULTIPLIER * 0.3;
      const forceY = dy * PHYSICS.FORCE_MULTIPLIER * 0.3;
      this.trajectoryPoints = this.predictTrajectory(forceX, forceY);
    }
  };

  private handleEnd = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault();
    if (!this.isDrawing || this.ball.isActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    this.touchEnd.x = clientX - rect.left;
    this.touchEnd.y = clientY - rect.top;
    this.touchEnd.time = Date.now();
    this.isDrawing = false;

    const dx = this.touchEnd.x - this.touchStart.x;
    const dy = this.touchEnd.y - this.touchStart.y;

    let targetBasket: 'left' | 'right';
    if (dx < -5) {
      targetBasket = 'left';
    } else if (dx > 5) {
      targetBasket = 'right';
    } else {
      const distToLeft = Math.abs(this.ball.x - (this.canvas.width * 0.22));
      const distToRight = Math.abs(this.ball.x - (this.canvas.width * 0.78));
      targetBasket = distToLeft < distToRight ? 'left' : 'right';
    }

    if (dy < -10) {
      const targetX = targetBasket === 'left' ? this.canvas.width * 0.22 : this.canvas.width * 0.78;
      const targetY = 150;
      
      this.ball.targetBasket = targetBasket;
      this.ball.launch(dx * PHYSICS.FORCE_MULTIPLIER, dy * PHYSICS.FORCE_MULTIPLIER, targetX, targetY, PHYSICS);
    }

    this.trajectoryPoints = [];
  };

  private predictTrajectory(vx: number, vy: number): Point[] {
    const points: Point[] = [];
    let x = this.ball.x;
    let y = this.ball.y;
    let velX = vx;
    let velY = vy;

    for (let i = 0; i < 60; i++) {
      velY += PHYSICS.GRAVITY;
      x += velX;
      y += velY;
      velX *= PHYSICS.FRICTION;

      points.push({ x, y });

      if (y > this.canvas.height || x < 0 || x > this.canvas.width) break;
    }

    return points;
  }

  private drawBrickWall(): void {
    const brickWidth = 50;
    const brickHeight = 20;
    const mortarThickness = 3;
    
    for (let row = 0; row < 25; row++) {
      const offsetX = (row % 2) * (brickWidth / 2);
      for (let col = -2; col < 15; col++) {
        const x = col * (brickWidth + mortarThickness) + offsetX;
        const y = row * (brickHeight + mortarThickness);
        
        const colorVariation = Math.floor((x + y) % 30);
        const red = 150 + colorVariation;
        const green = 60 + colorVariation / 2;
        const brown = 40 + colorVariation / 3;
        
        this.ctx.fillStyle = `rgb(${red}, ${green}, ${brown})`;
        this.ctx.fillRect(x, y, brickWidth, brickHeight);
        
        this.ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, brickWidth, brickHeight);
      }
    }
  }

  private drawFloor(): void {
    const floorGradient = this.ctx.createLinearGradient(0, this.canvas.height - 80, 0, this.canvas.height);
    floorGradient.addColorStop(0, '#8B4513');
    floorGradient.addColorStop(1, '#654321');
    this.ctx.fillStyle = floorGradient;
    this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);

    this.ctx.strokeStyle = '#FFF';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height - 80);
    this.ctx.lineTo(this.canvas.width, this.canvas.height - 80);
    this.ctx.stroke();
  }

  private drawTrajectory(): void {
    if (this.trajectoryPoints.length > 0 && !this.ball.isActive) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.trajectoryPoints.forEach((point, i) => {
        if (i === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      this.trajectoryPoints.forEach((point, i) => {
        if (i % 5 === 0) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });
    }
  }

  private gameLoop = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawBrickWall();
    this.drawFloor();
    this.drawTrajectory();

    const targetHoop = this.ball.targetBasket ? 
      this.hoops.find(h => h.side === this.ball.targetBasket) : undefined;

    this.hoops.forEach(hoop => {
      hoop.draw(this.ctx, hoop.side === 'left' ? this.scores.left : this.scores.right);
      hoop.collideWithBall(this.ball, PHYSICS);
      
      if (hoop.checkScore(this.ball)) {
        if (hoop.side === 'left') {
          this.scores.left++;
        } else {
          this.scores.right++;
        }
        
        this.onScore(hoop.side);
        
        setTimeout(() => {
          this.ball.reset(this.canvas.width, this.canvas.height);
          hoop.resetScored();
        }, 400);
      }
    });
    
    this.ball.update(
      this.canvas.width, 
      this.canvas.height, 
      PHYSICS,
      targetHoop?.x,
      targetHoop?.y
    );
    this.ball.draw(this.ctx);

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private startGameLoop(): void {
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  public loadNewLogo(logoImage: HTMLImageElement): void {
    this.ball.reset(this.canvas.width, this.canvas.height, logoImage);
  }

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.removeEventListeners();
  }
}
