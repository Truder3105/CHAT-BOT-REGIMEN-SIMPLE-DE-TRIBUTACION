# Sistema RST — Landing + Chatbot (Gestión del Conocimiento)

Proyecto web de **Gestión del Conocimiento** para el **Régimen Simple de Tributación (RST)** en Colombia, con **chatbot multilingüe** (español / inglés) integrado mediante **Google Gemini API** (REST), **modo local de respaldo** con base de conocimiento en JavaScript, e integración de la **Declaración Persona Transhumana**.

**Universidad de Cundinamarca** — Fundamentos Deep Learning / integración de IA en desarrollos web.

**Repositorio:** [github.com/Truder3105/CHAT-BOT-REGIMEN-SIMPLE-DE-TRIBUTACION](https://github.com/Truder3105/CHAT-BOT-REGIMEN-SIMPLE-DE-TRIBUTACION)

---

## Contenido del repositorio (entrega)

- Código fuente de **`rst-landing/`** (landing + chatbot).
- Este **README** (tecnologías, arquitectura, ejecución, variables).
- **No** subir `config.local.js` ni `.env` con secretos (`.gitignore`). Sí versionar `config.local.example.js` y `.env.example`.

---

## Cumplimiento con la rúbrica

### 1. Integración del chatbot

| Requisito | Evidencia |
|-----------|-----------|
| Integrado en el proyecto web | Widget **Chat IA** en `chatbot/chatbot.js`, estilos en `chatbot/chatbot.css`, montaje desde `app.js` en `#rst-chatbot-root` (`index.html`). |
| Interacción básica | Mensajes, historial, botón Enviar, indicador de carga. |
| Español e inglés | Selector **ES / EN**; `chatbot/prompt-builder.js` define idioma; textos UI en `chatbot.js`. |
| Interfaz web | Panel, input, roles ARIA y `dialog`. |
| Entorno del proyecto | Live Server o servidor estático sobre `rst-landing/`; ES modules; sin build obligatorio. |

### 2. Tecnologías (ejemplos del curso / investigación)

| Enunciado | Uso aquí |
|-----------|----------|
| APIs cloud / IA | **Google Gemini API** — `ListModels`, `generateContent`, `systemInstruction`. |
| JavaScript | Cliente, módulos ES, `fetch`, DOM. |
| HTML5 / CSS3 | `index.html`, `style.css`, responsive. |
| Servicios cloud | Documentación **AWS** en la landing; clave desde **Google AI Studio**. |

### 3. Declaración Persona Transhumana

Cita institucional y valores (ética, autonomía, bienestar, etc.):

| Forma de integración | Ubicación |
|---------------------|-----------|
| Mensaje inicial del chat | Bienvenida en `chatbot/chatbot.js` (ES/EN). |
| Módulo reflexivo | Botón *Módulo reflexivo* / *Reflective prompt*. |
| Sección informativa | `#filosofia` en `index.html`, estilos en `style.css`. |
| Contexto del modelo | `knowledge-base/persona-transhumana.js` + `prompt-builder.js`. |
| Componente visual | Chips y cita en landing y chat. |

### 4. README (GitHub)

Este archivo cubre: tecnologías, arquitectura, instrucciones de ejecución y variables.

### 5. Video técnico en inglés (guion sugerido)

1. **Goal:** Landing de gestión del conocimiento para RST y contexto DIAN (Colombia).
2. **Stack:** HTML5, CSS3, ES modules, Gemini REST.
3. **Pipeline:** `chatbot.js` → `prompt-builder.js` → `chatbot.service.js` (clave, modelos de texto, `generateContent`) → `chatbot-fallback.service.js` si falla la API.
4. **Knowledge base:** `knowledge-base/*.js` vía `index.js`.
5. **Security:** clave en `config.local.js` (no en Git); producción con proxy backend.
6. **Demo:** ES/EN, pregunta on-topic, módulo reflexivo, modo local si hay cuota.

---

## Arquitectura general

```text
┌──────────────────────────────────────────┐
│  Navegador                                │
│  index.html + style.css                   │
│         │                                 │
│         ▼                                 │
│  app.js (navbar, reveal, formulario…)   │
│         │                                 │
│         ├── components/*.js               │
│         └── chatbot/ + services/          │
│              Gemini API (HTTPS)          │
└──────────────────────────────────────────┘
```

- **Frontend estático:** el chat llama a Gemini desde el navegador (demo académica). En producción, usar **proxy** para ocultar la API key.
- **Modo local:** si la API falla, `chatbot-fallback.service.js` usa `knowledge-base/`.

### Estructura de carpetas

```text
rst-landing/
├── index.html
├── style.css
├── app.js
├── config.sample.js
├── config.local.example.js
├── .env.example
├── .gitignore
├── README.md
├── assets/
├── components/
├── services/
├── chatbot/
└── knowledge-base/
```

---

## Tecnologías (resumen)

- HTML5, CSS3, **JavaScript (ES modules)**
- **Google Gemini API** (REST)
- Fuentes: Syne, DM Sans, JetBrains Mono (Google Fonts)
- **Git** + `.gitignore`

---

## Variables y configuración

| Archivo | Descripción |
|---------|-------------|
| **`config.local.js`** (crear tú; no subir con clave) | `window.__RST_CONFIG__.GEMINI_API_KEY = "AIza…"`; opcional `GEMINI_MODEL` (solo modelos de **texto**, nunca `*-tts`). |
| `config.sample.js` | Valores por defecto; se importa antes de `config.local.js` en `app.js`. |
| `.env` | Solo si añades backend proxy; plantilla en `.env.example`. |

---

## Cómo ejecutar en local

1. Clona el repo y abre la carpeta **`rst-landing`** en VS Code (**File → Open Folder**).
2. Copia `config.local.example.js` a **`config.local.js`** y pega tu clave de [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Ejecuta **Live Server** sobre `index.html` (o `npx serve rst-landing`).
4. Pulsa **Chat IA**; prueba **ES / EN** y preguntas sobre RST, facturación o filosofía.

**Importante:** el servidor debe servir **`rst-landing/`** como raíz para que carguen los módulos ES.

### Cuota y modo local

Si Gemini no responde (cuota, red, etc.), el chat usa la base de conocimiento con el prefijo `[Modo local — Gemini no disponible]`.

---

## Buenas prácticas

- Commits con mensajes claros; ramas `main` / `feature/*` según el equipo.
- No versionar secretos en `config.sample.js` ni en el README.
- Revisar contraste y accesibilidad antes de entregar.

---

## Equipo

- **Julián Esteban Ballesteros Ortiz** — jestebanballestero@ucundinamarca.edu.co  
- **Juan Diego Walteros Cortés** — jdiegowalteros@ucundinamarca.edu.co  

**Universidad de Cundinamarca** — Proyecto académico (Gestión del Conocimiento y deep learning / chatbot en la web).
