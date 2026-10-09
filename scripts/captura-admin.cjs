// Capturas del panel del dueño (375px celular y 1280px escritorio) + medición de desborde horizontal.
// Uso: node scripts/captura-admin.cjs <url-base> [carpeta-salida]
// Requiere que el panel sea accesible en la URL base (con sesión de administrador o en modo de prueba local).
const { chromium } = require('playwright-core');

const SECCIONES = ['', 'ventas', 'ganancia', 'usuarios', 'uso', 'negocio', 'salud', 'costos'];

(async () => {
  const base = process.argv[2] ?? 'http://localhost:3100';
  const salida = process.argv[3] ?? 'docs/revisiones';
  const navegador = await chromium.launch({ channel: 'msedge' });
  for (const [sufijo, w, h] of [['375', 375, 812], ['1280', 1280, 800]]) {
    for (const s of SECCIONES) {
      const nombre = s === '' ? 'admin-resumen' : `admin-${s}`;
      const p = await navegador.newPage({ viewport: { width: w, height: h } });
      const errores = [];
      p.on('pageerror', (e) => errores.push(String(e)));
      p.on('console', (m) => m.type() === 'error' && !/hmr|WebSocket/i.test(m.text()) && errores.push(m.text()));
      await p.goto(`${base}/admin${s ? '/' + s : ''}`, { waitUntil: 'networkidle' });
      const alto = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < alto; y += h / 2) {
        await p.evaluate((yy) => window.scrollTo(0, yy), y);
        await p.waitForTimeout(120);
      }
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(500);
      const ancho = await p.evaluate(() => document.documentElement.scrollWidth);
      console.log(`${nombre}-${sufijo}: ancho de contenido ${ancho} (ventana ${w})${ancho > w ? '  ⚠️ DESBORDE HORIZONTAL' : ''}${errores.length ? '  ⚠️ errores: ' + errores.join(' | ').slice(0, 200) : ''}`);
      await p.screenshot({ path: `${salida}/${nombre}-${sufijo}.png`, fullPage: true });
      await p.close();
    }
  }
  await navegador.close();
})();
