
import { useState, useEffect } from 'react';

interface UseDragProps {
  id: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export function useDrag({ id, onDragStart, onDragEnd, disabled = false }: UseDragProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (disabled && isDragging) {
      setIsDragging(false);
    }
  }, [disabled, isDragging]);

  // These props would be used with framer-motion or react-dnd in a real implementation
  // For now we'll simulate the dragging behavior
  const dragProps = {
    draggable: !disabled,
    onDragStart: (e: React.DragEvent) => {
      if (disabled) return;
      
      e.dataTransfer.setData('text/plain', id);
      setIsDragging(true);
      onDragStart?.();
    },
    onDragEnd: () => {
      if (disabled) return;
      
      setIsDragging(false);
      onDragEnd?.();
    },
    style: { cursor: disabled ? 'default' : 'grab' }
  };

  return { isDragging, dragProps };
}
