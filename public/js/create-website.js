(function () {
  const input = document.getElementById("descriptionInput");
  const generateBtn = document.getElementById("generateBtn");
  const alertBox = document.getElementById("wizardAlert");
  const charCount = document.getElementById("charCount");
  const qualityHint = document.getElementById("qualityHint");
  const backendPreview = document.getElementById("backendPreview");

  const stepAsk = document.getElementById("stepAsk");
  const stepGenerating = document.getElementById("stepGenerating");
  const stepReady = document.getElementById("stepReady");

  const dot1 = document.getElementById("dot1");
  const dot2 = document.getElementById("dot2");
  const dot3 = document.getElementById("dot3");

  // Example cards fill the textarea and focus it
  document.querySelectorAll(".example-card").forEach((card) => {
    card.addEventListener("click", () => {
      input.value = card.dataset.text;
      input.dispatchEvent(new Event("input"));
      input.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Live character count + quality hint
  const BACKEND_KEYWORDS = {
    "login|sign up|signup|member area|membership|register users": "🔐 Member login & signup",
    "booking|reservation|appointment|book a table|book now": "📅 Booking / reservation system",
    "newsletter|subscribe|mailing list": "✉️ Newsletter signup",
    "contact form|get in touch|inquiry form": "📋 Contact form with storage"
  };

  input.addEventListener("input", () => {
    const len = input.value.trim().length;
    charCount.textContent = `${len} character${len === 1 ? "" : "s"}`;

    if (len === 0) {
      qualityHint.textContent = "";
    } else if (len < 20) {
      qualityHint.textContent = "Add more detail for better results";
      qualityHint.className = "text-xs text-warning";
    } else {
      qualityHint.textContent = "Looks good ✓";
      qualityHint.className = "text-xs text-success";
    }

    const text = input.value.toLowerCase();
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
    alertBox.className = `mb-6 text-sm rounded-lg px-4 py-3 ${
      type === "error"
        ? "bg-red-500/10 border border-red-500/30 text-red-300"
        : "bg-success/10 border border-success/30 text-success"
    }`;
    alertBox.classList.remove("hidden");
  }

  function markGenStep(id) {
    const el = document.getElementById(id);
    el.innerHTML = "✓ " + el.textContent.trim().slice(2);
  }

  async function generate() {
    const description = input.value.trim();
    if (description.length < 8) {
      showAlert("Please describe your website in a bit more detail.", "error");
      return;
    }

    alertBox.classList.add("hidden");
    stepAsk.classList.add("hidden");
    stepGenerating.classList.remove("hidden");
    dot1.className = "w-2.5 h-2.5 rounded-full bg-white/10";
    dot2.className = "w-2.5 h-2.5 rounded-full bg-primary";

    markGenStep("genStep1");

    try {
      const res = await fetch("/create-website/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _csrf: window.CSRF_TOKEN, description })
      });

      markGenStep("genStep2");
      markGenStep("genStep3");
      markGenStep("genStep4");

      const data = await res.json();

      if (data.success) {
        dot2.className = "w-2.5 h-2.5 rounded-full bg-white/10";
        dot3.className = "w-2.5 h-2.5 rounded-full bg-primary";
        stepGenerating.classList.add("hidden");
        stepReady.classList.remove("hidden");

        if (data.backendFeatures && data.backendFeatures.length) {
          const list = data.backendFeatures.map((f) => `• ${f}`).join("<br>");
          document.querySelector("#stepReady p.text-muted").innerHTML =
            `Opening the visual editor...<br><br><span class="text-xs">Backend features included:<br>${list}</span>`;
        }

        setTimeout(() => (window.location.href = data.redirect), 1200);
      } else {
        stepGenerating.classList.add("hidden");
        stepAsk.classList.remove("hidden");
        showAlert(data.message, "error");
      }
    } catch (err) {
      stepGenerating.classList.add("hidden");
      stepAsk.classList.remove("hidden");
      showAlert("Something went wrong. Please try again.", "error");
    }
  }

  generateBtn.addEventListener("click", generate);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generate();
    }
  });
})();