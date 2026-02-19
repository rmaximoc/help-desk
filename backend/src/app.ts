import express from 'express';
import cors from 'cors';
import path from 'path';
import { router } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { env } from './config/env.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
const uploadsPath = path.resolve(process.cwd(), env.UPLOAD_FOLDER);
app.use('/uploads', express.static(uploadsPath));

// Rotas
app.use('/api', router);

// Rota raiz
app.get('/', (_req, res) => {
  res.json({
    name: 'Help Desk API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export { app };
