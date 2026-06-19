// Multi-Receipt Mode for Fountain Vitality Receipt Generator
// Lets the user stage multiple receipts and generate ONE multi-page PDF.
// Independent of the single-receipt flow (generateReceipt).
(function () {
  "use strict";

  // Staged receipts. Each item:
  //   { template, price, weeks, state, noLabs, noPharmacy, addDiagnosis, diagnosisCode, chargeDate, medications }
  var staged = [];

  // Single-patient mode shared values
  var singlePatient = {
    enabled: false,
    name: "",
    dob: "",
    chargeDate: "",
    provider: "",
  };

  document.addEventListener("DOMContentLoaded", function () {
    var genBtn = document.getElementById("generateBtn");
    if (!genBtn) return;
    if (typeof getBreakdown !== "function") {
      console.warn("[multi-receipt] getBreakdown not found — bailing.");
      return;
    }

    // ===== UI: container =====
    var section = document.createElement("div");
    section.id = "multiReceiptSection";
    section.style.cssText =
      "margin-top:16px;padding:16px;background:#f7fafa;border:1px solid #e0e8e8;border-radius:8px;display:none;";

    var heading = document.createElement("div");
    heading.style.cssText =
      "font-weight:600;font-size:14px;color:#181C39;margin-bottom:4px;font-family:'Libre Franklin',sans-serif;";
    heading.textContent = "Multi-Receipt Mode";

    var desc = document.createElement("div");
    desc.style.cssText =
      "font-size:12px;color:#5E6075;margin-bottom:12px;font-family:'Libre Franklin',sans-serif;line-height:1.45;";
    desc.innerHTML =
      "Stage two or more receipts above and combine them into a single multi-page PDF. " +
      "Set the form to the receipt you want, then click <strong>Add current as receipt</strong>. " +
      "Repeat for each receipt, then click <strong>Generate Combined PDF</strong>.";

    // ===== Single-patient mode =====
    var spWrap = document.createElement("div");
    spWrap.style.cssText =
      "margin-bottom:14px;padding:14px 14px 12px;background:#eef9f9;border:2px solid #3EC9CC;border-radius:8px;";

    var spCalloutTitle = document.createElement("div");
    spCalloutTitle.style.cssText = "font-size:11px;font-weight:700;color:#2BA5A8;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;";
    spCalloutTitle.textContent = "Most common: one patient, multiple charges";

    var spToggleRow = document.createElement("label");
    spToggleRow.style.cssText = "display:flex;align-items:center;gap:8px;font-size:14px;color:#181C39;cursor:pointer;font-family:'Libre Franklin',sans-serif;font-weight:600;";
    var spToggle = document.createElement("input");
    spToggle.type = "checkbox";
    spToggle.id = "spToggle";
    var spToggleLbl = document.createElement("span");
    spToggleLbl.textContent = "Single-patient mode (all pages share the same patient info)";
    spToggleRow.appendChild(spToggle);
    spToggleRow.appendChild(spToggleLbl);

    spWrap.appendChild(spCalloutTitle);

    var spFields = document.createElement("div");
    spFields.id = "spFields";
    spFields.style.cssText = "display:none;margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;";

    function mkInput(id, label, type, ph) {
      var w = document.createElement("div");
      var l = document.createElement("label");
      l.textContent = label;
      l.style.cssText = "display:block;font-size:11px;font-weight:600;color:#5E6075;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.4px;";
      var i = document.createElement("input");
      i.type = type || "text";
      i.id = id;
      i.placeholder = ph || "";
      // Block browser autofill (e.g. Chrome dropping the user's email into Provider)
      i.setAttribute("autocomplete", "off");
      i.setAttribute("autocorrect", "off");
      i.setAttribute("autocapitalize", "off");
      i.setAttribute("spellcheck", "false");
      i.name = "fv_" + id + "_noauto";
      i.style.cssText = "width:100%;padding:8px 10px;border:1px solid #d0d4da;border-radius:6px;font-size:13px;font-family:'Libre Franklin',sans-serif;color:#181C39;";
      w.appendChild(l);
      w.appendChild(i);
      return { wrap: w, input: i };
    }
    var spName = mkInput("spName", "Patient Name", "text", "Full name");
    var spAddress = mkInput("spAddress", "Address", "text", "Street, City, ST ZIP");
    var spDob = mkInput("spDob", "Date of Birth", "text", "MM/DD/YYYY");
    var spDate = mkInput("spChargeDate", "Charge Date", "date", "");
    var spProv = mkInput("spProvider", "Rendering Provider", "text", "Provider name, credentials");
    spFields.appendChild(spName.wrap);
    spFields.appendChild(spAddress.wrap);
    spFields.appendChild(spDob.wrap);
    spFields.appendChild(spDate.wrap);
    spFields.appendChild(spProv.wrap);

    spWrap.appendChild(spToggleRow);
    spWrap.appendChild(spFields);

    spToggle.addEventListener("change", function () {
      singlePatient.enabled = spToggle.checked;
      // Toggle the grid as a real "grid" so the columns work
      spFields.style.display = spToggle.checked ? "grid" : "none";
    });
    spName.input.addEventListener("input", function () { singlePatient.name = spName.input.value; });
    spAddress.input.addEventListener("input", function () { singlePatient.address = spAddress.input.value; });
    spDob.input.addEventListener("input", function () { singlePatient.dob = spDob.input.value; });
    spDate.input.addEventListener("change", function () { singlePatient.chargeDate = spDate.input.value; });
    spProv.input.addEventListener("input", function () { singlePatient.provider = spProv.input.value; });

    // List of staged receipts
    var list = document.createElement("div");
    list.id = "multiReceiptList";
    list.style.cssText =
      "margin-bottom:12px;font-family:'Libre Franklin',sans-serif;font-size:13px;";

    // Action row
    var actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;";

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.textContent = "+ Add current as receipt";
    addBtn.style.cssText =
      "padding:10px 14px;background:#3EC9CC;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;flex:1;min-width:160px;";

    var csvBtn = document.createElement("button");
    csvBtn.type = "button";
    csvBtn.textContent = "Export staged as CSV";
    csvBtn.style.cssText =
      "padding:10px 14px;background:transparent;color:#181C39;border:1px solid #181C39;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;";

    var clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.textContent = "Clear list";
    clearBtn.style.cssText =
      "padding:10px 14px;background:transparent;color:#5E6075;border:1px solid #d0d4da;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;";

    var genCombinedBtn = document.createElement("button");
    genCombinedBtn.type = "button";
    genCombinedBtn.textContent = "Generate Combined PDF";
    genCombinedBtn.style.cssText =
      "padding:12px 16px;background:#181C39;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Libre Franklin',sans-serif;width:100%;";

    var status = document.createElement("div");
    status.id = "multiReceiptStatus";
    status.style.cssText =
      "font-size:13px;color:#5E6075;margin-top:10px;font-family:'Libre Franklin',sans-serif;";

    actions.appendChild(addBtn);
    actions.appendChild(csvBtn);
    actions.appendChild(clearBtn);

    section.appendChild(heading);
    section.appendChild(desc);
    section.appendChild(spWrap);
    section.appendChild(list);
    section.appendChild(actions);
    section.appendChild(genCombinedBtn);
    section.appendChild(status);

    // ===== Toggle button (mirrors the batch-mode toggle styling) =====
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "multiReceiptToggleBtn";
    toggle.innerHTML = "Multi-Receipt Mode <span style=\"font-weight:400;opacity:0.75;font-size:12px;\">— combine multiple receipts into one PDF</span>";
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
      this.innerHTML = showing
        ? "Multi-Receipt Mode <span style=\"font-weight:400;opacity:0.75;font-size:12px;\">— combine multiple receipts into one PDF</span>"
        : "Close Multi-Receipt Mode";
      if (!showing) {
        this.style.background = "var(--fountain-navy)";
        this.style.color = "white";
      } else {
        this.style.background = "transparent";
        this.style.color = "var(--fountain-navy)";
      }
    });

    // Insert directly after the main Generate button.
    genBtn.parentElement.insertBefore(toggle, genBtn.nextSibling);
    genBtn.parentElement.insertBefore(section, toggle.nextSibling);

    // ===== Helpers =====
    function snapshotForm() {
      var medsStr = (document.getElementById("medications") || { value: "" }).value.trim();
      // Diagnosis defaults ON for any template with a mapped ICD-10 (all TRT/HRT),
      // mirroring single-receipt mode. The shared checkbox is auto-synced to this
      // default, so reading it keeps batch consistent while still honoring a manual
      // override-off. Falls back to the template default if the checkbox is absent.
      var diagTmpl = document.getElementById("template").value;
      var diagBox = document.getElementById("addDiagnosis");
      var diagHasCode = !!(window.FV && window.FV.getDefaultICD10 &&
        (window.FV.getDefaultICD10(diagTmpl) || {}).code);
      var addDiag = diagBox ? diagBox.checked : diagHasCode;
      var addNPI = !!(document.getElementById("addNPI") && document.getElementById("addNPI").checked);
      var addRenderingProvider = !!(document.getElementById("addRenderingProvider") && document.getElementById("addRenderingProvider").checked);
      return {
        template: document.getElementById("template").value,
        price: parseFloat(document.getElementById("price").value) || null,
        weeks: parseInt(document.getElementById("weeks").value) || null,
        state: (document.getElementById("patientState") || { value: "" }).value || "",
        noLabs: !!(document.getElementById("noLabs") && document.getElementById("noLabs").checked),
        noPharmacy: !!(document.getElementById("noPharmacy") && document.getElementById("noPharmacy").checked),
        noEstradiol: ((document.getElementById("hrtComposition") || {}).value) || "full",
        addDiagnosis: addDiag,
        addNPI: addNPI,
        addRenderingProvider: addRenderingProvider,
        invoiceStatus: (document.getElementById("invoiceStatus") || { value: "paid" }).value,
        chargeDate: "",
        medications: medsStr ? medsStr.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : null,
      };
    }

    function describeReceipt(r) {
      var label = (r.template || "").replace(/_/g, " ");
      var bits = [];
      var STATUS_TEXT = { paid: "PAID", unpaid: "UNPAID", past_due: "PAST DUE", refunded: "REFUNDED" };
      bits.push(STATUS_TEXT[r.invoiceStatus] || "PAID");
      if (r.price != null) bits.push("$" + r.price);
      if (r.weeks) bits.push(r.weeks + " wk");
      if (r.state) bits.push(r.state);
      if (r.noLabs) bits.push("No Labs");
      if (r.noPharmacy) bits.push("Mgmt Only");
      if (r.noEstradiol && r.noEstradiol !== "full") {
        bits.push(r.noEstradiol === "t" ? "T only" : r.noEstradiol === "p" ? "P only" : "No Estradiol");
      }
      if (r.addDiagnosis && window.FV && window.FV.getDefaultICD10) {
        var d = window.FV.getDefaultICD10(r.template);
        if (d && d.code) bits.push("ICD: " + d.code);
      }
      return label + (bits.length ? " — " + bits.join(" · ") : "");
    }

    function renderList() {
      list.innerHTML = "";
      if (staged.length === 0) {
        var empty = document.createElement("div");
        empty.style.cssText =
          "padding:10px 12px;border:1px dashed #d0d4da;border-radius:6px;color:#8b8fa0;font-size:12px;text-align:center;";
        empty.textContent = "No receipts staged yet. Configure the form and click “+ Add current as receipt”.";
        list.appendChild(empty);
        genCombinedBtn.disabled = true;
        genCombinedBtn.style.opacity = "0.5";
        genCombinedBtn.style.cursor = "not-allowed";
        csvBtn.disabled = true;
        csvBtn.style.opacity = "0.5";
        csvBtn.style.cursor = "not-allowed";
        return;
      }
      genCombinedBtn.disabled = false;
      genCombinedBtn.style.opacity = "1";
      genCombinedBtn.style.cursor = "pointer";
      csvBtn.disabled = false;
      csvBtn.style.opacity = "1";
      csvBtn.style.cursor = "pointer";

      staged.forEach(function (r, idx) {
        var row = document.createElement("div");
        row.style.cssText =
          "display:flex;align-items:center;gap:8px;padding:8px 10px;background:white;border:1px solid #e0e8e8;border-radius:6px;margin-bottom:6px;";

        var badge = document.createElement("span");
        badge.textContent = "Page " + (idx + 1);
        badge.style.cssText =
          "background:#181C39;color:white;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;letter-spacing:0.3px;flex-shrink:0;";

        var label = document.createElement("span");
        label.textContent = describeReceipt(r);
        label.style.cssText = "flex:1;font-size:13px;color:#181C39;";

        // Reorder buttons
        function mkArrow(symbol, disabled, onclick, title) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = symbol;
          b.title = title;
          b.disabled = disabled;
          b.style.cssText =
            "background:transparent;border:1px solid #d0d4da;color:" + (disabled ? "#bbb" : "#181C39") +
            ";font-size:13px;line-height:1;cursor:" + (disabled ? "not-allowed" : "pointer") +
            ";padding:4px 8px;border-radius:4px;font-weight:700;";
          if (!disabled) b.addEventListener("click", onclick);
          return b;
        }
        var up = mkArrow("↑", idx === 0, function () {
          var tmp = staged[idx - 1];
          staged[idx - 1] = staged[idx];
          staged[idx] = tmp;
          renderList();
        }, "Move up");
        var down = mkArrow("↓", idx === staged.length - 1, function () {
          var tmp = staged[idx + 1];
          staged[idx + 1] = staged[idx];
          staged[idx] = tmp;
          renderList();
        }, "Move down");

        var del = document.createElement("button");
        del.type = "button";
        del.textContent = "×";
        del.title = "Remove";
        del.style.cssText =
          "background:transparent;border:none;color:#cc0000;font-size:20px;line-height:1;cursor:pointer;padding:0 6px;font-weight:700;";
        del.addEventListener("click", function () {
          staged.splice(idx, 1);
          renderList();
        });

        row.appendChild(badge);
        row.appendChild(label);
        row.appendChild(up);
        row.appendChild(down);
        row.appendChild(del);
        list.appendChild(row);
      });
    }

    addBtn.addEventListener("click", function () {
      if (typeof validateForm === "function" && !validateForm()) {
        if (typeof showToast === "function") showToast("Please fix the highlighted fields first");
        return;
      }
      var snap = snapshotForm();
      try {
        var bd = getBreakdown(snap.template, snap.price, snap.weeks, snap.noLabs, snap.noPharmacy, snap.medications, snap.noEstradiol);
        if (!bd) throw new Error("Invalid template/inputs");
      } catch (err) {
        status.style.color = "#cc0000";
        status.textContent = "Couldn't stage receipt: " + err.message;
        return;
      }
      staged.push(snap);
      renderList();
      status.style.color = "#2BA5A8";
      status.textContent = "Added. " + staged.length + " receipt" + (staged.length === 1 ? "" : "s") + " staged.";
      if (typeof showToast === "function") showToast("Receipt added as page " + staged.length);
    });

    clearBtn.addEventListener("click", function () {
      if (staged.length === 0) return;
      if (!window.confirm("Clear all " + staged.length + " staged receipt(s)?")) return;
      staged = [];
      renderList();
      status.textContent = "";
    });

    csvBtn.addEventListener("click", function () {
      if (staged.length === 0) return;
      var headers = ["template", "price", "weeks", "state", "noLabs", "noPharmacy"];
      var rows = staged.map(function (r) {
        return [
          r.template,
          r.price != null ? r.price : "",
          r.weeks != null ? r.weeks : "",
          r.state || "",
          r.noLabs ? "true" : "false",
          r.noPharmacy ? "true" : "false",
        ].join(",");
      });
      var csv = headers.join(",") + "\n" + rows.join("\n") + "\n";
      var blob = new Blob([csv], { type: "text/csv" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var date = (window.FV && window.FV.todayISO) ? window.FV.todayISO() : "";
      a.href = url;
      a.download = "Fountain_staged_" + staged.length + "rows" + (date ? "_" + date : "") + ".csv";
      a.click();
      if (typeof showToast === "function") showToast("CSV exported (" + staged.length + " rows)");
    });

    genCombinedBtn.addEventListener("click", async function () {
      if (staged.length === 0) return;
      genCombinedBtn.disabled = true;
      var origText = genCombinedBtn.textContent;
      genCombinedBtn.textContent = "Generating...";
      status.style.color = "#5E6075";
      status.textContent = "Building combined PDF with " + staged.length + " page(s)...";

      try {
        if (window.ensurePDFLib) await window.ensurePDFLib();
        var pdfDoc = await PDFLib.PDFDocument.create();
        // Metadata
        if (window.FV && window.FV.setPdfMetadata) {
          window.FV.setPdfMetadata(pdfDoc, {
            title: "Itemized Invoice — Fountain Vitality (" + staged.length + " pages)",
            subject: "Combined Itemized Invoice",
            keywords: ["Fountain Vitality", "Itemized Invoice", "Multi-page"],
          });
        }
        var helvetica = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        var helveticaBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

        var bgImage = null;
        if (typeof BG_IMAGE_B64 !== "undefined") {
          try {
            var bgBytes = Uint8Array.from(atob(BG_IMAGE_B64), function (c) { return c.charCodeAt(0); });
            bgImage = await pdfDoc.embedPng(bgBytes);
          } catch (e) { /* ignore */ }
        }

        for (var i = 0; i < staged.length; i++) {
          var cfg = staged[i];
          var breakdown = getBreakdown(cfg.template, cfg.price, cfg.weeks, cfg.noLabs, cfg.noPharmacy, cfg.medications, cfg.noEstradiol);
          if (!breakdown) throw new Error("Page " + (i + 1) + ": invalid template '" + cfg.template + "'");
          drawReceiptPage(pdfDoc, bgImage, helvetica, helveticaBold, breakdown, cfg, i);
        }

        // Force fillable fields to use embedded Helvetica so Adobe matches drawn text
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
        var fnDate = (singlePatient.enabled && singlePatient.chargeDate)
          ? singlePatient.chargeDate
          : ((window.FV && window.FV.todayISO) ? window.FV.todayISO() : "");
        window._lastPdfName = (window.FV && window.FV.buildFilename)
          ? window.FV.buildFilename({ count: staged.length, date: fnDate, kind: "multi" })
          : ("Itemized Receipts (" + staged.length + " pages).pdf");

        var a = document.createElement("a");
        a.href = url;
        a.download = window._lastPdfName;
        a.click();

        status.style.color = "#2BA5A8";
        status.textContent = "Done — combined PDF (" + staged.length + " pages) downloaded.";
        if (typeof showToast === "function") showToast("Combined PDF generated (" + staged.length + " pages)!");
      } catch (err) {
        console.error(err);
        status.style.color = "#cc0000";
        status.textContent = "Error: " + err.message;
      } finally {
        genCombinedBtn.disabled = false;
        genCombinedBtn.textContent = origText;
      }
    });

    // ===== Per-page renderer =====
    // `patientOverride` (optional): when supplied (e.g. by batch-by-plan mode),
    // this page uses that patient's info instead of the shared single-patient
    // fields. Shape: { name, address, dob, chargeDate, provider }. Any provided
    // field is baked as static text; omitted fields fall back to fillable boxes.
    function drawReceiptPage(pdfDoc, bgImage, helvetica, helveticaBold, breakdown, cfg, pageIndex, patientOverride) {
      var sp = patientOverride
        ? {
            enabled: true,
            name: patientOverride.name || "",
            address: patientOverride.address || "",
            dob: patientOverride.dob || "",
            chargeDate: patientOverride.chargeDate || "",
            provider: patientOverride.provider || "",
          }
        : singlePatient;
      var page = pdfDoc.addPage([596, 842]);
      var size = page.getSize();
      var width = size.width;
      var height = size.height;

      if (bgImage) {
        page.drawImage(bgImage, { x: 0, y: 0, width: width, height: height });
      }

      var black = PDFLib.rgb(0, 0, 0);
      var darkColor = PDFLib.rgb(0.102, 0.227, 0.29);
      var tealLine = PDFLib.rgb(0.251, 0.769, 0.690);
      var lightGray = PDFLib.rgb(0.961, 0.961, 0.941);
      var sectionBg = PDFLib.rgb(0.91, 0.91, 0.878);
      var paidRed = PDFLib.rgb(0.8, 0, 0);
      var grayLine = PDFLib.rgb(0.8, 0.8, 0.8);
      var whiteColor = PDFLib.rgb(1, 1, 1);
      var subtleGray = PDFLib.rgb(0.4, 0.42, 0.5);

      var templateType = cfg.template;
      var form = pdfDoc.getForm();
      var suf = "_p" + pageIndex;

      var effChargeDate = (sp.enabled && sp.chargeDate)
        ? sp.chargeDate
        : (cfg.chargeDate || "");

      // --- Patient Info Header ---
      // Lowered (was height - 93) so the boxes clear the letterhead logo. 2026-05-29
      var headerY = height - 115;
      page.drawRectangle({ x: 72, y: headerY - 4, width: 452, height: 16, color: lightGray });
      // 4 columns: Patient Name | Address | Date of Birth | Charge Date
      page.drawText("Patient Name", { x: 115, y: headerY, size: 8, font: helveticaBold, color: black });
      page.drawText("Address", { x: 261, y: headerY, size: 8, font: helveticaBold, color: black });
      page.drawText("Date of Birth", { x: 360, y: headerY, size: 8, font: helveticaBold, color: black });
      page.drawText("Charge Date", { x: 454, y: headerY, size: 8, font: helveticaBold, color: black });
      page.drawRectangle({ x: 72, y: headerY - 20, width: 140, height: 34, borderColor: grayLine, borderWidth: 0.5 });
      page.drawRectangle({ x: 212, y: headerY - 20, width: 130, height: 34, borderColor: grayLine, borderWidth: 0.5 });
      page.drawRectangle({ x: 342, y: headerY - 20, width: 92, height: 34, borderColor: grayLine, borderWidth: 0.5 });
      page.drawRectangle({ x: 434, y: headerY - 20, width: 90, height: 34, borderColor: grayLine, borderWidth: 0.5 });

      // Patient name
      if (sp.enabled && sp.name) {
        page.drawText(sp.name, { x: 78, y: headerY - 14, size: 9, font: helvetica, color: black });
      } else {
        (function(_f){_f.addToPage(page, { x: 74, y: headerY - 18, width: 136, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("patient_name" + suf));
      }
      // Address
      if (sp.enabled && sp.address) {
        page.drawText(sp.address, { x: 216, y: headerY - 14, size: 8, font: helvetica, color: black });
      } else {
        (function(_f){_f.addToPage(page, { x: 214, y: headerY - 18, width: 126, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("patient_address" + suf));
      }
      // DOB
      if (sp.enabled && sp.dob) {
        page.drawText(sp.dob, { x: 348, y: headerY - 14, size: 9, font: helvetica, color: black });
      } else {
        (function(_f){_f.addToPage(page, { x: 344, y: headerY - 18, width: 88, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("date_of_birth" + suf));
      }
      // Charge date
      if (effChargeDate) {
        var pretty = (window.FV && window.FV.todayPretty) ? window.FV.todayPretty(effChargeDate) : effChargeDate;
        page.drawText(pretty, { x: 438, y: headerY - 14, size: 8, font: helvetica, color: black });
      } else {
        (function(_f){_f.addToPage(page, { x: 436, y: headerY - 18, width: 86, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("charge_date" + suf));
      }
      // Re-draw header cell borders so nothing clips them
      page.drawRectangle({ x: 72, y: headerY - 20, width: 140, height: 34, borderColor: grayLine, borderWidth: 0.5 });
      page.drawRectangle({ x: 212, y: headerY - 20, width: 130, height: 34, borderColor: grayLine, borderWidth: 0.5 });
      page.drawRectangle({ x: 342, y: headerY - 20, width: 92, height: 34, borderColor: grayLine, borderWidth: 0.5 });
      page.drawRectangle({ x: 434, y: headerY - 20, width: 90, height: 34, borderColor: grayLine, borderWidth: 0.5 });

      // --- Subscription Coverage + Cycle rows (always fillable in Adobe Sign) ---
      var ySub = headerY - 38;
      var cycleAddedM = false;
      if (["hrt_core", "hrt_eval", "trt_enc_core", "hrt_first90_no_labs"].indexOf(templateType) !== -1) {
        // Coverage row — fillable. 18pt row with a shorter 12pt field centered inside,
        // so Adobe Sign's "Auto" font sizing can't balloon the typed value and clip its
        // descenders against the bottom border (fixed 2026-06-10).
        page.drawRectangle({ x: 72, y: ySub - 4, width: 452, height: 18, color: lightGray });
        page.drawRectangle({ x: 72, y: ySub - 4, width: 200, height: 18, borderColor: grayLine, borderWidth: 0.5 });
        page.drawRectangle({ x: 272, y: ySub - 4, width: 252, height: 18, borderColor: grayLine, borderWidth: 0.5 });
        page.drawText("Subscription Coverage", { x: 76, y: ySub + 2, size: 8, font: helveticaBold, color: black });
        var scFieldName = (templateType === "trt_enc_core" ? "subscription_coverage"
          : (templateType === "hrt_first90_no_labs" ? "subscription_coverage" : "subscription_coverage_hrt")) + suf;
        (function(_f){_f.addToPage(page, { x: 274, y: ySub - 1, width: 248, height: 12, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField(scFieldName));
        page.drawRectangle({ x: 72, y: ySub - 4, width: 200, height: 18, borderColor: grayLine, borderWidth: 0.5 });
        page.drawRectangle({ x: 272, y: ySub - 4, width: 252, height: 18, borderColor: grayLine, borderWidth: 0.5 });

        // Subscription Cycle row removed per request 2026-05-28
      }

      // --- Title row ---
      var yTitle = ySub - 24;
      page.drawText("ITEMIZED INVOICE", { x: 72, y: yTitle, size: 16, font: helveticaBold, color: darkColor });
      var STATUS_LABELS_M = { paid: "STATUS: PAID", unpaid: "STATUS: UNPAID", past_due: "STATUS: PAST DUE", refunded: "STATUS: REFUNDED" };
      var statusLabelM = STATUS_LABELS_M[cfg.invoiceStatus] || "STATUS: PAID";
      var statusColorM = (cfg.invoiceStatus === "unpaid" || cfg.invoiceStatus === "past_due") ? paidRed
                       : (cfg.invoiceStatus === "refunded") ? PDFLib.rgb(0.4, 0.4, 0.4)
                       : darkColor;
      page.drawText(statusLabelM, { x: 380, y: yTitle, size: 16, font: helveticaBold, color: statusColorM });

      // --- Cost breakdown ---
      var y = yTitle - 20;
      var lineH = 16;
      var xSection = 76;
      var xItem = 120;
      var xAmt = 480;
      var fmtLocal = (typeof fmt === "function") ? fmt : function (v) { return "$" + (v || 0).toFixed(2); };

      function drawSectionHeader(label, amount) {
        page.drawRectangle({ x: 72, y: y - 3, width: 452, height: lineH, color: sectionBg });
        page.drawLine({ start: { x: 72, y: y - 3 }, end: { x: 524, y: y - 3 }, thickness: 0.75, color: tealLine });
        page.drawText(label, { x: xSection, y: y + 1, size: 9, font: helveticaBold, color: black });
        var amtW = helveticaBold.widthOfTextAtSize(amount, 9);
        page.drawText(amount, { x: xAmt - amtW, y: y + 1, size: 9, font: helveticaBold, color: black });
        y -= lineH;
      }
      function drawLineItem(label, amount) {
        page.drawText(label, { x: xItem, y: y + 1, size: 8, font: helvetica, color: black });
        var labelEnd = xItem + helvetica.widthOfTextAtSize(label, 8) + 5;
        for (var dx = labelEnd; dx < xAmt - 40; dx += 4) {
          page.drawRectangle({ x: dx, y: y + 4, width: 1, height: 0.5, color: grayLine });
        }
        var amtW2 = helvetica.widthOfTextAtSize(amount, 8);
        page.drawText(amount, { x: xAmt - amtW2, y: y + 1, size: 8, font: helvetica, color: black });
        y -= lineH;
      }

      if (breakdown.pharmacy) {
        drawSectionHeader("Pharmacy Costs", fmtLocal(breakdown.pharmacy_total));
        for (var pk in breakdown.pharmacy) if (Object.prototype.hasOwnProperty.call(breakdown.pharmacy, pk)) {
          drawLineItem(pk, fmtLocal(breakdown.pharmacy[pk]));
        }
      }
      if (breakdown.labs) {
        drawSectionHeader("Lab Costs", fmtLocal(breakdown.labs_total));
        for (var lk in breakdown.labs) if (Object.prototype.hasOwnProperty.call(breakdown.labs, lk)) {
          drawLineItem(lk, fmtLocal(breakdown.labs[lk]));
        }
      }
      drawSectionHeader("Clinical Provider Services (Duval Medical P.A)", fmtLocal(breakdown.clinical_total));
      for (var ck in breakdown.clinical) if (Object.prototype.hasOwnProperty.call(breakdown.clinical, ck)) {
        drawLineItem(ck, fmtLocal(breakdown.clinical[ck]));
      }
      drawSectionHeader("Operational Costs", fmtLocal(breakdown.operational_total));
      for (var ok in breakdown.operational) if (Object.prototype.hasOwnProperty.call(breakdown.operational, ok)) {
        drawLineItem(ok, fmtLocal(breakdown.operational[ok]));
      }
      if (breakdown.membership_fee !== null && breakdown.membership_fee !== undefined) {
        var feeLabel = breakdown.membership_fee_label || "Core Membership Fee";
        drawSectionHeader(feeLabel, fmtLocal(breakdown.membership_fee));
      }

      // OTHER CHARGES (fillable CPT / custom lines) — 2-cell bordered structure
      // mirrors the single-receipt index.html implementation exactly so Adobe
      // Sign flattening produces identical visuals in single vs multi modes.
      var cpt = window.FV && window.FV.cptLines;
      if (cpt && cpt.enabled && cpt.count > 0) {
        drawSectionHeader("Other", "—");
        var otherDescCellX = 72;
        var otherDescCellW = 360;
        var otherAmtCellX = 432;
        var otherAmtCellW = 92;
        for (var oi = 0; oi < cpt.count; oi++) {
          // Row container: lightGray bg + 2 cell borders
          page.drawRectangle({ x: otherDescCellX, y: y - 2, width: otherDescCellW + otherAmtCellW, height: 16, color: lightGray });
          page.drawRectangle({ x: otherDescCellX, y: y - 2, width: otherDescCellW, height: 16, borderColor: grayLine, borderWidth: 0.5 });
          page.drawRectangle({ x: otherAmtCellX, y: y - 2, width: otherAmtCellW, height: 16, borderColor: grayLine, borderWidth: 0.5 });
          // Fillable description (inside left cell, 2px padding)
          (function(_f){_f.addToPage(page, { x: otherDescCellX + 2, y: y - 2, width: otherDescCellW - 4, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("other_desc" + suf + "_" + oi));
          // Fillable amount (inside right cell)
          (function(_f){_f.addToPage(page, { x: otherAmtCellX + 2, y: y - 2, width: otherAmtCellW - 4, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("other_amt" + suf + "_" + oi));
          // Re-draw cell borders AFTER fields so appearance streams can't clip
          page.drawRectangle({ x: otherDescCellX, y: y - 2, width: otherDescCellW, height: 16, borderColor: grayLine, borderWidth: 0.5 });
          page.drawRectangle({ x: otherAmtCellX, y: y - 2, width: otherAmtCellW, height: 16, borderColor: grayLine, borderWidth: 0.5 });
          y -= 18;
        }
      }

      // Total row
      var totalLabel = breakdown.weeks ? ("Total cost per " + breakdown.weeks + " weeks") : "Total cost";
      y -= 4;
      page.drawRectangle({ x: 72, y: y - 3, width: 452, height: lineH + 2, color: sectionBg });
      page.drawLine({ start: { x: 72, y: y - 3 }, end: { x: 524, y: y - 3 }, thickness: 2, color: tealLine });
      page.drawText(totalLabel, { x: xSection, y: y + 1, size: 10, font: helveticaBold, color: black });
      var totalAmtStr = fmtLocal(breakdown.total);
      var totalAmtW = helveticaBold.widthOfTextAtSize(totalAmtStr, 10);
      page.drawText(totalAmtStr, { x: xAmt - totalAmtW, y: y + 1, size: 10, font: helveticaBold, color: black });
      y -= 24;

      // Provider footer (2-cell structure, mirrors Subscription Coverage)
      // Assessments/evaluations omit the Rendering Provider row by default; the
      // "Rendering Provider" toggle (assessments only) adds it back. Non-assessment
      // templates always render it.
      var isAssessmentM = !!(window.TEMPLATE_PRESETS && window.TEMPLATE_PRESETS[templateType] && window.TEMPLATE_PRESETS[templateType].type === "evaluation");
      if (!isAssessmentM || cfg.addRenderingProvider) {
        page.drawRectangle({ x: 72, y: y - 2, width: 452, height: 16, color: lightGray });
        page.drawRectangle({ x: 72, y: y - 2, width: 200, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        page.drawRectangle({ x: 272, y: y - 2, width: 252, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        page.drawText("Rendering Provider's Professional Name", { x: 76, y: y + 2, size: 8, font: helveticaBold, color: black });
        if (sp.enabled && sp.provider) {
          page.drawText(sp.provider, { x: 278, y: y + 2, size: 8, font: helvetica, color: black });
        } else {
          (function(_f){_f.addToPage(page, { x: 274, y: y - 2, width: 248, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("rendering_provider" + suf));
        }
        page.drawRectangle({ x: 72, y: y - 2, width: 200, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        page.drawRectangle({ x: 272, y: y - 2, width: 252, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        y -= 18;
      }

      // NPI Number (optional, mirrors Rendering Provider row)
      if (cfg.addNPI) {
        page.drawRectangle({ x: 72, y: y - 2, width: 452, height: 16, color: lightGray });
        page.drawRectangle({ x: 72, y: y - 2, width: 200, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        page.drawRectangle({ x: 272, y: y - 2, width: 252, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        page.drawText("NPI Number", { x: 76, y: y + 2, size: 8, font: helveticaBold, color: black });
        (function(_f){_f.addToPage(page, { x: 274, y: y - 2, width: 248, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("npi_number" + suf));
        page.drawRectangle({ x: 72, y: y - 2, width: 200, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        page.drawRectangle({ x: 272, y: y - 2, width: 252, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        y -= 18;
      }

      // Place of Service (always present, baked text)
      page.drawRectangle({ x: 72, y: y - 2, width: 452, height: 16, color: lightGray });
      page.drawRectangle({ x: 72, y: y - 2, width: 200, height: 16, borderColor: grayLine, borderWidth: 0.5 });
      page.drawRectangle({ x: 272, y: y - 2, width: 252, height: 16, borderColor: grayLine, borderWidth: 0.5 });
      page.drawText("Place of Service", { x: 76, y: y + 2, size: 8, font: helveticaBold, color: black });
      page.drawText("Telehealth provided in patient's home", { x: 276, y: y + 2, size: 8, font: helvetica, color: black });
      y -= 18;

      if (cfg.addDiagnosis) {
        var dxAuto = (window.FV && window.FV.getDefaultICD10) ? window.FV.getDefaultICD10(templateType) : { code: "" };
        var dxCode = dxAuto.code || "";
        page.drawRectangle({ x: 72, y: y - 2, width: 452, height: 16, color: lightGray, borderColor: grayLine, borderWidth: 0.5 });
        page.drawText("Diagnosis Code", { x: 76, y: y + 2, size: 8, font: helveticaBold, color: black });
        if (dxCode) {
          page.drawText(dxCode, { x: 172, y: y + 2, size: 8, font: helvetica, color: black });
        } else {
          (function(_f){_f.addToPage(page, { x: 170, y: y - 2, width: 100, height: 14, borderWidth: 0, borderColor: whiteColor }); try { _f.setFontSize(8); } catch (e) {}})(form.createTextField("diagnosis_code" + suf));
        }
        page.drawText("EIN Number", { x: 300, y: y + 2, size: 8, font: helveticaBold, color: black });
        var ein = "85-3931138";
        page.drawText(ein, { x: 400, y: y + 2, size: 8, font: helvetica, color: black });
        page.drawRectangle({ x: 72, y: y - 2, width: 452, height: 16, borderColor: grayLine, borderWidth: 0.5 });
        y -= 18;
      }
    }

    // Expose the per-page renderer so other modes (batch-by-plan) can reuse it
    // instead of duplicating ~250 lines of drawing logic. Pass a patientOverride
    // as the 8th arg to bake a specific patient into each page.
    window.FVMulti = window.FVMulti || {};
    window.FVMulti.drawReceiptPage = drawReceiptPage;
  });
})();
