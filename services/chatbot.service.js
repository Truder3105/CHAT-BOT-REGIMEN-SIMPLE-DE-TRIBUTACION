const API_ROOT = "https://generativelanguage.googleapis.com/v1beta";

/** Prioridad al elegir modelos (el primero libre de cuota gana). */
const PREFERRED_MODEL_IDS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-latest",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
];

/** @type {string[]|null} */
let cachedOrderedModelIds = null;

/** Modelos que ya respondieron cuota / error en esta sesión (se reintenta con el siguiente). */
const sessionFailedModels = new Set();

function getUserModelOverride() {
  const raw =
    typeof window !== "undefined" ? window.__RST_CONFIG__?.GEMINI_MODEL?.trim?.() : "";
  return raw || null;
}

export function invalidateGeminiModelCache() {
  cachedOrderedModelIds = null;
  sessionFailedModels.clear();
}

export function normalizeModelName(name) {
  if (!name) return "";
  return String(name).replace(/^models\//, "");
}

export function validateGeminiApiKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) return { ok: false, code: "MISSING" };
  if (!key.startsWith("AIza")) return { ok: false, code: "FORMAT" };
  if (key.length < 30 || key.length > 256) return { ok: false, code: "FORMAT" };
  return { ok: true, key };
}

/**
 * Errores típicos de cuota / ritmo (Google).
 * No usar "limit: 0" solo, para no confundir con otros mensajes.
 */
export function isQuotaOrRateLimitError(err) {
  const msg = String(err?.message || err || "");
  if (err?.status === 429) return true;
  if (/RESOURCE_EXHAUSTED|Quota exceeded|quota exceeded/i.test(msg)) return true;
  if (/rate limit|too many requests|free_tier_requests|free_tier_input_token/i.test(msg)) return true;
  return false;
}

export function isModelNotFoundError(err) {
  return /not found|is not supported for generateContent/i.test(String(err?.message || err));
}

export function isEmptyResponseError(err) {
  return /^EMPTY_RESPONSE/i.test(String(err?.message || err || ""));
}

