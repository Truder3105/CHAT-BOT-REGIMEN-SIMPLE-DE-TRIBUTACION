# Sistema RST — Landing + Chatbot (Gestión del Conocimiento)

Proyecto web de **Gestión del Conocimiento** para el **Régimen Simple de Tributación (RST)** en Colombia, con **chatbot multilingüe** (español / inglés) integrado en la interfaz mediante **Google Gemini API** (REST), **modo local de respaldo** con base de conocimiento en JavaScript, e integración de la **Declaración Persona Transhumana** (visible y funcional).

**Universidad de Cundinamarca** — Fundamentos Deep Learning / integración de IA en desarrollos web.

---

## Enlace al repositorio GitHub (entrega)

> **Sustituye esta línea** por la URL pública de tu repositorio cuando lo crees en GitHub, por ejemplo:  
> `https://github.com/tu-usuario/tu-repo-rst-landing`

```text
[PEGA_AQUÍ_EL_LINK_DE_TU_REPOSITORIO_PUBLICO]
```

**Qué debe contener el repositorio público**

- Código fuente completo de la carpeta `rst-landing/` (o de este repo si la raíz es la carpeta del curso).
- Este `README.md` con tecnologías, arquitectura, instrucciones de ejecución y variables.
- **No** subas `config.local.js` ni `.env` con claves (están en `.gitignore`). Sí sube `config.local.example.js` y `.env.example` como plantillas.

---

## Cumplimiento con la rúbrica del profesor

### 1. Integración del chatbot (funcional en el proyecto web)


| Requisito                                 | Evidencia en el proyecto                                                                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integrado en el proyecto web              | Widget flotante **«Chat IA»** (`chatbot/chatbot.js` + `chatbot/chatbot.css`), montado desde `app.js` en `#rst-chatbot-root` en `index.html`.                    |
| Interacción básica con el usuario         | Envío de mensajes, historial de turnos, botón **Enviar**, indicador de escritura, teclado.                                                                      |
| Respuestas en **español e inglés**        | Selector **ES / EN** en la cabecera del chat; `buildSystemPrompt` en `chatbot/prompt-builder.js` fija reglas de idioma; textos de UI bilingües en `chatbot.js`. |
| Comunicación por interfaz web             | Panel de chat, formulario, accesibilidad básica (`aria-*`, `role="dialog"`).                                                                                    |
| Funcionamiento en el entorno del proyecto | Ejecución con Live Server o cualquier servidor estático sobre la carpeta `rst-landing`; módulos ES6; sin build obligatorio.                                     |


### 2. Tecnologías y herramientas (alineadas a ejemplos del curso / investigación)


| Ejemplo del enunciado                                      | Uso en este proyecto                                                                                                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **APIs cloud / IA**                                        | **Google Gemini API** (`generativelanguage.googleapis.com`): `ListModels`, `generateContent`, `systemInstruction`.          |
| **JavaScript**                                             | Lógica del cliente, módulos ES, `fetch`, DOM.                                                                               |
| **HTML5 / CSS3**                                           | `index.html` semántico, `style.css`, diseño responsive.                                                                     |
| **Servicios cloud**                                        | Documentación y arquitectura orientadas a **AWS** en la landing (S3, etc.); la clave se obtiene desde **Google AI Studio**. |
| *Opcionales mencionados* (OpenAI, LangChain, Node, React…) | No son obligatorios; aquí se priorizó **vanilla JS + Gemini** para claridad y despliegue estático.                          |


### 3. Declaración Persona Transhumana (visible y/o funcional)

Texto institucional: *«Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la construcción…»* y valores: desarrollo humano, ética, autonomía, transformación positiva, bienestar, evolución personal, responsabilidad social.


| Forma de integración (enunciado)    | Dónde está                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Mensaje inicial del chatbot         | Bloque de bienvenida en `chatbot/chatbot.js` (`welcomeTitle`, `quote`, `values`) en ES/EN.                |
| Módulo reflexivo en la conversación | Botón **«Módulo reflexivo»** / *Reflective prompt* que envía una pregunta-guía (autonomía + facturación). |
| Sección informativa del sistema     | Sección `**#filosofia`** en `index.html` + estilos `.filosofia` en `style.css`.                           |
| Respuestas contextuales del modelo  | `knowledge-base/persona-transhumana.js` + instrucciones en `chatbot/prompt-builder.js`.                   |
| Componente visual en la interfaz    | Chips de valores (ética, autonomía, etc.) y cita en la landing y en el chat.                              |
| Filosofía orientadora del proyecto  | README y narrativa del producto (gestión del conocimiento + responsabilidad).                             |


### 4. README (este archivo) — contenido exigido para GitHub

- **Tecnologías utilizadas:** secciones *Tecnologías* y tabla de la rúbrica arriba.  
- **Arquitectura general:** sección *Arquitectura general* más árbol de carpetas.  
- **Instrucciones de ejecución:** sección *Cómo ejecutar en local*.  
- **Variables de entorno necesarias:** sección *Variables de entorno y configuración*.

### 5. Video técnico en inglés

Debes **explicar técnicamente** la implementación en **inglés** (guion sugerido):

