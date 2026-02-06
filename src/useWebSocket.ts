import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';

export function useWebSocket(onDataUpdate: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Conectar ao servidor WebSocket
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Quando conectar
    socket.on('connect', () => {
      console.log('Conectado ao servidor WebSocket');
      isConnectedRef.current = true;
    });

    // Receber dados iniciais
    socket.on('initial-data', (data) => {
      console.log('Dados iniciais recebidos:', data);
      onDataUpdate(data);
    });

    // Receber atualizações de dados
    socket.on('data-updated', (data) => {
      console.log('Dados atualizados:', data);
      onDataUpdate(data);
    });

    // Quando desconectar
    socket.on('disconnect', () => {
      console.log('Desconectado do servidor WebSocket');
      isConnectedRef.current = false;
    });

    // Quando houver erro
    socket.on('error', (error) => {
      console.error('Erro WebSocket:', error);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [onDataUpdate]);

  // Função para enviar dados
  const sendData = useCallback((data: any) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('update-data', data);
    } else {
      console.warn('WebSocket não está conectado');
    }
  }, []);

  return {
    sendData,
    isConnected: isConnectedRef.current
  };
}
