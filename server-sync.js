import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Arquivo de dados compartilhado
const DATA_FILE = path.join(__dirname, 'guild-data.json');

// Inicializar arquivo de dados se não existir
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      pts: [],
      classes: [],
      rewards: [],
      presence: [],
      logo: null,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
};

// Ler dados do arquivo
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler dados:', error);
    return null;
  }
};

// Salvar dados no arquivo
const saveData = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
};

// Rotas
app.get('/api/data', (req, res) => {
  const data = readData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Erro ao ler dados' });
  }
});

app.post('/api/data', (req, res) => {
  const newData = req.body;
  if (saveData(newData)) {
    res.json({ success: true, data: newData });
  } else {
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
});

app.put('/api/data', (req, res) => {
  const updates = req.body;
  const currentData = readData();
  
  if (currentData) {
    const mergedData = { ...currentData, ...updates };
    if (saveData(mergedData)) {
      res.json({ success: true, data: mergedData });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar dados' });
    }
  } else {
    res.status(500).json({ error: 'Erro ao ler dados' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicializar e iniciar servidor
initializeDataFile();

app.listen(PORT, () => {
  console.log(`✅ Servidor de sincronização rodando na porta ${PORT}`);
  console.log(`📁 Arquivo de dados: ${DATA_FILE}`);
});