export async function listGeminiModels(apiKey) {
  const v = validateGeminiApiKey(apiKey);
  if (!v.ok) throw new Error("MISSING_API_KEY");

  const all = [];
  let pageToken = null;
  for (let page = 0; page < 5; page++) {
    const qs = new URLSearchParams({ key: v.key });
    if (pageToken) qs.set("pageToken", pageToken);
    const url = `${API_ROOT}/models?${qs.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || res.statusText;
      const e = new Error(msg);
      e.status = res.status;
      throw e;
    }
    const batch = Array.isArray(data.models) ? data.models : [];
    all.push(...batch);
    pageToken = data.nextPageToken || null;
    if (!pageToken) break;
  }
  return all;
}

/**
 * Modelos tipo TTS / solo audio exponen generateContent pero NO aceptan salida TEXT.
 * @param {{ name?: string, supportedResponseModalities?: string[] }} m
 */
export function supportsTextOutputModel(m) {
  const id = normalizeModelName(m?.name || "");
  if (!id) return false;

  if (/-tts\b|preview-tts|text-to-speech|native-audio|audio-only|gemini-live.*-audio/i.test(id)) {
    return false;
  }

  const mods = m.supportedResponseModalities || m.supported_response_modalities;
  if (Array.isArray(mods) && mods.length > 0) {
    if (mods.includes("AUDIO") && !mods.includes("TEXT")) return false;
  }

  return true;
}

/**
 * Lista ordenada de ids con generateContent (preferidos primero).
 * @param {string} apiKey
 */
export async function getOrderedGenerativeModelIds(apiKey) {
  const v = validateGeminiApiKey(apiKey);
  if (!v.ok) throw new Error("MISSING_API_KEY");

  if (cachedOrderedModelIds) return cachedOrderedModelIds;

  const models = await listGeminiModels(v.key);
  const generative = models.filter(
    (m) =>
      (m.supportedGenerationMethods || []).includes("generateContent") && supportsTextOutputModel(m)
  );

  if (!generative.length) {
    const err = new Error("NO_GENERATIVE_MODEL_AVAILABLE");
    throw err;
  }

  const idSet = new Set(generative.map((m) => normalizeModelName(m.name)));
  const ordered = [];

  for (const pref of PREFERRED_MODEL_IDS) {
    if (idSet.has(pref)) ordered.push(pref);
  }
  for (const m of generative) {
    const id = normalizeModelName(m.name);
    if (!ordered.includes(id)) ordered.push(id);
  }

  cachedOrderedModelIds = ordered;
  return cachedOrderedModelIds;
}

/**
 * Siguiente modelo a probar (salta los marcados en sessionFailedModels).
 * @param {string} apiKey
 */
export async function resolveGeminiModelId(apiKey) {
  const v = validateGeminiApiKey(apiKey);
  if (!v.ok) throw new Error("MISSING_API_KEY");

  const override = getUserModelOverride();
  if (override) {
    if (!supportsTextOutputModel({ name: `models/${override}` })) {
      const err = new Error("GEMINI_MODEL_REQUIRES_TEXT");
      err.model = override;
      throw err;
    }
    return override;
  }

  const ordered = await getOrderedGenerativeModelIds(v.key);
  for (const id of ordered) {
    if (!sessionFailedModels.has(id)) return id;
  }
  const err = new Error("NO_GENERATIVE_MODEL_AVAILABLE");
  throw err;
}

async function generateOnce(apiKey, model, systemPrompt, history, userText) {
  const v = validateGeminiApiKey(apiKey);
  const url = `${API_ROOT}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(v.key)}`;

  const trimmedHistory = trimHistoryForApi(history, { maxTurns: 6, maxModelChars: 4500 });
  const contents = [
    ...trimmedHistory.map((h) => ({
      role: h.role === "model" ? "model" : "user",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: [{ text: userText }] },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    const err = new Error(msg);
    err.model = model;
    err.status = res.status;
    throw err;
  }

  const text = extractGenerateContentText(data);
  if (!text) {
    const c0 = data?.candidates?.[0];
    const fr = c0?.finishReason || "UNKNOWN";
    const br = data?.promptFeedback?.blockReason;
    const err = new Error(
      br ? `EMPTY_RESPONSE:blockReason=${br}` : `EMPTY_RESPONSE:finishReason=${fr}`
    );
    err.model = model;
    err.finishReason = fr;
    err.blockReason = br;
    throw err;
  }
  return text;
}

/**
 * Recorta historial para la API: evita respuestas enormes (p. ej. modo local) que rompen el 2.º turno.
 * @param {{ role: string, text: string }[]} history
 */
function trimHistoryForApi(history, opts) {
  const maxTurns = opts.maxTurns ?? 6;
  const maxModelChars = opts.maxModelChars ?? 4500;
  const maxUserChars = 3000;
  const slice = history.slice(-maxTurns * 2);
  let out = slice.map((h) => {
    const role = h.role === "model" ? "model" : "user";
    let t = String(h.text ?? "");
    const cap = role === "model" ? maxModelChars : maxUserChars;
    if (t.length > cap) t = t.slice(0, cap) + "\n…";
    return { role, text: t };
  });
  while (out.length && out[0].role !== "user") out = out.slice(1);
  return out.filter((h) => h.text.trim().length > 0);
}

/**
 * Extrae texto de la respuesta Gemini (varias formas de parts / candidatos).
 */
function extractGenerateContentText(data) {
  const cands = data?.candidates;
  if (!Array.isArray(cands) || !cands.length) return "";

  const texts = [];
  for (const c of cands) {
    const parts = c?.content?.parts;
    if (!Array.isArray(parts)) continue;
    for (const p of parts) {
      if (p && typeof p.text === "string" && p.text.trim()) texts.push(p.text);
    }
  }
  return texts.join("\n").trim();
}

/**
 * Intenta generateContent; ante cuota o modelo no encontrado prueba el siguiente id de la lista.
 */
export async function sendGeminiMessage(apiKey, systemPrompt, history, userText, opts = {}) {
  const attempt = opts.attempt ?? 0;
  const maxAttempts = 24;

  const v = validateGeminiApiKey(apiKey);
  if (!v.ok) throw new Error("MISSING_API_KEY");

  const override = getUserModelOverride();
  if (attempt > maxAttempts) {
    const e = new Error("ALL_MODELS_EXHAUSTED");
    e.detail = "Se probaron varios modelos; todos fallaron por cuota o error.";
    throw e;
  }

  const model = await resolveGeminiModelId(v.key);

  try {
    return await generateOnce(v.key, model, systemPrompt, history, userText);
  } catch (err) {
    const msg = String(err.message || err);
    const canRotate = !override;

    if (canRotate && isModelNotFoundError(err)) {
      sessionFailedModels.add(model);
      return sendGeminiMessage(apiKey, systemPrompt, history, userText, { attempt: attempt + 1 });
    }

    if (canRotate && isQuotaOrRateLimitError(err)) {
      sessionFailedModels.add(model);
      return sendGeminiMessage(apiKey, systemPrompt, history, userText, { attempt: attempt + 1 });
    }

    if (
      canRotate &&
      /response modalities|TEXT\)|not supported by the model|accepts the following combination/i.test(msg)
    ) {
      sessionFailedModels.add(model);
      cachedOrderedModelIds = null;
      return sendGeminiMessage(apiKey, systemPrompt, history, userText, { attempt: attempt + 1 });
    }

    throw err;
  }
}

export async function resolveModelId(apiKey) {
  return resolveGeminiModelId(apiKey);
}
