import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, ChevronRight, ChevronDown, Pencil, GitBranch,
  Filter, X, ArrowUpDown, ArrowUp, ArrowDown,
  AlertTriangle, CheckCircle2, Clock, AlertCircle,
  CreditCard, Minus, List, Layers, TrendingUp,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'Scheduled' | 'Pending' | 'Paid'
  | 'Overdue' | 'Partial' | 'Cancelled' | 'Disputed';

export interface ChildPayment {
  id: string;
  description: string;
  amount: string;
  date: string;
  type: 'overpayment' | 'underpayment' | 'adjustment' | 'ad-hoc' | 'revenue-share';
  notes: string;
}

export interface LedgerPayment {
  id: string;
  payment: string;
  stageName: string;
  escalatorsApplied: string;
  baseAmount: string;
  escalationRate: string;
  amount: string;
  discount: string;
  paymentDueDate: string;
  status: PaymentStatus;
  actualPaymentDate: string;
  actualAmountPaid: string;
  notes: string;
  childPayments: ChildPayment[];
  isAdhoc: boolean;
  escalationImpacted: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)',
];

const STATUS_META: Record<PaymentStatus, { bg: string; color: string; border: string; dot: string }> = {
  Scheduled: {
    bg: 'color-mix(in srgb, var(--chart-2) 14%, transparent)',
    color: 'color-mix(in srgb, var(--chart-2) 75%, var(--foreground))',
    border: 'color-mix(in srgb, var(--chart-2) 30%, transparent)',
    dot: 'var(--chart-2)',
  },
  Pending: {
    bg: 'color-mix(in srgb, var(--chart-4) 14%, transparent)',
    color: 'var(--foreground)',
    border: 'color-mix(in srgb, var(--chart-4) 32%, transparent)',
    dot: 'var(--chart-4)',
  },
  Paid: {
    bg: 'color-mix(in srgb, var(--chart-3) 14%, transparent)',
    color: 'var(--chart-3)',
    border: 'color-mix(in srgb, var(--chart-3) 32%, transparent)',
    dot: 'var(--chart-3)',
  },
  Overdue: {
    bg: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
    color: 'var(--destructive)',
    border: 'color-mix(in srgb, var(--destructive) 28%, transparent)',
    dot: 'var(--destructive)',
  },
  Partial: {
    bg: 'color-mix(in srgb, var(--chart-4) 18%, transparent)',
    color: 'var(--foreground)',
    border: 'color-mix(in srgb, var(--chart-4) 42%, transparent)',
    dot: 'var(--chart-4)',
  },
  Cancelled: {
    bg: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
    color: 'var(--muted-foreground)',
    border: 'color-mix(in srgb, var(--muted-foreground) 18%, transparent)',
    dot: 'var(--muted-foreground)',
  },
  Disputed: {
    bg: 'color-mix(in srgb, var(--primary) 10%, transparent)',
    color: 'var(--primary)',
    border: 'color-mix(in srgb, var(--primary) 22%, transparent)',
    dot: 'var(--primary)',
  },
};

const ALL_STATUSES: PaymentStatus[] = [
  'Scheduled', 'Pending', 'Paid', 'Overdue', 'Partial', 'Cancelled', 'Disputed',
];

const CHILD_TYPE_META: Record<ChildPayment['type'], { label: string; color: string }> = {
  overpayment:     { label: 'Overpayment',   color: 'var(--chart-4)' },
  underpayment:    { label: 'Underpayment',  color: 'var(--destructive)' },
  adjustment:      { label: 'Adjustment',    color: 'var(--muted-foreground)' },
  'ad-hoc':        { label: 'Ad-hoc',        color: 'var(--primary)' },
  'revenue-share': { label: 'Revenue Share', color: 'var(--chart-3)' },
};

const FONT       = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";
const FONT_LABEL = "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Shared style constants ───────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', height: 32, padding: '0 8px',
  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  background: 'var(--input-background)', color: 'var(--foreground)',
  fontSize: 'var(--text-base)', fontFamily: FONT, boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
const textareaStyle: React.CSSProperties = {
  width: '100%', padding: 8,
  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  background: 'var(--input-background)', color: 'var(--foreground)',
  fontSize: 'var(--text-base)', fontFamily: FONT,
  resize: 'vertical', boxSizing: 'border-box',
};
const TH: React.CSSProperties = {
  textAlign: 'left', padding: '7px 8px',
  fontSize: 'var(--text-label)', fontFamily: FONT_LABEL,
  color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)',
  whiteSpace: 'nowrap', userSelect: 'none',
};
const TD: React.CSSProperties = {
  padding: '6px 8px', fontSize: 'var(--text-label)',
  fontFamily: FONT_LABEL, whiteSpace: 'nowrap',
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status, onClick }: { status: PaymentStatus; onClick?: () => void }) {
  const m = STATUS_META[status];
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '2px 8px', borderRadius: 'var(--radius)',
        fontSize: 'var(--text-label)',
        background: m.bg, color: m.color, border: `1px solid ${m.border}`,
        fontFamily: FONT_LABEL, whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function calcVariance(scheduled: string, actual: string): { label: string; color: string } {
  const s = parseFloat(scheduled.replace(/[$,]/g, '')) || 0;
  const a = parseFloat(actual.replace(/[$,]/g, '')) || 0;
  if (!actual) return { label: '—', color: 'var(--muted-foreground)' };
  const d = a - s;
  if (Math.abs(d) < 0.005) return { label: '$0.00', color: 'var(--chart-3)' };
  if (d > 0) return { label: `+$${d.toFixed(2)}`, color: 'var(--chart-4)' };
  return { label: `-$${Math.abs(d).toFixed(2)}`, color: 'var(--destructive)' };
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 5, fontSize: 'var(--text-label)', color: 'var(--foreground)', fontFamily: FONT_LABEL }}>
      {children}
    </label>
  );
}

