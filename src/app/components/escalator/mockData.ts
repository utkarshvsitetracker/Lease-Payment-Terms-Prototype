import type { ExistingEscalator, ExistingPeriod, ReviewPayment } from './types';

// LPT currency — used to flag currency-mismatched periods
export const LPT_CURRENCY = 'USD';

export const MOCK_ESCALATORS: ExistingEscalator[] = [
  { id: 'esc-1', name: 'Annual CPI Escalator', type: 'recurring', frequency: 'yearly', interval: 1, numberOfEscalations: 5 },
  { id: 'esc-2', name: 'Quarterly Step-Up', type: 'recurring', frequency: 'quarterly', interval: 1, numberOfEscalations: 8 },
  { id: 'esc-3', name: 'One-Time Rent Bump', type: 'one-time' },
  { id: 'esc-4', name: 'Biannual Fixed Increase', type: 'recurring', frequency: 'biannual', interval: 2, numberOfEscalations: 4 },
  { id: 'esc-5', name: 'Monthly Micro-Escalator', type: 'recurring', frequency: 'monthly', interval: 1 },
];

export const MOCK_PERIODS: ExistingPeriod[] = [
  { id: 'per-1', name: 'FY2025 CPI Rate', escalationType: 'percentage', startDate: '2025-01-01', rateOrAmount: '3.5%', currencyCode: 'USD' },
  { id: 'per-2', name: 'FY2025 Fixed Amount', escalationType: 'amount', startDate: '2025-01-01', rateOrAmount: '$500.00', currencyCode: 'USD' },
  { id: 'per-3', name: 'EUR Fixed Increase', escalationType: 'amount', startDate: '2025-03-01', rateOrAmount: '€400.00', currencyCode: 'EUR', unavailable: true },
  { id: 'per-4', name: 'Q1 2026 Rate', escalationType: 'percentage', startDate: '2026-01-01', rateOrAmount: '2.8%', currencyCode: 'USD' },
  { id: 'per-5', name: 'GBP Office Uplift', escalationType: 'amount', startDate: '2025-06-01', rateOrAmount: '£350.00', currencyCode: 'GBP', unavailable: true },
];

export const MOCK_REVIEW_PAYMENTS: ReviewPayment[] = [
  { id: 'PMT-001', baseAmount: 5000, escalationRate: '3.5%', escalatedAmount: 5175, paymentDate: '2025-03-01', status: 'Paid' },
  { id: 'PMT-002', baseAmount: 5000, escalationRate: '3.5%', escalatedAmount: 5175, paymentDate: '2025-04-01', status: 'Paid' },
  { id: 'PMT-003', baseAmount: 5000, escalationRate: '3.5%', escalatedAmount: 5175, paymentDate: '2025-05-01', status: 'Pending' },
  { id: 'PMT-004', baseAmount: 5000, escalationRate: '3.5%', escalatedAmount: 5175, paymentDate: '2025-06-01', status: 'Pending' },
  { id: 'PMT-005', baseAmount: 5000, escalationRate: '3.5%', escalatedAmount: 5175, paymentDate: '2025-07-01', status: 'Pending' },
  { id: 'PMT-006', baseAmount: 5000, escalationRate: '3.5%', escalatedAmount: 5175, paymentDate: '2025-08-01', status: 'Pending' },
];
