import {
  getKnowledgeBaseText,
  rstInfo,
  facturacionElectronica,
  modulosSistema,
  seguridad,
  arquitectura,
  metodologias,
  equipo,
  declaracionPersonaTranshumana,
} from "../knowledge-base/index.js";

function clip(s, max) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

function isEnglish(text) {
  return /\b(what|how|why|hello|hi|thanks|invoice|tax|security|team|module)\b/i.test(text) && !/[áéíóúñ¿¡]/i.test(text);
}

const OFF_TOPIC_ES =
  "Solo puedo orientarte sobre el Sistema RST, facturación electrónica, DIAN, arquitectura del proyecto, seguridad, equipo y la filosofía Persona Transhumana. ¿Quieres saber sobre alguno de esos temas?";
const OFF_TOPIC_EN =
  "I can only help with the RST system, e-invoicing, DIAN, project architecture, security, team, and the Persona Transhumana philosophy. What would you like to know about those topics?";

/**
 * Respuestas determinísticas cuando Gemini no está disponible (cuota, red, etc.).
 * @param {string} userText
 * @param {"es" | "en"} lang
 * @returns {{ text: string, mode: "local" }}
 */
export function answerWithLocalKnowledge(userText, lang) {
  const q = String(userText || "").trim();
  const lower = q.toLowerCase();
  const en = lang === "en" || isEnglish(q);

  if (/política|politica|apuesta|hack|crackear|ilegal|evadir|evasion/i.test(lower)) {
    return { text: en ? OFF_TOPIC_EN : OFF_TOPIC_ES, mode: "local" };
  }

  if (/^(hola|hi|hello|buenos|buenas|hey)\b/i.test(lower) || lower.length < 4) {
    return {
      text: en
        ? "Hello. I'm the RST assistant (local mode while the Gemini API is unavailable). Ask about the Colombian RST, e-invoicing, system modules, security, or the Persona Transhumana declaration."
        : "Hola. Soy el asistente RST (modo local mientras la API de Gemini no está disponible). Pregunta por el RST colombiano, facturación electrónica, módulos del sistema, seguridad o la declaración Persona Transhumana.",
      mode: "local",
    };
  }

  const pick = (es, eng) => (en ? eng : es);

  if (/(rst|régimen simple|regimen simple|tributación simplificada|tributacion simplificada)/i.test(lower)) {
    return { text: pick(clip(rstInfo, 900), clip(rstInfo, 900)), mode: "local" };
  }
  if (/(dian|factura electrónica|facturacion electronica|ubl|xml)/i.test(lower)) {
    return { text: pick(clip(facturacionElectronica, 900), clip(facturacionElectronica, 900)), mode: "local" };
  }
  if (/(módulo|modulo|sistema rst|10 módulos)/i.test(lower)) {
    return { text: pick(clip(modulosSistema, 950), clip(modulosSistema, 950)), mode: "local" };
  }
  if (/(seguridad|tls|cifrado|kms|jwt|firma)/i.test(lower)) {
    return { text: pick(clip(seguridad, 850), clip(seguridad, 850)), mode: "local" };
  }
  if (/(arquitectura|backend|express|mysql|node|api rest)/i.test(lower)) {
    return { text: pick(clip(arquitectura, 850), clip(arquitectura, 850)), mode: "local" };
  }
  if (/(scrum|xp|metodolog|ci\/cd|sprint)/i.test(lower)) {
    return { text: pick(clip(metodologias, 800), clip(metodologias, 800)), mode: "local" };
  }
  if (/(equipo|julián|julian|juan diego|ucundinamarca|correo)/i.test(lower)) {
    return { text: pick(clip(equipo, 800), clip(equipo, 800)), mode: "local" };
  }
  if (/(filosof|transhuman|ética|etica|autonom|libre y responsable|persona)/i.test(lower)) {
    return { text: pick(clip(declaracionPersonaTranshumana, 950), clip(declaracionPersonaTranshumana, 950)), mode: "local" };
  }

  const summary = clip(getKnowledgeBaseText(), 1100);
  return {
    text: pick(
      `Aquí tienes un resumen desde la base de conocimiento del proyecto (modo local):\n\n${summary}\n\n¿Sobre qué parte quieres más detalle: RST, facturación electrónica, módulos o seguridad?`,
      `Here is a summary from the project knowledge base (local mode):\n\n${summary}\n\nWhich topic should we go deeper on: RST, e-invoicing, modules, or security?`
    ),
    mode: "local",
  };
}
