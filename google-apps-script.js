// ─────────────────────────────────────────────────────────
//  Google Apps Script — Conference Invitee Reporter
//  Paste this entire file into your Apps Script editor
// ─────────────────────────────────────────────────────────

// ① Set this to the exact name of your Google Sheet tab
const SHEET_NAME = "Responses";

// ② Column headers — must match exactly with the sheet's first row
const HEADERS = [
  "Timestamp",
  "Inviter Name",
  "Cell Centre Name",
  "Cell Leader's Name",
  "Invitee Name",
  "Form Number",
  "WhatsApp Number"
];

/* ── Handle POST requests from the frontend ─────────── */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const rows    = payload.rows;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return respond({ status: "error", message: "No rows provided." });
    }

    const sheet = getOrCreateSheet();

    rows.forEach(row => {
      sheet.appendRow([
        row.timestamp      || new Date().toISOString(),
        row.inviterName    || "",
        row.cellCentre     || "",
        row.cellLeader     || "",
        row.inviteeName    || "",
        row.formNumber     || "",
        row.whatsappNumber || ""
      ]);
    });

    return respond({ status: "success", message: `${rows.length} row(s) saved.` });

  } catch (err) {
    console.error("doPost error:", err);
    return respond({ status: "error", message: err.toString() });
  }
}

/* ── Handle GET requests (health check) ─────────────── */
function doGet() {
  return respond({ status: "ok", message: "Conference Invitee Reporter is live." });
}

/* ── Helper: get sheet, create headers if missing ───── */
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Add headers if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);

    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#1a237e");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/* ── Helper: return JSON response with CORS headers ─── */
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
