// Trecho de código para integrar WebSocket ao App.tsx
// Adicione isto após os imports existentes:

import { io, Socket } from 'socket.io-client';

// Adicione isto dentro do componente App, após os outros useEffect:

const socketRef = useRef<Socket | null>(null);
const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

// Setup WebSocket
useEffect(() => {
  const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
  
  const socket = io(WS_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socketRef.current = socket;

  socket.on('connect', () => {
    console.log('Conectado ao servidor WebSocket');
    setIsWebSocketConnected(true);
  });

  socket.on('initial-data', (data) => {
    console.log('Dados iniciais recebidos:', data);
    if (data.pts) setPts(data.pts);
    if (data.classes) setClasses(data.classes);
    if (data.rewards) setRewards(data.rewards);
    if (data.presence) setPresence(data.presence);
  });

  socket.on('data-updated', (data) => {
    console.log('Dados atualizados via WebSocket:', data);
    if (data.pts) setPts(data.pts);
    if (data.classes) setClasses(data.classes);
    if (data.rewards) setRewards(data.rewards);
    if (data.presence) setPresence(data.presence);
  });

  socket.on('disconnect', () => {
    console.log('Desconectado do servidor WebSocket');
    setIsWebSocketConnected(false);
  });

  socket.on('error', (error) => {
    console.error('Erro WebSocket:', error);
  });

  return () => {
    socket.disconnect();
  };
}, []);

// Função para sincronizar dados via WebSocket
const syncDataToWebSocket = (data: any) => {
  if (socketRef.current && isWebSocketConnected) {
    socketRef.current.emit('update-data', data);
  }
};

// Substitua os useEffect de localStorage por WebSocket:
// Ao invés de:
// useEffect(() => localStorage.setItem('nephilins_pts', JSON.stringify(pts)), [pts]);
// Use:
useEffect(() => {
  localStorage.setItem('nephilins_pts', JSON.stringify(pts));
  syncDataToWebSocket({
    pts,
    classes,
    rewards,
    presence,
    logo: guildLogo
  });
}, [pts, classes, rewards, presence, guildLogo, isWebSocketConnected]);
