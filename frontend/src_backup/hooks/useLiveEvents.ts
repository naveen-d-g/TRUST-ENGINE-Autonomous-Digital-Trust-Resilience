import { useState, useEffect, useRef } from 'react';

/**
 * useLiveEvents Hook
 * WebSocket first, Polling fallback. 
 * Resilient real-time data transport for the SOC Command Center.
 */
export const useLiveEvents = <T>(endpoint: string, initialData: T, pollInterval: number = 5000) => {
    const [data, setData] = useState<T>(initialData);
    const [isLive, setIsLive] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Attempt WebSocket Connection
        const wsUrl = `ws://localhost:5000/api/v1/ws${endpoint}?token=dev-api-key&tenant_id=tenant_1`;
        
        const connect = () => {
            try {
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log(`[WS] Connected to ${endpoint}`);
                    setIsLive(true);
                };

                ws.onmessage = (event) => {
                    try {
                        const payload = JSON.parse(event.data);
                        setData(payload);
                    } catch (e) {
                        console.error("[WS] Parse Error", e);
                    }
                };

                ws.onclose = () => {
                    console.warn(`[WS] Closed ${endpoint}. Falling back to polling.`);
                    setIsLive(false);
                    // Reconnection logic could go here, but we have polling fallback
                };

                ws.onerror = (err) => {
                    console.error(`[WS] Error on ${endpoint}`, err);
                    ws.close();
                };
            } catch (e) {
                console.error(`[WS] Connection Failed to ${endpoint}`, e);
                setIsLive(false);
            }
        };

        connect();

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [endpoint]);

    // Polling Fallback
    useEffect(() => {
        if (isLive) return;

        const timer = setInterval(async () => {
            try {
                const response = await fetch(`/api/v1${endpoint}`, {
                    headers: {
                        'X-API-Key': 'dev-api-key',
                        'X-Tenant-ID': 'tenant_1'
                    }
                });
                if (response.ok) {
                    const payload = await response.json();
                    setData(payload);
                }
            } catch (e) {
                console.error(`[Poll] Error on ${endpoint}`, e);
            }
        }, pollInterval);

        return () => clearInterval(timer);
    }, [endpoint, isLive, pollInterval]);

    return { data, isLive };
};