// ─── DatePickerInput — matches inputStyle, opens picker on click ──────────────

function DatePickerInput({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const openPicker = () => { try { ref.current?.showPicker(); } catch { ref.current?.focus(); } };
  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={onChange}
        onClick={openPicker}
        style={{ ...inputStyle, paddingRight: 28, cursor: 'pointer' }}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={openPicker}
        style={{
          position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', color: 'var(--muted-foreground)',
        }}
        aria-label="Open date picker"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
    </div>
  );
}

// ─── Side panel shell ─────────────────────────────────────────────────────────

function SidePanel({ title, subtitle, children, onClose, footer }: {
  title: string; subtitle: string; children: React.ReactNode;
  onClose: () => void; footer: React.ReactNode;
}) {
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', background: 'var(--card)', borderLeft: '1px solid var(--border)', boxShadow: '-4px 0 20px rgba(0,0,0,0.13)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL, marginBottom: 3 }}>{subtitle}</p>
          <h3 style={{ color: 'var(--foreground)', margin: 0 }}>{title}</h3>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 4, marginTop: -2 }}>
          <X style={{ width: 18, height: 18 }} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>{children}</div>
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>{footer}</div>
    </div>
  );
}

function BtnPrimary({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '6px 16px', border: 'none', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'var(--primary-foreground)', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 'var(--text-base)', fontFamily: FONT, opacity: disabled ? 0.5 : 1 }}>{children}</button>
  );
}

function BtnSecondary({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer', fontSize: 'var(--text-base)', fontFamily: FONT }}>{children}</button>
  );
}

// ─── Edit Payment Panel ───────────────────────────────────────────────────────

function EditPaymentPanel({ payment, onSave, onClose }: { payment: LedgerPayment; onSave: (p: LedgerPayment) => void; onClose: () => void }) {
  const [f, setF] = useState({ status: payment.status, amount: payment.amount, paymentDueDate: payment.paymentDueDate, actualAmountPaid: payment.actualAmountPaid, actualPaymentDate: payment.actualPaymentDate, notes: payment.notes });
  return (
    <SidePanel title={payment.payment} subtitle="Edit Payment" onClose={onClose} footer={<><BtnSecondary onClick={onClose}>Cancel</BtnSecondary><BtnPrimary onClick={() => onSave({ ...payment, ...f })}>Save Changes</BtnPrimary></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><FieldLabel>Status</FieldLabel><select value={f.status} onChange={e => setF({ ...f, status: e.target.value as PaymentStatus })} style={selectStyle}>{ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><FieldLabel>Scheduled Amount</FieldLabel><input value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} placeholder="$0.00" style={inputStyle} /></div>
        <div><FieldLabel>Payment Due Date</FieldLabel><DatePickerInput value={f.paymentDueDate} onChange={e => setF({ ...f, paymentDueDate: e.target.value })} /></div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <p style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL, marginBottom: 12 }}>Actual Payment</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><FieldLabel>Amount Paid</FieldLabel><input value={f.actualAmountPaid} onChange={e => setF({ ...f, actualAmountPaid: e.target.value })} placeholder="$0.00" style={inputStyle} /></div>
            <div><FieldLabel>Payment Date (Actual)</FieldLabel><DatePickerInput value={f.actualPaymentDate} onChange={e => setF({ ...f, actualPaymentDate: e.target.value })} /></div>
          </div>
        </div>
        <div><FieldLabel>Notes</FieldLabel><textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={3} placeholder="Add notes…" style={textareaStyle} /></div>
      </div>
    </SidePanel>
  );
}

// ─── Add Child / Amendment Panel ──────────────────────────────────────────────

