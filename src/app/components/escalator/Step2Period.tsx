import { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import type { ModalState } from './types';
import { MOCK_PERIODS, LPT_CURRENCY } from './mockData';
import { DateInput } from '../ui/DateInput';

interface Step2Props {
  state: ModalState;
  onChange: (patch: Partial<ModalState>) => void;
}

const inputCls =
  'w-full border border-border bg-input-background rounded-[var(--radius)] px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all';
const selectCls =
  'w-full border border-border bg-input-background rounded-[var(--radius)] px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer';

function PctInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const clean = (v: string) => v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  return (
    <div
      className="flex items-center rounded-[var(--radius)] overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--input-background)' }}
    >
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder ?? '0'}
        onChange={e => onChange(clean(e.target.value))}
        style={{ flex: 1, padding: '8px 0 8px 10px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--foreground)' }}
      />
      <span style={{ padding: '0 10px 0 2px', color: 'var(--muted-foreground)' }}>%</span>
    </div>
  );
}

function CurrInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const clean = (v: string) => v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  return (
    <div
      className="flex items-center rounded-[var(--radius)] overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--input-background)' }}
    >
      <span style={{ padding: '0 4px 0 10px', color: 'var(--muted-foreground)' }}>$</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder ?? '0.00'}
        onChange={e => onChange(clean(e.target.value))}
        style={{ flex: 1, padding: '8px 10px 8px 2px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--foreground)' }}
      />
    </div>
  );
}

