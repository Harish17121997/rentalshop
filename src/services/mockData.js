/**
 * In-memory mock dataset shared by every service while USE_MOCK is true.
 * Shapes mirror the planned Google Sheets columns so swapping in real GAS
 * responses later requires no changes to consuming composables/components.
 */

export const mockUsers = [
  { userId: 'u1', name: 'Father', username: 'father', password: 'father123', role: 'admin' },
  { userId: 'u2', name: 'Me', username: 'me', password: 'me123', role: 'admin' },
]

/**
 * A rental unit is one property (Shop / House) with its tenant info inline —
 * no separate Tenants sheet, since the tenant belongs to exactly one unit in
 * this scope. The 8 shops are fixed (Kadam Complex Kinwat); House units can
 * be added/removed. agreementDate is when the shop/house was given to the
 * current tenant — reset it whenever a tenant changes.
 */
export const mockRentalUnits = [
  { unitId: 'shop-1', unitName: 'Shop 1', category: 'Shop', location: 'Kadam Complex Kinwat', monthlyRent: 12000, tenantName: 'John', tenantPhone: '9876500001', tenantAadhar: '234567890123', agreementDate: '2023-01-10', status: 'Rented' },
  { unitId: 'shop-2', unitName: 'Shop 2', category: 'Shop', location: 'Kadam Complex Kinwat', monthlyRent: 10000, tenantName: 'Raj', tenantPhone: '9876500002', tenantAadhar: '345678901234', agreementDate: '2022-06-15', status: 'Rented' },
  { unitId: 'shop-3', unitName: 'Shop 3', category: 'Shop', location: 'Kadam Complex Kinwat', monthlyRent: 15000, tenantName: 'ABC Traders', tenantPhone: '9876500003', tenantAadhar: '456789012345', agreementDate: '2021-11-01', status: 'Rented' },
  { unitId: 'shop-4', unitName: 'Shop 4', category: 'Shop', location: 'Kadam Complex Kinwat', monthlyRent: 11000, tenantName: 'Kumar Stores', tenantPhone: '9876500004', tenantAadhar: '567890123456', agreementDate: '2023-03-20', status: 'Rented' },
  { unitId: 'shop-5', unitName: 'Shop 5', category: 'Shop', location: 'Kadam Complex Kinwat', monthlyRent: 9000, tenantName: 'Priya', tenantPhone: '9876500005', tenantAadhar: '678901234567', agreementDate: '2024-05-05', status: 'Rented' },
  { unitId: 'shop-6', unitName: 'Shop 6', category: 'Shop', location: 'Kadam Complex Kinwat', monthlyRent: 13000, tenantName: '', tenantPhone: '', tenantAadhar: '', agreementDate: null, status: 'Vacant' },
  { unitId: 'shop-7', unitName: 'Shop 7', category: 'Shop', location: 'Kadam Complex Kinwat', monthlyRent: 8000, tenantName: 'Latha', tenantPhone: '9876500007', tenantAadhar: '789012345678', agreementDate: '2022-09-18', status: 'Rented' },
  { unitId: 'shop-8', unitName: 'Shop 8', category: 'Shop', location: 'Kadam Complex Kinwat', monthlyRent: 14000, tenantName: 'Venkat', tenantPhone: '9876500008', tenantAadhar: '890123456789', agreementDate: '2023-08-01', status: 'Rented' },

  { unitId: 'house-1', unitName: 'House 1', category: 'House', location: 'Green Colony', monthlyRent: 18000, tenantName: 'Suresh', tenantPhone: '9876500006', tenantAadhar: '901234567890', agreementDate: '2021-09-12', status: 'Rented' },
]

const CURRENT_YEAR = 2026

export const mockRentPayments = [
  { paymentId: 'r1', unitId: 'shop-1', month: 8, year: CURRENT_YEAR, expectedAmount: 12000, paidAmount: 0, paidDate: null, paymentMethod: null, description: '' },
  { paymentId: 'r2', unitId: 'shop-2', month: 8, year: CURRENT_YEAR, expectedAmount: 10000, paidAmount: 10000, paidDate: '2026-08-06', paymentMethod: 'UPI', description: 'August rent' },
  { paymentId: 'r3', unitId: 'shop-3', month: 8, year: CURRENT_YEAR, expectedAmount: 15000, paidAmount: 7000, paidDate: '2026-08-04', paymentMethod: 'Cash', description: 'Partial payment' },
  { paymentId: 'r4', unitId: 'house-1', month: 8, year: CURRENT_YEAR, expectedAmount: 18000, paidAmount: 18000, paidDate: '2026-08-05', paymentMethod: 'Bank', description: 'August rent' },

  { paymentId: 'r5', unitId: 'shop-1', month: 7, year: CURRENT_YEAR, expectedAmount: 12000, paidAmount: 12000, paidDate: '2026-07-05', paymentMethod: 'Cash', description: 'July rent' },
  { paymentId: 'r6', unitId: 'shop-2', month: 7, year: CURRENT_YEAR, expectedAmount: 10000, paidAmount: 10000, paidDate: '2026-07-06', paymentMethod: 'UPI', description: 'July rent' },
  { paymentId: 'r7', unitId: 'shop-3', month: 7, year: CURRENT_YEAR, expectedAmount: 15000, paidAmount: 15000, paidDate: '2026-07-03', paymentMethod: 'Cash', description: 'July rent' },
  { paymentId: 'r8', unitId: 'house-1', month: 7, year: CURRENT_YEAR, expectedAmount: 18000, paidAmount: 18000, paidDate: '2026-07-04', paymentMethod: 'Bank', description: 'July rent' },
]

export const mockStockTransactions = [
  { transactionId: 's1', companyName: 'ABC Ltd', type: 'IPO', quantity: 100, buyPrice: 150, buyAmount: 15000, buyDate: '2026-01-10', sellPrice: 200, sellAmount: 20000, sellDate: '2026-02-15', broker: 'Zerodha' },
  { transactionId: 's2', companyName: 'XYZ Corp', type: 'Stock Buy', quantity: 50, buyPrice: 800, buyAmount: 40000, buyDate: '2026-02-01', sellPrice: null, sellAmount: 0, sellDate: null, broker: 'Zerodha' },
  { transactionId: 's3', companyName: 'DEF Ltd', type: 'IPO', quantity: 200, buyPrice: 100, buyAmount: 20000, buyDate: '2026-03-05', sellPrice: 90, sellAmount: 18000, sellDate: '2026-04-01', broker: 'Groww' },
  { transactionId: 's4', companyName: 'GHI Ltd', type: 'Stock Buy', quantity: 30, buyPrice: 500, buyAmount: 15000, buyDate: '2026-04-10', sellPrice: 650, sellAmount: 19500, sellDate: '2026-05-20', broker: 'Zerodha' },
  { transactionId: 's5', companyName: 'JKL Ltd', type: 'IPO', quantity: 150, buyPrice: 120, buyAmount: 18000, buyDate: '2026-06-01', sellPrice: null, sellAmount: 0, sellDate: null, broker: 'Groww' },
]
