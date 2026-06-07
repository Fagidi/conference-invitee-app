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

  init();

  function init() {
    populateCellCentres();
    inviteCountEl.addEventListener("change", onCountChange);
    inviteCountEl.addEventListener("input",  onCountChange);
    countDown.addEventListener("click", () => nudgeCount(-1));
    countUp.addEventListener("click",   () => nudgeCount(1));
    addMoreBtn.addEventListener("click", () => { addInvitee(); syncCount(); });
    form.addEventListener("submit", onSubmit);
  }

  function populateCellCentres() {
    const sel = document.getElementById("cellCentre");
    CONFIG.CELL_CENTRES.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name; opt.textContent = name;
      sel.appendChild(opt);
    });
  }

  function nudgeCount(delta) {
    const current = parseInt(inviteCountEl.value, 10) || 0;
    const next = Math.max(1, Math.min(100, current + delta));
    inviteCountEl.value = next;
    onCountChange();
  }

  function syncCount() {
    inviteCountEl.value = inviteeData.length;
  }

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

  function addInvitee(animate = true) {
    inviteeCount++;
    const id = inviteeCount;
    inviteeData.push({ id, name: "", formNum: "", whatsapp: "" });

    const card = document.createElement("div");
    card.className = "invitee-card";
    card.dataset.id = id;
    if (!animate) card.style.animation = "none";

    card.innerHTML = `
      <div class="invitee-card-head">
        <span class="invitee-label">Invitee ${inviteeData.length}</span>
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
            <label>Form Number <span class="req">*</span></label>
            <input type="text" placeholder="e.g. F-001" data-field="formNum" data-id="${id}" required />
            <span class="field-err" id="err-formNum-${id}"></span>
          </div>
          <div class="field">
            <label>WhatsApp Number <span class="req">*</span></label>
            <input type="tel" placeholder="+234 800 000 0000" data-field="whatsapp" data-id="${id}" required />
            <span class="field-err" id="err-whatsapp-${id}"></span>
          </div>
        </div>
      </div>
    `;

    card.querySelectorAll("input[data-field]").forEach(input => {
      input.addEventListener("input", () => {
        const entry = inviteeData.find(d => d.id === id);
        if (entry) entry[input.dataset.field] = input.value.trim();
      });
    });

    card.querySelector(".btn-remove").addEventListener("click", () => {
      if (inviteeData.length <= 1) return;
      removeById(id);
      syncCount();
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
    inviteeList.querySelectorAll(".invitee-label").forEach((el, i) => {
      el.textContent = `Invitee ${i + 1}`;
    });
  }

  /* ── Validation ─────────────────────────────────── */
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

    inviteeData.forEach((entry, idx) => {
      const card = inviteeList.querySelector(`[data-id="${entry.id}"]`);
      if (!card) return;
      [["name","Invitee Name"],["formNum","Form Number"],["whatsapp","WhatsApp Number"]].forEach(([field, label]) => {
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

  /* ── Submit ─────────────────────────────────────── */
  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) { showToast("Please fill in all required fields."); return; }
    if (!CONFIG.SCRIPT_URL || CONFIG.SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      showToast("⚠ Script URL not set in config.js"); return;
    }

    setLoading(true);
    const timestamp  = new Date().toISOString();
    const inviterName = document.getElementById("inviterName").value.trim();
    const cellCentre  = document.getElementById("cellCentre").value;
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
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== "success") throw new Error(json.message || "Unknown error");
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
