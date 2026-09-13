(function () {
  const form = document.getElementById("aiForm");
  const alertBox = document.getElementById("alertBox");
  const progressBox = document.getElementById("progressBox");
  const generateBtn = document.getElementById("generateBtn");

  if (!form) return;

  const descriptionField = form.querySelector('textarea[name="description"]');
  const backendPreview = document.getElementById("backendPreview");
  const BACKEND_KEYWORDS = {
    "login|sign up|signup|member area|membership|register users": "🔐 Member login & signup",
    "booking|reservation|appointment|book a table|book now": "📅 Booking / reservation system",
    "newsletter|subscribe|mailing list": "✉️ Newsletter signup",
    "contact form|get in touch|inquiry form": "📋 Contact form with storage"
  };

  descriptionField?.addEventListener("input", () => {
    const text = descriptionField.value.toLowerCase();
    const matched = Object.entries(BACKEND_KEYWORDS)
      .filter(([pattern]) => new RegExp(pattern).test(text))
      .map(([, label]) => label);
    if (matched.length) {
      backendPreview.textContent = "Will include: " + matched.join(", ");
      backendPreview.classList.remove("hidden");
    } else {
      backendPreview.classList.add("hidden");
    }
  });

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `mb-4 text-sm rounded-lg px-4 py-3 ${
      type === "error"
        ? "bg-red-500/10 border border-red-500/30 text-red-300"
        : "bg-success/10 border border-success/30 text-success"
    }`;
    alertBox.classList.remove("hidden");
  }

  function setStep(id, done) {
    const el = document.getElementById(id);
    el.textContent = (done ? "✓ " : "● ") + el.textContent.slice(2);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    progressBox.classList.remove("hidden");
    alertBox.classList.add("hidden");

    setStep("step1", true);

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.pages = payload.pages.split(",").map((p) => p.trim()).filter(Boolean);
    payload._csrf = window.CSRF_TOKEN;

    setStep("step2", true);
    setStep("step3", true);

    try {
      const res = await fetch("/ai/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      setStep("step4", true);

      if (data.success) {
        showAlert(data.message, "success");
        setTimeout(() => (window.location.href = data.redirect), 900);
      } else {
        showAlert(data.message, "error");
        generateBtn.disabled = false;
        generateBtn.textContent = "✨ Generate Website";
      }
    } catch (err) {
      showAlert("Something went wrong. Please try again.", "error");
      generateBtn.disabled = false;
      generateBtn.textContent = "✨ Generate Website";
    }
  });
})();