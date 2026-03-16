import { ChevronDown, Info } from 'lucide-react';
import type { ModalState } from './types';

interface Step3Props {
  state: ModalState;
  onChange: (patch: Partial<ModalState>) => void;
}

// ─── Shared input primitives ────────────────────────────────────────────────

function PctInput({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
}) {
  const clean = (v: string) => v.replace(/[^0-9.]/g, '').replace(/(\..*)\./, '$1');
  return (
    <div className="space-y-1">
      <label style={{ color: 'var(--foreground)' }}>{label}</label>
      <div
        className="flex items-center rounded-[var(--radius)] overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--input-background)' }}
      >
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder="0"
          onChange={e => onChange(clean(e.target.value))}
          style={{
            flex: 1,
            padding: '8px 0 8px 10px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--foreground)',
          }}
        />
        <span style={{ padding: '0 10px 0 2px', color: 'var(--muted-foreground)' }}>%</span>
      </div>
      {helper && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
          {helper}
        </p>
      )}
    </div>
  );
}

function CurrInput({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
}) {
  const clean = (v: string) => v.replace(/[^0-9.]/g, '').replace(/(\..*)\./, '$1');
  return (
    <div className="space-y-1">
      <label style={{ color: 'var(--foreground)' }}>{label}</label>
      <div
        className="flex items-center rounded-[var(--radius)] overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--input-background)' }}
      >
        <span style={{ padding: '0 4px 0 10px', color: 'var(--muted-foreground)' }}>$</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder="0.00"
          onChange={e => onChange(clean(e.target.value))}
          style={{
            flex: 1,
            padding: '8px 10px 8px 2px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--foreground)',
          }}
        />
      </div>
      {helper && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
          {helper}
        </p>
      )}
    </div>
  );
}

// ─── Transaction preview builder ────────────────────────────────────────────

function buildTransactionRows(state: ModalState) {
  const { escalatorMode, selectedEscalator, newEscalator, periodMode, selectedPeriod, newPeriod, ruleset } = state;

  const esc = escalatorMode === 'select' ? selectedEscalator : null;
  const isOneTime =
    (escalatorMode === 'select' && selectedEscalator?.type === 'one-time') ||
    (escalatorMode === 'new' && newEscalator.type === 'one-time');

  const numEscalations = isOneTime
    ? 1
    : esc?.numberOfEscalations ??
      (newEscalator.numberOfEscalations ? parseInt(newEscalator.numberOfEscalations) : 4);

  const startDate =
    periodMode === 'existing'
      ? selectedPeriod?.startDate ?? '2025-01-01'
      : newPeriod.startDate || '2025-01-01';

  const rate =
    periodMode === 'existing'
      ? selectedPeriod?.rateOrAmount ?? '—'
      : newPeriod.escalationType === 'percentage'
      ? `${newPeriod.rate || '0'}%`
      : `$${newPeriod.amount || '0'}`;

  const pctApplied = ruleset.pctApplied ? parseFloat(ruleset.pctApplied) / 100 : 1;

  const rows = [];
  let d = new Date(startDate);
  for (let i = 0; i < Math.min(Number(numEscalations), 12); i++) {
    rows.push({
      n: i + 1,
      startDate: d.toISOString().slice(0, 10),
      rate,
      effectiveRate: rate.includes('%')
        ? `${(parseFloat(rate) * pctApplied).toFixed(2)}%`
        : rate,
    });
    d.setMonth(d.getMonth() + 1);
  }
  return rows;
}

// ─── Main component ─────────────────────────────────────────────────────────

