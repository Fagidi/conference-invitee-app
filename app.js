(function () {
  "use strict";

  let inviteeCount = 0;
  let inviteeData  = [];

  const form            = document.getElementById("mainForm");
  const inviteCountEl   = document.getElementById("inviteCount");
  const inviteesSection = document.getElementById("inviteesSection");
  const inviteeList     = document.getElementById("inviteeList");
  const submitRow       = document.getElementById("submitRow");
  const addMoreBtn      = document.getElementById("addMoreBtn");
  const submitBtn       = document.getElementById("submitBtn");
  const submitLabel     = document.getElementById("submitLabel");
  const successScreen   = document.getElementById("successScreen");
  const toast           = document.getElementById("toast");
  const countDown       = document.getElementById("countDown");
  const countUp         = document.getElementById("countUp");
  const cellCentreEl    = document.getElementById("cellCentre");

  init();

  function init() {
    populateCellCentres();
    inviteCountEl.addEventListener("change", onCountChange);
    inviteCountEl.addEventListener("input",  onCountChange);
    countDown.addEventListener("click", () => nudgeCount(-1));
    countUp.addEventListener("click",   () => nudgeCount(1));
    addMoreBtn.addEventListener("click", () => { addInvitee(); syncCount(); });
    cellCentreEl.addEventListener("change", onCellCentreChange);
    form.addEventListener("submit", onSubmit);
  }

  /* ── Cell Centre dropdown ────────────────────────── */
  function populateCellCentres() {
    Object.keys(CONFIG.CELL_CENTRES).forEach(name => {
      const opt = document.createElement("option");
      opt.value = name; opt.textContent = name;
      cellCentreEl.appendChild(opt);
    });
  }

  /* ── Get prefix for selected Cell Centre ─────────── */
  function getPrefix() {
    const selected = cellCentreEl.value;
    return CONFIG.CELL_CENTRES[selected] || "XX";
  }

  /* ── When Cell Centre changes, refresh all form numbers ── */
  function onCellCentreChange() {
    refreshAllFormNumbers();
  }

  function refreshAllFormNumbers() {
    const prefix = getPrefix();
    inviteeList.querySelectorAll(".invitee-card").forEach((card, i) => {
      const input = card.querySelector('[data-field="formNum"]');
      if (input) {
        const num = String(i + 1).padStart(2, "0");
        input.value = `${prefix}-${num}`;
        // sync into state
        const id = parseInt(card.dataset.id, 10);
        const entry = inviteeData.find(d => d.id === id);
        if (entry) entry.formNum = input.value;
      }
    });
  }

  /* ── Stepper ─────────────────────────────────────── */
  function nudgeCount(delta) {
    const current = parseInt(inviteCountEl.value, 10) || 0;
    const next = Math.max(1, Math.min(100, current + delta));
    inviteCountEl.value = next;
    onCountChange();
  }

  function syncCount() {
    inviteCountEl.value = inviteeData.length;
  }

  /* ── Count change ────────────────────────────────── */
  function onCountChange() {
    const n = parseInt(inviteCountEl.value, 10);
    if (!n || n < 1) {
      inviteesSection.style.display = "none";
      submitRow.style.display = "none";
      inviteeList.innerHTML = "";
      inviteeData = []; inviteeCount = 0;
      return;
    }
    const clamped = Math.min(n, 100);
    inviteesSection.style.display = "block";
    submitRow.style.display = "block";
    const current = inviteeData.length;
    if (clamped > current)      for (let i = current; i < clamped; i++) addInvitee(false);
    else if (clamped < current) for (let i = current; i > clamped; i--) removeLast();
  }

  /* ── Add invitee card ────────────────────────────── */
  function addInvitee(animate = true) {
    inviteeCount++;
    const id = inviteeCount;
    const index = inviteeData.length; // position before push
    inviteeData.push({ id, name: "", formNum: "", whatsapp: "" });

    // Auto-generate form number
    const prefix = getPrefix();
    const num    = String(index + 1).padStart(2, "0");
    const autoFormNum = cellCentreEl.value ? `${prefix}-${num}` : "";

    const card = document.createElement("div");
    card.className = "invitee-card";
    card.dataset.id = id;
    if (!animate) card.style.animation = "none";

    card.innerHTML = `
      <div class="invitee-card-head">
        <span class="invitee-label">Invitee ${index + 1}</span>
        <button type="button" class="btn-remove" data-id="${id}" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          Remove
        </button>
      </div>
      <div class="invitee-fields">
        <div class="field">
          <label>Invitee Name <span class="req">*</span></label>
          <input type="text" placeholder="Full name" data-field="name" data-id="${id}" required />
          <span class="field-err" id="err-name-${id}"></span>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Form Number</label>
            <input type="text" data-field="formNum" data-id="${id}" value="${autoFormNum}" readonly
              style="background:#F7F5F2;color:#5C5652;cursor:default" />
          </div>
          <div class="field">
            <label>WhatsApp Number <span class="req">*</span></label>
            <input type="tel" placeholder="+234 800 000 0000" data-field="whatsapp" data-id="${id}" required />
            <span class="field-err" id="err-whatsapp-${id}"></span>
          </div>
        </div>
      </div>
    `;

    // Sync name & whatsapp into state on input
    card.querySelectorAll("input[data-field]").forEach(input => {
      input.addEventListener("input", () => {
        const entry = inviteeData.find(d => d.id === id);
        if (entry) entry[input.dataset.field] = input.value.trim();
      });
    });

    // Set initial form number in state
    const entry = inviteeData.find(d => d.id === id);
    if (entry) entry.formNum = autoFormNum;

    card.querySelector(".btn-remove").addEventListener("click", () => {
      if (inviteeData.length <= 1) return;
      removeById(id);
      syncCount();
      refreshAllFormNumbers();
    });

    inviteeList.appendChild(card);
    renumber();
  }

  function removeById(id) {
    inviteeData = inviteeData.filter(d => d.id !== id);
    inviteeList.querySelector(`[data-id="${id}"]`)?.remove();
    renumber();
  }

  function removeLast() {
    const last = inviteeData[inviteeData.length - 1];
    if (!last) return;
    inviteeData.pop();
    inviteeList.querySelector(`[data-id="${last.id}"]`)?.remove();
  }

  function renumber() {
    inviteeList.querySelectorAll(".invitee-card").forEach((card, i) => {
      const label = card.querySelector(".invitee-label");
      if (label) label.textContent = `Invitee ${i + 1}`;
    });
  }

  /* ── Validation ──────────────────────────────────── */
  function validate() {
    let ok = true;

    [
      { id: "inviterName", msg: "Please enter your name." },
      { id: "cellCentre",  msg: "Please select a Cell Centre." },
      { id: "cellLeader",  msg: "Please enter your Cell Leader's name." },
      { id: "inviteCount", msg: "Please enter how many people you invited." },
    ].forEach(({ id, msg }) => {
      const el  = document.getElementById(id);
      const err = document.getElementById(`err-${id}`);
      if (!el.value.trim()) { setErr(el, err, msg); ok = false; }
      else clearErr(el, err);
    });

    inviteeData.forEach((entry) => {
      const card = inviteeList.querySelector(`[data-id="${entry.id}"]`);
      if (!card) return;
      [["name","Invitee Name"],["whatsapp","WhatsApp Number"]].forEach(([field, label]) => {
        const input = card.querySelector(`[data-field="${field}"]`);
        const err   = document.getElementById(`err-${field}-${entry.id}`);
        if (!input || !err) return;
        if (!input.value.trim()) { setErr(input, err, `${label} is required.`); ok = false; }
        else clearErr(input, err);
      });
    });

    return ok;
  }

  function setErr(el, errEl, msg) {
    el.classList.add("err");
    if (errEl) errEl.textContent = msg;
  }
  function clearErr(el, errEl) {
    el.classList.remove("err");
    if (errEl) errEl.textContent = "";
  }

  /* ── Submit ──────────────────────────────────────── */
  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) { showToast("Please fill in all required fields."); return; }
    if (!CONFIG.SCRIPT_URL || CONFIG.SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      showToast("⚠ Script URL not set in config.js"); return;
    }

    setLoading(true);
    const timestamp   = new Date().toISOString();
    const inviterName = document.getElementById("inviterName").value.trim();
    const cellCentre  = cellCentreEl.value;
    const cellLeader  = document.getElementById("cellLeader").value.trim();

    inviteeList.querySelectorAll(".invitee-card").forEach((card, i) => {
      const entry = inviteeData[i];
      if (!entry) return;
      entry.name     = card.querySelector('[data-field="name"]')?.value.trim()    || "";
      entry.formNum  = card.querySelector('[data-field="formNum"]')?.value.trim() || "";
      entry.whatsapp = card.querySelector('[data-field="whatsapp"]')?.value.trim()|| "";
    });

    const rows = inviteeData.map(inv => ({
      timestamp, inviterName, cellCentre, cellLeader,
      inviteeName: inv.name, formNumber: inv.formNum, whatsappNumber: inv.whatsapp
    }));

    try {
      // Use no-cors for Google Apps Script
      // Google Apps Script requires no-cors or a redirect workaround
      const urlWithParams = CONFIG.SCRIPT_URL;
      const res = await fetch(urlWithParams, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ rows })
      });
      // no-cors returns opaque response — if we get here without throwing, it worked
      document.querySelector(".page").style.display = "none";
      successScreen.style.display = "flex";
    } catch (err) {
      console.error(err);
      showToast("Submission failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitLabel.textContent = on ? "Submitting…" : "Submit Report";
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4500);
  }

  window.resetForm = function () {
    form.reset();
    inviteeList.innerHTML = ""; inviteeData = []; inviteeCount = 0;
    inviteesSection.style.display = "none";
    submitRow.style.display = "none";
    successScreen.style.display = "none";
    document.querySelector(".page").style.display = "flex";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

})();
