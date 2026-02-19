
import { useEffect } from 'react';
import { socketClient } from '../api/websocket';

export const useWebSocket = (onMessage: (data: unknown) => void) => {
  useEffect(() => {
    const unsubscribe = socketClient.subscribe(onMessage);
    return () => { unsubscribe(); };
  }, [onMessage]);
};