1. **Goal:** Knowledge-management landing for Colombian RST + DIAN context.
2. **Stack:** HTML5, CSS3, ES modules, Gemini REST API.
3. **Chat pipeline:** `chatbot.js` (UI, i18n) → `prompt-builder.js` (system prompt, scope, Persona Transhumana, bilingual rules) → `chatbot.service.js` (validate key, list text-capable models, `generateContent`, history trimming) → optional `chatbot-fallback.service.js` if API fails.
4. **Knowledge base:** `knowledge-base/*.js` aggregated in `index.js`.
5. **Security:** API key only in `config.local.js` (gitignored); production should use a backend proxy.
6. **Live demo:** ES/EN toggle, on-topic question, reflective module, local fallback if quota.

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│  Navegador (Landing RST)                                     │
│  index.html + style.css                                      │
│       │                                                      │
│       ▼                                                      │
│  app.js (orquestación: scroll, acordeones, formulario…)   │
│       │                                                      │
│       ├── components/*.js   (navbar, módulos, contacto…)   │
│       │                                                      │
│       └── chatbot/                                           │
│              chatbot.js  ←→  services/chatbot.service.js     │
│              prompt-builder.js    chatbot-fallback.service.js│
│              knowledge-base/index.js                         │
└─────────────────────────────────────────────────────────────┘
         │ HTTPS fetch
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Google Gemini API (v1beta)                                    │
│  GET /models  +  POST …/models/{id}:generateContent           │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend único:** no hay servidor Node obligatorio; el chat llama a Gemini desde el navegador (adecuado para demo académica; en producción se recomienda **proxy** para ocultar la clave).  
- **Modo local:** si la API falla (cuota, red, respuesta vacía, modalidades), `chatbot-fallback.service.js` responde con reglas y textos de `knowledge-base/`.

### Estructura de carpetas (código fuente)

```text
rst-landing/
├── index.html              # Landing + sección Persona Transhumana (#filosofia)
├── style.css
├── app.js                  # Punto de entrada (ES module)
├── config.sample.js        # Plantilla sin secretos (versionada)
├── config.local.example.js # Copia a config.local.js (no subir la copia con clave)
├── .env.example            # Referencia para futuro backend
├── .gitignore
├── README.md               # Este archivo
├── assets/                 # Imágenes, iconos (placeholders)
├── components/             # Inits por sección (navbar, módulos, contacto…)
├── services/             # chatbot.service.js, fallback, contacto, analytics
├── chatbot/              # UI del widget, prompt-builder, estilos
└── knowledge-base/       # Textos RST + Persona Transhumana para prompt y fallback
```

---

## Tecnologías utilizadas (resumen)

- **HTML5**, **CSS3**, **JavaScript (ES modules)**  
- **Google Gemini API** (REST: `ListModels`, `generateContent`, `systemInstruction`)  
- **Fuentes:** Syne, DM Sans, JetBrains Mono (Google Fonts)  
- **Control de versiones:** Git + `.gitignore` para secretos y artefactos

---

## Variables de entorno y configuración

### Frontend (obligatorio para probar el chat con Gemini)


| Variable / archivo                                    | Descripción                                                                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `**config.local.js`** (tú lo creas; **no** versionar) | `window.__RST_CONFIG__.GEMINI_API_KEY = "AIza…";` opcionalmente `GEMINI_MODEL` (solo modelos de **texto**, nunca `*-tts`). |
| `config.sample.js`                                    | Valores por defecto vacíos; se carga siempre antes de `config.local.js` en `app.js`.                                       |


### Backend futuro (opcional)


| Archivo | Uso                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------- |
| `.env`  | Si montas Express/FastAPI como proxy, define `GEMINI_API_KEY` ahí. Ver plantilla `**.env.example`**. |


El HTML **no** lee `.env` directamente; solo aplica si implementas servidor.

---

## Cómo ejecutar en local

1. Clona el repositorio o copia la carpeta `rst-landing`.
2. En VS Code: **File → Open Folder** → selecciona `**rst-landing`**.
3. Copia `config.local.example.js` → `**config.local.js**` y pega tu clave de [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Abre `index.html` con **Live Server** (o `npx serve rst-landing`).
5. Usa el botón **«Chat IA»**; prueba **ES / EN** y preguntas sobre RST / facturación / filosofía.

**Importante:** abre el servidor con la carpeta `rst-landing` como raíz para que resuelvan bien las rutas de los módulos.

---

## Cuota, modelos y modo local

Ver secciones anteriores del README (cuadro de causas y pruebas manuales). Si Gemini no responde, el chat activa respuestas desde `knowledge-base/` con el prefijo `[Modo local — Gemini no disponible]`.

---

## Buenas prácticas y control de versiones

- **Commits** con mensajes claros; ramas `main` / `feature/`* según acuerdo del equipo.  
- **No** subir `config.local.js`, `.env` ni claves en `config.sample.js`.  
- Revisar **Lighthouse** y contraste básico antes de entregar (recomendación del enunciado).

---

## Equipo

- Julián Esteban Ballesteros Ortiz — [jestebanballestero@ucundinamarca.edu.co](mailto:jestebanballestero@ucundinamarca.edu.co)  
- Juan Diego Walteros Cortés — [jdiegowalteros@ucundinamarca.edu.co](mailto:jdiegowalteros@ucundinamarca.edu.co)

## Universidad de Cundinamarca

Proyecto académico — Gestión del Conocimiento y fundamentos de deep learning (integración de chatbot e IA en la web).#   C H A T - B O T - R E G I M E N - S I M P L E - D E - T R I B U T A C I O N  
 