function AddChildPanel({ payment, onSave, onClose }: { payment: LedgerPayment; onSave: (c: ChildPayment) => void; onClose: () => void }) {
  const [f, setF] = useState({ description: '', amount: '', date: '', type: 'adjustment' as ChildPayment['type'], notes: '' });
  const showEscalWarn = !!payment.escalatorsApplied && (f.type === 'overpayment' || f.type === 'underpayment');
  const valid = !!(f.description && f.amount && f.date);
  return (
    <SidePanel title={payment.payment} subtitle="Add Amendment" onClose={onClose} footer={<><BtnSecondary onClick={onClose}>Cancel</BtnSecondary><BtnPrimary disabled={!valid} onClick={() => { if (valid) onSave({ id: `child-${Date.now()}`, ...f }); }}>Add Amendment</BtnPrimary></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {showEscalWarn && (
          <div style={{ padding: '10px 12px', background: 'color-mix(in srgb, var(--chart-4) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--chart-4) 30%, transparent)', borderRadius: 'var(--radius)', display: 'flex', gap: 8 }}>
            <AlertTriangle style={{ width: 14, height: 14, color: 'var(--chart-4)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 'var(--text-label)', color: 'var(--foreground)', fontFamily: FONT_LABEL, margin: 0 }}>This amendment on an escalated recurring payment may affect future payment calculations in this stage.</p>
          </div>
        )}
        <div><FieldLabel>Amendment Type</FieldLabel>
          <select value={f.type} onChange={e => setF({ ...f, type: e.target.value as ChildPayment['type'] })} style={selectStyle}>
            <option value="overpayment">Overpayment — paid more than required</option>
            <option value="underpayment">Underpayment — paid less than required</option>
            <option value="adjustment">Adjustment — general correction</option>
            <option value="ad-hoc">Ad-hoc — unscheduled addition</option>
          </select>
        </div>
        <div><FieldLabel>Description *</FieldLabel><input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Brief description…" style={inputStyle} /></div>
        <div>
          <FieldLabel>Amount *</FieldLabel>
          <input value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} placeholder="$0.00" style={inputStyle} />
          <p style={{ marginTop: 4, fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL }}>Scheduled: {payment.amount}</p>
        </div>
        <div><FieldLabel>Date *</FieldLabel><DatePickerInput value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></div>
        <div><FieldLabel>Notes</FieldLabel><textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={3} placeholder="Reason for amendment…" style={textareaStyle} /></div>
      </div>
    </SidePanel>
  );
}

// ─── Add Ad-hoc Payment Panel ─────────────────────────────────────────────────

function AddAdhocPanel({ stages, onSave, onClose }: { stages: string[]; onSave: (p: LedgerPayment) => void; onClose: () => void }) {
  const [f, setF] = useState({ payment: '', stageName: '', amount: '', paymentDueDate: '', status: 'Scheduled' as PaymentStatus, actualAmountPaid: '', actualPaymentDate: '', notes: '' });
  const valid = !!(f.payment && f.amount && f.paymentDueDate);
  return (
    <SidePanel title="Add Ad-hoc Payment" subtitle="New Payment" onClose={onClose} footer={<><BtnSecondary onClick={onClose}>Cancel</BtnSecondary><BtnPrimary disabled={!valid} onClick={() => { if (valid) onSave({ id: `adhoc-${Date.now()}`, payment: f.payment, stageName: f.stageName, escalatorsApplied: '', baseAmount: f.amount, escalationRate: '', amount: f.amount, discount: '$0.00', paymentDueDate: f.paymentDueDate, status: f.status, actualPaymentDate: f.actualPaymentDate, actualAmountPaid: f.actualAmountPaid, notes: f.notes, childPayments: [], isAdhoc: true, escalationImpacted: false }); }}>Add Payment</BtnPrimary></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><FieldLabel>Payment Name *</FieldLabel><input value={f.payment} onChange={e => setF({ ...f, payment: e.target.value })} placeholder="e.g. Security Deposit" style={inputStyle} /></div>
        <div><FieldLabel>Stage (Optional)</FieldLabel><select value={f.stageName} onChange={e => setF({ ...f, stageName: e.target.value })} style={selectStyle}><option value="">— No Stage —</option>{stages.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><FieldLabel>Amount *</FieldLabel><input value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} placeholder="$0.00" style={inputStyle} /></div>
        <div><FieldLabel>Due Date *</FieldLabel><DatePickerInput value={f.paymentDueDate} onChange={e => setF({ ...f, paymentDueDate: e.target.value })} /></div>
        <div><FieldLabel>Status</FieldLabel><select value={f.status} onChange={e => setF({ ...f, status: e.target.value as PaymentStatus })} style={selectStyle}>{ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <p style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL, marginBottom: 12 }}>If already paid</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><FieldLabel>Amount Paid</FieldLabel><input value={f.actualAmountPaid} onChange={e => setF({ ...f, actualAmountPaid: e.target.value })} placeholder="$0.00" style={inputStyle} /></div>
            <div><FieldLabel>Payment Date</FieldLabel><DatePickerInput value={f.actualPaymentDate} onChange={e => setF({ ...f, actualPaymentDate: e.target.value })} /></div>
          </div>
        </div>
        <div><FieldLabel>Notes</FieldLabel><textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={3} placeholder="Additional notes…" style={textareaStyle} /></div>
      </div>
    </SidePanel>
  );
}

// ─── Payment Row (shared across both views) ───────────────────────────────────

interface PaymentRowProps {
  payment: LedgerPayment;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  inlineStatusId: string | null;
  onStatusClick: () => void;
  onStatusChange: (s: PaymentStatus) => void;
  onEdit: () => void;
  onAddChild: () => void;
  showStageCol?: boolean;
  rowBg: string;
}

function PaymentRow({ payment, index, isExpanded, onToggleExpand, inlineStatusId, onStatusClick, onStatusChange, onEdit, onAddChild, showStageCol = true, rowBg }: PaymentRowProps) {
  const hasChildren = payment.childPayments.length > 0;
  const rsChildren    = payment.childPayments.filter(c => c.type === 'revenue-share');
  const amendChildren = payment.childPayments.filter(c => c.type !== 'revenue-share');
  const vr = calcVariance(payment.amount, payment.actualAmountPaid);
  const isOverdue = payment.status === 'Overdue';

  return (
    <tbody>
      <tr style={{ background: rowBg, borderBottom: isExpanded && hasChildren ? 'none' : '1px solid var(--border)' }}>
        {/* Expand */}
        <td style={{ ...TD, width: 28, padding: '5px 4px 5px 10px' }}>
          {hasChildren
            ? <button onClick={onToggleExpand} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                {isExpanded ? <ChevronDown style={{ width: 13, height: 13 }} /> : <ChevronRight style={{ width: 13, height: 13 }} />}
              </button>
            : <span style={{ width: 17, display: 'inline-block' }} />}
        </td>

        {/* # */}
        <td style={{ ...TD, color: 'var(--muted-foreground)', width: 28 }}>{index + 1}</td>

        {/* Name */}
        <td style={{ ...TD, color: 'var(--foreground)', maxWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span>{payment.payment}</span>
            {payment.isAdhoc && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 18%, transparent)', fontFamily: FONT_LABEL }}>Ad-hoc</span>}
            {payment.escalationImpacted && <AlertTriangle style={{ width: 11, height: 11, color: 'var(--chart-4)', flexShrink: 0 }} title="Escalation may be impacted" />}
            {rsChildren.length > 0 && (
              <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--chart-3) 12%, transparent)', color: 'var(--chart-3)', border: '1px solid color-mix(in srgb, var(--chart-3) 22%, transparent)', fontFamily: FONT_LABEL, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <TrendingUp style={{ width: 8, height: 8 }} /> Rev. Share
              </span>
            )}
            {amendChildren.length > 0 && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL }}>{amendChildren.length} amend.</span>}
          </div>
          {payment.notes && <p style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 1, fontFamily: FONT_LABEL, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{payment.notes}</p>}
        </td>

        {/* Stage (list view only) */}
        {showStageCol && <td style={{ ...TD, color: 'var(--muted-foreground)' }}>{payment.stageName || '—'}</td>}

        {/* Scheduled */}
        <td style={{ ...TD, color: 'var(--foreground)' }}>{payment.amount}</td>

        {/* Escalation */}
        <td style={{ ...TD }}>
          {payment.escalationRate
            ? <span style={{ fontSize: 'var(--text-label)', padding: '1px 6px', borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--chart-3) 12%, transparent)', color: 'var(--chart-3)', border: '1px solid color-mix(in srgb, var(--chart-3) 25%, transparent)', fontFamily: FONT_LABEL }}>{payment.escalationRate}</span>
            : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
        </td>

        {/* Due Date */}
        <td style={{ ...TD, color: isOverdue ? 'var(--destructive)' : 'var(--foreground)', fontWeight: isOverdue ? 'var(--font-weight-medium)' : undefined }}>{payment.paymentDueDate}</td>

        {/* Paid Amount */}
        <td style={{ ...TD, color: payment.actualAmountPaid ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{payment.actualAmountPaid || '—'}</td>

        {/* Payment Date */}
        <td style={{ ...TD, color: payment.actualPaymentDate ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{payment.actualPaymentDate || '—'}</td>

        {/* Variance */}
        <td style={{ ...TD, color: vr.color, fontWeight: vr.label !== '—' && vr.label !== '$0.00' ? 'var(--font-weight-medium)' : undefined }}>{vr.label}</td>

        {/* Status — inline picker */}
        <td style={{ ...TD, position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <StatusBadge status={payment.status} onClick={onStatusClick} />
            {inlineStatusId === payment.id && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 3, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 30, minWidth: 140 }}>
                {ALL_STATUSES.map(s => (
                  <button key={s} onClick={() => onStatusChange(s)} style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '5px 8px', background: s === payment.status ? 'var(--muted)' : 'none', border: 'none', cursor: 'pointer' }}>
                    <StatusBadge status={s} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </td>

        {/* Actions */}
        <td style={{ ...TD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button title="Edit payment" onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted-foreground)', borderRadius: 'var(--radius-sm)', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}><Pencil style={{ width: 12, height: 12 }} /></button>
            <button title="Add amendment" onClick={onAddChild} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted-foreground)', borderRadius: 'var(--radius-sm)', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}><GitBranch style={{ width: 12, height: 12 }} /></button>
          </div>
        </td>
      </tr>

      {/* Child rows — revenue-share entries first, then amendments */}
      {isExpanded && hasChildren && payment.childPayments.map((child, ci) => {
        const meta    = CHILD_TYPE_META[child.type];
        const isRS    = child.type === 'revenue-share';
        const isLast  = ci === payment.childPayments.length - 1;
        return (
          <tr
            key={child.id}
            style={{
              background: isRS
                ? 'color-mix(in srgb, var(--chart-3) 6%, var(--card))'
                : 'color-mix(in srgb, var(--primary) 3%, var(--card))',
              borderBottom: isLast ? '2px solid var(--border)' : `1px solid color-mix(in srgb, var(--border) 50%, transparent)`,
            }}
          >
            <td style={{ ...TD, padding: '5px 4px 5px 10px', width: 28 }} />
            <td style={{ ...TD, color: 'var(--muted-foreground)' }} />
            <td style={{ ...TD, paddingLeft: 24 }} colSpan={showStageCol ? 2 : 1}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, borderLeft: `2px solid ${meta.color}`, paddingLeft: 8 }}>
                {isRS
                  ? <TrendingUp style={{ width: 9, height: 9, color: meta.color, flexShrink: 0 }} />
                  : <Minus style={{ width: 9, height: 9, color: 'var(--muted-foreground)', flexShrink: 0 }} />
                }
                <span style={{ color: 'var(--foreground)', fontFamily: FONT_LABEL, fontSize: 'var(--text-label)' }}>{child.description}</span>
                <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 'var(--radius-sm)', background: `color-mix(in srgb, ${meta.color} 10%, transparent)`, color: meta.color, border: `1px solid color-mix(in srgb, ${meta.color} 22%, transparent)`, fontFamily: FONT_LABEL, whiteSpace: 'nowrap' }}>
                  {meta.label}
                </span>
              </div>
              {child.notes && (
                <p style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2, paddingLeft: 17, fontFamily: FONT_LABEL, maxWidth: 340 }}>
                  {child.notes}
                </p>
              )}
            </td>
            <td style={{ ...TD, color: isRS ? meta.color : 'var(--foreground)', fontWeight: isRS ? 'var(--font-weight-medium)' : undefined }}>
              {child.amount}
            </td>
            <td />
            <td style={{ ...TD, color: 'var(--foreground)' }}>{child.date}</td>
            <td colSpan={5} />
          </tr>
        );
      })}
    </tbody>
  );
}

// ─── Table header row (reusable) ──────────────────────────────────────────────

type SortField = 'payment' | 'stageName' | 'amount' | 'paymentDueDate' | 'status';

function TableHead({
  showStageCol = true,
  sortField, sortDir,
  onSort,
}: {
  showStageCol?: boolean;
  sortField: SortField; sortDir: 'asc' | 'desc';
  onSort: (f: SortField) => void;
}) {
  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown style={{ width: 11, height: 11, color: 'var(--muted-foreground)', flexShrink: 0 }} />;
    return sortDir === 'asc'
      ? <ArrowUp   style={{ width: 11, height: 11, color: 'var(--primary)', flexShrink: 0 }} />
      : <ArrowDown style={{ width: 11, height: 11, color: 'var(--primary)', flexShrink: 0 }} />;
  }

  const cols: { label: string; field?: SortField }[] = [
    { label: '' },           // expand
    { label: '#' },
    { label: 'Payment',      field: 'payment' },
    ...(showStageCol ? [{ label: 'Stage', field: 'stageName' as SortField }] : []),
    { label: 'Scheduled',    field: 'amount' },
    { label: 'Escalation' },
    { label: 'Due Date',     field: 'paymentDueDate' },
    { label: 'Paid Amount' },
    { label: 'Payment Date' },
    { label: 'Variance' },
    { label: 'Status',       field: 'status' },
    { label: 'Actions' },
  ];

  return (
    <thead>
      <tr style={{ background: 'color-mix(in srgb, var(--muted) 55%, transparent)', borderBottom: '1px solid var(--border)' }}>
        {cols.map((col, i) => (
          <th key={i} onClick={col.field ? () => onSort(col.field!) : undefined}
            style={{ ...TH, cursor: col.field ? 'pointer' : 'default', width: i === 0 ? 28 : i === 1 ? 28 : undefined, padding: i === 0 ? '7px 4px 7px 10px' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {col.label}
              {col.field && <SortIcon field={col.field} />}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ─── Stage Group (stage-view specific) ───────────────────────────────────────

interface StageGroupProps {
  stageName: string;
  displayName: string;
  payments: LedgerPayment[];
  color: string;
  defaultOpen?: boolean;
  onEdit: (p: LedgerPayment) => void;
  onAddChild: (p: LedgerPayment) => void;
  onStatusChange: (id: string, s: PaymentStatus) => void;
  onAddAdhoc: () => void;
  globalInlineStatusId: string | null;
  setGlobalInlineStatusId: (id: string | null) => void;
}

function StageGroup({ stageName, displayName, payments, color, defaultOpen = true, onEdit, onAddChild, onStatusChange, onAddAdhoc, globalInlineStatusId, setGlobalInlineStatusId }: StageGroupProps) {
  const [collapsed, setCollapsed] = useState(!defaultOpen);
  // Auto-expand payments that have revenue-share children so they're visible immediately
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(payments.filter(p => p.childPayments.some(c => c.type === 'revenue-share')).map(p => p.id))
  );
  const [sortField, setSortField] = useState<SortField>('paymentDueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const stats = useMemo(() => {
    const total   = payments.length;
    const paid    = payments.filter(p => p.status === 'Paid').length;
    const overdue = payments.filter(p => p.status === 'Overdue').length;
    const partial = payments.filter(p => p.status === 'Partial').length;
    const pending = payments.filter(p => p.status === 'Pending' || p.status === 'Scheduled').length;
    const escalImpacted = payments.some(p => p.escalationImpacted);
    const scheduled = payments.reduce((s, p) => s + (parseFloat(p.amount.replace(/[$,]/g, '')) || 0), 0);
    const collected = payments.reduce((s, p) => s + (parseFloat(p.actualAmountPaid.replace(/[$,]/g, '')) || 0), 0);
    const pct = total > 0 ? (paid / total) * 100 : 0;
    const statusGroups: Partial<Record<PaymentStatus, number>> = {};
    for (const p of payments) statusGroups[p.status] = (statusGroups[p.status] || 0) + 1;
    return { total, paid, overdue, partial, pending, escalImpacted, scheduled, collected, pct, statusGroups };
  }, [payments]);

  const sorted = useMemo(() => {
    return [...payments].sort((a, b) => {
      let av: any = a[sortField], bv: any = b[sortField];
      if (sortField === 'paymentDueDate') { av = new Date(av || 0).getTime(); bv = new Date(bv || 0).getTime(); }
      if (sortField === 'amount') { av = parseFloat(String(av).replace(/[$,]/g, '')) || 0; bv = parseFloat(String(bv).replace(/[$,]/g, '')) || 0; }
      return (av < bv ? -1 : av > bv ? 1 : 0) * (sortDir === 'asc' ? 1 : -1);
    });
  }, [payments, sortField, sortDir]);

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Status breakdown chips
  const statusChips = (Object.entries(stats.statusGroups) as [PaymentStatus, number][])
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => ALL_STATUSES.indexOf(a) - ALL_STATUSES.indexOf(b));

  return (
    <div style={{ marginBottom: 10, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--card)' }}>

      {/* ── Stage header ── */}
      <div
        onClick={() => setCollapsed(v => !v)}
        style={{
          padding: '0 14px',
          borderLeft: `3px solid ${color}`,
          background: `color-mix(in srgb, ${color} 5%, var(--card))`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: collapsed ? 'none' : '1px solid var(--border)',
          minHeight: 44,
          flexWrap: 'wrap',
        }}
      >
        {/* Chevron */}
        <span style={{ color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {collapsed ? <ChevronRight style={{ width: 15, height: 15 }} /> : <ChevronDown style={{ width: 15, height: 15 }} />}
        </span>

        {/* Color dot + name */}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontFamily: FONT_LABEL, fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--foreground)', flexShrink: 0 }}>
          {displayName}
        </span>

        {/* Count badge */}
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 7px', borderRadius: 99, background: `color-mix(in srgb, ${color} 12%, transparent)`, color, fontSize: 10, fontFamily: FONT_LABEL, border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`, flexShrink: 0 }}>
          {stats.total}
        </span>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 72, height: 4, background: 'color-mix(in srgb, var(--muted-foreground) 20%, transparent)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${stats.pct}%`, height: '100%', background: stats.overdue > 0 ? 'var(--destructive)' : color, borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: FONT_LABEL, whiteSpace: 'nowrap' }}>{stats.paid}/{stats.total} paid</span>
        </div>

        {/* Money totals */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL }}>{fmt(stats.scheduled)}</span>
          <span style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL }}>sched</span>
          {stats.collected > 0 && <>
            <span style={{ color: 'var(--border)', fontFamily: FONT_LABEL }}>·</span>
            <span style={{ fontSize: 'var(--text-label)', color: 'var(--chart-3)', fontFamily: FONT_LABEL, fontWeight: 'var(--font-weight-medium)' }}>{fmt(stats.collected)}</span>
            <span style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL }}>collected</span>
          </>}
        </div>

        {/* Status chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {statusChips.map(([status, count]) => (
            <span key={status} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '1px 6px', borderRadius: 99, background: STATUS_META[status].bg, color: STATUS_META[status].color, border: `1px solid ${STATUS_META[status].border}`, fontFamily: FONT_LABEL, whiteSpace: 'nowrap' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: STATUS_META[status].dot }} />
              {count} {status}
            </span>
          ))}
        </div>

        {/* Warnings */}
        {stats.escalImpacted && (
          <span title="Escalation impact detected" style={{ flexShrink: 0 }}>
            <AlertTriangle style={{ width: 13, height: 13, color: 'var(--chart-4)' }} />
          </span>
        )}

        {/* Add ad-hoc within stage */}
        <button
          onClick={e => { e.stopPropagation(); onAddAdhoc(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, padding: '0 9px', background: 'none', border: `1px solid color-mix(in srgb, ${color} 30%, var(--border))`, borderRadius: 'var(--radius)', color, cursor: 'pointer', fontSize: 10, fontFamily: FONT_LABEL, flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = `color-mix(in srgb, ${color} 8%, transparent)`)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Plus style={{ width: 10, height: 10 }} /> Add
        </button>
      </div>

      {/* ── Payment table ── */}
      {!collapsed && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <TableHead showStageCol={false} sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            {sorted.length === 0 ? (
              <tbody><tr><td colSpan={11} style={{ ...TD, padding: '32px 16px', textAlign: 'center', color: 'var(--muted-foreground)' }}>No payments in this stage.</td></tr></tbody>
            ) : sorted.map((payment, idx) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                index={idx}
                isExpanded={expandedIds.has(payment.id)}
                onToggleExpand={() => toggleExpand(payment.id)}
                inlineStatusId={globalInlineStatusId}
                onStatusClick={() => setGlobalInlineStatusId(globalInlineStatusId === payment.id ? null : payment.id)}
                onStatusChange={s => onStatusChange(payment.id, s)}
                onEdit={() => onEdit(payment)}
                onAddChild={() => { onAddChild(payment); setExpandedIds(prev => new Set([...prev, payment.id])); }}
                showStageCol={false}
                rowBg={payment.status === 'Overdue'
                  ? 'color-mix(in srgb, var(--destructive) 4%, var(--card))'
                  : idx % 2 === 0 ? 'var(--card)' : 'color-mix(in srgb, var(--muted) 20%, transparent)'}
              />
            ))}

            {/* Stage subtotal footer */}
            {sorted.length > 1 && (
              <tfoot>
                <tr style={{ background: `color-mix(in srgb, ${color} 4%, var(--card))`, borderTop: `2px solid color-mix(in srgb, ${color} 20%, var(--border))` }}>
                  <td colSpan={4} style={{ ...TD, padding: '6px 10px 6px 42px', color: 'var(--muted-foreground)' }}>Stage total ({stats.total} payments)</td>
                  <td style={{ ...TD, color, fontWeight: 'var(--font-weight-medium)' }}>{fmt(stats.scheduled)}</td>
                  <td /><td />
                  <td style={{ ...TD, color: 'var(--chart-3)', fontWeight: 'var(--font-weight-medium)' }}>{stats.collected > 0 ? fmt(stats.collected) : '—'}</td>
                  <td /><td style={{ ...TD, color: 'var(--muted-foreground)' }}>
                    {stats.scheduled > 0 ? (
                      <span style={{ fontSize: 10, fontFamily: FONT_LABEL }}>
                        {Math.round((stats.collected / stats.scheduled) * 100)}% collected
                      </span>
                    ) : null}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main PaymentsLedger ──────────────────────────────────────────────────────

type ViewMode = 'list' | 'stages';

interface PaymentsLedgerProps {
  payments: LedgerPayment[];
  onUpdatePayments: (payments: LedgerPayment[]) => void;
}

export function PaymentsLedger({ payments, onUpdatePayments }: PaymentsLedgerProps) {
  const [viewMode, setViewMode]         = useState<ViewMode>('stages');
  const [editingPayment, setEditingPayment] = useState<LedgerPayment | null>(null);
  const [addingChildTo, setAddingChildTo]   = useState<LedgerPayment | null>(null);
  const [showAdhocPanel, setShowAdhocPanel] = useState(false);
  const [sortField, setSortField] = useState<SortField>('paymentDueDate');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus[]>([]);
  const [filterStage, setFilterStage]   = useState<string[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showStageFilter, setShowStageFilter]   = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(payments.filter(p => p.childPayments.some(c => c.type === 'revenue-share')).map(p => p.id))
  );
  const [inlineStatusId, setInlineStatusId] = useState<string | null>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  // Auto-flag overdue
  const enriched = useMemo(() => payments.map(p => {
    if (p.status === 'Scheduled' || p.status === 'Pending') {
      const due = new Date(p.paymentDueDate);
      if (!isNaN(due.getTime()) && due < today) return { ...p, status: 'Overdue' as PaymentStatus };
    }
    return p;
  }), [payments, today]);

  // Stable color map (based on all stages, not filtered)
  const stageColorMap = useMemo(() => {
    const stages = [...new Set(enriched.map(p => p.stageName).filter(Boolean))];
    return new Map<string, string>(stages.map((s, i) => [s, STAGE_PALETTE[i % STAGE_PALETTE.length]]));
  }, [enriched]);

  const stats = useMemo(() => {
    const paid    = enriched.filter(p => p.status === 'Paid').length;
    const overdue = enriched.filter(p => p.status === 'Overdue').length;
    const pending = enriched.filter(p => p.status === 'Pending' || p.status === 'Scheduled').length;
    const totalScheduled = enriched.reduce((s, p) => s + (parseFloat(p.amount.replace(/[$,]/g, '')) || 0), 0);
    const totalPaid      = enriched.reduce((s, p) => s + (parseFloat(p.actualAmountPaid.replace(/[$,]/g, '')) || 0), 0);
    return { total: enriched.length, paid, overdue, pending, totalScheduled, totalPaid };
  }, [enriched]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(enriched.map(p => p.status))), [enriched]);
  const uniqueStages   = useMemo(() => Array.from(new Set(enriched.map(p => p.stageName).filter(Boolean))), [enriched]);

  // Filtered list
  const displayed = useMemo(() => {
    let list = [...enriched];
    if (filterStatus.length > 0) list = list.filter(p => filterStatus.includes(p.status));
    if (filterStage.length > 0)  list = list.filter(p => filterStage.includes(p.stageName));
    list.sort((a, b) => {
      let av: any = a[sortField], bv: any = b[sortField];
      if (sortField === 'paymentDueDate') { av = new Date(av || 0).getTime(); bv = new Date(bv || 0).getTime(); }
      if (sortField === 'amount') { av = parseFloat(String(av).replace(/[$,]/g, '')) || 0; bv = parseFloat(String(bv).replace(/[$,]/g, '')) || 0; }
      return (av < bv ? -1 : av > bv ? 1 : 0) * (sortDir === 'asc' ? 1 : -1);
    });
    return list;
  }, [enriched, filterStatus, filterStage, sortField, sortDir]);

  // Stage groups for stages view
  const stageGroups = useMemo(() => {
    const groups: Array<{ stageName: string; displayName: string; payments: LedgerPayment[]; color: string }> = [];
    const seen = new Map<string, number>();
    for (const p of displayed) {
      const key = p.stageName || '__adhoc__';
      const displayName = p.stageName || 'Ad-hoc & Unassigned';
      const color = p.stageName ? (stageColorMap.get(p.stageName) || STAGE_PALETTE[0]) : 'var(--muted-foreground)';
      if (!seen.has(key)) { seen.set(key, groups.length); groups.push({ stageName: key, displayName, payments: [], color }); }
      groups[seen.get(key)!].payments.push(p);
    }
    return groups;
  }, [displayed, stageColorMap]);

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
  };

  const handleStatusChange = (id: string, s: PaymentStatus) => {
    onUpdatePayments(payments.map(p => p.id === id ? { ...p, status: s } : p));
    setInlineStatusId(null);
  };

  const handleAddChild = (parentId: string, child: ChildPayment) => {
    const par = payments.find(p => p.id === parentId);
    if (!par) return;
    onUpdatePayments(payments.map(p => p.id !== parentId ? p : {
      ...p, childPayments: [...p.childPayments, child],
      escalationImpacted: !!p.escalatorsApplied && (child.type === 'overpayment' || child.type === 'underpayment'),
    }));
    setAddingChildTo(null);
  };

  const panelOpen = !!editingPayment || !!addingChildTo || showAdhocPanel;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Overlay */}
      {panelOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.22)', zIndex: 49 }} onClick={() => { setEditingPayment(null); setAddingChildTo(null); setShowAdhocPanel(false); }} />}
      {editingPayment && <EditPaymentPanel payment={editingPayment} onSave={p => { onUpdatePayments(payments.map(q => q.id === p.id ? p : q)); setEditingPayment(null); }} onClose={() => setEditingPayment(null)} />}
      {addingChildTo  && <AddChildPanel payment={addingChildTo} onSave={c => handleAddChild(addingChildTo.id, c)} onClose={() => setAddingChildTo(null)} />}
      {showAdhocPanel && <AddAdhocPanel stages={uniqueStages} onSave={p => { onUpdatePayments([...payments, p]); setShowAdhocPanel(false); }} onClose={() => setShowAdhocPanel(false)} />}

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 14 }}>
          {([
            { label: 'Total Payments',     value: stats.total,   Icon: CreditCard,   color: 'var(--foreground)' },
            { label: 'Paid',               value: stats.paid,    Icon: CheckCircle2, color: 'var(--chart-3)' },
            { label: 'Pending/Scheduled',  value: stats.pending, Icon: Clock,        color: 'var(--chart-4)' },
            { label: 'Overdue',            value: stats.overdue, Icon: AlertCircle,  color: 'var(--destructive)' },
            { label: 'Total Collected', value: fmt(stats.totalPaid), Icon: CheckCircle2, color: 'var(--primary)' },
          ] as const).map(({ label, value, Icon, color }) => (
            <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon style={{ width: 13, height: 13, color }} />
                <label style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL }}>{label}</label>
              </div>
              <span style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-medium)', color, fontFamily: FONT }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>

          {/* Toolbar */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0 }}>
              {([
                { mode: 'list'   as ViewMode, Icon: List,   label: 'List'     },
                { mode: 'stages' as ViewMode, Icon: Layers, label: 'By Stage' },
              ]).map(({ mode, Icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', background: viewMode === mode ? 'var(--primary)' : 'var(--card)', color: viewMode === mode ? 'var(--primary-foreground)' : 'var(--foreground)', border: 'none', borderLeft: mode === 'stages' ? '1px solid var(--border)' : 'none', cursor: 'pointer', fontSize: 'var(--text-label)', fontFamily: FONT_LABEL, transition: 'background 0.15s' }}>
                  <Icon style={{ width: 12, height: 12 }} /> {label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
              <Filter style={{ width: 13, height: 13, color: 'var(--muted-foreground)', flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL }}>Filter:</span>

              {/* Status */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setShowStatusFilter(v => !v); setShowStageFilter(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, height: 26, padding: '0 9px', border: `1px solid ${filterStatus.length > 0 ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: filterStatus.length > 0 ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--card)', color: filterStatus.length > 0 ? 'var(--primary)' : 'var(--foreground)', cursor: 'pointer', fontSize: 'var(--text-label)', fontFamily: FONT_LABEL }}>
                  Status {filterStatus.length > 0 && <span style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{filterStatus.length}</span>}
                </button>
                {showStatusFilter && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: '0 4px 12px rgba(0,0,0,0.10)', zIndex: 20, minWidth: 160 }}>
                    {uniqueStatuses.map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={filterStatus.includes(s)} onChange={() => setFilterStatus(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} style={{ accentColor: 'var(--primary)' }} />
                        <StatusBadge status={s} />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Stage */}
              {uniqueStages.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <button onClick={() => { setShowStageFilter(v => !v); setShowStatusFilter(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, height: 26, padding: '0 9px', border: `1px solid ${filterStage.length > 0 ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: filterStage.length > 0 ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--card)', color: filterStage.length > 0 ? 'var(--primary)' : 'var(--foreground)', cursor: 'pointer', fontSize: 'var(--text-label)', fontFamily: FONT_LABEL }}>
                    Stage {filterStage.length > 0 && <span style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{filterStage.length}</span>}
                  </button>
                  {showStageFilter && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: '0 4px 12px rgba(0,0,0,0.10)', zIndex: 20, minWidth: 180 }}>
                      {uniqueStages.map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 'var(--text-label)', fontFamily: FONT_LABEL, color: 'var(--foreground)' }}>
                          <input type="checkbox" checked={filterStage.includes(s)} onChange={() => setFilterStage(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} style={{ accentColor: 'var(--primary)' }} />
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: stageColorMap.get(s) || 'var(--muted-foreground)', flexShrink: 0 }} />
                          {s}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(filterStatus.length > 0 || filterStage.length > 0) && (
                <button onClick={() => { setFilterStatus([]); setFilterStage([]); }} style={{ display: 'flex', alignItems: 'center', gap: 4, height: 26, padding: '0 9px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--card)', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: 'var(--text-label)', fontFamily: FONT_LABEL }}>
                  <X style={{ width: 10, height: 10 }} /> Clear
                </button>
              )}
            </div>

            <span style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL, flexShrink: 0 }}>{displayed.length} of {payments.length}</span>

            <button onClick={() => setShowAdhocPanel(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 'var(--text-label)', fontFamily: FONT_LABEL, flexShrink: 0 }}>
              <Plus style={{ width: 13, height: 13 }} /> Add Ad-hoc Payment
            </button>
          </div>

          {/* Escalation notice */}
          {enriched.some(p => p.escalationImpacted) && (
            <div style={{ padding: '9px 14px', display: 'flex', alignItems: 'flex-start', gap: 8, background: 'color-mix(in srgb, var(--chart-4) 10%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--chart-4) 22%, transparent)' }}>
              <AlertTriangle style={{ width: 14, height: 14, color: 'var(--chart-4)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 'var(--text-label)', color: 'var(--foreground)', fontFamily: FONT_LABEL, margin: 0 }}>
                <strong>Escalation Impact Detected</strong> — Amendments on escalated recurring payments may affect future payment calculations.
              </p>
            </div>
          )}

          {/* ── List view ── */}
          {viewMode === 'list' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
                <TableHead showStageCol sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                {displayed.length === 0 ? (
                  <tbody><tr><td colSpan={13} style={{ ...TD, padding: '40px 16px', textAlign: 'center', color: 'var(--muted-foreground)' }}>No payments match your filters.</td></tr></tbody>
                ) : displayed.map((payment, idx) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    index={idx}
                    isExpanded={expandedIds.has(payment.id)}
                    onToggleExpand={() => setExpandedIds(prev => { const n = new Set(prev); n.has(payment.id) ? n.delete(payment.id) : n.add(payment.id); return n; })}
                    inlineStatusId={inlineStatusId}
                    onStatusClick={() => setInlineStatusId(inlineStatusId === payment.id ? null : payment.id)}
                    onStatusChange={s => handleStatusChange(payment.id, s)}
                    onEdit={() => setEditingPayment(payment)}
                    onAddChild={() => { setAddingChildTo(payment); setExpandedIds(p => new Set([...p, payment.id])); }}
                    showStageCol
                    rowBg={payment.status === 'Overdue' ? 'color-mix(in srgb, var(--destructive) 4%, var(--card))' : idx % 2 === 0 ? 'var(--card)' : 'color-mix(in srgb, var(--muted) 22%, transparent)'}
                  />
                ))}
              </table>
            </div>
          )}

          {/* ── Stages view ── */}
          {viewMode === 'stages' && (
            <div style={{ padding: 12 }}>
              {stageGroups.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: FONT_LABEL, fontSize: 'var(--text-base)' }}>No payments match your filters.</div>
              ) : stageGroups.map((group, i) => (
                <StageGroup
                  key={group.stageName}
                  stageName={group.stageName}
                  displayName={group.displayName}
                  payments={group.payments}
                  color={group.color}
                  defaultOpen={i === 0}
                  onEdit={setEditingPayment}
                  onAddChild={p => { setAddingChildTo(p); }}
                  onStatusChange={handleStatusChange}
                  onAddAdhoc={() => setShowAdhocPanel(true)}
                  globalInlineStatusId={inlineStatusId}
                  setGlobalInlineStatusId={setInlineStatusId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Click-outside to close dropdowns */}
      {(showStatusFilter || showStageFilter || inlineStatusId) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 15 }} onClick={() => { setShowStatusFilter(false); setShowStageFilter(false); setInlineStatusId(null); }} />
      )}
    </div>
  );
}
