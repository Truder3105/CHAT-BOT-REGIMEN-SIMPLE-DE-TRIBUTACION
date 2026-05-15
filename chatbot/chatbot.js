import { buildSystemPrompt } from "./prompt-builder.js";
import {
  sendGeminiMessage,
  validateGeminiApiKey,
  isQuotaOrRateLimitError,
  isEmptyResponseError,
} from "../services/chatbot.service.js";
import { answerWithLocalKnowledge } from "../services/chatbot-fallback.service.js";

const I18N = {
  es: {
    title: "Asistente RST",
    placeholder: "Escribe tu pregunta…",
    send: "Enviar",
    reflect: "Módulo reflexivo",
    suggestEn: "Try in English",
    hint: "Clave: solo en config.local.js (ver README). El modelo se elige automáticamente según tu cuenta.",
    welcomeTitle: "Bienvenida",
    welcomeBody:
      "Soy el asistente del Sistema RST. Puedo orientarte sobre facturación electrónica, el régimen simple y la arquitectura del proyecto.",
    quoteLabel: "Declaración Persona Transhumana",
    quote:
      "«Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la construcción, como ideal regulativo; me dirijo, controlo y dicto mis propias leyes.»",
    values:
      "Ética, autonomía, bienestar, transformación positiva y responsabilidad social guían el diseño de este sistema de gestión del conocimiento tributario.",
    reflectPrompt:
      "¿Cómo se relaciona la autonomía del contribuyente con el uso responsable de la facturación electrónica en el RST?",
    keyMissing:
      "Falta la clave de Gemini. Crea config.local.js a partir del README e introduce GEMINI_API_KEY.",
    errorGeneric: "No pude completar la respuesta. Revisa la conexión o la clave API.",
    errorKeyFormat:
      "La clave no parece válida: debe ser la API key de Google AI Studio (suele empezar por «AIza» y tener unos 39 caracteres). Revisa config.local.js.",
    errorBadManualModel:
      "GEMINI_MODEL apunta a un id que no existe o no admite generateContent. Quita GEMINI_MODEL en config.local.js para que el sitio elija un modelo disponible automáticamente (ListModels).",
    errorModelAudioOnly:
      "GEMINI_MODEL apunta a un modelo solo de audio (p. ej. *-tts). Este chat necesita salida de texto. Borra GEMINI_MODEL o elige en AI Studio un modelo Flash estándar con salida TEXT.",
    errorQuota:
      "Cuota de Google agotada o límite del plan para el modelo usado. Espera el tiempo que indica el error, revisa facturación en AI Studio, o quita GEMINI_MODEL y deja la selección automática.",
    localModeTag: "[Modo local — Gemini no disponible] ",
    quotaHintShort:
      "Nota: respuesta desde la base de conocimiento del proyecto (sin API). Cuando Google restaure cuota o uses otra clave, volverás a tener respuestas generadas por Gemini.",
    emptyApiHint:
      "La API de Gemini devolvió una respuesta vacía (p. ej. filtro de seguridad o contexto demasiado largo). Se muestra la respuesta local equivalente.",
  },
  en: {
    title: "RST Assistant",
    placeholder: "Type your question…",
    send: "Send",
    reflect: "Reflective prompt",
    suggestEn: "Español",
    hint: "API key: only in config.local.js (see README). Model is auto-selected for your account.",
    welcomeTitle: "Welcome",
    welcomeBody:
      "I am the RST system assistant. I can help with e-invoicing, the simplified tax regime (RST), and this project's architecture.",
    quoteLabel: "Persona Transhumana declaration",
    quote:
      "«I am FREE, AUTONOMOUS AND RESPONSIBLE through dialogue and construction as a regulative ideal; I direct, control, and lay down my own laws.»",
    values:
      "Ethics, autonomy, wellbeing, positive transformation, and social responsibility guide this knowledge-management tax system.",
    reflectPrompt:
      "How does taxpayer autonomy connect to responsible e-invoicing under the Colombian RST?",
    keyMissing:
      "Gemini API key missing. Create config.local.js from the README and set GEMINI_API_KEY.",
    errorGeneric: "Could not complete the reply. Check your network or API key.",
    errorKeyFormat:
      "The key does not look like a valid Google AI Studio API key (usually starts with \"AIza\", ~39 characters). Check config.local.js.",
    errorBadManualModel:
      "GEMINI_MODEL points to an unavailable model. Remove GEMINI_MODEL from config.local.js so the app auto-picks a model (ListModels).",
    errorModelAudioOnly:
      "GEMINI_MODEL points to an audio-only model (e.g. *-tts). This chat needs text output. Remove GEMINI_MODEL or pick a standard text Flash model in AI Studio.",
    errorQuota:
      "Google API quota exceeded or plan limit for the model in use. Wait for the retry window, check billing in AI Studio, or remove GEMINI_MODEL and use automatic selection.",
    localModeTag: "[Local mode — Gemini unavailable] ",
    quotaHintShort:
      "Note: this answer uses the project knowledge base (no API). When Google restores quota or you switch keys, Gemini-generated replies will return.",
    emptyApiHint:
      "Gemini returned an empty response (e.g. safety filter or context too large). Showing the equivalent local answer.",
  },
};

