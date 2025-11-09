import { useEffect, useRef, RefObject } from 'react';
import { BasketballGame } from '@/components/games/basketball/BasketballGame';

interface Logo {
  id: string;
  name: string;
  image: string;
}

interface Bin {
  id: string;
  label: string;
}

interface UseBasketballGameProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  currentLogo: Logo | null;
  bins: Bin[];
  onScore: (logoId: string, binId: string, binLabel: string, basketSide: 'left' | 'right') => Promise<void>;
}

export const useBasketballGame = ({
  canvasRef,
  currentLogo,
  bins,
  onScore
}: UseBasketballGameProps) => {
  const gameRef = useRef<BasketballGame | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !currentLogo || bins.length < 2) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    // Setup canvas with DPR scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Load logo image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      logoImageRef.current = img;
      
      gameRef.current = new BasketballGame(
        canvas,
        bins[0].label,
        bins[1].label,
        img,
        async (basketSide) => {
          const binId = basketSide === 'left' ? bins[0].id : bins[1].id;
          const binLabel = basketSide === 'left' ? bins[0].label : bins[1].label;
          await onScore(currentLogo.id, binId, binLabel, basketSide);
        }
      );
    };
    img.src = currentLogo.image;

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      gameRef.current?.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasRef, currentLogo, bins, onScore]);

  // Load new logo when currentLogo changes (after scoring)
  useEffect(() => {
    if (gameRef.current && currentLogo && logoImageRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        logoImageRef.current = img;
        gameRef.current?.loadNewLogo(img);
      };
      img.src = currentLogo.image;
    }
  }, [currentLogo]);

  return { game: gameRef.current };
};
