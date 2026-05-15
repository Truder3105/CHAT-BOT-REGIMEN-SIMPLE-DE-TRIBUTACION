/** Hook opcional para métricas */
export function trackEvent(name, detail = {}) {
  if (typeof console !== "undefined" && console.debug) {
    console.debug("[analytics]", name, detail);
  }
}