function getApiKey() {
  return window.__RST_CONFIG__?.GEMINI_API_KEY?.trim?.() || "";
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/**
 * @param {HTMLElement} mountNode
 */
export function initChatbot(mountNode) {
  const root = mountNode || document.getElementById("rst-chatbot-root");
  if (!root) return;

  let lang = "es";
  /** @type {{ role: "user" | "model"; text: string }[]} */
  let history = [];
  let open = false;
  let loading = false;

  root.innerHTML = "";
  root.appendChild(
    el(`
    <div id="rst-chatbot" aria-live="polite">
      <button class="rst-chatbot-toggle" type="button" aria-label="Abrir chat con el asistente RST" aria-expanded="false">
        <span class="rst-chatbot-toggle__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" stroke="#ffffff" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
          </svg>
        </span>
        <span class="rst-chatbot-toggle__text">Chat IA</span>
      </button>
      <div class="rst-chatbot-panel" role="dialog" aria-label="Chat RST">
        <div class="rst-chatbot-header">
          <div class="rst-chatbot-title" data-chat-title>${I18N.es.title}</div>
          <div class="rst-chatbot-lang" role="group" aria-label="Idioma / Language">
            <button type="button" data-lang="es" class="is-active">ES</button>
            <button type="button" data-lang="en">EN</button>
          </div>
        </div>
        <div class="rst-chatbot-toolbar">
          <button type="button" data-action="reflect"></button>
        </div>
        <div class="rst-chatbot-messages" data-messages></div>
        <div class="rst-chatbot-hint" data-hint></div>
        <form class="rst-chatbot-input-row" data-form autocomplete="off">
          <input name="msg" type="text" maxlength="2000" data-input />
          <button class="rst-chatbot-send" type="submit" data-send></button>
        </form>
      </div>
    </div>
  `)
  );

  const toggleBtn = root.querySelector(".rst-chatbot-toggle");
  const panel = root.querySelector(".rst-chatbot-panel");
  const titleEl = root.querySelector("[data-chat-title]");
  const messagesEl = root.querySelector("[data-messages]");
  const form = root.querySelector("[data-form]");
  const input = root.querySelector("[data-input]");
  const sendBtn = root.querySelector("[data-send]");
  const langButtons = root.querySelectorAll(".rst-chatbot-lang button");
  const reflectBtn = root.querySelector("[data-action='reflect']");
  const hintEl = root.querySelector("[data-hint]");

  function t() {
    return I18N[lang];
  }

  function setLang(next) {
    const prev = lang;
    lang = next === "en" ? "en" : "es";
    if (prev !== lang) {
      history = [];
    }
    langButtons.forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
    titleEl.textContent = t().title;
    input.placeholder = t().placeholder;
    sendBtn.textContent = t().send;
    reflectBtn.textContent = t().reflect;
    hintEl.textContent = getApiKey() ? "" : t().hint;
    renderWelcome(true);
  }

  function renderWelcome() {
    const msgHtml = `
      <div class="rst-msg rst-msg--system">
        <strong>${t().welcomeTitle}</strong><br/>${t().welcomeBody}
        <p class="rst-quote"><strong>${t().quoteLabel}:</strong> ${t().quote}</p>
        <p>${t().values}</p>
      </div>
    `;
    messagesEl.innerHTML = msgHtml;
  }

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `rst-msg rst-msg--${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setTyping(show) {
    const existing = messagesEl.querySelector(".rst-typing");
    if (existing) existing.remove();
    if (show) {
      const wrap = document.createElement("div");
      wrap.className = "rst-typing";
      wrap.innerHTML = "<span></span><span></span><span></span>";
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function setOpen(v) {
    open = v;
    panel.classList.toggle("is-open", v);
    toggleBtn.setAttribute("aria-expanded", v ? "true" : "false");
  }

  toggleBtn.addEventListener("click", () => setOpen(!open));

  langButtons.forEach((b) =>
    b.addEventListener("click", () => {
      setLang(b.getAttribute("data-lang"));
    })
  );

  reflectBtn.addEventListener("click", () => {
    appendMessage("user", t().reflectPrompt);
    void handleModelReply(t().reflectPrompt);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || loading) return;
    appendMessage("user", text);
    input.value = "";
    await handleModelReply(text);
  });

  async function handleModelReply(userText) {
    const apiKey = getApiKey();
    const v = validateGeminiApiKey(apiKey);
    if (!v.ok) {
      appendMessage("bot", v.code === "MISSING" ? t().keyMissing : t().errorKeyFormat);
      return;
    }
    loading = true;
    sendBtn.disabled = true;
    setTyping(true);
    try {
      const systemPrompt = buildSystemPrompt(lang, userText);
      const reply = await sendGeminiMessage(v.key, systemPrompt, history, userText);
      setTyping(false);
      appendMessage("bot", reply);
      history.push({ role: "user", text: userText });
      history.push({ role: "model", text: reply });
      if (history.length > 16) history = history.slice(-16);
    } catch (err) {
      setTyping(false);
      const raw = String(err.message || err);
      const manualBad =
        /not found|is not supported for generateContent/i.test(raw) &&
        Boolean(window.__RST_CONFIG__?.GEMINI_MODEL?.trim?.());

      if (manualBad) {
        appendMessage("bot", t().errorBadManualModel);
      } else if (String(err.message) === "GEMINI_MODEL_REQUIRES_TEXT") {
        appendMessage("bot", t().errorModelAudioOnly);
      } else {
        const quota = isQuotaOrRateLimitError(err);
        const exhausted =
          /ALL_MODELS_EXHAUSTED/.test(raw) || String(err.message) === "NO_GENERATIVE_MODEL_AVAILABLE";
        const network =
          /failed to fetch|NetworkError|network|Load failed|ECONNREFUSED|abort/i.test(raw) ||
          err.name === "TypeError";

        const useLocal =
          quota || exhausted || network || isEmptyResponseError(err);

        if (useLocal) {
          const { text } = answerWithLocalKnowledge(userText, lang);
          const tag = t().localModeTag;
          const suffix =
            quota || exhausted
              ? `\n\n${t().quotaHintShort}`
              : isEmptyResponseError(err)
                ? `\n\n${t().emptyApiHint}`
                : "";
          appendMessage("bot", `${tag}${text}${suffix}`);
          history.push({ role: "user", text: userText });
          history.push({ role: "model", text: `${tag}${text}${suffix}` });
          if (history.length > 16) history = history.slice(-16);
        } else {
          appendMessage("bot", `${t().errorGeneric} (${raw})`);
        }
      }
    } finally {
      loading = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  setLang("es");
}
