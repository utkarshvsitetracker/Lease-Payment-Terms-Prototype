import { useState, useMemo, useRef, useEffect } from 'react';
import { X, Info, Search, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import type { GeneratedPayment } from './LeasePaymentTerms';
import { DateInput } from './ui/DateInput';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiscountScope = 'all' | 'specific' | 'range';

export interface DiscountApplyData {
  discountPct: string;
  discountAmt: string;
  discountReason: string;
  scope: DiscountScope;
  startDate: string;
  endDate: string;
  inclusiveRange: boolean;
  selectedPaymentIds: string[];
}

interface DiscountModalProps {
  payments: GeneratedPayment[];
  onClose: () => void;
  onApply: (data: DiscountApplyData) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT   = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";
const FONT_T = "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

const DISCOUNT_REASONS = [
  'Free Rent Periods',
  'Early Payment Discount',
  'Tenant Improvement Allowance',
  'Lease Renewal Incentive',
  'Promotional Discount',
  'Hardship Concession',
  'Other',
];

const MAX_SELECTION = 200;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(str: string): Date | null {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function fmtAmt(raw: string) {
  const n = parseFloat(raw.replace(/[$,]/g, ''));
  return isNaN(n) ? raw : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── InfoTooltip ─────────────────────────────────────────────────────────────

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <Info
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ width: 13, height: 13, color: 'var(--muted-foreground)', cursor: 'default', marginLeft: 4 }}
      />
      {show && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 6,
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 9px',
            fontSize: 'var(--text-label)',
            fontFamily: FONT,
            whiteSpace: 'nowrap',
            zIndex: 100,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

interface Step1Props {
  discountPct: string;
  discountAmt: string;
  discountReason: string;
  scope: DiscountScope;
  startDate: string;
  endDate: string;
  inclusiveRange: boolean;
  onChange: (partial: Partial<DiscountApplyData>) => void;
}

function Step1({
  discountPct, discountAmt, discountReason,
  scope, startDate, endDate, inclusiveRange,
  onChange,
}: Step1Props) {
  const inputBox = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    background: 'var(--input-background)',
    color: 'var(--foreground)',
    fontSize: 'var(--text-base)',
    fontFamily: FONT,
    outline: 'none',
  } as React.CSSProperties;

  const radioRow = (value: DiscountScope, label: string) => (
    <label
      key={value}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        8,
        cursor:     'pointer',
        padding:    '4px 0',
      }}
    >
      <input
        type="radio"
        name="discount-scope"
        checked={scope === value}
        onChange={() => onChange({ scope: value })}
        style={{ accentColor: 'var(--primary)', width: 15, height: 15, flexShrink: 0 }}
      />
      <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>
        {label}
      </span>
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Subtitle */}
      <p style={{ margin: 0, color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT_T }}>
        Please enter the discount details:
      </p>

      {/* Discount Pct OR Discount Amount */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        {/* Pct */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ color: 'var(--foreground)', fontSize: 'var(--text-label)', fontFamily: FONT_T, display: 'flex', alignItems: 'center' }}>
            Discount Percentage (%)
            <InfoTip text="Enter a percentage to reduce each payment proportionally." />
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={discountPct}
            placeholder="0.00"
            onChange={e => {
              const v = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
              onChange({ discountPct: v, discountAmt: v ? '' : discountAmt });
            }}
            style={inputBox}
            disabled={!!discountAmt}
          />
        </div>

        {/* OR divider */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          paddingBottom:  2,
          flexShrink:     0,
        }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>
            OR
          </span>
        </div>

        {/* Amount */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ color: 'var(--foreground)', fontSize: 'var(--text-label)', fontFamily: FONT_T, display: 'flex', alignItems: 'center' }}>
            Discount Amount (USD)
            <InfoTip text="Enter a flat dollar amount to subtract from each selected payment." />
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={discountAmt}
            placeholder="0.00"
            onChange={e => {
              const v = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
              onChange({ discountAmt: v, discountPct: v ? '' : discountPct });
            }}
            style={inputBox}
            disabled={!!discountPct}
          />
        </div>
      </div>

      {/* Discount Reason */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ color: 'var(--foreground)', fontSize: 'var(--text-label)', fontFamily: FONT_T }}>
          Discount Reason
        </label>
        <div style={{ position: 'relative' }}>
          <select
            value={discountReason}
            onChange={e => onChange({ discountReason: e.target.value })}
            style={{
              ...inputBox,
              appearance: 'none',
              paddingRight: 36,
              cursor: 'pointer',
            }}
          >
            <option value="">Select a reason…</option>
            {DISCOUNT_REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 14, height: 14, color: 'var(--muted-foreground)', pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* Scope selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ color: 'var(--foreground)', fontSize: 'var(--text-label)', fontFamily: FONT_T }}>
          <span style={{ color: 'var(--destructive)' }}>* </span>
          Select payment(s) to apply the discount:
        </label>
        {radioRow('all',      'Apply discount to all payments')}
        {radioRow('specific', 'Apply discount to specific payments')}
        {radioRow('range',    'Apply discount to payments with range')}
      </div>

      {/* Date range inputs (only for "range") */}
      {scope === 'range' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: 'var(--foreground)', fontSize: 'var(--text-label)', fontFamily: FONT_T }}>
                <span style={{ color: 'var(--destructive)' }}>* </span>Start Date
              </label>
              <DateInput
                value={startDate}
                onChange={e => onChange({ startDate: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: 'var(--foreground)', fontSize: 'var(--text-label)', fontFamily: FONT_T }}>
                <span style={{ color: 'var(--destructive)' }}>* </span>End Date
              </label>
              <DateInput
                value={endDate}
                onChange={e => onChange({ endDate: e.target.value })}
              />
            </div>
          </div>
          <label
            style={{
              display:    'flex',
              alignItems: 'flex-start',
              gap:        8,
              cursor:     'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={inclusiveRange}
              onChange={e => onChange({ inclusiveRange: e.target.checked })}
              style={{ accentColor: 'var(--primary)', width: 14, height: 14, marginTop: 2, flexShrink: 0 }}
            />
            <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>
              Select all payments within the specified date range, inclusive of both start and end dates.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

type SortField2 = 'payment' | 'paymentDueDate' | 'amount' | 'status';
type SortDir2   = 'asc' | 'desc';

interface Step2Props {
  payments: GeneratedPayment[];
  scope: DiscountScope;
  startDate: string;
  endDate: string;
  inclusiveRange: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

function Step2({
  payments,
  scope,
  startDate,
  endDate,
  inclusiveRange,
  selectedIds,
  onSelectionChange,
}: Step2Props) {
  const [search,    setSearch]    = useState('');
  const [sortField, setSortField] = useState<SortField2>('paymentDueDate');
  const [sortDir,   setSortDir]   = useState<SortDir2>('asc');

  // Filter by date range if scope is 'range'
  const rangeFiltered = useMemo(() => {
    if (scope !== 'range' || (!startDate && !endDate)) return payments;
    const start = parseDate(startDate);
    const end   = parseDate(endDate);
    return payments.filter(p => {
      const d = parseDate(p.paymentDueDate);
      if (!d) return false;
      if (start && end) {
        return inclusiveRange
          ? d >= start && d <= end
          : d > start && d < end;
      }
      if (start) return inclusiveRange ? d >= start : d > start;
      if (end)   return inclusiveRange ? d <= end   : d < end;
      return true;
    });
  }, [payments, scope, startDate, endDate, inclusiveRange]);

  // Search filter
  const searchFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rangeFiltered;
    return rangeFiltered.filter(p =>
      p.payment.toLowerCase().includes(q) ||
      p.paymentDueDate.toLowerCase().includes(q) ||
      p.amount.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  }, [rangeFiltered, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...searchFiltered].sort((a, b) => {
      let av: any = a[sortField === 'amount' ? 'amount' : sortField];
      let bv: any = b[sortField === 'amount' ? 'amount' : sortField];
      if (sortField === 'paymentDueDate') {
        av = parseDate(av)?.getTime() ?? 0;
        bv = parseDate(bv)?.getTime() ?? 0;
      }
      if (sortField === 'amount') {
        av = parseFloat(String(av).replace(/[$,]/g, '')) || 0;
        bv = parseFloat(String(bv).replace(/[$,]/g, '')) || 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [searchFiltered, sortField, sortDir]);

  const toggleSort = (f: SortField2) => {
    if (f === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
  };

  const allVisibleIds = sorted.map(p => p.id);
  const allSelected   = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));
  const someSelected  = allVisibleIds.some(id => selectedIds.includes(id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(selectedIds.filter(id => !allVisibleIds.includes(id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...allVisibleIds])).slice(0, MAX_SELECTION);
      onSelectionChange(newIds);
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < MAX_SELECTION) {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const sortIcon = (f: SortField2) => {
    if (f !== sortField) return <ArrowUpDown style={{ width: 11, height: 11, opacity: 0.4 }} />;
    return sortDir === 'asc'
      ? <ChevronUp   style={{ width: 11, height: 11, color: 'var(--primary)' }} />
      : <ChevronDown style={{ width: 11, height: 11, color: 'var(--primary)' }} />;
  };

  const TH: React.CSSProperties = {
    textAlign:      'left',
    padding:        '8px 12px',
    color:          'var(--foreground)',
    fontSize:       'var(--text-label)',
    fontFamily:     FONT_T,
    fontWeight:     'var(--font-weight-medium)',
    borderBottom:   '1px solid var(--border)',
    background:     'color-mix(in srgb, var(--muted) 60%, transparent)',
    whiteSpace:     'nowrap',
    userSelect:     'none',
  };

  const TD: React.CSSProperties = {
    padding:   '9px 12px',
    color:     'var(--foreground)',
    fontSize:  'var(--text-base)',
    fontFamily: FONT,
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>

      {/* Subtitle */}
      <p style={{ margin: 0, color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT_T }}>
        Please select payments to apply discount:
      </p>

      {/* Counter + Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', fontFamily: FONT, flexShrink: 0 }}>
          {rangeFiltered.length} of {payments.length} items
          {selectedIds.length > 0 && ` · ${selectedIds.length} item${selectedIds.length !== 1 ? 's' : ''} selected`}
        </span>
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          7,
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          background:   'var(--input-background)',
          padding:      '7px 10px',
          flex:         '0 1 220px',
        }}>
          <Search style={{ width: 13, height: 13, color: 'var(--muted-foreground)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search this list..."
            style={{
              flex:       1,
              background: 'transparent',
              border:     'none',
              outline:    'none',
              color:      'var(--foreground)',
              fontSize:   'var(--text-label)',
              fontFamily: FONT,
              minWidth:   0,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow:     'hidden',
        flex:         1,
      }}>
        <div style={{ overflowY: 'auto', maxHeight: 320 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr>
                {/* Select-all checkbox */}
                <th style={{ ...TH, width: 40, paddingRight: 4 }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    style={{ accentColor: 'var(--primary)', width: 14, height: 14, cursor: 'pointer' }}
                  />
                </th>
                {/* Payment ID */}
                <th
                  style={{ ...TH, cursor: 'pointer' }}
                  onClick={() => toggleSort('payment')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Payment ID {sortIcon('payment')}
                  </span>
                </th>
                {/* Payment Date */}
                <th
                  style={{ ...TH, cursor: 'pointer' }}
                  onClick={() => toggleSort('paymentDueDate')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Payment Date {sortIcon('paymentDueDate')}
                  </span>
                </th>
                {/* Original Amount */}
                <th
                  style={{ ...TH, cursor: 'pointer' }}
                  onClick={() => toggleSort('amount')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Original Amount {sortIcon('amount')}
                  </span>
                </th>
                {/* Status */}
                <th
                  style={{ ...TH, cursor: 'pointer' }}
                  onClick={() => toggleSort('status')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Payment Status {sortIcon('status')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...TD, textAlign: 'center', color: 'var(--muted-foreground)', padding: '24px 12px' }}>
                    No payments match the selected criteria.
                  </td>
                </tr>
              ) : (
                sorted.map((p, i) => {
                  const isChecked = selectedIds.includes(p.id);
                  const isDisabled = !isChecked && selectedIds.length >= MAX_SELECTION;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        background: isChecked
                          ? 'color-mix(in srgb, var(--primary) 6%, transparent)'
                          : i % 2 === 0 ? 'var(--card)' : 'color-mix(in srgb, var(--muted) 20%, transparent)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.5 : 1,
                        transition: 'background 0.1s',
                      }}
                      onClick={() => !isDisabled && toggleOne(p.id)}
                    >
                      <td style={{ ...TD, paddingRight: 4, width: 40 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && toggleOne(p.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ accentColor: 'var(--primary)', width: 14, height: 14, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                        />
                      </td>
                      <td style={{ ...TD, color: isChecked ? 'var(--primary)' : 'var(--foreground)' }}>
                        {p.payment}
                      </td>
                      <td style={TD}>{p.paymentDueDate}</td>
                      <td style={TD}>{fmtAmt(p.baseAmount || p.amount)}</td>
                      <td style={TD}>
                        <span style={{
                          display:      'inline-flex',
                          alignItems:   'center',
                          padding:      '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize:     'var(--text-label)',
                          fontFamily:   FONT,
                          background:   'color-mix(in srgb, var(--chart-4) 12%, transparent)',
                          border:       '1px solid color-mix(in srgb, var(--chart-4) 30%, transparent)',
                          color:        'var(--foreground)',
                          whiteSpace:   'nowrap',
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <p style={{
        margin:     0,
        color:      'var(--muted-foreground)',
        fontSize:   'var(--text-label)',
        fontFamily: FONT,
      }}>
        <strong style={{ color: 'var(--foreground)' }}>Note:</strong>{' '}
        You can apply discount to a maximum of {MAX_SELECTION} payments at a time.
        {selectedIds.length >= MAX_SELECTION && (
          <span style={{ color: 'var(--destructive)', marginLeft: 6 }}>
            Maximum selection reached.
          </span>
        )}
      </p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function DiscountModal({ payments, onClose, onApply }: DiscountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<DiscountApplyData>({
    discountPct:       '',
    discountAmt:       '',
    discountReason:    '',
    scope:             'all',
    startDate:         '',
    endDate:           '',
    inclusiveRange:    false,
    selectedPaymentIds: [],
  });

  const updateForm = (partial: Partial<DiscountApplyData>) =>
    setForm(prev => ({ ...prev, ...partial }));

  // ── Validation: Step 1 can proceed ───────────────────────────────────────
  const step1Valid = useMemo(() => {
    const hasDiscount = !!(form.discountPct || form.discountAmt);
    const hasScope    = !!form.scope;
    if (!hasDiscount || !hasScope) return false;
    if (form.scope === 'range') {
      return !!(form.startDate && form.endDate);
    }
    return true;
  }, [form]);

  // ── Advance step ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 1) {
      if (form.scope === 'all') {
        // Select all payments and apply immediately
        onApply({ ...form, selectedPaymentIds: payments.map(p => p.id) });
      } else {
        setStep(2);
      }
    } else {
      if (form.selectedPaymentIds.length > 0) {
        onApply(form);
      }
    }
  };

  // Close on backdrop click
  const backdropRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    return () => prev?.focus();
  }, []);

  const canAdvanceStep2 = form.selectedPaymentIds.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={e => { if (e.target === backdropRef.current) onClose(); }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        {/* Modal */}
        <div
          style={{
            background:   'var(--card)',
            borderRadius: 'var(--radius)',
            width:        '100%',
            maxWidth:     step === 1 ? 560 : 720,
            maxHeight:    '90vh',
            display:      'flex',
            flexDirection: 'column',
            boxShadow:    '0 8px 40px rgba(0,0,0,0.22)',
            overflow:     'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '20px 24px',
            borderBottom:   '1px solid var(--border)',
            flexShrink:     0,
          }}>
            <h2 style={{
              margin:     0,
              color:      'var(--foreground)',
              fontFamily: FONT_T,
              fontSize:   'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
            }}>
              Apply Discount
            </h2>
            <button
              onClick={onClose}
              style={{
                background:   'transparent',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor:       'pointer',
                padding:      4,
                color:        'var(--muted-foreground)',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                transition:   'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Divider rule */}
          <div style={{ height: 1, background: 'var(--border)', flexShrink: 0 }} />

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>
            {step === 1 ? (
              <Step1
                discountPct={form.discountPct}
                discountAmt={form.discountAmt}
                discountReason={form.discountReason}
                scope={form.scope}
                startDate={form.startDate}
                endDate={form.endDate}
                inclusiveRange={form.inclusiveRange}
                onChange={updateForm}
              />
            ) : (
              <Step2
                payments={payments}
                scope={form.scope}
                startDate={form.startDate}
                endDate={form.endDate}
                inclusiveRange={form.inclusiveRange}
                selectedIds={form.selectedPaymentIds}
                onSelectionChange={ids => updateForm({ selectedPaymentIds: ids })}
              />
            )}
          </div>

          {/* Footer */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: step === 2 ? 'space-between' : 'flex-end',
            padding:        '16px 24px',
            borderTop:      '1px solid var(--border)',
            background:     'color-mix(in srgb, var(--muted) 30%, transparent)',
            flexShrink:     0,
            marginTop:      16,
          }}>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                style={{
                  padding:      '9px 20px',
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background:   'var(--card)',
                  color:        'var(--foreground)',
                  cursor:       'pointer',
                  fontSize:     'var(--text-base)',
                  fontFamily:   FONT,
                  transition:   'background 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--card)')}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={step === 1 ? !step1Valid : !canAdvanceStep2}
              style={{
                padding:      '9px 24px',
                border:       'none',
                borderRadius: 'var(--radius)',
                background:   'var(--primary)',
                color:        'var(--primary-foreground)',
                cursor:       (step === 1 ? !step1Valid : !canAdvanceStep2) ? 'not-allowed' : 'pointer',
                fontSize:     'var(--text-base)',
                fontFamily:   FONT_T,
                fontWeight:   'var(--font-weight-medium)',
                opacity:      (step === 1 ? !step1Valid : !canAdvanceStep2) ? 0.5 : 1,
                transition:   'opacity 0.15s',
              }}
              onMouseEnter={e => {
                if (step === 1 ? step1Valid : canAdvanceStep2)
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
              }}
              onMouseLeave={e => {
                if (step === 1 ? step1Valid : canAdvanceStep2)
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
