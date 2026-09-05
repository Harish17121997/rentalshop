/**
 * Google Apps Script backend for the Rental & Stock app.
 *
 * Deploy as a Web App (Deploy > New deployment > Web app):
 *   - Execute as: Me
 *   - Who has access: Anyone (or "Anyone with the link")
 * Then set VITE_GAS_API_URL in the frontend .env to the deployment URL and
 * flip USE_MOCK to false in src/services/api.js.
 *
 * Every request goes through doGet/doPost with an `action` field, mirroring
 * the action names used by src/services/*.js. Responses are always shaped as
 * { success: true, data } or { success: false, error, code } to match the
 * `unwrap()` helper in src/services/api.js.
 */

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const SHEET_ID = '1Pjf9ORWctgvqNIxotzHZ4xdwvTauFlu8S6T_U150P-s'

const USERS_SHEET = 'Users'
const RENTAL_UNITS_SHEET = 'RentalUnits'
const RENT_PAYMENTS_SHEET = 'RentPayments'
const STOCK_TRANSACTIONS_SHEET = 'StockTransactions'

const SHEET_HEADERS = {}
SHEET_HEADERS[USERS_SHEET] = ['userId', 'name', 'username', 'password', 'role']
SHEET_HEADERS[RENTAL_UNITS_SHEET] = ['unitId', 'unitName', 'category', 'location', 'monthlyRent', 'tenantName', 'tenantPhone', 'tenantAadhar', 'agreementDate', 'status']
SHEET_HEADERS[RENT_PAYMENTS_SHEET] = ['paymentId', 'unitId', 'month', 'year', 'expectedAmount', 'paidAmount', 'paidDate', 'paymentMethod', 'description']
SHEET_HEADERS[STOCK_TRANSACTIONS_SHEET] = ['transactionId', 'companyName', 'type', 'quantity', 'buyPrice', 'buyAmount', 'buyDate', 'sellPrice', 'sellAmount', 'sellDate', 'broker']

/** Public entry points **************************************************/

function doGet(e) {
  return handleRequest(e)
}

function doPost(e) {
  return handleRequest(e)
}

function handleRequest(e) {
  var action = ''
  var params = {}
  var token = ''

  try {
    var qs = (e && e.parameter) || {}

    if (e && e.postData && e.postData.contents) {
      var body = JSON.parse(e.postData.contents)
      action = body.action || qs.action || ''
      token = body.token || qs.token || ''
      params = body.payload || {}
    } else {
      action = qs.action || ''
      token = qs.token || ''
      params = qs
    }

    if (!action) {
      return jsonResponse({ success: false, error: 'Missing action', code: 'BAD_REQUEST' })
    }

    if (action !== 'auth.login') {
      var authError = requireAuth(token)
      if (authError) return jsonResponse(authError)
    }

    var data = routeAction(action, params)
    return jsonResponse({ success: true, data: data })
  } catch (err) {
    return jsonResponse({ success: false, error: err && err.message ? err.message : String(err), code: 'SERVER_ERROR' })
  }
}

function routeAction(action, params) {
  switch (action) {
    case 'auth.login':
      return authLogin(params.username, params.password)
    case 'auth.logout':
      return {}

    case 'rentalUnits.list':
      return rentalUnitsList()
    case 'rentalUnits.create':
      return rentalUnitsCreate(params)
    case 'rentalUnits.update':
      return rentalUnitsUpdate(params.unitId, params)
    case 'rentalUnits.delete':
      return rentalUnitsDelete(params.unitId)

    case 'rent.list':
      return rentList(params)
    case 'rent.history':
      return rentHistory(params.unitId)
    case 'rent.recordPayment':
      return rentRecordPayment(params)

    case 'stock.list':
      return stockList()
    case 'stock.create':
      return stockCreate(params)
    case 'stock.update':
      return stockUpdate(params.transactionId, params)

    default:
      throw new Error('Unknown action: ' + action)
  }
}

/** Auth ******************************************************************/

