import { useState } from 'react';
import { X, ChevronLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProgressStepper } from './escalator/ProgressStepper';
import { Step1Escalator } from './escalator/Step1Escalator';
import { Step2Period } from './escalator/Step2Period';
import { Step3Rules } from './escalator/Step3Rules';
import { Step4Review } from './escalator/Step4Review';
import type { ModalState } from './escalator/types';
import { MOCK_REVIEW_PAYMENTS } from './escalator/mockData';

interface EscalatorModalProps {
  onClose: () => void;
  onApply?: (data: {
    escalatorName: string;
    periodName: string;
    valueType: 'percentage' | 'amount';
    rateValue: number;
    startDate: string;
    escalatorType: 'one-time' | 'recurring';
    escalationFrequency: string;
  }) => void;
}

const INITIAL_STATE: ModalState = {
  escalatorMode: null,
  selectedEscalator: null,
  newEscalator: {
    name: '',
    type: 'recurring',
    frequency: '',
    interval: '',
    numberOfEscalations: '',
    useEscalationDateRange: false,
    escalationRangeStartDate: '',
    escalationRangeEndDate: '',
    considerLPTRuleset: false,
  },
  periodMode: 'existing',
  selectedPeriod: null,
  newPeriod: {
    name: '',
    escalationType: 'percentage',
    amount: '',
    rate: '',
    startDate: '',
    endDate: '',
    minPct: '',
    minAmt: '',
    maxPct: '',
    maxAmt: '',
  },
  ruleset: {
    boundType: 'percentage',
    pctApplied: '',
    minPct: '',
    minAmt: '',
    maxPct: '',
    maxAmt: '',
    reason: '',
  },
};

type ApplyStatus = 'idle' | 'loading' | 'success' | 'error';

/** Shared button styles */
const btnSecondary: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--secondary)',
  color: 'var(--secondary-foreground)',
  cursor: 'pointer',
  transition: 'background 0.15s',
};
const btnPrimary: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 'var(--radius)',
  border: 'none',
  background: 'var(--primary)',
  color: 'var(--primary-foreground)',
  cursor: 'pointer',
  boxShadow: 'var(--elevation-sm)',
  transition: 'opacity 0.15s',
};
const btnDestructive: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--destructive)',
  background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
  color: 'var(--destructive)',
  cursor: 'pointer',
};

