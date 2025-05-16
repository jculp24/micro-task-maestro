
import { useState, useRef, useEffect } from 'react';

interface UseDroppableProps {
  id: string;
  onDrop: (itemId: string) => void;
}

export function useDroppable({ id, onDrop }: UseDroppableProps) {
  const [isOver, setIsOver] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const setNodeRef = (element: HTMLDivElement) => {
    nodeRef.current = element;
  };

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsOver(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setIsOver(true);
    };

    const handleDragLeave = () => {
      setIsOver(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer?.getData('text/plain');
      if (data) {
        setActive(data);
        onDrop(data);
      }
      setIsOver(false);
    };

    node.addEventListener('dragover', handleDragOver);
    node.addEventListener('dragenter', handleDragEnter);
    node.addEventListener('dragleave', handleDragLeave);
    node.addEventListener('drop', handleDrop);

    return () => {
      node.removeEventListener('dragover', handleDragOver);
      node.removeEventListener('dragenter', handleDragEnter);
      node.removeEventListener('dragleave', handleDragLeave);
      node.removeEventListener('drop', handleDrop);
    };
  }, [onDrop]);

  return {
    isOver,
    active,
    setNodeRef,
  };
}
