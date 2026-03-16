import { useMemo } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import type { PaymentStage } from '../LeasePaymentTerms';

interface EscalationPreviewTableProps {
  formData: PaymentStage;
}

const FREQ_MONTHS: Record<string, number> = {
  monthly: 1, quarterly: 3, annually: 12,
};

function advanceDate(base: Date, monthsOffset: number, eom: boolean, dayStr: string): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + monthsOffset);
  if (eom) {
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
  } else {
    const day = parseInt(dayStr, 10);
    if (!isNaN(day) && day >= 1) {
      const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, maxDay));
    }
  }
  return d;
}

interface PreviewRow {
  n: number;
  dueDate: string;
  baseAmount: number;
  escalLabel: string;
  finalAmount: number;
  isEscalated: boolean;
}

export function EscalationPreviewTable({ formData }: EscalationPreviewTableProps) {
  // ── Resolve total payment count (outside memo so it's accessible in JSX) ──
  const totalPaymentCount = useMemo<number>(() => {
    const freqMonths = FREQ_MONTHS[formData.paymentFrequency] ?? 1;
    if (formData.usePaymentDateRange && formData.paymentStartDate && formData.paymentEndDate) {
      const start = new Date(formData.paymentStartDate);
      const end   = new Date(formData.paymentEndDate);
      const diffMonths =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth()    - start.getMonth());
      return Math.max(1, Math.floor(diffMonths / freqMonths) + 1);
    }
    return parseInt(formData.numberOfPayments || '1', 10) || 0;
  }, [formData.usePaymentDateRange, formData.paymentStartDate, formData.paymentEndDate, formData.paymentFrequency, formData.numberOfPayments]);

  const rows = useMemo<PreviewRow[]>(() => {
    if (!formData.firstPaymentDate || !formData.appliedEscalationRateValue) return [];

    const baseAmt    = parseFloat(formData.amount.replace(/[$,]/g, '')) || 0;
    const freqMonths = FREQ_MONTHS[formData.paymentFrequency] ?? 1;
    const numPayments = totalPaymentCount;
    if (isNaN(numPayments) || numPayments < 1) return [];

    const firstDate = new Date(formData.firstPaymentDate);

    // Effective escalation start
    const appliedStart = new Date(formData.appliedEscalationStartDate);
    const lptStart = formData.paymentTermsDateToBeginEscalation
      ? new Date(formData.paymentTermsDateToBeginEscalation)
      : null;
    const effectiveStart = lptStart && lptStart > appliedStart ? lptStart : appliedStart;

    // Ruleset
    const appliedPctFactor = parseFloat(formData.escalationAppliedPct || '100') / 100;
    const minPct = parseFloat(formData.minEscalationPct || '0');
    const maxPct = parseFloat(formData.maxEscalationPct || '0');
    const rawRate = parseFloat(formData.appliedEscalationRateValue || '0');

    const result: PreviewRow[] = [];

    for (let i = 0; i < Math.min(numPayments, 24); i++) {
      const paymentDate = advanceDate(
        firstDate, i * freqMonths, formData.endOfMonth, formData.recurringPaymentDate,
      );
      const isEscalated = paymentDate >= effectiveStart;

      let finalAmount = baseAmt;
      let escalLabel = '—';

      if (isEscalated) {
        if (formData.appliedEscalationValueType === 'percentage') {
          let effectiveRate = (rawRate / 100) * appliedPctFactor;
          if (minPct > 0) effectiveRate = Math.max(effectiveRate, minPct / 100);
          if (maxPct > 0) effectiveRate = Math.min(effectiveRate, maxPct / 100);

          if (formData.appliedEscalatorType === 'one-time') {
            finalAmount = baseAmt * (1 + effectiveRate);
            escalLabel = `+${(effectiveRate * 100).toFixed(2)}%`;
          } else {
            const escalFreqMonths = FREQ_MONTHS[formData.appliedEscalationFrequency || 'annually'] ?? 12;
            const totalMonths =
              (paymentDate.getFullYear() - effectiveStart.getFullYear()) * 12 +
              (paymentDate.getMonth() - effectiveStart.getMonth());
            const periods = Math.max(1, Math.floor(totalMonths / escalFreqMonths) + 1);
            finalAmount = baseAmt * Math.pow(1 + effectiveRate, periods);
            escalLabel = `+${(effectiveRate * 100).toFixed(2)}% ×${periods}`;
          }
        } else {
          // Amount
          const escalAmt = rawRate * appliedPctFactor;
          finalAmount = baseAmt + escalAmt;
          escalLabel = `+$${escalAmt.toFixed(2)}`;
        }
      }

      result.push({
        n: i + 1,
        dueDate: paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        baseAmount: baseAmt,
        escalLabel,
        finalAmount,
        isEscalated,
      });
    }

    return result;
  }, [formData, totalPaymentCount]);

  if (rows.length === 0) return null;

  const escalatedCount = rows.filter(r => r.isEscalated).length;
  const baseAmt = rows[0]?.baseAmount ?? 0;
  const maxFinal = Math.max(...rows.map(r => r.finalAmount));
  const totalLift = maxFinal - baseAmt;

  return (
    <div
      className="rounded-[var(--radius)] overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Section header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: 'color-mix(in srgb, var(--primary) 6%, var(--muted))',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp style={{ width: 14, height: 14, color: 'var(--primary)' }} />
          <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)' }}>
            Escalation Preview
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            style={{
              fontSize: 'var(--text-label)',
              padding: '2px 8px',
              borderRadius: 'var(--radius)',
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {escalatedCount} of {rows.length} escalated
          </span>
          {totalLift > 0 && (
            <span
              style={{
                fontSize: 'var(--text-label)',
                padding: '2px 8px',
                borderRadius: 'var(--radius)',
                background: 'color-mix(in srgb, var(--chart-3) 10%, transparent)',
                color: 'var(--chart-3)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Max lift: +${totalLift.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Info note */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{
          background: 'color-mix(in srgb, var(--muted) 50%, transparent)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Info style={{ width: 12, height: 12, color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
          Effective rate = period rate × % applied, bounded by Min / Max.
          {rows.length < totalPaymentCount
            ? ` Showing first ${rows.length} of ${totalPaymentCount} payments.`
            : ''}
        </p>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--muted)' }}>
              {['#', 'Due Date', 'Base Amount', 'Escalation', 'Final Amount'].map(h => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--text-label)',
                    fontWeight: 'var(--font-weight-medium)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                    fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.n}
                style={{
                  background: row.isEscalated
                    ? idx % 2 === 0
                      ? 'color-mix(in srgb, var(--primary) 4%, var(--card))'
                      : 'color-mix(in srgb, var(--primary) 6%, var(--muted))'
                    : idx % 2 === 0
                    ? 'var(--card)'
                    : 'color-mix(in srgb, var(--muted) 30%, transparent)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <td style={{ padding: '7px 12px', color: 'var(--muted-foreground)', fontSize: 'var(--text-label)' }}>
                  {row.n}
                </td>
                <td style={{ padding: '7px 12px', color: 'var(--foreground)', fontSize: 'var(--text-base)', whiteSpace: 'nowrap' }}>
                  {row.dueDate}
                </td>
                <td style={{ padding: '7px 12px', color: 'var(--muted-foreground)', fontSize: 'var(--text-base)' }}>
                  ${row.baseAmount.toFixed(2)}
                </td>
                <td style={{ padding: '7px 12px', fontSize: 'var(--text-label)', whiteSpace: 'nowrap' }}>
                  {row.isEscalated ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius)',
                        background: 'color-mix(in srgb, var(--chart-3) 10%, transparent)',
                        color: 'var(--chart-3)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {row.escalLabel}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                  )}
                </td>
                <td
                  style={{
                    padding: '7px 12px',
                    color: row.isEscalated ? 'var(--primary)' : 'var(--foreground)',
                    fontWeight: row.isEscalated ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                    fontSize: 'var(--text-base)',
                  }}
                >
                  ${row.finalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}