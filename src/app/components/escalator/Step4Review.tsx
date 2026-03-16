import { Download, Info, AlertTriangle } from 'lucide-react';
import type { ModalState, CatchupPayment } from './types';
import { MOCK_REVIEW_PAYMENTS } from './mockData';

interface Step4Props {
  state: ModalState;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function buildCatchups(payments: typeof MOCK_REVIEW_PAYMENTS): CatchupPayment[] {
  const paid = payments.filter(p => p.status === 'Paid');
  const catchups: CatchupPayment[] = [];
  paid.forEach((p, i) => {
    const diff = p.escalatedAmount - p.baseAmount;
    if (diff > 0.01) {
      catchups.push({
        id: `${i + 1}.1`,
        catchupAmount: diff,
        paymentDate: p.paymentDate,
        status: 'Pending',
      });
    }
  });
  return catchups;
}

export function Step4Review({ state }: Step4Props) {
  const { escalatorMode, selectedEscalator, newEscalator, periodMode, selectedPeriod, newPeriod, ruleset } = state;

  const escalatorName =
    escalatorMode === 'select'
      ? selectedEscalator?.name ?? '—'
      : newEscalator.name || '—';

  const periodName =
    periodMode === 'existing'
      ? selectedPeriod?.name ?? '—'
      : newPeriod.name || '—';

  const rate =
    periodMode === 'existing'
      ? selectedPeriod?.rateOrAmount ?? '—'
      : newPeriod.escalationType === 'percentage'
      ? `${newPeriod.rate || '0'}%`
      : `$${newPeriod.amount || '0'}`;

  const startDate =
    periodMode === 'existing'
      ? selectedPeriod?.startDate ?? '—'
      : newPeriod.startDate || '—';

  const pctApplied = ruleset.pctApplied || '100';

  const rawRate = rate.includes('%') ? parseFloat(rate) : null;
  const effectiveRate =
    rawRate !== null ? `${(rawRate * (parseFloat(pctApplied) / 100)).toFixed(2)}%` : rate;

  const payments = MOCK_REVIEW_PAYMENTS;
  const catchups = buildCatchups(payments);
  const pendingCount = payments.filter(p => p.status === 'Pending').length;
  const paidCount = payments.filter(p => p.status === 'Paid').length;

  const summaryFields = [
    { label: 'Escalator', value: escalatorName },
    { label: 'Period', value: periodName },
    { label: 'Rate / Amount', value: rate },
    { label: 'Start Date', value: startDate },
    { label: 'Effective Rate', value: effectiveRate },
    { label: '% Applied', value: `${pctApplied}%` },
    { label: 'Min Escalation', value: ruleset.minPct ? `${ruleset.minPct}%` : ruleset.minAmt ? `$${ruleset.minAmt}` : '—' },
    { label: 'Max Escalation', value: ruleset.maxPct ? `${ruleset.maxPct}%` : ruleset.maxAmt ? `$${ruleset.maxAmt}` : '—' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 style={{ color: 'var(--foreground)', marginBottom: 4 }}>Review Payments & Apply</h4>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Review the payments that will be updated. This action cannot be undone.
        </p>
      </div>

      {/* ── Header summary bar ───────────────────────────────────────────────── */}
      <div
        className="rounded-[var(--radius)] overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="px-4 py-3"
          style={{ background: 'color-mix(in srgb, var(--muted) 50%, transparent)', borderBottom: '1px solid var(--border)' }}
        >
          <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--foreground)' }}>
            Escalation Summary
          </span>
        </div>
        <div
          className="grid p-4 gap-x-6 gap-y-3"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--card)' }}
        >
          {summaryFields.map(f => (
            <div key={f.label}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: '0 0 2px' }}>
                {f.label}
              </p>
              <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                {f.value}
              </span>
            </div>
          ))}
        </div>
        {/* Info note */}
        <div
          className="flex items-start gap-2 px-4 py-3"
          style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)', borderTop: '1px solid var(--border)' }}
        >
          <Info style={{ width: 13, height: 13, color: 'var(--muted-foreground)', marginTop: 1, flexShrink: 0 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
            Effective escalation is calculated based on the ruleset defined above and the Lease Payment Term bounds.
          </p>
        </div>
      </div>

      {/* ── SECTION 1: Payments to be escalated ─────────────────────────────── */}
      <div
        className="rounded-[var(--radius)] overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'color-mix(in srgb, var(--muted) 50%, transparent)', borderBottom: '1px solid var(--border)' }}
        >
          <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--foreground)' }}>
            Payments to be Escalated
          </span>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius)] transition-colors"
            style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)', background: 'var(--card)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--card)')}
            title="Export payments"
          >
            <Download style={{ width: 13, height: 13 }} />
            <span style={{ fontSize: 'var(--text-label)' }}>Export</span>
          </button>
        </div>

        {/* Header row */}
        <div
          className="grid px-4 py-2"
          style={{
            gridTemplateColumns: '100px 1fr 1.2fr 1.2fr 1fr 80px',
            background: 'var(--muted)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['Payment ID', 'Base Amount', 'Escalation Rate/Amt', 'Escalated Amount', 'Payment Date', 'Status'].map(h => (
            <span
              key={h}
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-label)',
                fontWeight: 'var(--font-weight-medium)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {payments.map(p => (
          <div
            key={p.id}
            className="grid px-4 py-3"
            style={{
              gridTemplateColumns: '100px 1fr 1.2fr 1.2fr 1fr 80px',
              borderBottom: '1px solid var(--border)',
              background: p.status === 'Paid'
                ? 'color-mix(in srgb, var(--muted) 40%, transparent)'
                : 'transparent',
            }}
          >
            <span style={{ color: 'var(--foreground)' }}>{p.id}</span>
            <span style={{ color: 'var(--foreground)' }}>{fmt(p.baseAmount)}</span>
            <span style={{ color: 'var(--foreground)' }}>{p.escalationRate}</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
              {fmt(p.escalatedAmount)}
            </span>
            <span style={{ color: 'var(--foreground)' }}>{p.paymentDate}</span>
            <span>
              <span
                style={{
                  fontSize: 'var(--text-label)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius)',
                  background:
                    p.status === 'Paid'
                      ? 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)'
                      : 'color-mix(in srgb, var(--primary) 12%, transparent)',
                  color: p.status === 'Paid' ? 'var(--muted-foreground)' : 'var(--primary)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {p.status}
              </span>
            </span>
          </div>
        ))}

        {/* Paid payments note */}
        {paidCount > 0 && (
          <div
            className="flex items-start gap-2 px-4 py-3"
            style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}
          >
            <AlertTriangle style={{ width: 13, height: 13, color: 'var(--muted-foreground)', marginTop: 1, flexShrink: 0 }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
              {paidCount} paid payment{paidCount > 1 ? 's are' : ' is'} shown above.
              Catch-up records will be created rather than directly editing these payments.
            </p>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Catch-Up Payments (conditional) ──────────────────────── */}
      {catchups.length > 0 && (
        <div
          className="rounded-[var(--radius)] overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="px-4 py-3"
            style={{ background: 'color-mix(in srgb, var(--muted) 50%, transparent)', borderBottom: '1px solid var(--border)' }}
          >
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--foreground)' }}>
              Catch-Up Payments
            </span>
          </div>

          <div
            className="flex items-start gap-2 px-4 py-3"
            style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)', borderBottom: '1px solid var(--border)' }}
          >
            <Info style={{ width: 13, height: 13, color: 'var(--muted-foreground)', marginTop: 1, flexShrink: 0 }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
              Catch-up payments are automatically created for paid payments to account for the escalation difference.
              They cannot be disabled. Amounts rounding to zero (below $0.01) are excluded.
            </p>
          </div>

          {/* Header */}
          <div
            className="grid px-4 py-2"
            style={{
              gridTemplateColumns: '120px 1.5fr 1fr 80px',
              background: 'var(--muted)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {['Catchup ID', 'Catchup Amount', 'Payment Date', 'Status'].map(h => (
              <span
                key={h}
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 'var(--text-label)',
                  fontWeight: 'var(--font-weight-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {catchups.map(c => (
            <div
              key={c.id}
              className="grid px-4 py-3"
              style={{ gridTemplateColumns: '120px 1.5fr 1fr 80px', borderBottom: '1px solid var(--border)' }}
            >
              <span style={{ color: 'var(--muted-foreground)' }}>{c.id}</span>
              <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                {fmt(c.catchupAmount)}
              </span>
              <span style={{ color: 'var(--foreground)' }}>{c.paymentDate}</span>
              <span>
                <span
                  style={{
                    fontSize: 'var(--text-label)',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius)',
                    background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                    color: 'var(--primary)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  Pending
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex gap-4">
        {[
          { label: 'Pending payments updated', value: pendingCount, color: 'var(--primary)' },
          { label: 'Catch-up records created', value: catchups.length, color: 'var(--muted-foreground)' },
          { label: 'Total payments affected', value: payments.length, color: 'var(--foreground)' },
        ].map(s => (
          <div
            key={s.label}
            className="flex-1 rounded-[var(--radius)] p-3 text-center"
            style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
          >
            <div style={{ fontSize: 22, fontWeight: 'var(--font-weight-medium)', color: s.color, lineHeight: 1.2 }}>
              {s.value}
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: '4px 0 0' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
