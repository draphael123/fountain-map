// batch-by-plan.js — Batch by Plan mode for the Fountain Vitality receipt generator.
//
// Use case: many patients, ALL on the same subscription plan (e.g. $199 every
// 4 weeks). The plan/medication itemization is identical for everyone, so the
// operator locks the plan once (from the main form) and then just fills a
// patient roster table. One page is generated per patient row and combined into
// a single multi-page PDF.
//
// This mode reuses multi-receipt.js's page renderer via window.FVMulti.drawReceiptPage
// (passed a per-row patientOverride) so there is ONE source of truth for the
// receipt layout. It does not duplicate the drawing logic.
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var genBtn = document.getElementById("generateBtn");
    if (!genBtn) return;
    if (typeof getBreakdown !== "function") {
      console.warn("[batch-by-plan] getBreakdown not found — bailing.");
      return;
    }

    // The locked plan snapshot (everything except per-patient fields).
    var lockedPlan = null;

    // ===== Snapshot the current main-form plan config =====
    // Mirrors multi-receipt.js snapshotForm() but is plan-only (no patient).
    function snapshotPlan() {
      var diagTmpl = document.getElementById("template").value;
      var diagBox = document.getElementById("addDiagnosis");
      var diagHasCode = !!(window.FV && window.FV.getDefaultICD10 &&
        (window.FV.getDefaultICD10(diagTmpl) || {}).code);
      var addDiag = diagBox ? diagBox.checked : diagHasCode;
      var medsStr = (document.getElementById("medications") || { value: "" }).value.trim();
      return {
        template: diagTmpl,
        price: parseFloat(document.getElementById("price").value) || null,
        weeks: parseInt(document.getElementById("weeks").value) || null,
        state: (document.getElementById("patientState") || { value: "" }).value || "",
        noLabs: !!(document.getElementById("noLabs") && document.getElementById("noLabs").checked),
        noPharmacy: !!(document.getElementById("noPharmacy") && document.getElementById("noPharmacy").checked),
        noEstradiol: ((document.getElementById("hrtComposition") || {}).value) || "full",
        addDiagnosis: addDiag,
        addNPI: !!(document.getElementById("addNPI") && document.getElementById("addNPI").checked),
        addRenderingProvider: !!(document.getElementById("addRenderingProvider") && document.getElementById("addRenderingProvider").checked),
        invoiceStatus: (document.getElementById("invoiceStatus") || { value: "paid" }).value,
        chargeDate: "",
        medications: medsStr ? medsStr.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : null,
      };
    }

    function describePlan(p) {
      if (!p) return "";
      var preset = (window.TEMPLATE_PRESETS && window.TEMPLATE_PRESETS[p.template]) || {};
      var label = preset.label || (p.template || "").replace(/_/g, " ");
      var bits = [];
      if (p.price != null) bits.push("$" + p.price);
      if (p.weeks) bits.push("every " + p.weeks + " wk");
      if (p.state) bits.push(p.state);
      if (p.noLabs) bits.push("No Labs");
      if (p.noPharmacy) bits.push("Mgmt Only");
      if (p.noEstradiol && p.noEstradiol !== "full") {
        bits.push(p.noEstradiol === "t" ? "T only" : p.noEstradiol === "p" ? "P only" : "No Estradiol");
      }
      var STATUS_TEXT = { paid: "PAID", unpaid: "UNPAID", past_due: "PAST DUE", refunded: "REFUNDED" };
      bits.push(STATUS_TEXT[p.invoiceStatus] || "PAID");
      return label + (bits.length ? " — " + bits.join(" · ") : "");
    }

    // ===== UI: container =====
    var section = document.createElement("div");
    section.id = "batchByPlanSection";
    section.style.cssText =
      "margin-top:16px;padding:16px;background:#f7fafa;border:1px solid #e0e8e8;border-radius:8px;display:none;";

    var heading = document.createElement("div");
    heading.style.cssText =
      "font-weight:600;font-size:14px;color:#181C39;margin-bottom:4px;font-family:'Libre Franklin',sans-serif;";
    heading.textContent = "Batch by Plan";

    var desc = document.createElement("div");
    desc.style.cssText =
      "font-size:12px;color:#5E6075;margin-bottom:12px;font-family:'Libre Franklin',sans-serif;line-height:1.45;";
    desc.innerHTML =
      "Same plan, many patients. Configure the plan once on the main form above " +
      "(template, price, duration, options), then click <strong>Lock plan from form</strong>. " +
      "Add a row per patient below and click <strong>Generate Combined PDF</strong> — each " +
      "patient gets their own page with the identical itemized breakdown.";

    // ===== Locked-plan callout =====
    var planWrap = document.createElement("div");
    planWrap.style.cssText =
      "margin-bottom:14px;padding:12px 14px;background:#eef9f9;border:2px solid #3EC9CC;border-radius:8px;";

    var planTitle = document.createElement("div");
    planTitle.style.cssText = "font-size:11px;font-weight:700;color:#2BA5A8;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;";
    planTitle.textContent = "Locked plan (applies to every patient)";

    var planLabel = document.createElement("div");
    planLabel.style.cssText = "font-size:13px;color:#181C39;font-weight:600;font-family:'Libre Franklin',sans-serif;margin-bottom:8px;";
    planLabel.textContent = "No plan locked yet — set the form above, then lock it.";

    var lockBtn = document.createElement("button");
    lockBtn.type = "button";
    lockBtn.textContent = "Lock plan from form";
    lockBtn.style.cssText =
      "padding:8px 14px;background:#3EC9CC;color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;";

    planWrap.appendChild(planTitle);
    planWrap.appendChild(planLabel);
    planWrap.appendChild(lockBtn);

    // ===== Patient roster table =====
    var tableWrap = document.createElement("div");
    tableWrap.style.cssText = "overflow-x:auto;margin-bottom:10px;";

    var table = document.createElement("table");
    table.style.cssText = "width:100%;border-collapse:collapse;font-family:'Libre Franklin',sans-serif;font-size:12px;min-width:640px;";

    var thead = document.createElement("thead");
    thead.innerHTML =
      "<tr style=\"text-align:left;\">" +
      "<th style=\"padding:6px 8px;color:#5E6075;font-size:10px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e0e8e8;width:24px;\">#</th>" +
      "<th style=\"padding:6px 8px;color:#5E6075;font-size:10px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e0e8e8;\">Patient Name</th>" +
      "<th style=\"padding:6px 8px;color:#5E6075;font-size:10px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e0e8e8;\">Address</th>" +
      "<th style=\"padding:6px 8px;color:#5E6075;font-size:10px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e0e8e8;\">DOB</th>" +
      "<th style=\"padding:6px 8px;color:#5E6075;font-size:10px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e0e8e8;\">Charge Date</th>" +
      "<th style=\"padding:6px 8px;color:#5E6075;font-size:10px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e0e8e8;\">Rendering Provider</th>" +
      "<th style=\"padding:6px 8px;border-bottom:2px solid #e0e8e8;width:28px;\"></th>" +
      "</tr>";
    var tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);
    tableWrap.appendChild(table);

    function cellInput(type) {
      var i = document.createElement("input");
      i.type = type || "text";
      i.setAttribute("autocomplete", "off");
      i.setAttribute("autocorrect", "off");
      i.setAttribute("autocapitalize", "off");
      i.setAttribute("spellcheck", "false");
      i.style.cssText = "width:100%;padding:6px 8px;border:1px solid #d0d4da;border-radius:5px;font-size:12px;font-family:'Libre Franklin',sans-serif;color:#181C39;box-sizing:border-box;";
      return i;
    }

    function renumber() {
      var rows = tbody.querySelectorAll("tr");
      for (var i = 0; i < rows.length; i++) {
        var numCell = rows[i].querySelector(".bbp-num");
        if (numCell) numCell.textContent = String(i + 1);
      }
    }

    function addRow(prefill) {
      prefill = prefill || {};
      var tr = document.createElement("tr");

      var tdNum = document.createElement("td");
      tdNum.className = "bbp-num";
      tdNum.style.cssText = "padding:4px 8px;color:#8b8fa0;font-weight:600;";
      tr.appendChild(tdNum);

      var fields = ["name", "address", "dob", "chargeDate", "provider"];
      var types = ["text", "text", "text", "date", "text"];
      var phs = ["Full name", "Street, City, ST ZIP", "MM/DD/YYYY", "", "Provider name, credentials"];
      fields.forEach(function (f, idx) {
        var td = document.createElement("td");
        td.style.cssText = "padding:4px 6px;";
        var inp = cellInput(types[idx]);
        inp.className = "bbp-" + f;
        if (phs[idx]) inp.placeholder = phs[idx];
        if (prefill[f]) inp.value = prefill[f];
        td.appendChild(inp);
        tr.appendChild(td);
      });

      var tdDel = document.createElement("td");
      tdDel.style.cssText = "padding:4px 6px;text-align:center;";
      var del = document.createElement("button");
      del.type = "button";
      del.textContent = "×";
      del.title = "Remove row";
      del.style.cssText = "background:transparent;border:none;color:#cc0000;font-size:18px;line-height:1;cursor:pointer;padding:0 4px;font-weight:700;";
      del.addEventListener("click", function () {
        tr.parentElement.removeChild(tr);
        if (tbody.querySelectorAll("tr").length === 0) addRow();
        renumber();
      });
      tdDel.appendChild(del);
      tr.appendChild(tdDel);

      tbody.appendChild(tr);
      renumber();
    }

    function readRows() {
      var out = [];
      var rows = tbody.querySelectorAll("tr");
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var row = {
          name: (r.querySelector(".bbp-name") || {}).value || "",
          address: (r.querySelector(".bbp-address") || {}).value || "",
          dob: (r.querySelector(".bbp-dob") || {}).value || "",
          chargeDate: (r.querySelector(".bbp-chargeDate") || {}).value || "",
          provider: (r.querySelector(".bbp-provider") || {}).value || "",
        };
        // A row counts if it has at least a name (other fields optional / fillable later).
        if (row.name.trim()) out.push(row);
      }
      return out;
    }

    // ===== Action row =====
    var actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;";

    var addRowBtn = document.createElement("button");
    addRowBtn.type = "button";
    addRowBtn.textContent = "+ Add patient row";
    addRowBtn.style.cssText =
      "padding:10px 14px;background:#3EC9CC;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;";

    var clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.textContent = "Clear rows";
    clearBtn.style.cssText =
      "padding:10px 14px;background:transparent;color:#5E6075;border:1px solid #d0d4da;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;";

    actions.appendChild(addRowBtn);
    actions.appendChild(clearBtn);

    var genCombinedBtn = document.createElement("button");
    genCombinedBtn.type = "button";
    genCombinedBtn.textContent = "Generate Combined PDF";
    genCombinedBtn.style.cssText =
      "padding:12px 16px;background:#181C39;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;width:100%;";

    var status = document.createElement("div");
    status.id = "batchByPlanStatus";
    status.style.cssText =
      "font-size:13px;color:#5E6075;margin-top:10px;font-family:'Libre Franklin',sans-serif;";

    section.appendChild(heading);
    section.appendChild(desc);
    section.appendChild(planWrap);
    section.appendChild(tableWrap);
    section.appendChild(actions);
    section.appendChild(genCombinedBtn);
    section.appendChild(status);

    // ===== Toggle button =====
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "batchByPlanToggleBtn";
    var toggleClosedLabel = "Batch by Plan <span style=\"font-weight:400;opacity:0.75;font-size:12px;\">— one plan, many patients</span>";
    toggle.innerHTML = toggleClosedLabel;
    toggle.style.cssText =
      "margin-top:8px;padding:10px 20px;background:transparent;color:var(--fountain-navy);border:2px solid var(--fountain-navy);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;width:100%;transition:all 0.2s;";

    toggle.addEventListener("mouseenter", function () {
      this.style.background = "var(--fountain-navy)";
      this.style.color = "white";
    });
    toggle.addEventListener("mouseleave", function () {
      if (section.style.display === "none") {
        this.style.background = "transparent";
        this.style.color = "var(--fountain-navy)";
      }
    });
    toggle.addEventListener("click", function () {
      var showing = section.style.display !== "none";
      section.style.display = showing ? "none" : "block";
      this.innerHTML = showing ? toggleClosedLabel : "Close Batch by Plan";
      if (!showing) {
        this.style.background = "var(--fountain-navy)";
        this.style.color = "white";
        // Auto-lock the current form plan on open for convenience.
        if (!lockedPlan) lockPlan();
      } else {
        this.style.background = "transparent";
        this.style.color = "var(--fountain-navy)";
      }
    });

    // Place after the multi-receipt toggle if present, else after the Generate button.
    var anchor = document.getElementById("multiReceiptToggleBtn") || genBtn;
    anchor.parentElement.insertBefore(toggle, anchor.nextSibling);
    toggle.parentElement.insertBefore(section, toggle.nextSibling);

    // ===== Behaviour =====
    function lockPlan() {
      if (typeof validateForm === "function" && !validateForm()) {
        status.style.color = "#cc0000";
        status.textContent = "Fix the highlighted fields on the form, then lock the plan.";
        return;
      }
      var snap = snapshotPlan();
      try {
        var bd = getBreakdown(snap.template, snap.price, snap.weeks, snap.noLabs, snap.noPharmacy, snap.medications, snap.noEstradiol);
        if (!bd) throw new Error("Invalid template/inputs");
      } catch (err) {
        status.style.color = "#cc0000";
        status.textContent = "Couldn't lock plan: " + err.message;
        return;
      }
      lockedPlan = snap;
      planLabel.textContent = describePlan(snap);
      status.style.color = "#2BA5A8";
      status.textContent = "Plan locked. Add patient rows, then generate.";
      if (typeof showToast === "function") showToast("Plan locked for batch");
    }

    lockBtn.addEventListener("click", lockPlan);
    addRowBtn.addEventListener("click", function () { addRow(); });
    clearBtn.addEventListener("click", function () {
      if (!window.confirm("Clear all patient rows?")) return;
      tbody.innerHTML = "";
      addRow(); addRow(); addRow();
      status.textContent = "";
    });

    genCombinedBtn.addEventListener("click", async function () {
      if (!lockedPlan) {
        status.style.color = "#cc0000";
        status.textContent = "Lock a plan first (click “Lock plan from form”).";
        return;
      }
      if (!window.FVMulti || typeof window.FVMulti.drawReceiptPage !== "function") {
        status.style.color = "#cc0000";
        status.textContent = "Renderer not available — make sure multi-receipt.js loaded.";
        return;
      }
      var rows = readRows();
      if (rows.length === 0) {
        status.style.color = "#cc0000";
        status.textContent = "Add at least one patient row (a name is required).";
        return;
      }

      genCombinedBtn.disabled = true;
      var origText = genCombinedBtn.textContent;
      genCombinedBtn.textContent = "Generating...";
      status.style.color = "#5E6075";
      status.textContent = "Building combined PDF for " + rows.length + " patient(s)...";

      try {
        var cfg = lockedPlan;
        var breakdown = getBreakdown(cfg.template, cfg.price, cfg.weeks, cfg.noLabs, cfg.noPharmacy, cfg.medications, cfg.noEstradiol);
        if (!breakdown) throw new Error("Invalid plan config");

        if (window.ensurePDFLib) await window.ensurePDFLib();
        var pdfDoc = await PDFLib.PDFDocument.create();
        if (window.FV && window.FV.setPdfMetadata) {
          window.FV.setPdfMetadata(pdfDoc, {
            title: "Itemized Invoices — Fountain Vitality (" + rows.length + " patients)",
            subject: "Batch Itemized Invoice — " + describePlan(cfg),
            keywords: ["Fountain Vitality", "Itemized Invoice", "Batch by Plan"],
          });
        }
        var helvetica = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        var helveticaBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

        var bgImage = null;
        if (typeof BG_IMAGE_B64 !== "undefined") {
          try {
            var bgBytes = Uint8Array.from(atob(BG_IMAGE_B64), function (c) { return c.charCodeAt(0); });
            bgImage = await pdfDoc.embedPng(bgBytes);
          } catch (e) { /* ignore — page renders without bg */ }
        }

        for (var i = 0; i < rows.length; i++) {
          window.FVMulti.drawReceiptPage(pdfDoc, bgImage, helvetica, helveticaBold, breakdown, cfg, i, rows[i]);
        }

        try { pdfDoc.getForm().updateFieldAppearances(helvetica); } catch (e) { /* older pdf-lib */ }

        var pdfBytes = await pdfDoc.save();
        var blob = new Blob([pdfBytes], { type: "application/pdf" });
        var url = URL.createObjectURL(blob);

        var previewContainer = document.getElementById("pdfPreviewContainer");
        var previewFrame = document.getElementById("pdfPreviewFrame");
        if (previewContainer && previewFrame) {
          previewContainer.classList.add("show");
          previewFrame.src = url;
        }

        window._lastPdfUrl = url;
        var fnDate = (window.FV && window.FV.todayISO) ? window.FV.todayISO() : "";
        window._lastPdfName = (window.FV && window.FV.buildFilename)
          ? window.FV.buildFilename({ count: rows.length, date: fnDate, kind: "batch" })
          : ("Itemized Receipts — Batch (" + rows.length + " patients).pdf");

        var a = document.createElement("a");
        a.href = url;
        a.download = window._lastPdfName;
        a.click();

        status.style.color = "#2BA5A8";
        status.textContent = "Done — combined PDF (" + rows.length + " patient page(s)) downloaded.";
        if (typeof showToast === "function") showToast("Batch PDF generated (" + rows.length + " patients)!");
      } catch (err) {
        console.error(err);
        status.style.color = "#cc0000";
        status.textContent = "Error: " + err.message;
      } finally {
        genCombinedBtn.disabled = false;
        genCombinedBtn.textContent = origText;
      }
    });

    // Seed three blank rows.
    addRow(); addRow(); addRow();
  });
})();
