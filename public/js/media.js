(function () {
  const fileInput = document.getElementById("fileInput");
  const grid = document.getElementById("mediaGrid");

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("_csrf", window.CSRF_TOKEN);

    await fetch("/media/upload", { method: "POST", body: formData });
    window.location.reload();
  });

  grid?.addEventListener("click", async (e) => {
    const card = e.target.closest("[data-id]");
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.classList.contains("delete-media-btn")) {
      if (!confirm("Delete this image?")) return;
      await fetch(`/media/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _csrf: window.CSRF_TOKEN })
      });
      card.remove();
    }

    if (e.target.classList.contains("save-alt-btn")) {
      const altText = card.querySelector(".alt-input").value;
      await fetch(`/media/${id}/alt-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _csrf: window.CSRF_TOKEN, altText })
      });
      e.target.textContent = "Saved ✓";
      setTimeout(() => (e.target.textContent = "Save Alt"), 1200);
    }
  });
})();