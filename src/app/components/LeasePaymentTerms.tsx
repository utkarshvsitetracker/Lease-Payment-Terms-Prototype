import { useState } from 'react';
import { FileText, Percent, Edit2 } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { StagesList } from './StagesList';
import { StagePanel } from './StagePanel';
import { PaymentsView } from './PaymentsView';
import { ToastContainer, useToasts } from './ui/Toast';
import { checkMoveDependencyConflict } from './utils/dependencyUtils';
import { PaymentsLedger, type LedgerPayment, type PaymentStatus } from './PaymentsLedger';
import { SplitPaymentModal, buildDefaultBeneficiaries, type SplitPaymentConfig } from './SplitPaymentModal';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeasePaymentTermsProps {
  /** Term name to display in the embedded header. If absent, PageHeader is shown instead. */
  termName?: string;
  /** Accounting type label (e.g. "Payable") shown in the embedded header + summary banner. */
  accountingType?: string;
  /** Pre-loaded stages when editing an existing payment term. */
  initialStages?: PaymentStage[];
  /**
   * Called when the user clicks "← Payment Terms".
   * Receives the current stages so the parent can persist them.
   */
  onBack?: (currentStages: PaymentStage[]) => void;
  /**
   * Called when the user accepts and creates all payments.
   * Receives the generated payments and current stages.
   */
  onAcceptAndCreate?: (generatedPayments: GeneratedPayment[], currentStages: PaymentStage[]) => void;
}

// ─── Embedded header (used when rendered inside LeaseRecordPage) ──────────────

const FONT   = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";
const FONT_T = "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

