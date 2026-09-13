(function () {
  const tabs = document.querySelectorAll(".panel-tab");
  const panels = {
    components: document.getElementById("panelComponents"),
    canvas: document.getElementById("panelCanvas"),
    properties: document.getElementById("panelProperties")
  };

  // Only relevant below the lg breakpoint — on desktop all 3 panels show via CSS already.
  function isMobileLayout() {
    return window.innerWidth < 1024;
  }

  function showPanel(name) {
    if (!isMobileLayout()) return; // desktop always shows all three; nothing to switch

    Object.entries(panels).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle("hidden", key !== name);
      el.classList.toggle("flex", key === name && name === "canvas");
      el.classList.toggle("block", key === name && name !== "canvas");
    });

    tabs.forEach((tab) => {
      const active = tab.dataset.panel === name;
      tab.classList.toggle("border-primary", active);
      tab.classList.toggle("text-white", active);
      tab.classList.toggle("border-transparent", !active);
      tab.classList.toggle("text-muted", !active);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showPanel(tab.dataset.panel));
  });

  // When a component is selected on mobile, automatically jump to the Properties tab
  // so the person doesn't have to manually tap it — this is the core UX fix for the
  // "Select a component to edit its properties" panel being unreachable on small screens.
  document.getElementById("canvas")?.addEventListener("click", (e) => {
    if (e.target.closest(".builder-section") && isMobileLayout()) {
      setTimeout(() => showPanel("properties"), 80);
    }
  });

  // Default view on load
  showPanel(isMobileLayout() ? "canvas" : "components");

  window.addEventListener("resize", () => {
    if (!isMobileLayout()) {
      // Reset all inline hide/show classes so desktop's normal `lg:block` CSS takes back over
      Object.values(panels).forEach((el) => {
        if (!el) return;
        el.classList.remove("hidden", "flex", "block");
      });
    }
  });
})();