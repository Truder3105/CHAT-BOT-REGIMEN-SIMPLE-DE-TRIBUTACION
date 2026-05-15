import { rstInfo } from "./rst-info.js";
import { facturacionElectronica } from "./facturacion-electronica.js";
import { modulosSistema } from "./modulos-sistema.js";
import { seguridad } from "./seguridad.js";
import { arquitectura } from "./arquitectura.js";
import { metodologias } from "./metodologias.js";
import { equipo } from "./equipo.js";
import { declaracionPersonaTranshumana } from "./persona-transhumana.js";

/** Texto concatenado para contexto del modelo */
export function getKnowledgeBaseText() {
  return [
    rstInfo,
    facturacionElectronica,
    modulosSistema,
    seguridad,
    arquitectura,
    metodologias,
    equipo,
    declaracionPersonaTranshumana,
  ].join("\n\n");
}

export {
  rstInfo,
  facturacionElectronica,
  modulosSistema,
  seguridad,
  arquitectura,
  metodologias,
  equipo,
  declaracionPersonaTranshumana,
};
