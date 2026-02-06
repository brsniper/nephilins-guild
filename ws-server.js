import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'guild-data.json');

// Dados padrão
const defaultData = {
  pts: [],
  guerreiros: [],
  premios: [],
  classes: [],
  batalhas: []
};

// Carregar dados
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }
  return defaultData;
}

// Salvar dados
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let guildData = loadData();

// Rotas HTTP
app.get('/api/guild-data', (req, res) => {
  res.json(guildData);
});

app.post('/api/guild-data', (req, res) => {
  guildData = req.body;
  saveData(guildData);
  // Emitir para todos os clientes conectados
  io.emit('data-updated', guildData);
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket - Socket.io
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Enviar dados atuais ao conectar
  socket.emit('initial-data', guildData);

  // Escutar atualizações de dados
  socket.on('update-data', (data) => {
    guildData = data;
    saveData(guildData);
    // Emitir para todos os clientes (incluindo o que enviou)
    io.emit('data-updated', guildData);
  });

  // Escutar desconexão
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket rodando na porta ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});
