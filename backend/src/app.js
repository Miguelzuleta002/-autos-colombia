// Configuración de la aplicación Express - Autos Colombia

import express from 'express';
import cors from 'cors';
import apiRoutes from './api/routes/index.js';
import { errorHandler } from './api/middlewares/errorHandler.js';

const app = express();

// --- Middlewares globales ---

// CORS: permitir peticiones desde el frontend Vite
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parseo de JSON en el body
app.use(express.json());

// --- Rutas de la API ---
app.use('/api', apiRoutes);

// --- Middleware centralizado de errores (debe ir al final) ---
app.use(errorHandler);

export default app;