export function Step2Period({ state, onChange }: Step2Props) {
  const { periodMode, selectedPeriod, newPeriod, escalatorMode, selectedEscalator, newEscalator } = state;
  const [periodSearch, setPeriodSearch] = useState('');

  const isOneTime =
    (escalatorMode === 'select' && selectedEscalator?.type === 'one-time') ||
    (escalatorMode === 'new' && newEscalator.type === 'one-time');

  const patchPeriod = (patch: Partial<typeof newPeriod>) =>
    onChange({ newPeriod: { ...newPeriod, ...patch } });

  const availablePeriods = MOCK_PERIODS.filter(p => !p.unavailable);
  const unavailablePeriods = MOCK_PERIODS.filter(p => p.unavailable);

  const filteredAvailable = availablePeriods.filter(p =>
    p.name.toLowerCase().includes(periodSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h4 style={{ color: 'var(--foreground)', marginBottom: 4 }}>Select or Create Escalation Period</h4>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Define the specific rate and date range for this escalation.
        </p>
      </div>

      {/* Mode toggle */}
      <div
        className="flex rounded-[var(--radius)] overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--muted)', padding: 3, gap: 3 }}
      >
        {(['existing', 'new'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => onChange({ periodMode: mode, selectedPeriod: null })}
            className="flex-1 py-2 rounded-[var(--radius)] transition-colors"
            style={{
              background: periodMode === mode ? 'var(--card)' : 'transparent',
              color: periodMode === mode ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow: periodMode === mode ? 'var(--elevation-sm)' : 'none',
              border: 'none',
            }}
          >
            {mode === 'existing' ? 'Use existing period' : 'Create new period'}
          </button>
        ))}
      </div>

      {/* ── PATH A: use existing period ──────────────────────────────────────── */}
      {periodMode === 'existing' && (
        <div className="space-y-4">
          {/* Search */}
          <input
            type="text"
            className={inputCls}
            placeholder="Search periods..."
            value={periodSearch}
            onChange={e => setPeriodSearch(e.target.value)}
          />

          {/* Available periods table */}
          <div
            className="overflow-hidden rounded-[var(--radius)]"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div
              className="grid px-4 py-2"
              style={{
                gridTemplateColumns: '2fr 1fr 1.3fr 1fr',
                background: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {['Period Name', 'Escalation Type', 'Start Date', 'Rate / Amount'].map(h => (
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

            {filteredAvailable.length === 0 ? (
              <div className="p-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
                No periods match your search.
              </div>
            ) : (
              filteredAvailable.map(period => {
                const selected = selectedPeriod?.id === period.id;
                return (
                  <button
                    key={period.id}
                    onClick={() => onChange({ selectedPeriod: period })}
                    className="w-full grid px-4 py-3 text-left transition-colors"
                    style={{
                      gridTemplateColumns: '2fr 1fr 1.3fr 1fr',
                      borderBottom: '1px solid var(--border)',
                      background: selected
                        ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                        : 'transparent',
                      outline: selected ? '2px solid var(--primary)' : 'none',
                      outlineOffset: -2,
                    }}
                    onMouseEnter={e => {
                      if (!selected)
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)';
                    }}
                    onMouseLeave={e => {
                      if (!selected)
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    <span style={{ color: 'var(--foreground)', fontWeight: selected ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)' }}>
                      {period.name}
                    </span>
                    <span style={{ color: 'var(--foreground)', textTransform: 'capitalize' }}>
                      {period.escalationType}
                    </span>
                    <span style={{ color: 'var(--foreground)' }}>{period.startDate}</span>
                    <span style={{ color: 'var(--foreground)' }}>{period.rateOrAmount}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Unavailable (currency mismatch) */}
          {unavailablePeriods.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
                <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)' }}>
                  These periods are unavailable due to currency mismatch
                </span>
              </div>
              <div
                className="overflow-hidden rounded-[var(--radius)]"
                style={{ border: '1px solid var(--border)', opacity: 0.45 }}
              >
                <div
                  className="grid px-4 py-2"
                  style={{ gridTemplateColumns: '2fr 1fr 1.3fr 1fr', background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
                >
                  {['Period Name', 'Escalation Type', 'Start Date', 'Rate / Amount'].map(h => (
                    <span key={h} style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </span>
                  ))}
                </div>
                {unavailablePeriods.map(p => (
                  <div
                    key={p.id}
                    className="grid px-4 py-3"
                    style={{ gridTemplateColumns: '2fr 1fr 1.3fr 1fr', borderBottom: '1px solid var(--border)', cursor: 'not-allowed' }}
                  >
                    <span style={{ color: 'var(--muted-foreground)' }}>{p.name}</span>
                    <span style={{ color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{p.escalationType}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>{p.startDate}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>{p.rateOrAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PATH B: create new period ────────────────────────────────────────── */}
      {periodMode === 'new' && (
        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label style={{ color: 'var(--foreground)' }}>
              Escalation Period Name <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="Enter period name"
              value={newPeriod.name}
              onChange={e => patchPeriod({ name: e.target.value })}
            />
          </div>

          {/* Escalation type radio */}
          <div className="space-y-2">
            <label style={{ color: 'var(--foreground)' }}>Escalation Type</label>
            <div className="flex gap-6">
              {([['amount', 'Amount ($)'], ['percentage', 'Percentage (%)']] as const).map(([val, lbl]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--foreground)' }}>
                  <input
                    type="radio"
                    name="escalationType"
                    value={val}
                    checked={newPeriod.escalationType === val}
                    onChange={() => patchPeriod({ escalationType: val })}
                    style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
                  />
                  {lbl}
                </label>
              ))}
            </div>
          </div>

          {/* Amount or rate */}
          {newPeriod.escalationType === 'amount' ? (
            <div className="space-y-1">
              <label style={{ color: 'var(--foreground)' }}>Escalation Amount</label>
              <CurrInput value={newPeriod.amount} onChange={v => patchPeriod({ amount: v })} />
            </div>
          ) : (
            <div className="space-y-1">
              <label style={{ color: 'var(--foreground)' }}>Escalation Rate (%)</label>
              <PctInput value={newPeriod.rate} onChange={v => patchPeriod({ rate: v })} />
            </div>
          )}

          {/* Start date */}
          <div className="space-y-1">
            <label style={{ color: 'var(--foreground)' }}>
              Escalation Start Date <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <DateInput
              value={newPeriod.startDate}
              onChange={e => patchPeriod({ startDate: e.target.value })}
            />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', marginTop: 2 }}>
              The later of this date and the LPT's "Date To Begin Escalation" will be used as the actual start.
            </p>
          </div>

          {/* End date — One Time only */}
          {isOneTime && (
            <div className="space-y-1">
              <label style={{ color: 'var(--foreground)' }}>Escalation End Date</label>
              <DateInput
                value={newPeriod.endDate}
                onChange={e => patchPeriod({ endDate: e.target.value })}
              />
            </div>
          )}

          {/* Currency code (read-only) */}
          <div className="space-y-1">
            <label style={{ color: 'var(--foreground)' }}>Currency Code</label>
            <div
              className="flex items-center rounded-[var(--radius)] px-3 py-2 gap-2"
              style={{ border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'not-allowed' }}
            >
              <span style={{ color: 'var(--muted-foreground)', userSelect: 'none' }}>{LPT_CURRENCY}</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)' }}>
                — inherited from Lease Payment Term
              </span>
            </div>
          </div>

          {/* Optional min/max */}
          <div
            className="rounded-[var(--radius)] p-4 space-y-4"
            style={{ border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}
          >
            <label style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
              Optional Bounds
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label style={{ color: 'var(--foreground)' }}>Minimum Escalation %</label>
                <PctInput value={newPeriod.minPct} onChange={v => patchPeriod({ minPct: v })} />
              </div>
              <div className="space-y-1">
                <label style={{ color: 'var(--foreground)' }}>Minimum Escalation $</label>
                <CurrInput value={newPeriod.minAmt} onChange={v => patchPeriod({ minAmt: v })} />
              </div>
              <div className="space-y-1">
                <label style={{ color: 'var(--foreground)' }}>Maximum Escalation %</label>
                <PctInput value={newPeriod.maxPct} onChange={v => patchPeriod({ maxPct: v })} />
              </div>
              <div className="space-y-1">
                <label style={{ color: 'var(--foreground)' }}>Maximum Escalation $</label>
                <CurrInput value={newPeriod.maxAmt} onChange={v => patchPeriod({ maxAmt: v })} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
