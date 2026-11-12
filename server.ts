import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { 
  getAllPerjalananDinas, 
  upsertPerjalananDinas, 
  deletePerjalananDinas, 
  batchUpsertPerjalananDinas,
  getOrCreateUser 
} from './src/db/perjadinRepo.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// 1. API Routes
app.get('/api/perjadin', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getAllPerjalananDinas();
    res.json({ status: 'success', data });
  } catch (error: any) {
    console.error('API Error /api/perjadin:', error);
    res.status(500).json({ error: error.message || 'Gagal memuat data' });
  }
});

app.post('/api/perjadin', requireAuth, async (req: AuthRequest, res) => {
  try {
    const item = req.body;
    const saved = await upsertPerjalananDinas(item);
    res.json({ status: 'success', data: saved });
  } catch (error: any) {
    console.error('API Error POST /api/perjadin:', error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan data' });
  }
});

app.delete('/api/perjadin/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await deletePerjalananDinas(id);
    res.json({ status: 'success', message: `Perjadin ${id} dihapus` });
  } catch (error: any) {
    console.error('API Error DELETE /api/perjadin/:id:', error);
    res.status(500).json({ error: error.message || 'Gagal menghapus data' });
  }
});

app.post('/api/perjadin/batch', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Payload records harus berupa array' });
    }
    const count = await batchUpsertPerjalananDinas(records);
    res.json({ status: 'success', count });
  } catch (error: any) {
    console.error('API Error POST /api/perjadin/batch:', error);
    res.status(500).json({ error: error.message || 'Gagal batch menyimpan' });
  }
});

app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID dan email diperlukan' });
    }
    const user = await getOrCreateUser(uid, email, displayName);
    res.json({ status: 'success', user });
  } catch (error: any) {
    console.error('API Error POST /api/users/sync:', error);
    res.status(500).json({ error: error.message || 'Gagal sinkronisasi user' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'PostgreSQL Cloud SQL',
    timestamp: new Date().toISOString(),
  });
});

// 2. Mount Vite Middleware for Dev or Static Serve for Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
