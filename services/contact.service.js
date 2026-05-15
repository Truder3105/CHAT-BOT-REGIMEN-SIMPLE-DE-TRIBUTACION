/** Simula envío de formulario; en producción conectar a backend */
export function submitContactForm(payload) {
  console.info("[contact.service] Enviaría:", payload);
  return Promise.resolve({ ok: true, message: "Mensaje registrado (demo local)." });
}
