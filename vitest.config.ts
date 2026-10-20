import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Pruebas automáticas de la lógica que no puede fallar: plazos, alertas, avisos, firmas de enlaces y lectura de avisos de Hotmart.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      // 'server-only' solo existe dentro de Next.js; en las pruebas se sustituye por un módulo vacío
      'server-only': fileURLToPath(new URL('./tests/vacio.ts', import.meta.url)),
    },
  },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
