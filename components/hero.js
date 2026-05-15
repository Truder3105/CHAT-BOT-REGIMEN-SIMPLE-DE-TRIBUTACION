export function initHero() {
  const root = document.getElementById("home");
  if (!root) return;
  root.querySelectorAll("[data-stat]").forEach((el, i) => {
    const target = Number(el.getAttribute("data-target") || "0");
    const duration = 1200 + i * 120;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
