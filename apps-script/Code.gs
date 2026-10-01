/**
 * Mesa Forge for Business — request inbox.
 *
 * Bound to the Google Sheet that holds B2B requests. The website's server
 * POSTs each request here; this appends one row to `Requests` and one row per
 * product to `Items`. Nothing else writes to the sheet, and nothing here reads
 * from it except to find the tabs.
 *
 * Setup (once): see README.md → "Connect the Google Sheet".
 *   Project Settings → Script properties → WEBHOOK_SECRET = <same value as SHEETS_WEBHOOK_SECRET>
 *   Deploy → New deployment → Web app → Execute as: Me · Who has access: Anyone
 */

var REQUESTS = 'Requests';
var ITEMS = 'Items';

var REQUEST_HEADERS = [
  'Ref', 'Received (IST)', 'Status', 'Owner', 'Company', 'Name', 'Email', 'Phone', 'Email domain',
  'Products', 'Total units', 'Indicative value (₹, retail)', 'Brands asked', 'Follow-up notes',
];
var ITEM_HEADERS = [
  'Ref', 'Received (IST)', 'Company', 'Name', 'Team code', 'Brand', 'SKU', 'Product',
  'Variant', 'Qty', 'Unit price (₹)', 'Line value (₹)', 'Link',
];
var STATUSES = ['New', 'Contacted', 'Quote sent', 'Won', 'Lost', 'Spam'];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!secret || body.secret !== secret) return json_({ ok: false, error: 'unauthorised' });

    var r = body.request;
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var requests = ensureSheet_(ss, REQUESTS, REQUEST_HEADERS);
      var items = ensureSheet_(ss, ITEMS, ITEM_HEADERS);

      // The same ref twice means the site retried after a slow reply; the
      // first write already landed.
      if (refExists_(requests, r.ref)) return json_({ ok: true, duplicate: true });

      var received = new Date(r.receivedAt);
      var brands = unique_(r.items.map(function (i) { return i.brand + ' (' + i.teamCode + ')'; }));

      requests.appendRow([
        r.ref, received, 'New', '', r.company, r.name, r.email, "'" + r.phone, r.emailDomain,
        r.items.length, r.totalUnits, r.indicativeValue, brands.join(', '), '',
      ]);

      if (r.items.length) {
        var rows = r.items.map(function (i) {
          return [r.ref, received, r.company, r.name, i.teamCode, i.brand, i.sku, i.product,
            i.variant, i.qty, i.unitPrice, i.lineValue, i.url];
        });
        items.getRange(items.getLastRow() + 1, 1, rows.length, ITEM_HEADERS.length).setValues(rows);
      }
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Visiting the /exec URL in a browser just says it's alive. */
function doGet() {
  return json_({ ok: true, service: 'mesa-forge-b2b-inbox' });
}

/** Creates the tab with headers, frozen row, formats and the Status dropdown if it isn't there yet. */
function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (sh) return sh;
  sh = ss.insertSheet(name);
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#2A1849').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  sh.getRange('B2:B').setNumberFormat('dd mmm yyyy, h:mm am/pm');
  if (name === REQUESTS) {
    sh.setFrozenColumns(1);
    sh.getRange('L2:L').setNumberFormat('₹#,##0');
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
    sh.getRange('C2:C').setDataValidation(rule);
    var rules = [
      ['New', '#F3D9FA'], ['Contacted', '#E4E1F7'], ['Quote sent', '#FFF1D6'],
      ['Won', '#D6F5E0'], ['Lost', '#EEEEEE'], ['Spam', '#EEEEEE'],
    ].map(function (p) {
      return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(p[0]).setBackground(p[1])
        .setRanges([sh.getRange('C2:C')]).build();
    });
    sh.setConditionalFormatRules(rules);
  } else {
    sh.getRange('K2:L').setNumberFormat('₹#,##0.00');
  }
  return sh;
}

function refExists_(sh, ref) {
  var last = sh.getLastRow();
  if (last < 2) return false;
  return sh.getRange(2, 1, last - 1, 1).createTextFinder(ref).matchEntireCell(true).findNext() !== null;
}

function unique_(xs) {
  var seen = {};
  return xs.filter(function (x) { return seen[x] ? false : (seen[x] = true); });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
