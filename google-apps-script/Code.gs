const SHEET_NAME = "RSVP Responses";
const HEADERS = [
  "Timestamp",
  "Guest Name",
  "RSVP Status",
  "Number of Guests",
  "Additional Guest Name",
  "Marriage Advice",
];

function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    const data = JSON.parse(e.postData.contents || "{}");

    sheet.appendRow([
      new Date(),
      sanitize_(data.guestName),
      sanitize_(data.rsvpStatus),
      sanitize_(data.guestCount),
      sanitize_(data.additionalGuestName),
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
    sheet.appendRow(HEADERS);
  } else {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
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
