import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

interface UseRealTimeDataOptions<T> {
  initialData: T[];
  eventPrefix: string; // e.g., 'Socios', 'Recibos', 'Cortejos'
  onCreated?: (item: T) => void;
  onUpdated?: (item: T) => void;
  onDeleted?: (deletedId: number) => void;
}

export function useRealTimeData<T extends { id: number }>({
  initialData,
  eventPrefix,
  onCreated,
  onUpdated,
  onDeleted,
}: UseRealTimeDataOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const { on, off, isConnected } = useWebSocket();

  // Actualizar datos cuando cambie initialData
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleCreated = useCallback((newItem: T) => {
    setData(prev => [...prev, newItem]);
    onCreated?.(newItem);
  }, [onCreated]);

  const handleUpdated = useCallback((updatedItem: T) => {
    setData(prev => prev.map(item => 
      item.id === updatedItem.id ? { ...item, ...updatedItem } : item
    ));
    onUpdated?.(updatedItem);
  }, [onUpdated]);

  const handleDeleted = useCallback((deletedData: { id: number }) => {
    setData(prev => prev.filter(item => item.id !== deletedData.id));
    onDeleted?.(deletedData.id);
  }, [onDeleted]);

  useEffect(() => {
    if (!isConnected) return;

    const createdEvent = `${eventPrefix}_created`;
    const updatedEvent = `${eventPrefix}_updated`;
    const deletedEvent = `${eventPrefix}_deleted`;

    on(createdEvent, handleCreated);
    on(updatedEvent, handleUpdated);
    on(deletedEvent, handleDeleted);

    return () => {
      off(createdEvent, handleCreated);
      off(updatedEvent, handleUpdated);
      off(deletedEvent, handleDeleted);
    };
  }, [isConnected, eventPrefix, handleCreated, handleUpdated, handleDeleted, on, off]);

  return {
    data,
    setData,
    isConnected,
  };
}
