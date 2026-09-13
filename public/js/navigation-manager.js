(function () {
  const list = document.getElementById("navItemsList");
  if (!list) return;

  let items = window.EXISTING_NAV.length
    ? window.EXISTING_NAV.map((n) => ({ ...n }))
    : window.WEBSITE_PAGES.map((p) => ({ label: p.name, type: "page", pageSlug: p.slug, url: "" }));

  function render() {
    list.innerHTML = "";
    items.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "flex items-center gap-2 bg-surface/60 rounded-lg px-3 py-2";
      row.innerHTML = `
        <input type="text" class="input-field flex-1 text-sm nav-label" value="${item.label || ""}" placeholder="Label" />
        <span class="text-xs text-muted w-16 text-center">${item.type === "external" ? "External" : "Page"}</span>
        <button type="button" class="text-muted text-xs move-up px-1" ${i === 0 ? "disabled style='opacity:.3'" : ""}>↑</button>
        <button type="button" class="text-muted text-xs move-down px-1" ${i === items.length - 1 ? "disabled style='opacity:.3'" : ""}>↓</button>
        <button type="button" class="text-red-400 text-xs remove-item px-1">Remove</button>
      `;
      row.querySelector(".nav-label").addEventListener("input", (e) => (item.label = e.target.value));
      row.querySelector(".move-up").addEventListener("click", () => {
        if (i > 0) { [items[i - 1], items[i]] = [items[i], items[i - 1]]; render(); }
      });
      row.querySelector(".move-down").addEventListener("click", () => {
        if (i < items.length - 1) { [items[i + 1], items[i]] = [items[i], items[i + 1]]; render(); }
      });
      row.querySelector(".remove-item").addEventListener("click", () => { items.splice(i, 1); render(); });
      list.appendChild(row);
    });
  }

  document.getElementById("addPageNavBtn").addEventListener("click", () => {
    const pageOptions = window.WEBSITE_PAGES.map((p) => p.name).join(", ");
    const chosen = prompt(`Which page? (${pageOptions})`);
    const page = window.WEBSITE_PAGES.find((p) => p.name.toLowerCase() === (chosen || "").toLowerCase());
    if (!page) return alert("Page not found — check the spelling matches one of the listed pages.");
    items.push({ label: page.name, type: "page", pageSlug: page.slug, url: "" });
    render();
  });

  document.getElementById("addExternalNavBtn").addEventListener("click", () => {
    const label = prompt("Link label (e.g. 'Blog')");
    if (!label) return;
    const url = prompt("Full URL (e.g. https://example.com)");
    if (!url) return;
    items.push({ label, type: "external", pageSlug: "", url });
    render();
  });

  document.getElementById("saveNavBtn").addEventListener("click", async () => {
    const res = await fetch(`/websites/${window.WEBSITE_ID}/navigation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _csrf: window.CSRF_TOKEN, navigation: items })
    });
    const data = await res.json();
    alert(data.success ? "Navigation saved! Publish your website again to apply it to the live site." : (data.message || "Failed to save."));
  });

  render();
})();