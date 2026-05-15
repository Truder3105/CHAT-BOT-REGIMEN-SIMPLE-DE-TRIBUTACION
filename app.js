import "./config.sample.js";
import { initNavbar } from "./components/navbar.js";
import { initHero } from "./components/hero.js";
import { initProblem } from "./components/problem.js";
import { initSolution } from "./components/solution.js";
import { initModules } from "./components/modules.js";
import { initArchitecture } from "./components/architecture.js";
import { initSecurity } from "./components/security.js";
import { initMethodology } from "./components/methodology.js";
import { initTechnologies } from "./components/technologies.js";
import { initTimeline } from "./components/timeline.js";
import { initViability } from "./components/viability.js";
import { initTeam } from "./components/team.js";
import { initEvidence } from "./components/evidence.js";
import { initGithub } from "./components/github.js";
import { initContact } from "./components/contact.js";
import { initFooter } from "./components/footer.js";
import { initChatbot } from "./chatbot/chatbot.js";

async function loadOptionalConfig() {
  try {
    await import("./config.local.js");
  } catch {
    /* opcional */
  }
}

function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

function safeRun(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[RST] ${name}`, err);
  }
}

async function boot() {
  await loadOptionalConfig();

  safeRun("chatbot", () => initChatbot(document.getElementById("rst-chatbot-root")));

  safeRun("navbar", initNavbar);
  safeRun("hero", initHero);
  safeRun("problem", initProblem);
  safeRun("solution", initSolution);
  safeRun("modules", initModules);
  safeRun("architecture", initArchitecture);
  safeRun("security", initSecurity);
  safeRun("methodology", initMethodology);
  safeRun("technologies", initTechnologies);
  safeRun("timeline", initTimeline);
  safeRun("viability", initViability);
  safeRun("team", initTeam);
  safeRun("evidence", initEvidence);
  safeRun("github", initGithub);
  safeRun("contact", initContact);
  safeRun("footer", initFooter);
  safeRun("reveal", initReveal);
}

document.addEventListener("DOMContentLoaded", () => {
  void boot();
});