export function EscalatorModal({ onClose, onApply }: EscalatorModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [state, setState] = useState<ModalState>(INITIAL_STATE);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const patch = (p: Partial<ModalState>) => setState(prev => ({ ...prev, ...p }));

  // ─── Validation per step ──────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1) {
      if (state.escalatorMode === 'select') return !!state.selectedEscalator;
      if (state.escalatorMode === 'new') return !!state.newEscalator.name.trim();
      return false;
    }
    if (step === 2) {
      if (state.periodMode === 'existing') return !!state.selectedPeriod;
      return !!state.newPeriod.name.trim() && !!state.newPeriod.startDate;
    }
    return true;
  };

  const next = () => {
    if (step < 4) setStep((step + 1) as 1 | 2 | 3 | 4);
  };
  const back = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4);
  };

  // ─── Apply escalation ────────────────────────────────────────────────────
  const handleApply = () => {
    setApplyStatus('loading');
    // Simulate async call
    setTimeout(() => {
      const success = Math.random() > 0.15; // 85% success for demo
      if (success) {
        setApplyStatus('success');

        // Derive escalation data from modal state
        const { escalatorMode, selectedEscalator, newEscalator, periodMode, selectedPeriod, newPeriod, ruleset } = state;
        const escalatorName = escalatorMode === 'select' ? (selectedEscalator?.name ?? '') : newEscalator.name;
        const escalatorType: 'one-time' | 'recurring' =
          escalatorMode === 'select'
            ? (selectedEscalator?.type ?? 'recurring')
            : newEscalator.type;
        const escalationFrequency =
          escalatorMode === 'select'
            ? (selectedEscalator?.frequency ?? '')
            : newEscalator.frequency;
        const periodName = periodMode === 'existing' ? (selectedPeriod?.name ?? '') : newPeriod.name;
        const valueType: 'percentage' | 'amount' =
          periodMode === 'existing'
            ? (selectedPeriod?.escalationType ?? 'percentage')
            : newPeriod.escalationType;
        const startDate =
          periodMode === 'existing' ? (selectedPeriod?.startDate ?? '') : newPeriod.startDate;
        // Parse the raw rate/amount value
        const rawStr =
          periodMode === 'existing'
            ? (selectedPeriod?.rateOrAmount ?? '0').replace(/[^0-9.]/g, '')
            : valueType === 'percentage'
            ? newPeriod.rate
            : newPeriod.amount;
        const rateValue = parseFloat(rawStr || '0');

        if (onApply) {
          onApply({
            escalatorName,
            periodName,
            valueType,
            rateValue,
            startDate,
            escalatorType,
            escalationFrequency: escalationFrequency || '',
          });
        }

        setTimeout(() => onClose(), 2000);
      } else {
        setApplyStatus('error');
        setErrorMsg('An unexpected error occurred while applying the escalation. Please try again.');
      }
    }, 2200);
  };

  const pendingCount = MOCK_REVIEW_PAYMENTS.filter(p => p.status === 'Pending').length;
  const catchupCount = MOCK_REVIEW_PAYMENTS.filter(p => p.status === 'Paid').length;
  const totalAffected = pendingCount + catchupCount;

  const stepLabels: Record<number, string> = {
    1: 'Select or Create Escalator',
    2: 'Select or Create Period',
    3: 'Rules, Reason & Summary',
    4: 'Review & Apply',
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
        onClick={() => setShowCancelConfirm(true)}
      />

      {/* Modal shell */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-6"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="flex flex-col w-full rounded-[var(--radius-lg)]"
          style={{
            maxWidth: 900,
            maxHeight: '92vh',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            pointerEvents: 'auto',
          }}
        >
          {/* ── Modal header ─────────────────────────────────────────────────── */}
          <div
            className="px-6 pt-5 pb-4 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {/* Top row: title + close */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 style={{ color: 'var(--foreground)', margin: 0 }}>Apply Escalator</h3>
                <p style={{ color: 'var(--muted-foreground)', marginTop: 2 }}>
                  Step {step} of 4 — {stepLabels[step]}
                </p>
              </div>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="p-2 rounded-[var(--radius)] transition-colors"
                style={{ color: 'var(--muted-foreground)', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)';
                }}
                aria-label="Close modal"
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Progress stepper */}
            <ProgressStepper currentStep={step} />
          </div>

          {/* ── Scrollable content ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {step === 1 && <Step1Escalator state={state} onChange={patch} />}
            {step === 2 && <Step2Period state={state} onChange={patch} />}
            {step === 3 && <Step3Rules state={state} onChange={patch} />}
            {step === 4 && <Step4Review state={state} />}
          </div>

          {/* ── Error banner ─────────────────────────────────────────────────── */}
          {applyStatus === 'error' && (
            <div
              className="flex items-start gap-3 mx-6 mb-2 px-4 py-3 rounded-[var(--radius)]"
              style={{ background: 'color-mix(in srgb, var(--destructive) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--destructive) 25%, transparent)' }}
            >
              <AlertCircle style={{ width: 16, height: 16, color: 'var(--destructive)', flexShrink: 0, marginTop: 1 }} />
              <div className="flex-1">
                <span style={{ color: 'var(--destructive)', fontWeight: 'var(--font-weight-medium)' }}>
                  Escalation failed —{' '}
                </span>
                <span style={{ color: 'var(--destructive)' }}>{errorMsg}</span>
              </div>
              <button
                onClick={handleApply}
                style={{ color: 'var(--destructive)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 px-6 py-4 flex items-center"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'color-mix(in srgb, var(--muted) 35%, transparent)',
            }}
          >
            {/* Left: Back + Cancel */}
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={back}
                  className="flex items-center gap-1"
                  style={btnSecondary}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--secondary)')}
                >
                  <ChevronLeft style={{ width: 14, height: 14 }} />
                  Back
                </button>
              )}
              <button
                onClick={() => setShowCancelConfirm(true)}
                style={btnDestructive}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--destructive)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--destructive-foreground)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--destructive) 8%, transparent)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--destructive)';
                }}
              >
                Cancel
              </button>
            </div>

            {/* Center: payment count chip (step 4 only) */}
            {step === 4 && (
              <div className="flex-1 flex justify-center">
                <span
                  style={{
                    padding: '4px 14px',
                    borderRadius: 999,
                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    color: 'var(--primary)',
                    fontSize: 'var(--text-label)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  {totalAffected} payment{totalAffected !== 1 ? 's' : ''} will be updated
                </span>
              </div>
            )}

            {/* Spacer when not step 4 */}
            {step !== 4 && <div className="flex-1" />}

            {/* Right: Next / Apply */}
            {step < 4 ? (
              <button
                onClick={next}
                disabled={!canProceed()}
                style={{
                  ...btnPrimary,
                  opacity: canProceed() ? 1 : 0.45,
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={e => {
                  if (canProceed()) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
                }}
                onMouseLeave={e => {
                  if (canProceed()) (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                }}
              >
                {step === 3 ? 'Next — Review' : 'Save & Next'}
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={applyStatus === 'loading' || applyStatus === 'success'}
                className="flex items-center gap-2"
                style={{
                  ...btnPrimary,
                  opacity: applyStatus === 'loading' || applyStatus === 'success' ? 0.7 : 1,
                  cursor: applyStatus === 'loading' ? 'wait' : 'pointer',
                  minWidth: 180,
                  justifyContent: 'center',
                }}
              >
                {applyStatus === 'loading' && (
                  <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                )}
                {applyStatus === 'success' && (
                  <CheckCircle2 style={{ width: 15, height: 15 }} />
                )}
                {applyStatus === 'loading'
                  ? 'Applying...'
                  : applyStatus === 'success'
                  ? 'Applied!'
                  : 'Apply Escalation'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading overlay (step 4 applying) ─────────────────────────────────── */}
      {applyStatus === 'loading' && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
        >
          <div
            className="flex flex-col items-center gap-4 p-8 rounded-[var(--radius-lg)]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 280 }}
          >
            <Loader2
              style={{ width: 36, height: 36, color: 'var(--primary)', animation: 'spin 1s linear infinite' }}
            />
            <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
              Applying escalation to payments...
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0, textAlign: 'center' }}>
              Creating transactions and updating lease payment records.
            </p>
          </div>
        </div>
      )}

      {/* ── Success overlay ────────────────────────────────────────────────────── */}
      {applyStatus === 'success' && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
        >
          <div
            className="flex flex-col items-center gap-4 p-8 rounded-[var(--radius-lg)]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 300 }}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CheckCircle2 style={{ width: 28, height: 28, color: 'var(--primary)' }} />
            </div>
            <h4 style={{ color: 'var(--foreground)', margin: 0 }}>Escalation Applied Successfully</h4>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: 0, textAlign: 'center' }}>
              Lease payment records have been updated. The page will refresh shortly.
            </p>
          </div>
        </div>
      )}

      {/* ── Cancel confirmation dialog ─────────────────────────────────────────── */}
      {showCancelConfirm && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowCancelConfirm(false)}
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="rounded-[var(--radius-lg)] overflow-hidden"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
                maxWidth: 420,
                width: '100%',
                pointerEvents: 'auto',
              }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h4 style={{ color: 'var(--foreground)', margin: 0 }}>Cancel Escalator Setup?</h4>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 4 }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-5">
                <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
                  All progress across all steps will be lost. Are you sure you want to cancel?
                </p>
              </div>

              {/* Footer */}
              <div
                className="px-5 py-4 flex justify-end gap-2"
                style={{ borderTop: '1px solid var(--border)', background: 'color-mix(in srgb, var(--muted) 35%, transparent)' }}
              >
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  style={btnSecondary}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--secondary)')}
                >
                  Keep editing
                </button>
                <button
                  onClick={onClose}
                  style={btnDestructive}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--destructive)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--destructive-foreground)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--destructive) 8%, transparent)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--destructive)';
                  }}
                >
                  Yes, cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}