// Punto de entrada - Autos Colombia Backend
// Inicializa datos de prueba y arranca el servidor Express

import app from './app.js';
import { PORT } from './config/constants.js';
import { seed } from './persistence/seed.js';

async function main() {
  try {
    // Crear datos iniciales si no existen
    await seed();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚗 Autos Colombia - Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📋 API disponible en http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

main();
