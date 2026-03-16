import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronRight, TrendingUp, Link2, Info, CalendarCheck } from 'lucide-react';
import type { PaymentStage, ManualPayment, GeneratedPayment } from './LeasePaymentTerms';
import { DEFAULT_REVENUE_SHARE_CONFIG } from './LeasePaymentTerms';
import { EscalatorModal } from './EscalatorModal';
import { RevenueSharePanel } from './RevenueSharePanel';

import { DateInput } from './ui/DateInput';
import {
  getEligibleDependencyStages,
  computeDependentFirstPaymentDate,
  getStageLastPaymentDate,
  hasPaymentTerms,
} from './utils/dependencyUtils';
import { EscalationPreviewTable } from './escalator/EscalationPreviewTable';

interface StagePanelProps {
  stage: PaymentStage;
  allStages: PaymentStage[];
  generatedPayments?: GeneratedPayment[];
  onSave: (stage: PaymentStage) => void;
  onDelete: (stageId: string) => void;
  onCancel: () => void;
}

export function StagePanel({ stage, allStages, generatedPayments = [], onSave, onDelete, onCancel }: StagePanelProps) {
  const [formData, setFormData] = useState<PaymentStage>({
    ...stage,
    // Default to recurring when opening a new (incomplete) stage
    typeOfPayment: !stage.isComplete && !stage.typeOfPayment ? 'recurring' : stage.typeOfPayment,
    revenueShareEnabled: stage.revenueShareEnabled ?? false,
    revenueShareConfig: stage.revenueShareConfig ?? DEFAULT_REVENUE_SHARE_CONFIG,
  });
  const [isPaymentAccordionOpen, setIsPaymentAccordionOpen] = useState(true);
  const [isEscalationAccordionOpen, setIsEscalationAccordionOpen] = useState(true);
  const [showEscalatorModal, setShowEscalatorModal] = useState(false);
  // Tracks the auto-computed date notice shown when dependency is linked
  const [depDateNotice, setDepDateNotice] = useState<string | null>(null);

  const updateField = <K extends keyof PaymentStage>(field: K, value: PaymentStage[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ─── Stages eligible as dependencies: only completed stages BEFORE this one ──
  const eligibleDependencyStages = getEligibleDependencyStages(allStages, stage.id);

  // ─── Core dependency date-linking logic ────────────────────────────────────
  const recalcDependentDate = useCallback(
    (data: PaymentStage) => {
      if (!data.dependsOnPreviousStage || !data.dependentStageId) {
        setDepDateNotice(null);
        return;
      }
      const depStage = allStages.find(s => s.id === data.dependentStageId);
      if (!depStage) { setDepDateNotice(null); return; }

      const computed = computeDependentFirstPaymentDate(
        depStage,
        data.paymentFrequency,
        data.recurringPaymentDate,
        data.endOfMonth,
      );
      if (!computed) { setDepDateNotice(null); return; }

      const lastDate = getStageLastPaymentDate(depStage);
      const lastFmt = lastDate
        ? lastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : '';
      const nextFmt = new Date(computed).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
      setDepDateNotice(
        `First Payment Date auto-set to ${nextFmt} — follows "${depStage.name || 'Unnamed'}"'s last payment${lastFmt ? ` (${lastFmt})` : ''}.`,
      );
      setFormData(prev => ({ ...prev, firstPaymentDate: computed }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allStages],
  );

  // Re-run whenever dependency or frequency fields change
  useEffect(() => {
    recalcDependentDate(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.dependsOnPreviousStage,
    formData.dependentStageId,
    formData.paymentFrequency,
    formData.recurringPaymentDate,
    formData.endOfMonth,
  ]);

  // ─── Save guard: name + typeOfPayment are both required ─────────────────────
  const needsFrequency = formData.typeOfPayment === 'recurring' || formData.typeOfPayment === 'revenue-sharing';

  const canSave =
    formData.name.trim() !== '' &&
    (
      formData.typeOfPayment === 'recurring' ||
      formData.typeOfPayment === 'one-time' ||
      formData.typeOfPayment === 'revenue-sharing'
    ) &&
    (!needsFrequency || !!formData.paymentFrequency);

  // ─── Missing fields list — drives the inline hint near Save ─────────────────
  const missingFields: string[] = [];
  if (!formData.name.trim()) missingFields.push('Stage Name');
  if (!formData.typeOfPayment) missingFields.push('Type of Payment');
  if (needsFrequency && !formData.paymentFrequency) missingFields.push('Payment Frequency');

  const addManualPayment = () => {
    const newPayment: ManualPayment = {
      id: `payment-${Date.now()}`,
      paymentName: '',
      paymentDueDate: '', // DateInput with autoPopulate/autoOpen will fill this
      paymentAmount: '',
    };
    updateField('manualPayments', [...formData.manualPayments, newPayment]);
  };

  const updateManualPayment = (id: string, field: keyof ManualPayment, value: string) => {
    const updated = formData.manualPayments.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    updateField('manualPayments', updated);
  };

  const deleteManualPayment = (id: string) => {
    updateField('manualPayments', formData.manualPayments.filter(p => p.id !== id));
  };

  // ─── Shared input / label styles ────────────────────────────────────────────
  const inputCls =
    'w-full border border-border bg-input-background rounded-[var(--radius)] p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all';
  const selectCls =
    'w-full border border-border bg-input-background rounded-[var(--radius)] p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer';

  // ─── Sanitise numeric-only percentage input ──────────────────────────────────
  const handlePctChange = (field: 'minEscalationPct' | 'maxEscalationPct' | 'escalationAppliedPct', raw: string) => {
    // Allow only digits and a single decimal point
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    updateField(field, cleaned);
  };

  return (
    <>
      {/* Right side panel — Fixed, overlays content */}
      <div
        className="fixed right-0 top-0 h-full flex flex-col z-50"
        style={{
          width: 'clamp(580px, 55vw, 1200px)',
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '0 0 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div
          className="p-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--muted) 40%, transparent)' }}
        >
          <div>
            <h2 style={{ color: 'var(--foreground)', marginBottom: 4 }}>
              {stage.isComplete ? 'Edit Payment Stage' : 'New Payment Stage'}
            </h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)' }}>
              Configure payment terms and dependencies
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-[var(--radius)] transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Basic Information ────────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 style={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              Basic Information
            </h3>

            {/* Stage Name */}
            <div className="space-y-2">
              <label className="block" style={{ color: 'var(--foreground)' }}>
                Lease Payment Stage Name{' '}
                <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                className={inputCls}
                placeholder="Enter stage name"
                style={
                  !formData.name.trim()
                    ? { borderColor: 'color-mix(in srgb, var(--destructive) 40%, var(--border))' }
                    : {}
                }
              />
            </div>

            {/* Connected Lease — read-only, always locked to Lease Agreement 001 */}
            <div className="space-y-2">
              <label className="block" style={{ color: 'var(--foreground)' }}>
                Connected Lease
              </label>
              <div
                className="flex items-center gap-2 rounded-[var(--radius)] px-3 py-3"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  cursor: 'not-allowed',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--text-base)',
                    fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                    userSelect: 'none',
                  }}
                >
                  Lease Agreement 001
                </span>
              </div>
            </div>

            {/* Type of Payment */}
            <div className="space-y-2">
              <label className="block" style={{ color: 'var(--foreground)' }}>
                Type of Payment{' '}
                <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.typeOfPayment}
                  onChange={e =>
                    updateField('typeOfPayment', e.target.value as '' | 'recurring' | 'one-time')
                  }
                  className={selectCls}
                  style={
                    !formData.typeOfPayment
                      ? { borderColor: 'color-mix(in srgb, var(--destructive) 40%, var(--border))', color: 'var(--muted-foreground)' }
                      : {}
                  }
                >
                  <option value="">Select payment type…</option>
                  <option value="recurring">Recurring</option>
                  <option value="one-time">One-Time</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--muted-foreground)' }}
                />
              </div>
            </div>
          </section>

          {/* ── Payment Configuration Accordion ─────────────────────────────── */}
          <section className="space-y-4">
            <div
              className="overflow-hidden rounded-[var(--radius)]"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Accordion header */}
              <button
                onClick={() => setIsPaymentAccordionOpen(!isPaymentAccordionOpen)}
                className="w-full p-4 flex items-center justify-between transition-colors"
                style={{
                  background: 'color-mix(in srgb, var(--muted) 50%, transparent)',
                  color: 'var(--foreground)',
                }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    'var(--muted)')
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    'color-mix(in srgb, var(--muted) 50%, transparent)')
                }
              >
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Payment Configuration
                </span>
                {isPaymentAccordionOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {isPaymentAccordionOpen && (
                <div className="p-6 space-y-6" style={{ background: 'var(--card)' }}>

                  {/* ── Manual Entry toggle (One-Time only) ────────────────── */}
                  {formData.typeOfPayment === 'one-time' && (
                    <div
                      className="flex items-center justify-between p-4 rounded-[var(--radius)]"
                      style={{
                        background: 'color-mix(in srgb, var(--muted) 30%, transparent)',
                      }}
                    >
                      <div>
                        <label
                          className="block"
                          style={{
                            color: 'var(--foreground)',
                            fontWeight: 'var(--font-weight-medium)',
                            marginBottom: 4,
                          }}
                        >
                          Manual Entry of Payment Terms
                        </label>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)' }}>
                          Enter individual payment details manually
                        </p>
                      </div>
                      {/* Toggle switch */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isManualEntry}
                          onChange={e => updateField('isManualEntry', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div
                          className="w-14 h-7 rounded-full peer transition-colors"
                          style={{
                            background: formData.isManualEntry
                              ? 'var(--primary)'
                              : 'var(--border)',
                            position: 'relative',
                          }}
                        >
                          <span
                            className="absolute top-0.5 start-[4px] w-6 h-6 bg-white rounded-full transition-all"
                            style={{
                              transform: formData.isManualEntry
                                ? 'translateX(100%)'
                                : 'translateX(0)',
                            }}
                          />
                        </div>
                      </label>
                    </div>
                  )}

                  {/* ── Manual Entry table (One-Time + isManualEntry) ──────── */}
                  {formData.typeOfPayment === 'one-time' && formData.isManualEntry ? (
                    <div className="space-y-4">
                      {formData.manualPayments.length > 0 && (
                        <div
                          className="overflow-hidden rounded-[var(--radius)]"
                          style={{ border: '1px solid var(--border)' }}
                        >
                          {/* Table header */}
                          <div
                            className="grid grid-cols-[2fr_1.5fr_1.5fr_auto] gap-3 p-3"
                            style={{
                              background: 'var(--muted)',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            <label style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                              Payment Name
                            </label>
                            <label style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                              Payment Due Date
                            </label>
                            <label style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                              Payment Amount
                            </label>
                            <div className="w-10" />
                          </div>

                          {/* Table rows */}
                          <div style={{ borderTop: 'none' }}>
                            {formData.manualPayments.map(payment => (
                              <div
                                key={payment.id}
                                className="grid grid-cols-[2fr_1.5fr_1.5fr_auto] gap-3 p-3 transition-colors"
                                style={{ borderBottom: '1px solid var(--border)' }}
                                onMouseEnter={e =>
                                  ((e.currentTarget as HTMLDivElement).style.background =
                                    'color-mix(in srgb, var(--muted) 50%, transparent)')
                                }
                                onMouseLeave={e =>
                                  ((e.currentTarget as HTMLDivElement).style.background =
                                    'transparent')
                                }
                              >
                                {/* Payment name */}
                                <input
                                  type="text"
                                  value={payment.paymentName}
                                  onChange={e =>
                                    updateManualPayment(payment.id, 'paymentName', e.target.value)
                                  }
                                  className="border border-border bg-input-background rounded-[var(--radius-sm)] px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                  placeholder="Payment name"
                                  style={{ fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-base)' }}
                                />

                                {/* Payment due date — auto-opens + pre-populates for new rows */}
                                <DateInput
                                  value={payment.paymentDueDate}
                                  onChange={e =>
                                    updateManualPayment(payment.id, 'paymentDueDate', e.target.value)
                                  }
                                  autoOpen={!payment.paymentDueDate}
                                  autoPopulate={!payment.paymentDueDate}
                                  className="rounded-[var(--radius-sm)] py-2"
                                />

                                {/* Amount */}
                                <input
                                  type="text"
                                  value={payment.paymentAmount}
                                  onChange={e =>
                                    updateManualPayment(payment.id, 'paymentAmount', e.target.value)
                                  }
                                  className="border border-border bg-input-background rounded-[var(--radius-sm)] px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                  placeholder="$0.00"
                                  style={{ fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-base)' }}
                                />

                                {/* Delete row */}
                                <button
                                  onClick={() => deleteManualPayment(payment.id)}
                                  className="w-10 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors"
                                  style={{ color: 'var(--destructive)' }}
                                  onMouseEnter={e =>
                                    ((e.currentTarget as HTMLButtonElement).style.background =
                                      'color-mix(in srgb, var(--destructive) 10%, transparent)')
                                  }
                                  onMouseLeave={e =>
                                    ((e.currentTarget as HTMLButtonElement).style.background =
                                      'transparent')
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={addManualPayment}
                        className="flex items-center gap-2 transition-colors"
                        style={{ color: 'var(--primary)' }}
                        onMouseEnter={e =>
                          ((e.currentTarget as HTMLButtonElement).style.opacity = '0.75')
                        }
                        onMouseLeave={e =>
                          ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
                        }
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Payment</span>
                      </button>
                    </div>
                  ) : (
                    /* ── Recurring / One-Time non-manual fields ──────────────── */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Amount / Base Rent */}
                        <div className="space-y-2">
                          <label className="block" style={{ color: 'var(--foreground)' }}>
                            Amount
                          </label>
                          <input
                            type="text"
                            value={formData.amount}
                            onChange={e => updateField('amount', e.target.value)}
                            className={inputCls}
                            placeholder="$0.00"
                          />
                        </div>

                        {/* First Payment Date — auto-populates if empty (new stage) */}
                        <div className="space-y-2">
                          <label className="block" style={{ color: 'var(--foreground)' }}>
                            First Payment Date
                          </label>
                          <DateInput
                            value={formData.firstPaymentDate}
                            onChange={e => updateField('firstPaymentDate', e.target.value)}
                            autoPopulate={!formData.firstPaymentDate}
                            autoOpen={!formData.firstPaymentDate}
                          />
                        </div>
                      </div>

                      {/* Recurring scheduling fields */}
                      {formData.typeOfPayment === 'recurring' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Payment Frequency */}
                            <div className="space-y-2">
                              <label className="block" style={{ color: 'var(--foreground)' }}>
                                Payment Frequency
                              </label>
                              <div className="relative">
                                <select
                                  value={formData.paymentFrequency}
                                  onChange={e => updateField('paymentFrequency', e.target.value)}
                                  className={selectCls}
                                >
                                  <option value="">Select frequency</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="quarterly">Quarterly</option>
                                  <option value="annually">Annually</option>
                                </select>
                                <ChevronDown
                                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                  style={{ color: 'var(--muted-foreground)' }}
                                />
                              </div>
                            </div>

                            {/* Number of Terms / Date Range — toggled */}
                            <div className="space-y-2">
                              {/* Switch header row */}
                              <div className="flex items-center justify-between gap-2">
                                <label className="block" style={{ color: 'var(--foreground)', flexShrink: 0 }}>
                                  {formData.usePaymentDateRange ? 'Payment Date Range' : 'Number of Terms'}
                                </label>
                                <label
                                  className="inline-flex items-center cursor-pointer gap-2"
                                  title={formData.usePaymentDateRange ? 'Switch to number of terms' : 'Switch to date range'}
                                >
                                  <span style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                                    Use dates
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={formData.usePaymentDateRange}
                                    onChange={e => {
                                      updateField('usePaymentDateRange', e.target.checked);
                                      if (e.target.checked) {
                                        updateField('numberOfPayments', '');
                                      } else {
                                        updateField('paymentStartDate', '');
                                        updateField('paymentEndDate', '');
                                      }
                                    }}
                                    className="sr-only"
                                  />
                                  <div
                                    style={{
                                      width: 36,
                                      height: 20,
                                      borderRadius: 999,
                                      background: formData.usePaymentDateRange ? 'var(--primary)' : 'var(--border)',
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
                                        transform: formData.usePaymentDateRange ? 'translateX(16px)' : 'translateX(0)',
                                      }}
                                    />
                                  </div>
                                </label>
                              </div>

                              {/* Conditional input(s) */}
                              {formData.usePaymentDateRange ? (
                                <div className="space-y-2">
                                  <div>
                                    <p style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', marginBottom: 4, marginTop: 0 }}>Start Date</p>
                                    <DateInput
                                      value={formData.paymentStartDate}
                                      onChange={e => updateField('paymentStartDate', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <p style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', marginBottom: 4, marginTop: 0 }}>End Date</p>
                                    <DateInput
                                      value={formData.paymentEndDate}
                                      onChange={e => updateField('paymentEndDate', e.target.value)}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  value={formData.numberOfPayments}
                                  onChange={e => updateField('numberOfPayments', e.target.value)}
                                  className={inputCls}
                                  placeholder="0"
                                  min="1"
                                />
                              )}
                            </div>
                          </div>

                          {/* Recurring Payment Date */}
                          <div className="space-y-2">
                            <label className="block" style={{ color: 'var(--foreground)' }}>
                              Recurring Payment Date
                            </label>
                            <input
                              type="text"
                              value={formData.recurringPaymentDate}
                              onChange={e => updateField('recurringPaymentDate', e.target.value)}
                              disabled={formData.endOfMonth}
                              className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                              placeholder="e.g., 1st of month"
                            />
                          </div>

                          <div className="space-y-3">
                            {/* End of Month checkbox */}
                            <div
                              className="flex items-center gap-3 p-3 rounded-[var(--radius)] transition-colors cursor-pointer"
                              style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}
                              onClick={() => {
                                const newValue = !formData.endOfMonth;
                                updateField('endOfMonth', newValue);
                                if (newValue) updateField('recurringPaymentDate', '');
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={formData.endOfMonth}
                                onChange={e => {
                                  updateField('endOfMonth', e.target.checked);
                                  if (e.target.checked) updateField('recurringPaymentDate', '');
                                }}
                                onClick={e => e.stopPropagation()}
                                className="w-4 h-4 cursor-pointer rounded"
                                style={{ accentColor: 'var(--primary)' }}
                              />
                              <label
                                className="flex-1 cursor-pointer"
                                style={{ color: 'var(--foreground)' }}
                              >
                                End of Month
                              </label>
                            </div>

                            {/* Payment Terms Date to Begin Escalation */}
                            <div className="space-y-2">
                              <label className="block" style={{ color: 'var(--foreground)' }}>
                                Payment Terms Date to Begin Escalation
                              </label>
                              <DateInput
                                value={formData.paymentTermsDateToBeginEscalation}
                                onChange={e =>
                                  updateField('paymentTermsDateToBeginEscalation', e.target.value)
                                }
                              />
                            </div>

                            {/* Prorated Escalations checkbox */}
                            <div
                              className="flex items-center gap-3 p-3 rounded-[var(--radius)] transition-colors cursor-pointer"
                              style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}
                              onClick={() =>
                                updateField('proratedEscalations', !formData.proratedEscalations)
                              }
                            >
                              <input
                                type="checkbox"
                                checked={formData.proratedEscalations}
                                onChange={e =>
                                  updateField('proratedEscalations', e.target.checked)
                                }
                                onClick={e => e.stopPropagation()}
                                className="w-4 h-4 cursor-pointer rounded"
                                style={{ accentColor: 'var(--primary)' }}
                              />
                              <label
                                className="flex-1 cursor-pointer"
                                style={{ color: 'var(--foreground)' }}
                              >
                                Prorated Escalations
                              </label>
                            </div>

                            {/* Days Before Payment is Due */}
                            <div className="space-y-2">
                              <label className="block" style={{ color: 'var(--foreground)' }}>
                                Days Before Payment is Due
                              </label>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  value={formData.daysBeforePaymentDue ?? ''}
                                  onChange={e => updateField('daysBeforePaymentDue', e.target.value)}
                                  placeholder="e.g. 30"
                                  className="w-full border border-border bg-input-background rounded-[var(--radius)] p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                  style={{ fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-base)', paddingRight: 52 }}
                                />
                                <span style={{
                                  position: 'absolute', right: 12,
                                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                                  fontSize: 'var(--text-label)',
                                  color: 'var(--muted-foreground)',
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                                }}>
                                  days
                                </span>
                              </div>
                            </div>
                          </div>


                        </>
                      )}
                    </div>
                  )}


                </div>
              )}
            </div>
          </section>

          {/* ── Revenue Sharing Add-On Section ──────────────────────────────────── */}
          {formData.typeOfPayment === 'recurring' && (
            <section className="space-y-4">
              <div
                style={{
                  border: formData.revenueShareEnabled
                    ? '2px solid var(--primary)'
                    : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Header row — big toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    background: formData.revenueShareEnabled
                      ? 'color-mix(in srgb, var(--primary) 6%, var(--card))'
                      : 'color-mix(in srgb, var(--muted) 60%, transparent)',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: 'var(--radius)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        background: formData.revenueShareEnabled ? 'var(--primary)' : 'color-mix(in srgb, var(--muted-foreground) 20%, transparent)',
                        transition: 'background 0.2s',
                      }}
                    >
                      <TrendingUp style={{ width: 18, height: 18, color: formData.revenueShareEnabled ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-medium)', color: 'var(--foreground)', lineHeight: 1.3 }}>
                        Revenue Sharing
                      </p>
                      <p style={{ margin: '4px 0 0', fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', lineHeight: 1.5, maxWidth: 360 }}>
                        Add revenue sharing on top of this recurring stage's base payment.
                        Applicable to recurring payment types only.
                      </p>
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-base)', color: formData.revenueShareEnabled ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: formData.revenueShareEnabled ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)', transition: 'color 0.2s', userSelect: 'none' }}>
                      {formData.revenueShareEnabled ? 'Enabled' : 'Add On'}
                    </span>
                    <input type="checkbox" checked={formData.revenueShareEnabled} onChange={e => updateField('revenueShareEnabled', e.target.checked)} className="sr-only" />
                    <div style={{ width: 52, height: 28, borderRadius: 999, background: formData.revenueShareEnabled ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0, boxShadow: formData.revenueShareEnabled ? '0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent)' : 'none' }}>
                      <span style={{ position: 'absolute', top: 3, left: 3, width: 22, height: 22, borderRadius: '50%', background: 'var(--primary-foreground)', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'transform 0.2s', transform: formData.revenueShareEnabled ? 'translateX(24px)' : 'translateX(0)' }} />
                    </div>
                  </label>
                </div>
                {formData.revenueShareEnabled && (
                  <div style={{ padding: '20px 24px', background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                    <RevenueSharePanel
                      baseRent={formData.amount}
                      config={formData.revenueShareConfig ?? DEFAULT_REVENUE_SHARE_CONFIG}
                      onChange={cfg => updateField('revenueShareConfig', cfg)}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Escalation Rule Set Section ──────────────────────────────────── */}
          <section className="space-y-4">
            <div
              className="overflow-hidden rounded-[var(--radius)]"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Accordion header */}
              <button
                onClick={() => setIsEscalationAccordionOpen(!isEscalationAccordionOpen)}
                className="w-full p-4 flex items-center justify-between transition-colors"
                style={{
                  background: 'color-mix(in srgb, var(--muted) 50%, transparent)',
                  color: 'var(--foreground)',
                }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)')
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    'color-mix(in srgb, var(--muted) 50%, transparent)')
                }
              >
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Escalation Rule Set
                </span>
                {isEscalationAccordionOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {isEscalationAccordionOpen && (
                <div className="p-6 space-y-5" style={{ background: 'var(--card)' }}>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                    Define the bounds and applied rate for this stage's escalation.
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Minimum Escalation Percentage */}
                    <div className="space-y-2">
                      <label
                        className="block"
                        style={{ color: 'var(--foreground)', fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-label)' }}
                      >
                        Minimum Escalation Percentage
                      </label>
                      <div
                        className="flex items-center rounded-[var(--radius)] overflow-hidden transition-all"
                        style={{ border: '1px solid var(--border)', background: 'var(--input-background)' }}
                        onFocusCapture={e =>
                          ((e.currentTarget as HTMLDivElement).style.outline = '2px solid var(--ring)')
                        }
                        onBlurCapture={e =>
                          ((e.currentTarget as HTMLDivElement).style.outline = 'none')
                        }
                      >
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formData.minEscalationPct}
                          onChange={e => handlePctChange('minEscalationPct', e.target.value)}
                          placeholder="0"
                          style={{
                            flex: 1,
                            padding: '12px 0 12px 12px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--foreground)',
                            fontSize: 'var(--text-base)',
                            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                            minWidth: 0,
                          }}
                        />
                        <span
                          style={{
                            padding: '0 12px 0 4px',
                            color: formData.minEscalationPct ? 'var(--foreground)' : 'var(--muted-foreground)',
                            fontSize: 'var(--text-base)',
                            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                            userSelect: 'none',
                            lineHeight: 1,
                          }}
                        >
                          %
                        </span>
                      </div>
                    </div>

                    {/* Maximum Escalation Percentage */}
                    <div className="space-y-2">
                      <label
                        className="block"
                        style={{ color: 'var(--foreground)', fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-label)' }}
                      >
                        Maximum Escalation Percentage
                      </label>
                      <div
                        className="flex items-center rounded-[var(--radius)] overflow-hidden transition-all"
                        style={{ border: '1px solid var(--border)', background: 'var(--input-background)' }}
                        onFocusCapture={e =>
                          ((e.currentTarget as HTMLDivElement).style.outline = '2px solid var(--ring)')
                        }
                        onBlurCapture={e =>
                          ((e.currentTarget as HTMLDivElement).style.outline = 'none')
                        }
                      >
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formData.maxEscalationPct}
                          onChange={e => handlePctChange('maxEscalationPct', e.target.value)}
                          placeholder="0"
                          style={{
                            flex: 1,
                            padding: '12px 0 12px 12px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--foreground)',
                            fontSize: 'var(--text-base)',
                            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                            minWidth: 0,
                          }}
                        />
                        <span
                          style={{
                            padding: '0 12px 0 4px',
                            color: formData.maxEscalationPct ? 'var(--foreground)' : 'var(--muted-foreground)',
                            fontSize: 'var(--text-base)',
                            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                            userSelect: 'none',
                            lineHeight: 1,
                          }}
                        >
                          %
                        </span>
                      </div>
                    </div>

                    {/* Percentage of Escalation Applied */}
                    <div className="space-y-2">
                      <label
                        className="block"
                        style={{ color: 'var(--foreground)', fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-label)' }}
                      >
                        Percentage of Escalation Applied
                      </label>
                      <div
                        className="flex items-center rounded-[var(--radius)] overflow-hidden transition-all"
                        style={{ border: '1px solid var(--border)', background: 'var(--input-background)' }}
                        onFocusCapture={e =>
                          ((e.currentTarget as HTMLDivElement).style.outline = '2px solid var(--ring)')
                        }
                        onBlurCapture={e =>
                          ((e.currentTarget as HTMLDivElement).style.outline = 'none')
                        }
                      >
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formData.escalationAppliedPct}
                          onChange={e => handlePctChange('escalationAppliedPct', e.target.value)}
                          placeholder="0"
                          style={{
                            flex: 1,
                            padding: '12px 0 12px 12px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--foreground)',
                            fontSize: 'var(--text-base)',
                            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                            minWidth: 0,
                          }}
                        />
                        <span
                          style={{
                            padding: '0 12px 0 4px',
                            color: formData.escalationAppliedPct ? 'var(--foreground)' : 'var(--muted-foreground)',
                            fontSize: 'var(--text-base)',
                            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                            userSelect: 'none',
                            lineHeight: 1,
                          }}
                        >
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Apply Escalator Section ─────────────────────────���─────────────── */}
          <section className="space-y-4">
            <h3 style={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              Apply Escalator
            </h3>

            {/* Soft hint when the ruleset hasn't been filled yet */}
            {!formData.minEscalationPct && !formData.maxEscalationPct && !formData.escalationAppliedPct && !formData.appliedEscalatorName && (
              null
            )}

            <div
              className="p-4 rounded-[var(--radius)]"
              style={{
                border: '1px solid var(--border)',
                background: 'color-mix(in srgb, var(--muted) 20%, transparent)',
              }}
            >
              {/* Label + status + button row */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  {formData.appliedEscalatorName ? (
                    <div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', marginBottom: 2 }}>
                        {formData.appliedEscalatorName}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0 }}>
                        {formData.appliedPeriodName ? `Period: ${formData.appliedPeriodName} · ` : ''}
                        {formData.appliedEscalationValueType === 'percentage'
                          ? `${formData.appliedEscalationRateValue}% period rate`
                          : `$${formData.appliedEscalationRateValue} flat`}
                        {formData.appliedEscalationStartDate
                          ? ` · from ${new Date(formData.appliedEscalationStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : ''}
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', margin: 0 }}>
                      No escalator applied yet
                    </p>
                  )}
                </div>
                {/* Apply Escalator button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {/* Apply Escalator */}
                  <button
                    onClick={() => setShowEscalatorModal(true)}
                    className="flex items-center gap-2 rounded-[var(--radius)] transition-all duration-200 whitespace-nowrap"
                    style={{
                      padding: '8px 14px',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      background: 'transparent',
                      flexShrink: 0,
                      fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: 'var(--text-base)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-foreground)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
                    }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>{formData.appliedEscalatorName ? 'Edit Escalator' : 'Apply Escalator'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Escalation Preview Table — shown once escalator is applied */}
            {formData.appliedEscalatorName && formData.appliedEscalationRateValue && formData.firstPaymentDate && (
              <EscalationPreviewTable formData={formData} />
            )}
          </section>

          {/* ── Dependencies Section ─────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 style={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              Dependencies
            </h3>

            <div
              className="p-4 space-y-4 rounded-[var(--radius)]"
              style={{
                border: '1px solid var(--border)',
                background: 'color-mix(in srgb, var(--muted) 30%, transparent)',
              }}
            >
              {/* No eligible stages notice */}
              {eligibleDependencyStages.length === 0 && (
                <div
                  className="flex items-center gap-2 p-3 rounded-[var(--radius)]"
                  style={{
                    background: 'color-mix(in srgb, var(--muted) 50%, transparent)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Info style={{ width: 14, height: 14, color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)' }}>
                    No saved stages exist before this one — save a stage first before setting dependencies.
                  </span>
                </div>
              )}

              {/* Depends on previous stage checkbox */}
              {eligibleDependencyStages.length > 0 && (
                <div
                  className="flex items-center gap-3 p-3 rounded-[var(--radius)] transition-colors cursor-pointer"
                  style={{ background: 'var(--card)' }}
                  onClick={() => {
                    const next = !formData.dependsOnPreviousStage;
                    setFormData(prev => ({
                      ...prev,
                      dependsOnPreviousStage: next,
                      dependentStageId: next ? prev.dependentStageId : '',
                    }));
                    if (!next) setDepDateNotice(null);
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      'color-mix(in srgb, var(--muted) 50%, transparent)')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLDivElement).style.background = 'var(--card)')
                  }
                >
                  <input
                    type="checkbox"
                    checked={formData.dependsOnPreviousStage}
                    onChange={e => {
                      const next = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        dependsOnPreviousStage: next,
                        dependentStageId: next ? prev.dependentStageId : '',
                      }));
                      if (!next) setDepDateNotice(null);
                    }}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 cursor-pointer rounded"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <Link2 style={{ width: 14, height: 14, color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    <label className="flex-1 cursor-pointer" style={{ color: 'var(--foreground)' }}>
                      Depending on completion of previous stage
                    </label>
                  </div>
                </div>
              )}

              {/* Stage dropdown — only when checkbox is checked */}
              {formData.dependsOnPreviousStage && eligibleDependencyStages.length > 0 && (
                <div className="space-y-3 ml-7">
                  {/* Banner: some stages need payment terms */}
                  {eligibleDependencyStages.some(s => !hasPaymentTerms(s)) && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-[var(--radius)]"
                      style={{
                        background: 'color-mix(in srgb, var(--chart-4) 8%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--chart-4) 22%, transparent)',
                      }}
                    >
                      <Info style={{ width: 13, height: 13, color: 'var(--chart-4)', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ color: 'color-mix(in srgb, var(--chart-4) 80%, var(--foreground))', fontSize: 'var(--text-label)', margin: 0 }}>
                        Some stages are greyed out because they have no payment terms configured yet.
                        Open them and add payment details before depending on them.
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block" style={{ color: 'var(--foreground)' }}>
                      Select Dependency Stage
                    </label>
                    <div className="relative">
                      <select
                        value={formData.dependentStageId}
                        onChange={e => updateField('dependentStageId', e.target.value)}
                        className={selectCls}
                      >
                        <option value="">— select a stage —</option>
                        {eligibleDependencyStages.map(s => {
                          const hasTerms = hasPaymentTerms(s);
                          const last = getStageLastPaymentDate(s);
                          const lastFmt = last
                            ? last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : null;
                          return (
                            <option key={s.id} value={s.id} disabled={!hasTerms}>
                              {s.name || 'Unnamed Stage'}
                              {hasTerms
                                ? lastFmt ? ` — ends ${lastFmt}` : ''
                                : ' (payment terms needed)'}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--muted-foreground)' }}
                      />
                    </div>
                  </div>

                  {/* Dependency last-payment summary card */}
                  {formData.dependentStageId && (() => {
                    const dep = allStages.find(s => s.id === formData.dependentStageId);
                    if (!dep) return null;
                    const last = getStageLastPaymentDate(dep);
                    if (!last) return null;
                    return (
                      <div
                        className="flex items-start gap-2 p-3 rounded-[var(--radius)]"
                        style={{
                          background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--primary) 18%, transparent)',
                        }}
                      >
                        <CalendarCheck style={{ width: 13, height: 13, color: 'var(--primary)', marginTop: 1, flexShrink: 0 }} />
                        <div>
                          <p style={{ color: 'var(--foreground)', fontSize: 'var(--text-label)', margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                            "{dep.name || 'Unnamed'}" last payment:
                          </p>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: '2px 0 0' }}>
                            {last.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            {dep.paymentFrequency ? ` · ${dep.paymentFrequency}` : ''}
                            {dep.numberOfPayments
                              ? ` · ${dep.numberOfPayments} payment${parseInt(dep.numberOfPayments) !== 1 ? 's' : ''}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Auto-date-linked notice */}
              {depDateNotice && (
                <div
                  className="flex items-start gap-2 p-3 rounded-[var(--radius)]"
                  style={{
                    background: 'color-mix(in srgb, var(--chart-3) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--chart-3) 25%, transparent)',
                  }}
                >
                  <CalendarCheck style={{ width: 14, height: 14, color: 'var(--chart-3)', marginTop: 1, flexShrink: 0 }} />
                  <p style={{ color: 'color-mix(in srgb, var(--chart-3) 85%, var(--foreground))', fontSize: 'var(--text-label)', margin: 0 }}>
                    {depDateNotice}
                  </p>
                </div>
              )}

              {/* Hint: frequency not yet set */}
              {formData.dependsOnPreviousStage &&
                formData.dependentStageId &&
                !formData.paymentFrequency &&
                formData.typeOfPayment === 'recurring' && (
                <div
                  className="flex items-start gap-2 p-3 rounded-[var(--radius)]"
                  style={{
                    background: 'color-mix(in srgb, var(--chart-4) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--chart-4) 25%, transparent)',
                  }}
                >
                  <Info style={{ width: 13, height: 13, color: 'var(--chart-4)', marginTop: 1, flexShrink: 0 }} />
                  <p style={{ color: 'color-mix(in srgb, var(--chart-4) 80%, var(--foreground))', fontSize: 'var(--text-label)', margin: 0 }}>
                    Select a Payment Frequency in the Payment Configuration section to auto-calculate the First Payment Date from this dependency.
                  </p>
                </div>
              )}
            </div>

            {/* Additional Comments — always active, outside dependency box */}
            <div className="space-y-2">
              <label className="block" style={{ color: 'var(--foreground)' }}>
                Additional Comments
              </label>
              <textarea
                value={formData.additionalComments}
                onChange={e => updateField('additionalComments', e.target.value)}
                className="w-full border border-border bg-input-background rounded-[var(--radius)] p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all min-h-[120px] resize-none"
                placeholder="Enter any additional comments or notes..."
                style={{ fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: 'var(--text-base)' }}
              />
            </div>
          </section>
        </div>

        {/* ── Footer Buttons ───────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--muted) 30%, transparent)',
          }}
        >
          {/* ── Inline requirement hint — only shown when Save is disabled ── */}
          {!canSave && (
            <div
              className="flex items-center gap-2 px-6 py-3"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--destructive) 15%, var(--border))' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--destructive)', flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ color: 'var(--destructive)', fontSize: 'var(--text-label)', margin: 0 }}>
                Required before saving:{' '}
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {missingFields.join(' and ')}
                </span>
              </p>
            </div>
          )}

          <div className="p-6 flex items-center justify-end gap-3">
            {/* Cancel */}
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-[var(--radius)] transition-all"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'var(--secondary)')
              }
            >
              Cancel
            </button>

            {/* Delete (only when editing an existing stage) */}
            {stage.isComplete && (
              <button
                onClick={() => onDelete(stage.id)}
                className="px-6 py-3 rounded-[var(--radius)] transition-all"
                style={{
                  border: '1px solid var(--destructive)',
                  background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                  color: 'var(--destructive)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--destructive)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--destructive-foreground)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'color-mix(in srgb, var(--destructive) 10%, transparent)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--destructive)';
                }}
              >
                Delete
              </button>
            )}

            {/* Save / Update */}
            <button
              onClick={() => canSave && onSave(formData)}
              disabled={!canSave}
              title={
                !canSave
                  ? `Required before saving: ${missingFields.join(' and ')}`
                  : undefined
              }
              className="px-6 py-3 rounded-[var(--radius)] transition-all"
              style={{
                background: canSave ? 'var(--primary)' : 'var(--muted)',
                color: canSave ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                boxShadow: canSave ? 'var(--elevation-sm)' : 'none',
                cursor: canSave ? 'pointer' : 'not-allowed',
                opacity: canSave ? 1 : 0.6,
              }}
              onMouseEnter={e => {
                if (canSave) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = canSave ? '1' : '0.6';
              }}
            >
              {stage.isComplete ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Escalator Modal */}
      {showEscalatorModal && (
        <EscalatorModal
          onClose={() => setShowEscalatorModal(false)}
          onApply={(data) => {
            setFormData(prev => ({
              ...prev,
              appliedEscalatorName: data.escalatorName,
              appliedPeriodName: data.periodName,
              appliedEscalationValueType: data.valueType,
              appliedEscalationRateValue: String(data.rateValue),
              appliedEscalationStartDate: data.startDate,
              appliedEscalatorType: data.escalatorType,
              appliedEscalationFrequency: data.escalationFrequency,
            }));
            setShowEscalatorModal(false);
          }}
        />
      )}


    </>
  );
}