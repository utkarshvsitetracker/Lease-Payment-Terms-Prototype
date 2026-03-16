// ─── Shared types for the Apply Escalator multi-step modal ───────────────────

export type EscalatorType = 'one-time' | 'recurring';
export type EscalationFrequency = 'monthly' | 'quarterly' | 'biannual' | 'yearly';
export type EscalationValueType = 'amount' | 'percentage';

export interface ExistingEscalator {
  id: string;
  name: string;
  type: EscalatorType;
  frequency?: EscalationFrequency;
  interval?: number;
  numberOfEscalations?: number;
}

export interface ExistingPeriod {
  id: string;
  name: string;
  escalationType: EscalationValueType;
  startDate: string;
  rateOrAmount: string;
  currencyCode: string; // 'USD' | 'EUR' | etc — Amount-type periods must match LPT currency
  unavailable?: boolean; // currency mismatch
}

// ─── Step 1 form state ────────────────────────────────────────────────────────
export interface NewEscalatorForm {
  name: string;
  type: EscalatorType;
  frequency: EscalationFrequency | '';
  interval: string;
  /** Used when useEscalationDateRange is false */
  numberOfEscalations: string;
  /** When true, derive escalation count from date range instead of a number */
  useEscalationDateRange: boolean;
  escalationRangeStartDate: string;
  escalationRangeEndDate: string;
  considerLPTRuleset: boolean;
}

// ─── Step 2 form state ────────────────────────────────────────────────────────
export interface NewPeriodForm {
  name: string;
  escalationType: EscalationValueType;
  amount: string;
  rate: string;
  startDate: string;
  endDate: string;
  minPct: string;
  minAmt: string;
  maxPct: string;
  maxAmt: string;
}

// ─── Step 3 form state ────────────────────────────────────────────────────────
export interface RulesetForm {
  boundType: 'percentage' | 'amount';   // drives which bound fields are shown
  pctApplied: string;
  minPct: string;
  minAmt: string;
  maxPct: string;
  maxAmt: string;
  reason: string;
}

// ─── Aggregated modal state passed down to steps ─────────────────────────────
export interface ModalState {
  // Step 1
  escalatorMode: 'select' | 'new' | null;
  selectedEscalator: ExistingEscalator | null;
  newEscalator: NewEscalatorForm;

  // Step 2
  periodMode: 'existing' | 'new';
  selectedPeriod: ExistingPeriod | null;
  newPeriod: NewPeriodForm;

  // Step 3
  ruleset: RulesetForm;
}

// ─── A derived "review payment" row ──────────────────────────────────────────
export interface ReviewPayment {
  id: string;
  baseAmount: number;
  escalationRate: string;
  escalatedAmount: number;
  paymentDate: string;
  status: 'Pending' | 'Paid';
}

export interface CatchupPayment {
  id: string;
  catchupAmount: number;
  paymentDate: string;
  status: 'Pending';
}