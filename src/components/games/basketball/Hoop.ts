import { Ball } from './Ball';
import { PhysicsConstants } from './types';

export class Hoop {
  x: number;
  y: number;
  side: 'left' | 'right';
  label: string;
  rimWidth: number = 110;
  rimDepth: number = 25;
  rimThickness: number = 8;
  backboardWidth: number = 130;
  backboardHeight: number = 95;
  poleHeight: number = 150;
  netHeight: number = 60;
  scored: boolean = false;
  scoreZoneY: number;
  animationScale: number = 1.0;
  animationProgress: number = 0;

  constructor(x: number, y: number, side: 'left' | 'right', label: string) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.label = label;
    this.scoreZoneY = y + this.rimThickness;
  }

  checkScore(ball: Ball): boolean {
    if (ball.isActive && !this.scored) {
      const isTargetBasket = this.side === ball.targetBasket;
      const xMargin = isTargetBasket ? 0 : 15;
      const yRange = isTargetBasket ? 80 : 30;
      
      const inXRange = ball.x > this.x - this.rimWidth / 2 + xMargin && 
                      ball.x < this.x + this.rimWidth / 2 - xMargin;
      const passingThrough = ball.y > this.scoreZoneY - 20 && 
                           ball.y < this.scoreZoneY + yRange;
      
      if (isTargetBasket && inXRange && passingThrough) {
        this.scored = true;
        this.startAnimation();
        return true;
      } else if (!isTargetBasket && inXRange && passingThrough && ball.vy > 0) {
        this.scored = true;
        this.startAnimation();
        return true;
      }
    }
    return false;
  }

  startAnimation(): void {
    this.animationProgress = 0;
    const animate = () => {
      this.animationProgress += 0.05;
      if (this.animationProgress < 1) {
        this.animationScale = 1 + Math.sin(this.animationProgress * Math.PI) * 0.15;
        requestAnimationFrame(animate);
      } else {
        this.animationScale = 1.0;
      }
    };
    animate();
  }

  resetScored(): void {
    this.scored = false;
  }

  collideWithBall(ball: Ball, physics: PhysicsConstants): void {
    if (!ball.isActive) return;

    const isTargetBasket = this.side === ball.targetBasket;
    if (isTargetBasket) return;

    const rimTop = this.y;
    const rimBottom = this.y + this.rimThickness;
    const rimLeft = this.x - this.rimWidth / 2;
    const rimRight = this.x + this.rimWidth / 2;

    // Rim top collision
    if (ball.y + ball.radius > rimTop && ball.y + ball.radius < rimBottom + 5) {
      if (ball.x > rimLeft && ball.x < rimRight) {
        if (ball.vy > 0) {
          ball.y = rimTop - ball.radius;
          ball.vy *= -physics.BOUNCE_DAMPING;
        }
      }
    }

    // Left rim edge
    if (ball.x > rimLeft - ball.radius && ball.x < rimLeft + 8 &&
        ball.y > rimTop - 5 && ball.y < rimBottom + 5) {
      ball.x = rimLeft - ball.radius;
      ball.vx *= -physics.BOUNCE_DAMPING;
    }

    // Right rim edge
    if (ball.x < rimRight + ball.radius && ball.x > rimRight - 8 &&
        ball.y > rimTop - 5 && ball.y < rimBottom + 5) {
      ball.x = rimRight + ball.radius;
      ball.vx *= -physics.BOUNCE_DAMPING;
    }
  }

  draw(ctx: CanvasRenderingContext2D, score: number): void {
    ctx.save();
    
    ctx.translate(this.x, this.y);
    ctx.scale(this.animationScale, this.animationScale);
    ctx.translate(-this.x, -this.y);

    // Backboard shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(
      this.x - this.backboardWidth / 2 + 5,
      this.y - this.poleHeight + 5,
      this.backboardWidth,
      this.backboardHeight
    );

    // Backboard
    const backboardGradient = ctx.createLinearGradient(
      this.x - this.backboardWidth / 2,
      0,
      this.x + this.backboardWidth / 2,
      0
    );
    backboardGradient.addColorStop(0, '#FFFFFF');
    backboardGradient.addColorStop(0.5, '#F5F5F5');
    backboardGradient.addColorStop(1, '#E0E0E0');
    
    ctx.fillStyle = backboardGradient;
    ctx.fillRect(
      this.x - this.backboardWidth / 2,
      this.y - this.poleHeight,
      this.backboardWidth,
      this.backboardHeight
    );

    // Backboard border
    ctx.strokeStyle = '#B0B0B0';
    ctx.lineWidth = 4;
    ctx.strokeRect(
      this.x - this.backboardWidth / 2,
      this.y - this.poleHeight,
      this.backboardWidth,
      this.backboardHeight
    );

    // Inner rectangle
    ctx.strokeStyle = '#D0D0D0';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      this.x - 35,
      this.y - this.poleHeight + 15,
      70,
      50
    );

    // Rim support
    ctx.fillStyle = '#666';
    ctx.fillRect(
      this.x - this.rimWidth / 2 - 5,
      this.y - 8,
      this.rimWidth + 10,
      8
    );

    // Rim back
    ctx.strokeStyle = '#CC4400';
    ctx.lineWidth = this.rimThickness;
    ctx.beginPath();
    ctx.ellipse(
      this.x,
      this.y + this.rimDepth / 2,
      this.rimWidth / 2,
      this.rimDepth / 2,
      0,
      Math.PI,
      0
    );
    ctx.stroke();

    // Rim front
    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = this.rimThickness;
    ctx.beginPath();
    ctx.ellipse(
      this.x,
      this.y,
      this.rimWidth / 2,
      this.rimDepth / 2,
      0,
      0,
      Math.PI
    );
    ctx.stroke();

    // Rim sides
    ctx.strokeStyle = '#DD4411';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - this.rimWidth / 2, this.y);
    ctx.lineTo(this.x - this.rimWidth / 2, this.y + this.rimDepth / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + this.rimWidth / 2, this.y);
    ctx.lineTo(this.x + this.rimWidth / 2, this.y + this.rimDepth / 2);
    ctx.stroke();

    // Net
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    const netSegments = 12;
    
    for (let i = 0; i <= netSegments; i++) {
      const angle = Math.PI * i / netSegments;
      const x1 = this.x + Math.cos(angle) * this.rimWidth / 2;
      const y1 = this.y;
      const bottomWidth = this.rimWidth * 0.4;
      const x2 = this.x + Math.cos(angle) * bottomWidth / 2;
      const y2 = this.y + this.netHeight;
      
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    for (let i = 1; i < 4; i++) {
      const yPos = this.y + (this.netHeight / 4) * i;
      const width = this.rimWidth * (1 - i * 0.15);
      
      ctx.beginPath();
      ctx.ellipse(
        this.x,
        yPos,
        width / 2,
        this.rimDepth / 2 * (1 - i * 0.1),
        0,
        Math.PI,
        0
      );
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0;
    ctx.restore();

    // Label
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x, this.y - this.poleHeight - 15);

    // Score
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText(String(score), this.x, this.y - this.poleHeight - 35);
  }
}
