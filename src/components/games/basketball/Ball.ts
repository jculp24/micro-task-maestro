import { PhysicsConstants } from './types';

const BALL_COLORS = ['#FF6B35', '#F7931E', '#FDC830', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF6F91', '#C44569'];

export class Ball {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  radius: number = 28;
  rotation: number = 0;
  rotationSpeed: number = 0;
  isActive: boolean = false;
  color: string;
  logoImage: HTMLImageElement | null = null;
  targetBasket: 'left' | 'right' | null = null;
  prevY: number;

  constructor(x: number, y: number, logoImage?: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.prevY = y;
    this.color = this.getRandomColor();
    this.logoImage = logoImage || null;
  }

  private getRandomColor(): string {
    return BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  reset(canvasWidth: number, canvasHeight: number, newLogoImage?: HTMLImageElement): void {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 100;
    this.vx = 0;
    this.vy = 0;
    this.isActive = false;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.color = this.getRandomColor();
    this.prevY = this.y;
    this.targetBasket = null;
    if (newLogoImage) {
      this.logoImage = newLogoImage;
    }
  }

  launch(forceX: number, forceY: number, targetHoopX: number, targetHoopY: number, physics: PhysicsConstants): void {
    const dx = targetHoopX - this.x;
    const dy = targetHoopY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const timeToTarget = Math.sqrt(distance / 15);
    
    this.vx = dx / timeToTarget;
    this.vy = (dy - 0.5 * physics.GRAVITY * timeToTarget * timeToTarget) / timeToTarget;
    
    if (this.vy < physics.MAX_UPWARD_VELOCITY * 1.5) {
      this.vy = physics.MAX_UPWARD_VELOCITY * 1.5;
    }
    
    this.isActive = true;
    this.rotationSpeed = this.vx * 0.02;
  }

  update(canvasWidth: number, canvasHeight: number, physics: PhysicsConstants, targetHoopX?: number, targetHoopY?: number): void {
    if (!this.isActive) return;

    this.prevY = this.y;
    this.vy += physics.GRAVITY;

    // Magnetic guidance to target
    if (this.targetBasket && targetHoopX !== undefined && targetHoopY !== undefined) {
      const dx = targetHoopX - this.x;
      const dy = targetHoopY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const baseStrength = 0.8;
      const closenessFactor = Math.max(0.5, 1 - (distance / 400));
      const pullStrength = baseStrength * (1 + closenessFactor);
      
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      this.vx += dirX * pullStrength;
      this.vy += dirY * pullStrength;
      
      if (distance < 150) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const targetSpeed = Math.max(speed, 5);
        this.vx = dirX * targetSpeed;
        this.vy = dirY * targetSpeed;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.targetBasket) {
      this.vx *= 0.995;
    } else {
      this.vx *= physics.FRICTION;
    }

    this.rotation += this.rotationSpeed;

    // Wall collisions
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -physics.BOUNCE_DAMPING * 0.5;
    } else if (this.x + this.radius > canvasWidth) {
      this.x = canvasWidth - this.radius;
      this.vx *= -physics.BOUNCE_DAMPING * 0.5;
    }

    // Floor collision
    if (this.y + this.radius > canvasHeight) {
      this.y = canvasHeight - this.radius;
      this.vy *= -physics.BOUNCE_DAMPING;
      this.vx *= physics.FRICTION;
      
      if (Math.abs(this.vy) < 1 && Math.abs(this.vx) < 1) {
        setTimeout(() => this.reset(canvasWidth, canvasHeight), 1000);
      }
    }

    // Reset if out of bounds
    if (this.y > canvasHeight + 100) {
      this.reset(canvasWidth, canvasHeight);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(3, 3, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, this.radius);
    gradient.addColorStop(0, this.lightenColor(this.color, 20));
    gradient.addColorStop(1, this.color);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw logo on ball
    if (this.logoImage) {
      // White circle background
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      // Clip to circle
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw logo
      const logoSize = this.radius * 1.2;
      ctx.drawImage(
        this.logoImage,
        -logoSize / 2,
        -logoSize / 2,
        logoSize,
        logoSize
      );
    }

    ctx.restore();
  }
}
