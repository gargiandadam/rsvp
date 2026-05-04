const SHEET_NAME = "RSVP Responses";

function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    const data = JSON.parse(e.postData.contents || "{}");

    sheet.appendRow([
      new Date(),
      sanitize_(data.guestName),
      sanitize_(data.rsvpStatus),
      sanitize_(data.guestCount),
      sanitize_(data.favoriteMemory),
      sanitize_(data.marriageAdvice),
    ]);

    return json_({
      ok: true,
      message: "RSVP saved.",
    });
  } catch (error) {
    return json_({
      ok: false,
      message: error.message,
    });
  }
}

function doGet() {
  return json_({
    ok: true,
    message: "Gargi and Adam RSVP endpoint is live.",
  });
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Guest Name",
      "RSVP Status",
      "Number of Guests",
      "Custom Question 1",
      "Custom Question 2",
    ]);
  }

  return sheet;
}

function sanitize_(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
