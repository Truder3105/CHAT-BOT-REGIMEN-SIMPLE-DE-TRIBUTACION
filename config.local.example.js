// 1) Copia este archivo como `config.local.js` en la MISMA carpeta rst-landing (no se sube a git).
// 2) Único sitio necesario para la clave del chat en el navegador:

window.__RST_CONFIG__ = window.__RST_CONFIG__ || {};
window.__RST_CONFIG__.GEMINI_API_KEY = "PASTE_YOUR_KEY_HERE";

// Opcional: forzar un modelo concreto (solo si sabes el id exacto en tu cuenta).
// Si lo omites, la app llama a ListModels y elige el mejor disponible (p. ej. flash-lite).
// window.__RST_CONFIG__.GEMINI_MODEL = "gemini-2.0-flash-lite";
