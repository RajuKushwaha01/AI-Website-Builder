(function () {
  function csrfBody(extra) {
    return JSON.stringify({ _csrf: window.CSRF_TOKEN, ...extra });
  }

  // ── Users page ──
  document.querySelectorAll(".block-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest("[data-id]").dataset.id;
      await fetch(`/admin/users/${id}/block`, { method: "POST", headers: { "Content-Type": "application/json" }, body: csrfBody() });
      window.location.reload();
    });
  });

  document.querySelectorAll(".unblock-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest("[data-id]").dataset.id;
      await fetch(`/admin/users/${id}/unblock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: csrfBody() });
      window.location.reload();
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this user and all their websites permanently?")) return;
      const id = btn.closest("[data-id]").dataset.id;
      await fetch(`/admin/users/${id}/delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: csrfBody() });
      window.location.reload();
    });
  });

  document.querySelectorAll(".role-select").forEach((select) => {
    select.addEventListener("change", async () => {
      const id = select.closest("[data-id]").dataset.id;
      await fetch(`/admin/users/${id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: csrfBody({ role: select.value })
      });
    });
  });

  // ── Websites page ──
  document.querySelectorAll(".disable-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest("[data-id]").dataset.id;
      await fetch(`/admin/websites/${id}/disable`, { method: "POST", headers: { "Content-Type": "application/json" }, body: csrfBody() });
      window.location.reload();
    });
  });

  document.querySelectorAll(".delete-site-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this website permanently?")) return;
      const id = btn.closest("[data-id]").dataset.id;
      await fetch(`/admin/websites/${id}/delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: csrfBody() });
      window.location.reload();
    });
  });

  // ── Templates page ──
  document.getElementById("addTplBtn")?.addEventListener("click", async () => {
    await fetch("/admin/templates/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: csrfBody({
        name: document.getElementById("tplName").value,
        category: document.getElementById("tplCategory").value,
        isPremium: document.getElementById("tplPremium").checked,
        structure: "{}"
      })
    });
    window.location.reload();
  });

  document.querySelectorAll(".delete-tpl-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this template?")) return;
      const id = btn.closest("[data-id]").dataset.id;
      await fetch(`/admin/templates/${id}/delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: csrfBody() });
      window.location.reload();
    });
  });
})();