export function Step3Rules({ state, onChange }: Step3Props) {
  const { ruleset, newEscalator } = state;
  const considerLPT = newEscalator.considerLPTRuleset;

  const patchRuleset = (patch: Partial<typeof ruleset>) =>
    onChange({ ruleset: { ...ruleset, ...patch } });

  const txRows = buildTransactionRows(state);
  const isPct = ruleset.boundType === 'percentage';

  // Shared select / option styling
  const selectCls =
    'w-full border border-border bg-input-background rounded-[var(--radius)] p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer';

  return (
    <div className="space-y-6">
      <div>
        <h4 style={{ color: 'var(--foreground)', marginBottom: 4 }}>Rules, Reason &amp; Transaction Summary</h4>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Override escalation bounds, provide a reason, and review the transactions that will be created.
        </p>
      </div>

      {/* ── SECTION A: Escalation Ruleset ──────────────────────────────────── */}
      <div
        className="rounded-[var(--radius)] overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Card header */}
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{
            background: 'color-mix(in srgb, var(--muted) 50%, transparent)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
            Escalation Ruleset
          </span>
          {considerLPT && (
            <span
              style={{
                fontSize: 'var(--text-label)',
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
                borderRadius: 'var(--radius)',
                padding: '1px 6px',
              }}
            >
              Pre-filled from LPT
            </span>
          )}
        </div>

        <div className="p-5 space-y-5" style={{ background: 'var(--card)' }}>
          {/* Pre-fill notice */}
          {considerLPT && (
            <div
              className="flex items-start gap-2 p-3 rounded-[var(--radius)]"
              style={{
                background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
                border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
              }}
            >
              <Info style={{ width: 14, height: 14, color: 'var(--primary)', marginTop: 1, flexShrink: 0 }} />
              <p style={{ color: 'var(--foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
                Fields below are pre-populated from the Lease Payment Term ruleset but remain editable.
              </p>
            </div>
          )}

          {/* ── Escalation Bound Type dropdown ── */}
          <div className="space-y-2">
            <label style={{ color: 'var(--foreground)' }}>Escalation Bound Type</label>
            <div className="relative">
              <select
                value={ruleset.boundType}
                onChange={e =>
                  patchRuleset({ boundType: e.target.value as 'percentage' | 'amount' })
                }
                className={selectCls}
              >
                <option value="percentage">Percentage Based</option>
                <option value="amount">Amount Based</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--muted-foreground)' }}
              />
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
              {isPct
                ? 'Set the applied rate and percentage-based floor and ceiling for this escalation.'
                : 'Set a fixed dollar floor and ceiling — the escalation will be clamped to these amounts.'}
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* ── PERCENTAGE BASED fields ── */}
          {isPct && (
            <div className="space-y-4">
              {/* % of Escalation Applied — full width */}
              <PctInput
                label="% of Escalation Applied"
                value={ruleset.pctApplied}
                onChange={v => patchRuleset({ pctApplied: v })}
                helper="100% = full rate applied · 75% = discounted · 102% = 2% on top. Defaults to 100% if blank."
              />

              {/* Min / Max % — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <PctInput
                  label="Minimum Escalation %"
                  value={ruleset.minPct}
                  onChange={v => patchRuleset({ minPct: v })}
                  helper="Effective escalation will not go below this"
                />
                <PctInput
                  label="Maximum Escalation %"
                  value={ruleset.maxPct}
                  onChange={v => patchRuleset({ maxPct: v })}
                  helper="Effective escalation will not exceed this"
                />
              </div>
            </div>
          )}

          {/* ── AMOUNT BASED fields ── */}
          {!isPct && (
            <div className="grid grid-cols-2 gap-4">
              <CurrInput
                label="Minimum Escalation Amount"
                value={ruleset.minAmt}
                onChange={v => patchRuleset({ minAmt: v })}
                helper="Effective escalation will not go below this amount"
              />
              <CurrInput
                label="Maximum Escalation Amount"
                value={ruleset.maxAmt}
                onChange={v => patchRuleset({ maxAmt: v })}
                helper="Effective escalation will not exceed this amount"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION B: Reason ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label style={{ color: 'var(--foreground)' }}>Reason for Escalation</label>
        <textarea
          value={ruleset.reason}
          onChange={e => patchRuleset({ reason: e.target.value })}
          placeholder="Optional — explain why this escalation is being applied..."
          className="w-full border border-border bg-input-background rounded-[var(--radius)] px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
          style={{ minHeight: 80 }}
        />
      </div>

      {/* ── SECTION C: Transaction Summary ──────────────────────────────────── */}
      <div
        className="rounded-[var(--radius)] overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="px-4 py-3"
          style={{
            background: 'color-mix(in srgb, var(--muted) 50%, transparent)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
            Transaction Summary (Preview)
          </span>
        </div>

        {/* Info note */}
        <div
          className="flex items-start gap-2 px-4 py-3"
          style={{
            background: 'color-mix(in srgb, var(--muted) 30%, transparent)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Info style={{ width: 13, height: 13, color: 'var(--muted-foreground)', marginTop: 1, flexShrink: 0 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
            {isPct
              ? 'Effective escalation rate = (Period Rate × % of Escalation Applied), bounded by Min % and Max % defined above.'
              : 'Effective escalation is bounded by the Min and Max dollar amounts defined above.'}
          </p>
        </div>

        {/* Table header */}
        <div
          className="grid px-4 py-2"
          style={{
            gridTemplateColumns: '60px 1fr 1fr 1fr',
            background: 'var(--muted)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['#', 'Escalation Start Date', 'Period Rate / Amount', 'Effective Rate'].map(h => (
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

        {txRows.length === 0 ? (
          <div className="px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>
            Complete steps 1 &amp; 2 to see a transaction preview.
          </div>
        ) : (
          txRows.map(row => (
            <div
              key={row.n}
              className="grid px-4 py-3"
              style={{
                gridTemplateColumns: '60px 1fr 1fr 1fr',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ color: 'var(--muted-foreground)' }}>{row.n}</span>
              <span style={{ color: 'var(--foreground)' }}>{row.startDate}</span>
              <span style={{ color: 'var(--foreground)' }}>{row.rate}</span>
              <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                {row.effectiveRate}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