function EmbeddedTermHeader({
  onBack,
}: { termName: string; accountingType: string; onBack: () => void }) {
  return (
    <div style={{
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      height: 48,
      flexShrink: 0,
    }}>
      {/* Back link only — no term name or accounting type */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: FONT_T, fontSize: 'var(--text-label)',
          color: 'var(--primary)', padding: 0, flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        ← Payment Terms
      </button>
    </div>
  );
}

// ─── Interactive Tabs ─────────────────────────────────────────────────────────
// Matches the Figma Tabs visual spec: active = bold + 2px primary underline,
// inactive = regular weight + 1px border underline. All colours via CSS vars.

type TabId = 'details' | 'critical-dates' | 'clauses' | 'payment-terms' | 'payments' | 'history';

const TAB_LIST: { id: TabId; label: string }[] = [
  { id: 'details',        label: 'Details'       },
  { id: 'critical-dates', label: 'Critical Dates' },
  { id: 'clauses',        label: 'Clauses'        },
  { id: 'payment-terms',  label: 'Payment Terms'  },
  { id: 'payments',       label: 'Payments'       },
  { id: 'history',        label: 'History'        },
];

function AppTabs({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div style={{
      width: '100%', height: 40, position: 'relative', flexShrink: 0,
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', height: 40 }}>
        {TAB_LIST.map(tab => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                height: 40, padding: '10px 12px',
                background: 'var(--card)',
                border: 'none',
                borderRadius: tab.id === TAB_LIST[0].id ? 'var(--radius) 0 0 0' : 0,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                position: 'relative',
                flexShrink: 0,
                fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 'var(--text-base)',
                fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                color: 'var(--foreground)',
                boxShadow: isActive
                  ? 'inset 0px -2px 0px 0px var(--primary)'
                  : 'inset 0px -1px 0px 0px var(--border)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface ManualPayment {
  id: string;
  paymentName: string;
  paymentDueDate: string;
  paymentAmount: string;
}

// ─── Revenue Share types ───────────────────────────────────────────────────────

export interface RevenueShareTenantRow {
  id: string;
  tenantId: string;
  tenantName: string;
  /** For structure B: the tenant's own rent. For structure C: the landlord's base rent. */
  tenantRent: number;
  sharePct: string;
}

export interface RevenueShareConfigData {
  structure:
    | 'total-tenant-revenue'
    | 'per-tenant-revenue'
    | 'per-tenant-base-rent'
    | '';
  /** Used by structure A only */
  totalSharePct: string;
  /** Used by structures B and C */
  tenantRows: RevenueShareTenantRow[];
  hasMinGuarantee: boolean;
  minGuaranteeAmount: string;
}

export const DEFAULT_REVENUE_SHARE_CONFIG: RevenueShareConfigData = {
  structure:          '',
  totalSharePct:      '',
  tenantRows:         [],
  hasMinGuarantee:    false,
  minGuaranteeAmount: '',
};

export interface PaymentStage {
  id: string;
  name: string;
  connectedLease: string;
  typeOfPayment: '' | 'recurring' | 'one-time' | 'revenue-sharing';
  isManualEntry: boolean;
  
  // Manual payment fields
  manualPayments: ManualPayment[];
  
  // Recurring payment fields
  amount: string;
  firstPaymentDate: string;
  paymentFrequency: string;
  recurringPaymentDate: string;
  /** Used when usePaymentDateRange is false */
  numberOfPayments: string;
  /** When true, derive payment count from paymentStartDate → paymentEndDate */
  usePaymentDateRange: boolean;
  paymentStartDate: string;
  paymentEndDate: string;
  endOfMonth: boolean;
  paymentTermsDateToBeginEscalation: string;
  proratedEscalations: boolean;

  // Escalation rule set (bounds + applied %)
  minEscalationPct: string;
  maxEscalationPct: string;
  escalationAppliedPct: string;

  // Applied escalator — populated when EscalatorModal Apply succeeds
  appliedEscalatorName: string;
  appliedPeriodName: string;
  appliedEscalationValueType: 'percentage' | 'amount';
  appliedEscalationRateValue: string; // e.g. "3.5" for 3.5% or "500" for $500
  appliedEscalationStartDate: string;
  appliedEscalatorType: 'one-time' | 'recurring';
  appliedEscalationFrequency: string; // 'monthly' | 'quarterly' | 'annually' | ''
  
  // Dependencies
  dependsOnPreviousStage: boolean;
  dependentStageId: string;
  daysBeforePaymentDue: string;
  additionalComments: string;

  // Revenue share add-on (only applicable when typeOfPayment === 'recurring')
  revenueShareEnabled: boolean;
  revenueShareConfig: RevenueShareConfigData;
  
  isComplete: boolean;
}

export interface GeneratedPayment {
  id: string;
  payment: string;
  stageName: string;
  escalatorsApplied: string;
  baseAmount: string;
  escalationRate: string;
  amount: string;
  discount: string;
  paymentDueDate: string;
  status: string;
  paymentDate: string;
  /** Present when the stage has revenueShareEnabled — the computed share for this period. */
  revenueShareAmount?: string;
  /** Human-readable breakdown of how the revenue share was computed. */
  revenueShareBreakdown?: string;
}

export function LeasePaymentTerms({
  termName = '',
  accountingType = '',
  initialStages,
  onBack,
  onAcceptAndCreate: onAcceptAndCreateProp,
}: LeasePaymentTermsProps = {}) {
  const [stages, setStages] = useState<PaymentStage[]>(initialStages ?? []);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [generatedPayments, setGeneratedPayments] = useState<GeneratedPayment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toasts, addToast, dismissToast } = useToasts();

  // ── Split payment state ─────────────────────────────────────────────────────
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitConfig, setSplitConfig] = useState<SplitPaymentConfig>({ beneficiaries: buildDefaultBeneficiaries() });
  const [splitApplied, setSplitApplied] = useState(false);

  const isPayable = accountingType?.toLowerCase() === 'payable';
  const hasRevenueSharing = stages.some(s => s.typeOfPayment === 'revenue-sharing');
  const showSplitSection = isPayable && !hasRevenueSharing;

  const activeSplits = splitConfig.beneficiaries.filter(b => b.included && parseFloat(b.percentage) > 0);

  const handleSaveSplit = (cfg: SplitPaymentConfig) => {
    setSplitConfig(cfg);
    setSplitApplied(true);
    setShowSplitModal(false);
  };

  // ── Tab & ledger state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('payment-terms');
  const [ledgerPayments, setLedgerPayments] = useState<LedgerPayment[]>([]);

  const handleAcceptAndCreate = () => {
    onAcceptAndCreateProp?.(generatedPayments, stages);
  };

  const handleAddStage = () => {
    const newStage: PaymentStage = {
      id: `stage-${Date.now()}`,
      name: '',
      connectedLease: 'lease-1',
      typeOfPayment: 'recurring',
      isManualEntry: false,
      manualPayments: [],
      amount: '',
      firstPaymentDate: '',
      paymentFrequency: '',
      recurringPaymentDate: '',
      numberOfPayments: '',
      usePaymentDateRange: false,
      paymentStartDate: '',
      paymentEndDate: '',
      endOfMonth: false,
      paymentTermsDateToBeginEscalation: '',
      proratedEscalations: false,
      minEscalationPct: '',
      maxEscalationPct: '',
      escalationAppliedPct: '',
      appliedEscalatorName: '',
      appliedPeriodName: '',
      appliedEscalationValueType: 'percentage',
      appliedEscalationRateValue: '',
      appliedEscalationStartDate: '',
      appliedEscalatorType: 'recurring',
      appliedEscalationFrequency: '',
      dependsOnPreviousStage: false,
      dependentStageId: '',
      daysBeforePaymentDue: '',
      additionalComments: '',
      revenueShareEnabled: false,
      revenueShareConfig: DEFAULT_REVENUE_SHARE_CONFIG,
      isComplete: false,
    };
    setStages([...stages, newStage]);
    setSelectedStageId(newStage.id);
    setIsPanelOpen(true);
  };

  const handleEditStage = (stageId: string) => {
    setSelectedStageId(stageId);
    setIsPanelOpen(true);
  };

  const handleSaveStage = (updatedStage: PaymentStage) => {
    setStages(stages.map(stage => 
      stage.id === updatedStage.id ? { ...updatedStage, isComplete: true } : stage
    ));
    setIsPanelOpen(false);
    setSelectedStageId(null);
    
    // Clear generated payments when stages are modified
    // User will need to regenerate
    if (generatedPayments.length > 0) {
      setGeneratedPayments([]);
    }
  };

  const handleDeleteStageFromList = (stageId: string) => {
    setStages(stages.filter(stage => stage.id !== stageId));
    
    // Clear generated payments if stages are deleted
    if (generatedPayments.length > 0) {
      setGeneratedPayments([]);
    }
  };

  const handleDeleteStageFromPanel = (stageId: string) => {
    setStages(stages.filter(stage => stage.id !== stageId));
    setIsPanelOpen(false);
    setSelectedStageId(null);
    
    // Clear generated payments if stages are deleted
    if (generatedPayments.length > 0) {
      setGeneratedPayments([]);
    }
  };

  const handleCancelEdit = () => {
    // If the stage was never completed (new stage), remove it
    if (selectedStageId) {
      const stage = stages.find(s => s.id === selectedStageId);
      if (stage && !stage.isComplete) {
        setStages(stages.filter(s => s.id !== selectedStageId));
      }
    }
    setIsPanelOpen(false);
    setSelectedStageId(null);
  };

  const handleMoveStage = (dragIndex: number, hoverIndex: number) => {
    // Check for dependency conflicts before allowing the move
    const conflict = checkMoveDependencyConflict(stages, dragIndex, hoverIndex);
    if (conflict) {
      addToast(conflict, 'warning');
      return; // block the move
    }

    const newStages = [...stages];
    const [movedStage] = newStages.splice(dragIndex, 1);
    newStages.splice(hoverIndex, 0, movedStage);
    setStages(newStages);
    
    // Clear generated payments when stage order changes
    if (generatedPayments.length > 0) {
      setGeneratedPayments([]);
    }
  };

  const handleGeneratePayments = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const payments: GeneratedPayment[] = [];

      // ── Frequency helpers ──────────────────────────────────────────────────
      const FREQ_MONTHS: Record<string, number> = {
        monthly: 1, quarterly: 3, annually: 12,
      };

      /** Advance a Date by N months, snapping day to end-of-month or recurringPaymentDate. */
      const advanceDate = (base: Date, monthsOffset: number, eom: boolean, dayStr: string): Date => {
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
      };

      /** Returns the escalated amount and a display label for a single payment occurrence. */
      const computeEscalation = (
        stage: PaymentStage,
        paymentDate: Date,
        baseAmt: number,
      ): { finalAmount: number; escalLabel: string; hasEscal: boolean } => {
        const hasApplied =
          !!stage.appliedEscalationRateValue && !!stage.appliedEscalationStartDate;
        if (!hasApplied) return { finalAmount: baseAmt, escalLabel: '', hasEscal: false };

        // Effective start = later of appliedStart and LPT begin-escalation date
        const appliedStart = new Date(stage.appliedEscalationStartDate);
        const lptStart = stage.paymentTermsDateToBeginEscalation
          ? new Date(stage.paymentTermsDateToBeginEscalation)
          : null;
        const effectiveStart = lptStart && lptStart > appliedStart ? lptStart : appliedStart;
        if (paymentDate < effectiveStart) return { finalAmount: baseAmt, escalLabel: '', hasEscal: false };

        const appliedPctFactor = parseFloat(stage.escalationAppliedPct || '100') / 100;
        const minPct = parseFloat(stage.minEscalationPct || '0');
        const maxPct = parseFloat(stage.maxEscalationPct || '0');
        const rawRate = parseFloat(stage.appliedEscalationRateValue || '0');

        if (stage.appliedEscalationValueType === 'percentage') {
          let effectiveRate = (rawRate / 100) * appliedPctFactor;
          if (minPct > 0) effectiveRate = Math.max(effectiveRate, minPct / 100);
          if (maxPct > 0) effectiveRate = Math.min(effectiveRate, maxPct / 100);

          if (stage.appliedEscalatorType === 'one-time') {
            return {
              finalAmount: baseAmt * (1 + effectiveRate),
              escalLabel: `+${(effectiveRate * 100).toFixed(2)}%`,
              hasEscal: true,
            };
          } else {
            // Recurring: compound per escalation interval elapsed
            const escalFreqMonths = FREQ_MONTHS[stage.appliedEscalationFrequency || 'annually'] ?? 12;
            const totalMonthsElapsed =
              (paymentDate.getFullYear() - effectiveStart.getFullYear()) * 12 +
              (paymentDate.getMonth() - effectiveStart.getMonth());
            const periods = Math.max(1, Math.floor(totalMonthsElapsed / escalFreqMonths) + 1);
            return {
              finalAmount: baseAmt * Math.pow(1 + effectiveRate, periods),
              escalLabel: `+${(effectiveRate * 100).toFixed(2)}% ×${periods}`,
              hasEscal: true,
            };
          }
        } else {
          // Flat dollar escalation
          const escalAmt = rawRate * appliedPctFactor;
          return { finalAmount: baseAmt + escalAmt, escalLabel: `+$${escalAmt.toFixed(2)}`, hasEscal: true };
        }
      };

      stages.forEach((stage) => {
        // ── Manual entry ─────────────────────────────────────────────────────
        if (stage.isManualEntry && stage.manualPayments.length > 0) {
          stage.manualPayments.forEach((mp) => {
            const baseAmt = parseFloat(mp.paymentAmount.replace(/[$,]/g, '')) || 0;
            const { finalAmount, escalLabel, hasEscal } = computeEscalation(
              stage,
              mp.paymentDueDate ? new Date(mp.paymentDueDate) : new Date(),
              baseAmt,
            );
            payments.push({
              id: `${stage.id}-${mp.id}`,
              payment: mp.paymentName,
              stageName: stage.name,
              escalatorsApplied: hasEscal ? stage.appliedEscalatorName : '',
              baseAmount: `$${baseAmt.toFixed(2)}`,
              escalationRate: escalLabel,
              amount: `$${finalAmount.toFixed(2)}`,
              discount: '$0.00',
              paymentDueDate: mp.paymentDueDate,
              status: 'Pending',
              paymentDate: '',
            });
          });
          return;
        }

        // ── Recurring / non-manual ────────────────────────────────────────────────
        if (!stage.firstPaymentDate) return;

        const rawBaseAmt = parseFloat(stage.amount.replace(/[$,]/g, '')) || 0;
        let baseAmt = rawBaseAmt;

        // ── Revenue-sharing: compute effective amount (base rent + revenue share) ──
        if (stage.typeOfPayment === 'revenue-sharing') {
          const cfg = stage.revenueShareConfig ?? DEFAULT_REVENUE_SHARE_CONFIG;
          // Total of all active tenant rents (matches MOCK_AVAILABLE_TENANTS in RevenueSharePanel)
          const TOTAL_TENANT_REV = 51_450;
          let revenueShare = 0;

          if (cfg.structure === 'total-tenant-revenue') {
            revenueShare =
              TOTAL_TENANT_REV * ((parseFloat(cfg.totalSharePct) || 0) / 100);
          } else if (
            cfg.structure === 'per-tenant-revenue' ||
            cfg.structure === 'per-tenant-base-rent'
          ) {
            cfg.tenantRows.forEach(row => {
              const pct    = parseFloat(row.sharePct) || 0;
              const source =
                cfg.structure === 'per-tenant-base-rent'
                  ? rawBaseAmt
                  : row.tenantRent;
              revenueShare += source * (pct / 100);
            });
          }

          let total = rawBaseAmt + revenueShare;
          if (cfg.hasMinGuarantee) {
            const minGuarantee =
              parseFloat(cfg.minGuaranteeAmount.replace(/[$,]/g, '')) || 0;
            total = Math.max(total, minGuarantee);
          }
          baseAmt = total;
        }

        const freqMonths = FREQ_MONTHS[stage.paymentFrequency] ?? 1;
        const firstDate = new Date(stage.firstPaymentDate);

        // ── Resolve number of payments ────────────────────────────────────────
        let numPayments: number;
        if (stage.usePaymentDateRange && stage.paymentStartDate && stage.paymentEndDate) {
          const start = new Date(stage.paymentStartDate);
          const end   = new Date(stage.paymentEndDate);
          const diffMonths =
            (end.getFullYear()  - start.getFullYear())  * 12 +
            (end.getMonth()     - start.getMonth());
          numPayments = Math.max(1, Math.floor(diffMonths / freqMonths) + 1);
        } else {
          numPayments = parseInt(stage.numberOfPayments || '1', 10);
        }
        if (isNaN(numPayments) || numPayments < 1) return;

        // ── Revenue share add-on computation (recurring + revenueShareEnabled) ─
        let rsAmount: string | undefined;
        let rsBreakdown: string | undefined;

        if (stage.typeOfPayment === 'recurring' && stage.revenueShareEnabled) {
          const cfg = stage.revenueShareConfig ?? DEFAULT_REVENUE_SHARE_CONFIG;
          const TOTAL_TENANT_REV = 51_450;
          let revenueShare = 0;
          const breakdownParts: string[] = [];

          if (cfg.structure === 'total-tenant-revenue') {
            const pct = parseFloat(cfg.totalSharePct) || 0;
            revenueShare = TOTAL_TENANT_REV * (pct / 100);
            breakdownParts.push(`${pct}% of total tenant revenue ($${TOTAL_TENANT_REV.toLocaleString()})`);
          } else if (cfg.structure === 'per-tenant-revenue' || cfg.structure === 'per-tenant-base-rent') {
            cfg.tenantRows.forEach(row => {
              const pct = parseFloat(row.sharePct) || 0;
              const source = cfg.structure === 'per-tenant-base-rent' ? rawBaseAmt : row.tenantRent;
              revenueShare += source * (pct / 100);
              breakdownParts.push(`${row.tenantName}: ${pct}%`);
            });
          }

          if (cfg.hasMinGuarantee) {
            const minG = parseFloat(cfg.minGuaranteeAmount.replace(/[$,]/g, '')) || 0;
            revenueShare = Math.max(revenueShare, minG);
            breakdownParts.push(`Min. guarantee: $${minG.toFixed(2)}`);
          }

          rsAmount = `$${revenueShare.toFixed(2)}`;
          rsBreakdown = breakdownParts.length > 0 ? breakdownParts.join(' · ') : 'Revenue share';
        }

        for (let i = 0; i < numPayments; i++) {
          const paymentDate = advanceDate(
            firstDate, i * freqMonths, stage.endOfMonth, stage.recurringPaymentDate,
          );
          const { finalAmount, escalLabel, hasEscal } = computeEscalation(stage, paymentDate, baseAmt);
          payments.push({
            id: `${stage.id}-payment-${i}`,
            payment: `${stage.name} – Payment ${i + 1}`,
            stageName: stage.name,
            escalatorsApplied: hasEscal ? stage.appliedEscalatorName : '',
            baseAmount: `$${baseAmt.toFixed(2)}`,
            escalationRate: escalLabel,
            amount: `$${finalAmount.toFixed(2)}`,
            discount: '$0.00',
            paymentDueDate: paymentDate.toISOString().slice(0, 10),
            status: 'Pending',
            paymentDate: '',
            revenueShareAmount: rsAmount,
            revenueShareBreakdown: rsBreakdown,
          });
        }
      });

      // ── Split payment expansion ────────────────────────────────────────────
      // When split payments are configured, each payment row becomes N rows —
      // one per beneficiary — with the amount proportionally divided.
      const currentActiveSplits = splitConfig.beneficiaries.filter(
        b => b.included && parseFloat(b.percentage) > 0
      );
      const finalPayments: GeneratedPayment[] =
        splitApplied && currentActiveSplits.length > 0
          ? payments.flatMap(p => {
              const baseAmt  = parseFloat(p.baseAmount.replace(/[$,]/g, '')) || 0;
              const finalAmt = parseFloat(p.amount.replace(/[$,]/g, ''))     || 0;
              return currentActiveSplits.map(b => {
                const pct    = parseFloat(b.percentage) / 100;
                return {
                  ...p,
                  id:          `${p.id}-split-${b.id}`,
                  payment:     `${p.payment} — ${b.name}`,
                  baseAmount:  `$${(baseAmt  * pct).toFixed(2)}`,
                  amount:      `$${(finalAmt * pct).toFixed(2)}`,
                  stageName:   `${p.stageName} (${b.percentage}% · ${b.name})`,
                };
              });
            })
          : payments;

      setGeneratedPayments(finalPayments);
      setIsGenerating(false);
    }, 1800);
  };

  const handleClearPayments = () => {
    setGeneratedPayments([]);
  };

  const selectedStage = selectedStageId ? stages.find(s => s.id === selectedStageId) : null;

  // ── Split Payments sidebar section ─────────────────────────────────────────
  const SplitPaymentsSection = showSplitSection ? (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>

      {splitApplied && activeSplits.length > 0 ? (
        /* ── Applied summary card ── */
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--primary) 5%, var(--card))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Percent size={14} color="var(--primary)" />
              <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>
                Split Payments Applied
              </span>
            </div>
            <button
              onClick={() => setShowSplitModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', padding: '3px 8px',
                fontFamily: FONT_T, fontSize: 11, color: 'var(--muted-foreground)',
              }}
            >
              <Edit2 size={11} />
              Edit
            </button>
          </div>

          {/* Beneficiary rows */}
          <div style={{ padding: '6px 0' }}>
            {activeSplits.map(b => (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--primary)', color: 'var(--primary-foreground)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, fontFamily: FONT, flexShrink: 0,
                  }}>
                    {b.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: 'var(--foreground)', margin: 0 }}>
                      {b.name}
                    </p>
                    <p style={{ fontFamily: FONT_T, fontSize: 11, color: 'var(--muted-foreground)', margin: 0 }}>
                      {b.role}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontFamily: FONT, fontSize: 13, fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                }}>
                  {b.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Add Split Payments button ── */
        <button
          onClick={() => setShowSplitModal(true)}
          disabled={isPanelOpen}
          style={{
            width: '100%',
            border: '2px dashed var(--border)',
            background: 'var(--card)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: isPanelOpen ? 'not-allowed' : 'pointer',
            opacity: isPanelOpen ? 0.5 : 1,
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { if (!isPanelOpen) { e.currentTarget.style.background = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <Percent size={15} color="var(--muted-foreground)" />
          <span style={{ fontFamily: FONT_T, fontSize: 13, color: 'var(--muted-foreground)' }}>
            Add Split Payments
          </span>
        </button>
      )}
    </div>
  ) : null;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Global toast layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Split Payment Modal */}
      {showSplitModal && (
        <SplitPaymentModal
          config={splitConfig}
          onSave={handleSaveSplit}
          onClose={() => setShowSplitModal(false)}
        />
      )}

      {/* Header — embedded back button or standalone PageHeader */}
      {onBack ? (
        <EmbeddedTermHeader
          termName={termName}
          accountingType={accountingType}
          onBack={() => onBack(stages)}
        />
      ) : (
        <PageHeader />
      )}

      {/* ── Embedded mode: go straight to the builder, no tabs ── */}
      {onBack ? (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Overlay backdrop when panel is open */}
          {isPanelOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={(e) => e.preventDefault()}
            />
          )}

          <div className={`p-4 transition-opacity duration-200 ${isPanelOpen ? 'pointer-events-none opacity-50' : ''}`}>
            {/* Left Sidebar - Stages */}
            <div
              style={{
                width: isSidebarCollapsed ? 40 : 600,
                transition: 'width 0.25s ease',
                overflow: 'hidden',
                height: '100%',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {/* Collapse toggle — only visible once payments are generated */}
              {generatedPayments.length > 0 && (
                <button
                  onClick={() => setIsSidebarCollapsed(v => !v)}
                  title={isSidebarCollapsed ? 'Expand stages panel' : 'Collapse stages panel'}
                  style={{
                    position: 'absolute', top: 0, right: 0, zIndex: 10,
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--primary)', color: 'var(--primary-foreground)',
                    border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                    style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                    <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              {isSidebarCollapsed ? (
                <div style={{ width: 40, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', fontSize: '14px', color: 'var(--muted-foreground)', letterSpacing: '0.04em', userSelect: 'none', fontFamily: FONT }}>Stages</span>
                </div>
              ) : (
                <div className="w-[600px] h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <StagesList
                      stages={stages}
                      onAddStage={handleAddStage}
                      onEditStage={handleEditStage}
                      onMoveStage={handleMoveStage}
                      onDeleteStage={handleDeleteStageFromList}
                      isPanelOpen={isPanelOpen}
                    />
                  </div>
                  {SplitPaymentsSection && (
                    <div style={{ flexShrink: 0, paddingTop: 4 }}>
                      {SplitPaymentsSection}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 p-4 transition-opacity duration-200 ${isPanelOpen ? 'pointer-events-none opacity-50' : ''}`}>
            <PaymentsView
              payments={generatedPayments}
              isGenerating={isGenerating}
              onGeneratePayments={handleGeneratePayments}
              onClearPayments={handleClearPayments}
              hasStages={stages.length > 0}
              onAcceptAndCreate={handleAcceptAndCreate}
            />
          </div>

          {/* Right Hand Side Panel */}
          {isPanelOpen && selectedStage && (
            <StagePanel
              stage={selectedStage}
              allStages={stages}
              generatedPayments={generatedPayments}
              onSave={handleSaveStage}
              onDelete={handleDeleteStageFromPanel}
              onCancel={handleCancelEdit}
            />
          )}
        </div>
      ) : (
        /* ── Standalone mode: full tab navigation ── */
        <>
          <AppTabs active={activeTab} onChange={setActiveTab} />

          {/* Payments tab — ledger view */}
          {activeTab === 'payments' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 16px', flexShrink: 0, background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ color: 'var(--foreground)', margin: 0 }}>Payment Ledger</h4>
                  <p style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontFamily: FONT, marginTop: 2 }}>Track payments, record actuals, manage amendments</p>
                </div>
                <button onClick={() => setActiveTab('payment-terms')} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer', fontSize: 'var(--text-label)', fontFamily: FONT }}>
                  ← Back to Payment Terms
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', padding: 16, overflowY: 'auto' }}>
                {ledgerPayments.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <div style={{ textAlign: 'center', padding: 48 }}>
                      <p style={{ color: 'var(--muted-foreground)', fontFamily: FONT, fontSize: 'var(--text-base)', marginBottom: 12 }}>No payments have been created yet.</p>
                      <button onClick={() => setActiveTab('payment-terms')} style={{ padding: '8px 20px', border: 'none', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'var(--primary-foreground)', cursor: 'pointer', fontSize: 'var(--text-base)', fontFamily: FONT }}>
                        Go to Payment Terms to generate &amp; accept payments
                      </button>
                    </div>
                  </div>
                ) : (
                  <PaymentsLedger payments={ledgerPayments} onUpdatePayments={setLedgerPayments} />
                )}
              </div>
            </div>
          )}

          {/* Payment Terms tab — setup + preview */}
          {activeTab === 'payment-terms' && (
            <div className="flex flex-1 overflow-hidden relative">
              {isPanelOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={(e) => e.preventDefault()} />}
              <div className={`p-4 transition-opacity duration-200 ${isPanelOpen ? 'pointer-events-none opacity-50' : ''}`}>
                <div style={{ width: isSidebarCollapsed ? 40 : 600, transition: 'width 0.25s ease', overflow: 'hidden', height: '100%', position: 'relative', flexShrink: 0 }}>
                  {generatedPayments.length > 0 && (
                    <button onClick={() => setIsSidebarCollapsed(v => !v)} style={{ position: 'absolute', top: 0, right: 0, zIndex: 10, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                        <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                  {isSidebarCollapsed ? (
                    <div style={{ width: 40, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                      <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '14px', color: 'var(--muted-foreground)', fontFamily: FONT }}>Stages</span>
                    </div>
                  ) : (
                    <div className="w-[600px] h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <StagesList stages={stages} onAddStage={handleAddStage} onEditStage={handleEditStage} onMoveStage={handleMoveStage} onDeleteStage={handleDeleteStageFromList} isPanelOpen={isPanelOpen} />
                      </div>
                      {SplitPaymentsSection && (
                        <div style={{ flexShrink: 0, paddingTop: 4 }}>
                          {SplitPaymentsSection}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className={`flex-1 p-4 transition-opacity duration-200 ${isPanelOpen ? 'pointer-events-none opacity-50' : ''}`}>
                <PaymentsView payments={generatedPayments} isGenerating={isGenerating} onGeneratePayments={handleGeneratePayments} onClearPayments={handleClearPayments} hasStages={stages.length > 0} onAcceptAndCreate={handleAcceptAndCreate} />
              </div>
              {isPanelOpen && selectedStage && <StagePanel stage={selectedStage} allStages={stages} generatedPayments={generatedPayments} onSave={handleSaveStage} onDelete={handleDeleteStageFromPanel} onCancel={handleCancelEdit} />}
            </div>
          )}

          {/* Placeholder tabs */}
          {(activeTab === 'details' || activeTab === 'critical-dates' || activeTab === 'clauses' || activeTab === 'history') && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)' }}>
              <p style={{ color: 'var(--muted-foreground)', fontFamily: FONT, fontSize: 'var(--text-base)' }}>
                {TAB_LIST.find(t => t.id === activeTab)?.label} — coming soon
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}