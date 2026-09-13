(function () {
  const fieldsList = document.getElementById("fieldsList");
  const FIELD_TYPES = ["text", "email", "phone", "number", "dropdown", "checkbox", "radio", "textarea", "date"];

  function renderField(field = { label: "", fieldType: "text", required: false, options: [] }) {
    const row = document.createElement("div");
    row.className = "card-glass p-4 flex flex-wrap gap-2 items-center field-row";
    row.innerHTML = `
      <input type="text" class="input-field flex-1 min-w-[140px] field-label" placeholder="Field label" value="${field.label}" />
      <select class="input-field w-36 field-type">
        ${FIELD_TYPES.map((t) => `<option value="${t}" ${t === field.fieldType ? "selected" : ""}>${t}</option>`).join("")}
      </select>
      <label class="text-xs text-muted flex items-center gap-1"><input type="checkbox" class="field-required accent-primary" ${field.required ? "checked" : ""}/> Required</label>
      <input type="text" class="input-field flex-1 min-w-[140px] field-options" placeholder="Options (comma separated, for dropdown/radio)" value="${(field.options || []).join(", ")}" />
      <button type="button" class="btn-glass text-xs py-1.5 px-3 text-red-400 remove-field">Remove</button>
    `;
    row.querySelector(".remove-field").addEventListener("click", () => row.remove());
    fieldsList.appendChild(row);
  }

  window.EXISTING_FIELDS.forEach((f) => renderField(f));

  document.getElementById("addFieldBtn").addEventListener("click", () => renderField());

  document.getElementById("saveFormBtn").addEventListener("click", async () => {
    const fields = [...document.querySelectorAll(".field-row")].map((row) => ({
      label: row.querySelector(".field-label").value,
      fieldType: row.querySelector(".field-type").value,
      required: row.querySelector(".field-required").checked,
      options: row.querySelector(".field-options").value.split(",").map((o) => o.trim()).filter(Boolean)
    }));

    const res = await fetch("/forms/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _csrf: window.CSRF_TOKEN,
        formId: window.FORM_ID || undefined,
        websiteId: window.WEBSITE_ID,
        name: document.getElementById("formName").value,
        notifyEmail: document.getElementById("notifyEmail").value,
        fields
      })
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = "/dashboard/forms";
    } else {
      alert(data.message);
    }
  });
})();