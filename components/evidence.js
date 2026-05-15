export function initEvidence() {
  const tabs = document.querySelectorAll("[data-evidence-tab]");
  const panels = document.querySelectorAll("[data-evidence-panel]");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-evidence-tab");
      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      panels.forEach((p) => {
        p.classList.toggle("is-active", p.getAttribute("data-evidence-panel") === id);
      });
    });
  });
}
