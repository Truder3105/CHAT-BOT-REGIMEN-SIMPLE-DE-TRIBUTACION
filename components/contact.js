import { submitContactForm } from "../services/contact.service.js";
import { trackEvent } from "../services/analytics.service.js";

export function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const feedback = form.querySelector("[data-contact-feedback]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    trackEvent("contact_submit", payload);
    try {
      await submitContactForm(payload);
      if (feedback) {
        feedback.textContent = "¡Gracias! Tu mensaje fue registrado (demo local).";
        feedback.hidden = false;
      }
      form.reset();
    } catch {
      if (feedback) {
        feedback.textContent = "No se pudo enviar. Intenta de nuevo.";
        feedback.hidden = false;
      }
    }
  });
}
