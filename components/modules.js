export function initModules() {
  const root = document.getElementById("modulos");
  if (!root) return;
  root.querySelectorAll("[data-accordion]").forEach((card) => {
    const btn = card.querySelector("[data-accordion-toggle]");
    const panel = card.querySelector("[data-accordion-panel]");
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    });
  });
}
