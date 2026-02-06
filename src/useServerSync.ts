import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface ServerData {
  pts: any[];
  classes: string[];
  rewards: any[];
  presence: any[];
  guildLogo?: string | null;
}

export const useServerSync = (
  onDataUpdate: (data: ServerData) => void,
  enabled: boolean = true
) => {
  const socketRef: React.MutableRefObject<Socket | null> = { current: null };

  useEffect(() => {
    if (!enabled) return;

    const wsUrl = import.meta.env.REACT_APP_WS_URL || 'https://nephilins-guild.onrender.com';
    
    try {
      socketRef.current = io(wsUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      // Conectado
      socketRef.current.on('connect', () => {
        console.log('✅ Conectado ao servidor WebSocket');
      });

      // Receber dados iniciais
      socketRef.current.on('initial-data', (data: ServerData) => {
        console.log('📥 Dados iniciais recebidos:', data);
        onDataUpdate(data);
      });

      // Receber atualizações
      socketRef.current.on('data-updated', (data: ServerData) => {
        console.log('🔄 Dados atualizados recebidos:', data);
        onDataUpdate(data);
      });

      // Erro de conexão
      socketRef.current.on('connect_error', (error) => {
        console.warn('⚠️ Erro de conexão:', error);
      });

      // Desconectado
      socketRef.current.on('disconnect', () => {
        console.log('❌ Desconectado do servidor');
      });

    } catch (error) {
      console.error('❌ Erro ao conectar ao servidor:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [enabled, onDataUpdate]);

  const sendDataUpdate = useCallback((data: ServerData) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('update-data', data);
      console.log('📤 Dados enviados para o servidor');
    } else {
      console.warn('⚠️ Socket não conectado, tentando enviar via HTTP...');
      // Fallback para HTTP POST
      fetch(`${import.meta.env.REACT_APP_WS_URL || 'https://nephilins-guild.onrender.com'}/api/guild-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.error('Erro ao enviar dados:', err));
    }
  }, []);

  return { sendDataUpdate, socket: socketRef.current };
};
