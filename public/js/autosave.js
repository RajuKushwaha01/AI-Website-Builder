(function () {
  const form = document.getElementById("settingsForm");
  const status = document.getElementById("saveStatus");
  if (!form) return;

  let timer = null;

  function save() {
    status.textContent = "Saving...";
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => (payload[key] = value));
    payload._csrf = window.CSRF_TOKEN;

    fetch(`/websites/${window.WEBSITE_ID}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then(() => {
        status.textContent = "Saved ✓";
        setTimeout(() => (status.textContent = ""), 2000);
      })
      .catch(() => (status.textContent = "Failed to save"));
  }

  form.addEventListener("input", () => {
    status.textContent = "Editing...";
    clearTimeout(timer);
    timer = setTimeout(save, 1200); // debounce autosave
  });
})();