function authLogin(username, password) {
  var users = readSheet(USERS_SHEET)
  var user = users.find(function (u) {
    return String(u.username).toLowerCase() === String(username || '').toLowerCase() && String(u.password) === String(password)
  })

  if (!user) {
    throw new Error('Invalid username or password')
  }

  return {
    token: 'token-' + user.userId,
    user: { userId: user.userId, name: user.name, username: user.username, role: user.role },
  }
}

function requireAuth(token) {
  if (!token || token.indexOf('token-') !== 0) {
    return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
  }
  var userId = token.substring('token-'.length)
  var users = readSheet(USERS_SHEET)
  var user = users.find(function (u) { return String(u.userId) === userId })
  if (!user) {
    return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
  }
  return null
}

/** Rental units **********************************************************/

function rentalUnitsList() {
  return readSheet(RENTAL_UNITS_SHEET)
}

function rentalUnitsCreate(payload) {
  var sheet = getSheet(RENTAL_UNITS_SHEET)
  var units = readSheet(RENTAL_UNITS_SHEET)
  var unitId = payload.unitId || nextId('unit', units, 'unitId')

  var record = {
    unitId: unitId,
    unitName: payload.unitName || '',
    category: payload.category || '',
    location: payload.location || '',
    monthlyRent: Number(payload.monthlyRent) || 0,
    tenantName: payload.tenantName || '',
    tenantPhone: payload.tenantPhone || '',
    tenantAadhar: payload.tenantAadhar || '',
    agreementDate: payload.agreementDate || null,
    status: payload.status || 'Rented',
  }

  appendRow(sheet, SHEET_HEADERS[RENTAL_UNITS_SHEET], record)
  return record
}

function rentalUnitsUpdate(unitId, payload) {
  var sheet = getSheet(RENTAL_UNITS_SHEET)
  var rowIndex = findRowIndex(sheet, SHEET_HEADERS[RENTAL_UNITS_SHEET], 'unitId', unitId)
  if (rowIndex === -1) throw new Error('Rental unit not found: ' + unitId)

  var updated = updateRow(sheet, SHEET_HEADERS[RENTAL_UNITS_SHEET], rowIndex, payload)
  return updated
}

function rentalUnitsDelete(unitId) {
  var sheet = getSheet(RENTAL_UNITS_SHEET)
  var rowIndex = findRowIndex(sheet, SHEET_HEADERS[RENTAL_UNITS_SHEET], 'unitId', unitId)
  if (rowIndex === -1) throw new Error('Rental unit not found: ' + unitId)

  sheet.deleteRow(rowIndex + 2) // +1 header, +1 to 1-index
  return { unitId: unitId }
}

/** Rent payments *********************************************************/

function rentList(params) {
  var results = readSheet(RENT_PAYMENTS_SHEET)
  if (params.month) results = results.filter(function (r) { return Number(r.month) === Number(params.month) })
  if (params.year) results = results.filter(function (r) { return Number(r.year) === Number(params.year) })
  if (params.unitId) results = results.filter(function (r) { return r.unitId === params.unitId })
  return results
}

function rentHistory(unitId) {
  var results = readSheet(RENT_PAYMENTS_SHEET).filter(function (r) { return r.unitId === unitId })
  results.sort(function (a, b) { return (b.year - a.year) || (b.month - a.month) })
  return results
}

/**
 * Creates the (unitId, month, year) rent record if none exists yet;
 * otherwise adds the new amount onto the existing paidAmount so repeated
 * partial payments accumulate instead of overwriting each other.
 */
function rentRecordPayment(params) {
  var sheet = getSheet(RENT_PAYMENTS_SHEET)
  var records = readSheet(RENT_PAYMENTS_SHEET)

  var existing = records.find(function (r) {
    return r.unitId === params.unitId && Number(r.month) === Number(params.month) && Number(r.year) === Number(params.year)
  })

  if (!existing) {
    var record = {
      paymentId: nextId('r', records, 'paymentId'),
      unitId: params.unitId,
      month: Number(params.month),
      year: Number(params.year),
      expectedAmount: Number(params.expectedAmount) || 0,
      paidAmount: 0,
      paidDate: null,
      paymentMethod: null,
      description: '',
    }
    appendRow(sheet, SHEET_HEADERS[RENT_PAYMENTS_SHEET], record)
    existing = record
  }

  var rowIndex = findRowIndex(sheet, SHEET_HEADERS[RENT_PAYMENTS_SHEET], 'paymentId', existing.paymentId)
  var newPaidAmount = (Number(existing.paidAmount) || 0) + Number(params.amount)

  var updated = updateRow(sheet, SHEET_HEADERS[RENT_PAYMENTS_SHEET], rowIndex, {
    paidAmount: newPaidAmount,
    paidDate: params.date,
    paymentMethod: params.method,
    description: params.description,
  })

  return updated
}

