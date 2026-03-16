import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus, Info } from 'lucide-react';
import { DateInput } from '../ui/DateInput';
import type { ModalState, ExistingEscalator, EscalationFrequency } from './types';
import { MOCK_ESCALATORS } from './mockData';

interface Step1Props {
  state: ModalState;
  onChange: (patch: Partial<ModalState>) => void;
}

const inputCls =
  'w-full border border-border bg-input-background rounded-[var(--radius)] px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all';
const selectCls =
  'w-full border border-border bg-input-background rounded-[var(--radius)] px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer';

const FREQ_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  biannual: 'Biannual',
  yearly: 'Yearly',
};

function ReadOnlyRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-start gap-3">
      <span style={{ color: 'var(--muted-foreground)', minWidth: 200, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

export function Step1Escalator({ state, onChange }: Step1Props) {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { escalatorMode, selectedEscalator, newEscalator } = state;

  const filtered = MOCK_ESCALATORS.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectExisting = (esc: ExistingEscalator) => {
    onChange({ escalatorMode: 'select', selectedEscalator: esc });
    setQuery(esc.name);
    setDropdownOpen(false);
  };

  const startNew = () => {
    onChange({ escalatorMode: 'new', selectedEscalator: null });
    setQuery('');
    setDropdownOpen(false);
  };

  const patchNew = (patch: Partial<typeof newEscalator>) => {
    onChange({ newEscalator: { ...newEscalator, ...patch } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 style={{ color: 'var(--foreground)', marginBottom: 4 }}>Select or Create Escalator</h4>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Choose an existing escalator record or define a new one for this lease payment term.
        </p>
      </div>

      {/* Search input */}
      <div className="space-y-1">
        <label style={{ color: 'var(--foreground)' }}>
          Escalator Name <span style={{ color: 'var(--destructive)' }}>*</span>
        </label>
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center rounded-[var(--radius)] overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--input-background)' }}
          >
            <Search
              style={{ width: 14, height: 14, color: 'var(--muted-foreground)', marginLeft: 10, flexShrink: 0 }}
            />
            <input
              type="text"
              value={query}
              placeholder="Search escalators..."
              onFocus={() => setDropdownOpen(true)}
              onChange={e => {
                setQuery(e.target.value);
                setDropdownOpen(true);
                if (escalatorMode === 'select') {
                  onChange({ escalatorMode: null, selectedEscalator: null });
                }
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute left-0 right-0 z-50 overflow-hidden"
              style={{
                top: 'calc(100% + 4px)',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
              }}
            >
              {/* + New option */}
              <button
                onClick={startNew}
                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                style={{ borderBottom: '1px solid var(--border)', color: 'var(--primary)' }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)')
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')
                }
              >
                <Plus style={{ width: 14, height: 14 }} />
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>+ New Lease Escalator</span>
              </button>

              {filtered.length === 0 ? (
                <div className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>
                  No escalators match "{query}"
                </div>
              ) : (
                filtered.map(esc => (
                  <button
                    key={esc.id}
                    onClick={() => selectExisting(esc)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors"
                    style={{ color: 'var(--foreground)' }}
                    onMouseEnter={e =>
                      ((e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)')
                    }
                    onMouseLeave={e =>
                      ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')
                    }
                  >
                    <span>{esc.name}</span>
                    <span
                      style={{
                        fontSize: 'var(--text-label)',
                        color: 'var(--muted-foreground)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {esc.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── PATH A: selected existing escalator ─────────────────────────────── */}
      {escalatorMode === 'select' && selectedEscalator && (
        <div
          className="rounded-[var(--radius)] p-4 space-y-3"
          style={{ border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--muted) 40%, transparent)' }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <span
              style={{
                fontSize: 'var(--text-label)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Escalator Details (read-only)
            </span>
          </div>
          <ReadOnlyRow label="Escalator Name" value={selectedEscalator.name} />
          <ReadOnlyRow
            label="Escalator Type"
            value={selectedEscalator.type === 'one-time' ? 'One Time' : 'Recurring'}
          />
          {selectedEscalator.type === 'recurring' && (
            <>
              <ReadOnlyRow
                label="Escalation Frequency"
                value={selectedEscalator.frequency ? FREQ_LABELS[selectedEscalator.frequency] : '—'}
              />
              <ReadOnlyRow label="Escalation Interval" value={selectedEscalator.interval} />
              <ReadOnlyRow
                label="Number of Escalations"
                value={selectedEscalator.numberOfEscalations ?? 'Until end of lease'}
              />
            </>
          )}
        </div>
      )}

      {/* ── PATH B: create new escalator ────────────────────────────────────── */}
      {escalatorMode === 'new' && (
        <div
          className="rounded-[var(--radius)] p-5 space-y-5"
          style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
        >
          <h4 style={{ color: 'var(--foreground)', marginBottom: 0 }}>New Lease Escalator</h4>

          {/* Name */}
          <div className="space-y-1">
            <label style={{ color: 'var(--foreground)' }}>
              Escalator Name <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="Enter escalator name"
              value={newEscalator.name}
              onChange={e => patchNew({ name: e.target.value })}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label style={{ color: 'var(--foreground)' }}>Escalator Type</label>
            <div className="flex gap-6">
              {(['one-time', 'recurring'] as const).map(t => (
                <label
                  key={t}
                  className="flex items-center gap-2 cursor-pointer"
                  style={{ color: 'var(--foreground)' }}
                >
                  <input
                    type="radio"
                    name="escalatorType"
                    value={t}
                    checked={newEscalator.type === t}
                    onChange={() => patchNew({ type: t })}
                    style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
                  />
                  {t === 'one-time' ? 'One Time' : 'Recurring'}
                </label>
              ))}
            </div>
          </div>

          {/* Recurring-only fields */}
          {newEscalator.type === 'recurring' && (
            <div className="space-y-4 pl-4" style={{ borderLeft: '2px solid var(--border)' }}>
              {/* Frequency */}
              <div className="space-y-1">
                <label style={{ color: 'var(--foreground)' }}>Escalation Frequency</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={newEscalator.frequency}
                    onChange={e => patchNew({ frequency: e.target.value as EscalationFrequency })}
                  >
                    <option value="">Select frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannual">Biannual</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <ChevronDown
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      width: 14, height: 14, color: 'var(--muted-foreground)', pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Interval */}
              <div className="space-y-1">
                <label style={{ color: 'var(--foreground)' }}>Escalation Interval</label>
                <input
                  type="number"
                  min="1"
                  className={inputCls}
                  placeholder="e.g. 1"
                  value={newEscalator.interval}
                  onChange={e => patchNew({ interval: e.target.value })}
                />
                <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', marginTop: 2 }}>
                  Number of periods between each escalation (e.g. 1 = every period)
                </p>
              </div>

              {/* # Escalations / Date Range — toggled */}
              <div className="space-y-2">
                {/* Switch header row */}
                <div className="flex items-center justify-between gap-2">
                  <label style={{ color: 'var(--foreground)', flexShrink: 0 }}>
                    {newEscalator.useEscalationDateRange ? 'Escalation Date Range' : 'Number of Escalations'}
                  </label>
                  <label
                    className="inline-flex items-center cursor-pointer gap-2"
                    title={newEscalator.useEscalationDateRange ? 'Switch to number of escalations' : 'Switch to date range'}
                  >
                    <span style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                      Use dates
                    </span>
                    <input
                      type="checkbox"
                      checked={newEscalator.useEscalationDateRange}
                      onChange={e => {
                        patchNew({ useEscalationDateRange: e.target.checked });
                        if (e.target.checked) {
                          patchNew({ numberOfEscalations: '' });
                        } else {
                          patchNew({ escalationRangeStartDate: '', escalationRangeEndDate: '' });
                        }
                      }}
                      className="sr-only"
                    />
                    <div
                      style={{
                        width: 36,
                        height: 20,
                        borderRadius: 999,
                        background: newEscalator.useEscalationDateRange ? 'var(--primary)' : 'var(--border)',
                        position: 'relative',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 2,
                          left: 2,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'var(--primary-foreground)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          transition: 'transform 0.2s',
                          transform: newEscalator.useEscalationDateRange ? 'translateX(16px)' : 'translateX(0)',
                        }}
                      />
                    </div>
                  </label>
                </div>

                {/* Conditional input(s) */}
                {newEscalator.useEscalationDateRange ? (
                  <div className="space-y-2">
                    <div>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', marginBottom: 4, marginTop: 0 }}>
                        Escalation Start Date
                      </p>
                      <DateInput
                        value={newEscalator.escalationRangeStartDate}
                        onChange={e => patchNew({ escalationRangeStartDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', marginBottom: 4, marginTop: 0 }}>
                        Escalation End Date
                      </p>
                      <DateInput
                        value={newEscalator.escalationRangeEndDate}
                        onChange={e => patchNew({ escalationRangeEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      min="1"
                      className={inputCls}
                      placeholder="Leave blank for entire lease term"
                      value={newEscalator.numberOfEscalations}
                      onChange={e => patchNew({ numberOfEscalations: e.target.value })}
                    />
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', marginTop: 4 }}>
                      Leave blank to apply until end of lease term
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consider LPT Ruleset */}
          <div
            className="flex items-start gap-3 p-3 rounded-[var(--radius)] cursor-pointer"
            style={{ background: 'color-mix(in srgb, var(--muted) 40%, transparent)', border: '1px solid var(--border)' }}
            onClick={() => patchNew({ considerLPTRuleset: !newEscalator.considerLPTRuleset })}
          >
            <input
              type="checkbox"
              checked={newEscalator.considerLPTRuleset}
              onChange={e => patchNew({ considerLPTRuleset: e.target.checked })}
              onClick={e => e.stopPropagation()}
              style={{ accentColor: 'var(--primary)', width: 15, height: 15, marginTop: 1, flexShrink: 0 }}
            />
            <div>
              <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                Consider LPT Escalation Ruleset
              </span>
              <div className="flex items-start gap-1 mt-1">
                <Info style={{ width: 12, height: 12, color: 'var(--muted-foreground)', marginTop: 1, flexShrink: 0 }} />
                <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
                  When checked, the min/max/% fields from the Lease Payment Term will be used to bound
                  the effective escalation on the Rules screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {escalatorMode === null && (
        <div
          className="rounded-[var(--radius)] p-6 text-center"
          style={{ border: '1px dashed var(--border)', background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}
        >
          <Search style={{ width: 24, height: 24, color: 'var(--muted-foreground)', margin: '0 auto 8px' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>
            Search for an escalator above, or click "+ New Lease Escalator" to create one.
          </p>
        </div>
      )}
    </div>
  );
}
