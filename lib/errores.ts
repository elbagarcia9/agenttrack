// Envía un error visto por una persona al servidor (error_log → panel del dueño). Nunca lanza.
export function reportarError(error: Error & { digest?: string }, contexto: string) {
  try {
    void fetch('/api/error', {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mensaje: `${error.name}: ${error.message}`.slice(0, 500),
        contexto,
        ruta: window.location.pathname,
      }),
    }).catch(() => undefined);
  } catch {
    /* reportar un error nunca causa otro */
  }
}
