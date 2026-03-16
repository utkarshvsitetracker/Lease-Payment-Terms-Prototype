import type { PaymentStage } from '../LeasePaymentTerms';

// ─── Frequency month increments ────────────────────────────────────────────────
const FREQ_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  annually: 12,
};

/**
 * Returns true when a stage has meaningful payment terms configured beyond
 * just the stage name and type of payment.
 *
 * Used in the Dependencies dropdown to distinguish stages that are "saved"
 * (name + type) from stages that are "eligible as dependencies" (payment terms set).
 *
 * Rules:
 *   • one-time manual  → at least one manual payment with a due date and amount
 *   • everything else  → amount AND firstPaymentDate are both non-empty
 */
export function hasPaymentTerms(stage: PaymentStage): boolean {
  if (!stage.isComplete) return false;

  if (stage.typeOfPayment === 'one-time' && stage.isManualEntry) {
    return (
      stage.manualPayments.length > 0 &&
      stage.manualPayments.some(p => p.paymentAmount.trim() !== '' && p.paymentDueDate !== '')
    );
  }

  // recurring or one-time non-manual
  return !!(stage.amount.trim() && stage.firstPaymentDate);
}

/**
 * Returns the last payment date for a completed stage.
 * For manual-entry stages: the latest paymentDueDate across all manual payments.
 * For recurring stages: firstPaymentDate + (numberOfPayments − 1) × frequency.
 */
export function getStageLastPaymentDate(stage: PaymentStage): Date | null {
  if (!stage.isComplete) return null;

  // ── Manual entry ────────────────────────────────────────────────────────────
  if (stage.isManualEntry && stage.manualPayments.length > 0) {
    const sorted = stage.manualPayments
      .map(p => p.paymentDueDate)
      .filter(Boolean)
      .sort();
    if (sorted.length > 0) return new Date(sorted[sorted.length - 1]);
    return null;
  }

  // ── Recurring / one-time (non-manual) ───────────────────────────────────────
  // Date-range mode: end date IS the last payment boundary
  if (stage.usePaymentDateRange && stage.paymentEndDate) {
    return new Date(stage.paymentEndDate);
  }

  if (!stage.firstPaymentDate) return null;

  const first = new Date(stage.firstPaymentDate);
  const n = parseInt(stage.numberOfPayments || '1', 10);
  if (isNaN(n) || n < 1) return first;

  const last = new Date(first);
  const months = FREQ_MONTHS[stage.paymentFrequency] ?? 1;
  last.setMonth(last.getMonth() + (n - 1) * months);
  return last;
}

/**
 * Computes the first payment date for a stage that depends on `depStage`.
 *
 * Rule: first payment month = last payment month of depStage + 1 payment period
 * of the CURRENT stage's frequency.
 *
 * The day inside the month is determined by:
 *   1. endOfMonth flag → last calendar day of that month
 *   2. recurringPaymentDate string (e.g. "15") → that day number (clamped to month length)
 *   3. fallback → same day as the last payment of the dependency
 */
export function computeDependentFirstPaymentDate(
  depStage: PaymentStage,
  currentFrequency: string,
  recurringPaymentDay: string,
  endOfMonth: boolean,
): string | null {
  const lastDate = getStageLastPaymentDate(depStage);
  if (!lastDate) return null;

  const months = FREQ_MONTHS[currentFrequency] ?? 1;
  const next = new Date(lastDate);
  next.setMonth(next.getMonth() + months);

  // Adjust day
  if (endOfMonth) {
    // Last day of the target month
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    next.setDate(0);
  } else {
    const dayNum = parseInt(recurringPaymentDay, 10);
    if (!isNaN(dayNum) && dayNum >= 1) {
      // Clamp to the number of days in that month
      const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(dayNum, daysInMonth));
    }
    // else keep whatever day came from the +months addition
  }

  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const d = String(next.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks whether moving the stage at `dragIndex` to `hoverIndex` would violate
 * any dependency constraint in the list.
 *
 * A violation occurs when, in the new order, any stage ends up BEFORE a stage
 * it depends on (i.e. the dependency stage comes at the same index or later).
 *
 * Returns null if the move is safe, or a human-readable error string if blocked.
 */
export function checkMoveDependencyConflict(
  stages: PaymentStage[],
  dragIndex: number,
  hoverIndex: number,
): string | null {
  if (dragIndex === hoverIndex) return null;

  // Simulate the reorder
  const next = [...stages];
  const [moved] = next.splice(dragIndex, 1);
  next.splice(hoverIndex, 0, moved);

  for (let i = 0; i < next.length; i++) {
    const s = next[i];
    if (!s.dependsOnPreviousStage || !s.dependentStageId) continue;

    const depIdx = next.findIndex(d => d.id === s.dependentStageId);
    if (depIdx === -1) continue;

    if (depIdx >= i) {
      // The stage it depends on would be after (or at) it — conflict
      const depName = next[depIdx].name || 'Unnamed Stage';
      const stageName = s.name || 'Unnamed Stage';
      return `"${stageName}" depends on "${depName}" — move blocked to preserve dependency order.`;
    }
  }

  return null;
}

/**
 * Returns all stages that appear strictly BEFORE `stageId` in the ordered list
 * and are fully completed — these are the valid dependency targets.
 */
export function getEligibleDependencyStages(
  allStages: PaymentStage[],
  stageId: string,
): PaymentStage[] {
  const currentIndex = allStages.findIndex(s => s.id === stageId);
  if (currentIndex <= 0) return [];
  return allStages.slice(0, currentIndex).filter(s => s.isComplete);
}