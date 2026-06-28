const screens = Array.from(document.querySelectorAll(".screen"));
const navButtons = Array.from(document.querySelectorAll("[data-screen]"));
const bottomButtons = Array.from(document.querySelectorAll(".bottom-nav [data-screen]"));

function showScreen(id) {
  const next = document.getElementById(id);
  if (!next) return;

  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === id);
  });

  bottomButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === id);
  });

  const title = next.dataset.title || "Finland 2026";
  document.title = `Frost Rocks Finland v0 - ${title}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screen));
});

const tabs = Array.from(document.querySelectorAll(".mode-tabs .tab"));
const viewPanels = {
  timeline: document.getElementById("timeline-view"),
  map: document.getElementById("map-view"),
  themes: document.getElementById("themes-view"),
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    Object.entries(viewPanels).forEach(([name, panel]) => {
      panel.classList.toggle("active", name === tab.dataset.view);
    });
  });
});

Array.from(document.querySelectorAll(".reveal")).forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.dataset.reveal);
    if (!panel) return;
    panel.classList.toggle("active");
    button.textContent = panel.classList.contains("active")
      ? button.textContent.replace("Reveal", "Hide")
      : button.textContent.replace("Hide", "Reveal");
  });
});

Array.from(document.querySelectorAll(".segmented button, .choice-grid button")).forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.parentElement;
    Array.from(group.children).forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

Array.from(document.querySelectorAll(".toggle")).forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
  });
});
