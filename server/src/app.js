import express from 'express';
import cors from 'cors';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Проверка дали сървърът работи
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Тези двете винаги са последни
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
