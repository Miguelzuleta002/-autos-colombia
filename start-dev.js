// Script para iniciar concurrentemente backend y frontend con `npm run dev` en la raíz

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🚗 AUTOS COLOMBIA — INICIANDO SERVIDORES DE DESARROLLO');
console.log('====================================================');
console.log('Backend  : http://localhost:3001');
console.log('Frontend : http://localhost:5173');
console.log('Presione Ctrl + C para detener ambos servidores.\n');

const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

function handleExit() {
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
