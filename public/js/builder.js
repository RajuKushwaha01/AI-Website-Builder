(function () {
  const canvas = document.getElementById("canvas");
  const componentLibraryEl = document.querySelectorAll(".component-item");
  const saveIndicator = document.getElementById("saveIndicator");
  let selectedSectionId = null;
  let selectedSectionData = null;

  function csrfBody(extra) {
    return JSON.stringify({ _csrf: window.CSRF_TOKEN, ...extra });
  }

  function showSaved() {
    saveIndicator.textContent = "Saved ✓";
    setTimeout(() => (saveIndicator.textContent = ""), 1500);
  }

  // ── Sortable: reorder + drag new components from the library ──
  new Sortable(canvas, {
    animation: 0,
    handle: ".drag-handle",
    group: { name: "builder", pull: false, put: ["library"] },
    onEnd: () => saveOrder(),
    onAdd: async (evt) => {
      const type = evt.item.dataset.type;
      if (!type) return;
      evt.item.remove(); // remove placeholder; server response re-renders properly
      await addComponent(type, evt.newIndex);
      window.location.reload(); // simplest reliable re-render of new component's HTML
    }
  });

  componentLibraryEl.forEach((el) => {
    new Sortable(el.parentElement, {
      group: { name: "library", pull: "clone", put: false },
      sort: false,
      animation: 0
    });
  });

  async function saveOrder() {
    const orderedIds = [...canvas.querySelectorAll(".builder-section")].map((el) => el.dataset.sectionId);
    saveIndicator.textContent = "Saving...";
    await fetch(`/builder/${window.WEBSITE_ID}/reorder-sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: csrfBody({ pageId: canvas.dataset.pageId, orderedIds })
    });
    showSaved();
  }

  async function addComponent(type, atIndex) {
    await fetch(`/builder/${window.WEBSITE_ID}/add-component`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: csrfBody({ pageId: canvas.dataset.pageId, type, atIndex })
    });
  }

  // ── Selection & properties panel ──
  canvas.addEventListener("click", (e) => {
    const sectionEl = e.target.closest(".builder-section");
    if (!sectionEl) return;

    document.querySelectorAll(".builder-section").forEach((el) => el.classList.remove("ring-2", "ring-primary"));
    sectionEl.classList.add("ring-2", "ring-primary");

    selectedSectionId = sectionEl.dataset.sectionId;
    openPropertiesPanel(selectedSectionId, sectionEl.dataset.type);
  });

  function openPropertiesPanel(sectionId, type) {
    document.getElementById("noSelection").classList.add("hidden");
    document.getElementById("propertiesForm").classList.remove("hidden");

    // Simple content field: a single "text/heading" field editor for common types
    const contentFields = document.getElementById("contentFields");
    contentFields.innerHTML = "";

    const defaults = window.COMPONENT_DEFAULTS[type] || {};
    Object.keys(defaults).forEach((key) => {
      if (typeof defaults[key] === "string") {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "input-field text-sm";
        input.placeholder = key;
        input.dataset.field = key;
        contentFields.appendChild(input);
      }
    });
  }

  document.getElementById("applyStylesBtn").addEventListener("click", async () => {
    if (!selectedSectionId) return;

    const content = {};
    document.querySelectorAll("#contentFields input").forEach((input) => {
      if (input.value) content[input.dataset.field] = input.value;
    });

    const styles = {
      fontFamily: document.getElementById("propFontFamily").value,
      fontSize: document.getElementById("propFontSize").value,
      fontWeight: document.getElementById("propFontWeight").value,
      lineHeight: document.getElementById("propLineHeight").value,
      letterSpacing: document.getElementById("propLetterSpacing").value,
      textAlign: document.getElementById("propTextAlign").value,
      textColor: document.getElementById("propTextColor").value,
      backgroundColor: document.getElementById("propBgColor").value,
      width: document.getElementById("propWidth").value,
      height: document.getElementById("propHeight").value,
      margin: document.getElementById("propMargin").value,
      padding: document.getElementById("propPadding").value,
      borderRadius: document.getElementById("propRadius").value,
      boxShadow: document.getElementById("propShadow").value
    };

    saveIndicator.textContent = "Saving...";

    if (Object.keys(content).length) {
      await fetch(`/builder/${window.WEBSITE_ID}/update-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: csrfBody({ pageId: canvas.dataset.pageId, sectionId: selectedSectionId, content })
      });
    }

    await fetch(`/builder/${window.WEBSITE_ID}/update-styles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: csrfBody({ pageId: canvas.dataset.pageId, sectionId: selectedSectionId, styles })
    });

    showSaved();
    window.location.reload();
  });

  document.getElementById("duplicateBtn").addEventListener("click", async () => {
    if (!selectedSectionId) return;
    await fetch(`/builder/${window.WEBSITE_ID}/duplicate-section`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: csrfBody({ pageId: canvas.dataset.pageId, sectionId: selectedSectionId })
    });
    window.location.reload();
  });

  document.getElementById("hideBtn").addEventListener("click", async () => {
    if (!selectedSectionId) return;
    await fetch(`/builder/${window.WEBSITE_ID}/toggle-section`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: csrfBody({ pageId: canvas.dataset.pageId, sectionId: selectedSectionId })
    });
    window.location.reload();
  });

  document.getElementById("deleteBtn").addEventListener("click", async () => {
    if (!selectedSectionId || !confirm("Delete this section?")) return;
    await fetch(`/builder/${window.WEBSITE_ID}/delete-section`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: csrfBody({ pageId: canvas.dataset.pageId, sectionId: selectedSectionId })
    });
    window.location.reload();
  });

  // ── Responsive preview switch ──
  document.querySelectorAll(".device-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".device-btn").forEach((b) => {
        b.classList.remove("active", "bg-aurora-gradient", "text-white");
        b.classList.add("text-muted");
      });
      btn.classList.add("active", "bg-aurora-gradient", "text-white");
      btn.classList.remove("text-muted");
      document.getElementById("canvasFrame").style.maxWidth = btn.dataset.width === "100%" ? "1100px" : btn.dataset.width;
    });
  });

  // ── Page switcher ──
  document.getElementById("pageSwitcher").addEventListener("change", (e) => {
    window.location.href = `/builder/${window.WEBSITE_ID}?page=${e.target.value}`;
  });

  // ── Theme presets ──
  document.getElementById("themeSelector").addEventListener("change", async (e) => {
    if (!e.target.value) return;
    await fetch(`/builder/${window.WEBSITE_ID}/apply-theme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: csrfBody({ themeName: e.target.value })
    });
    window.location.reload();
  });
})();

document.getElementById("publishBtn")?.addEventListener("click", async () => {
  const res = await fetch(`/websites/${window.WEBSITE_ID}/publish-live`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _csrf: window.CSRF_TOKEN })
  });
  const data = await res.json();
  if (data.success) {
    alert(`🎉 Website Live!\n\nVisit it at: ${window.location.origin}${data.publicUrl}`);
    window.location.reload();
  } else {
    alert(data.message);
  }
});

document.getElementById("unpublishBtn")?.addEventListener("click", async () => {
  await fetch(`/websites/${window.WEBSITE_ID}/unpublish-live`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _csrf: window.CSRF_TOKEN })
  });
  window.location.reload();
});