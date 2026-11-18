import React, { createContext, useContext, useEffect, useRef } from 'react';

type EventHandler = (event: { type: string; payload: any }) => void;

interface EventsContextType {
  subscribe: (handler: EventHandler) => () => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handlersRef = useRef<Set<EventHandler>>(new Set());

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            for (const handler of handlersRef.current) {
              handler(data);
            }
          } catch (err) {
            // Ignore parse errors (e.g. heartbeat)
          }
        };

        eventSource.onerror = () => {
          if (eventSource) eventSource.close();
          // Attempt reconnect after 5s
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.warn('[EventsContext] Failed to initialize SSE:', err);
      }
    };

    connect();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const subscribe = (handler: EventHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  };

  return <EventsContext.Provider value={{ subscribe }}>{children}</EventsContext.Provider>;
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) throw new Error('useEvents must be used within EventsProvider');
  return context;
};