/** Stock transactions ****************************************************/

function stockList() {
  return readSheet(STOCK_TRANSACTIONS_SHEET)
}

function stockCreate(payload) {
  var sheet = getSheet(STOCK_TRANSACTIONS_SHEET)
  var records = readSheet(STOCK_TRANSACTIONS_SHEET)

  var record = {
    transactionId: nextId('s', records, 'transactionId'),
    companyName: payload.companyName || '',
    type: payload.type || '',
    quantity: Number(payload.quantity) || 0,
    buyPrice: Number(payload.buyPrice) || 0,
    buyAmount: Number(payload.buyAmount) || 0,
    buyDate: payload.buyDate || null,
    sellPrice: payload.sellPrice != null ? Number(payload.sellPrice) : null,
    sellAmount: Number(payload.sellAmount) || 0,
    sellDate: payload.sellDate || null,
    broker: payload.broker || '',
  }

  appendRow(sheet, SHEET_HEADERS[STOCK_TRANSACTIONS_SHEET], record)
  return record
}

function stockUpdate(transactionId, payload) {
  var sheet = getSheet(STOCK_TRANSACTIONS_SHEET)
  var rowIndex = findRowIndex(sheet, SHEET_HEADERS[STOCK_TRANSACTIONS_SHEET], 'transactionId', transactionId)
  if (rowIndex === -1) throw new Error('Stock transaction not found: ' + transactionId)

  var updated = updateRow(sheet, SHEET_HEADERS[STOCK_TRANSACTIONS_SHEET], rowIndex, payload)
  return updated
}

/** Sheet helpers *********************************************************/

function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID)
}

function getSheet(name) {
  var ss = getSpreadsheet()
  var sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    sheet.appendRow(SHEET_HEADERS[name])
  }
  return sheet
}

function readSheet(name) {
  var sheet = getSheet(name)
  var headers = SHEET_HEADERS[name]
  var lastRow = sheet.getLastRow()
  if (lastRow < 2) return []

  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues()
  return values
    .filter(function (row) { return row.some(function (cell) { return cell !== '' && cell !== null }) })
    .map(function (row) { return rowToRecord(row, headers) })
}

function rowToRecord(row, headers) {
  var record = {}
  headers.forEach(function (key, i) {
    var value = row[i]
    if (value === '') value = null
    if (value instanceof Date) value = formatDate(value)
    record[key] = value
  })
  return record
}

function appendRow(sheet, headers, record) {
  var row = headers.map(function (key) {
    var value = record[key]
    return value === undefined || value === null ? '' : value
  })
  sheet.appendRow(row)
}

function findRowIndex(sheet, headers, keyField, keyValue) {
  var lastRow = sheet.getLastRow()
  if (lastRow < 2) return -1

  var keyCol = headers.indexOf(keyField) + 1
  var values = sheet.getRange(2, keyCol, lastRow - 1, 1).getValues()
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(keyValue)) return i
  }
  return -1
}

function updateRow(sheet, headers, rowIndex, patch) {
  var rangeRow = rowIndex + 2
  var current = rowToRecord(sheet.getRange(rangeRow, 1, 1, headers.length).getValues()[0], headers)
  var merged = Object.assign({}, current, patch)

  var row = headers.map(function (key) {
    var value = merged[key]
    return value === undefined || value === null ? '' : value
  })
  sheet.getRange(rangeRow, 1, 1, headers.length).setValues([row])
  return merged
}

function nextId(prefix, records, idField) {
  var max = 0
  records.forEach(function (r) {
    var match = String(r[idField] || '').match(/(\d+)$/)
    if (match) max = Math.max(max, Number(match[1]))
  })
  return prefix + (max + 1)
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd')
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
