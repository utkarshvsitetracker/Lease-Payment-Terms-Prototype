import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Link, CheckCircle2, AlertCircle, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import type { PaymentStage } from './LeasePaymentTerms';

const CARD_TYPE = 'STAGE_CARD';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface StageCardProps {
  stage: PaymentStage;
  index: number;
  allStages: PaymentStage[];
  onEdit: (stageId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (stageId: string) => void;
}

// Shared frequency helper
const FREQ_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, annually: 12 };

/** Derive the effective payment count from a stage, respecting date-range mode. */
function resolvePaymentCount(stage: PaymentStage): number {
  if (stage.usePaymentDateRange && stage.paymentStartDate && stage.paymentEndDate && stage.paymentFrequency) {
    const freqMonths = FREQ_MONTHS[stage.paymentFrequency] ?? 1;
    const start = new Date(stage.paymentStartDate);
    const end   = new Date(stage.paymentEndDate);
    const diffMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth()    - start.getMonth());
    return Math.max(1, Math.floor(diffMonths / freqMonths) + 1);
  }
  return parseInt(stage.numberOfPayments || '0', 10);
}

export function StageCard({ stage, index, allStages, onEdit, onMove, onDelete }: StageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Drag ─────────────────────────────────────────────────────────────────────
  const [{ isDragging }, drag, dragPreview] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: CARD_TYPE,
    item: { type: CARD_TYPE, id: stage.id, index },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  // ── Drop ─────────────────────────────────────────────────────────────────────
  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>({
    accept: CARD_TYPE,
    collect: monitor => ({ isOver: monitor.isOver() }),
    hover(item, monitor) {
      if (!cardRef.current) return;
      const dragIndex  = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverRect   = cardRef.current.getBoundingClientRect();
      const hoverMiddle = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClient = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClient < hoverMiddle) return;
      if (dragIndex > hoverIndex && hoverClient > hoverMiddle) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Connect drag preview to the card, drag handle to the grip icon
  dragPreview(drop(cardRef));

  // ── Payment summary ───────────────────────────────────────────────────────────
  const getPaymentSummary = () => {
    if (stage.isManualEntry && stage.manualPayments.length > 0) {
      const total = stage.manualPayments.reduce((sum, p) => {
        return sum + (parseFloat(p.paymentAmount.replace(/[$,]/g, '')) || 0);
      }, 0);
      return { count: stage.manualPayments.length, total: `$${total.toFixed(2)}`, type: 'manual' as const };
    }

    if (stage.usePaymentDateRange && stage.paymentStartDate && stage.paymentEndDate && stage.amount && stage.paymentFrequency) {
      const count  = resolvePaymentCount(stage);
      const amount = parseFloat(stage.amount.replace(/[$,]/g, '')) || 0;
      return {
        count,
        total: `$${(amount * count).toFixed(2)}`,
        type: 'recurring' as const,
        frequency: stage.paymentFrequency,
      };
    }

    if (stage.numberOfPayments && stage.amount) {
      const amount = parseFloat(stage.amount.replace(/[$,]/g, '')) || 0;
      const count  = parseInt(stage.numberOfPayments) || 0;
      return {
        count,
        total: `$${(amount * count).toFixed(2)}`,
        type: 'recurring' as const,
        frequency: stage.paymentFrequency,
      };
    }
    return null;
  };

  // ── Date range label ──────────────────────────────────────────────────────────
  const getDateRange = (): string | null => {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (stage.isManualEntry && stage.manualPayments.length > 0) {
      const dates = stage.manualPayments.map(p => p.paymentDueDate).filter(Boolean).sort();
      if (dates.length > 0) return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
    }

    if (stage.usePaymentDateRange && stage.paymentStartDate && stage.paymentEndDate) {
      return `${fmt(stage.paymentStartDate)} – ${fmt(stage.paymentEndDate)}`;
    }

    if (stage.firstPaymentDate && stage.numberOfPayments && stage.paymentFrequency) {
      const freqMonths = FREQ_MONTHS[stage.paymentFrequency] ?? 1;
      const n         = parseInt(stage.numberOfPayments) || 1;
      const first     = new Date(stage.firstPaymentDate);
      const last      = new Date(first);
      last.setMonth(last.getMonth() + (n - 1) * freqMonths);
      return `${fmt(stage.firstPaymentDate)} – ${fmt(last.toISOString().slice(0, 10))}`;
    }

    return null;
  };

  const hasDependency  = stage.dependsOnPreviousStage && stage.dependentStageId;
  const dependentStage = hasDependency ? allStages.find(s => s.id === stage.dependentStageId) : null;
  const dateRange      = getDateRange();
  const summary        = getPaymentSummary();
  const expandedCount  = resolvePaymentCount(stage);

  return (
    <div
      ref={cardRef}
      style={{
        opacity:        isDragging ? 0.4 : 1,
        background:     isOver ? 'color-mix(in srgb, var(--primary) 5%, var(--card))' : 'var(--card)',
        border:         isOver ? '1px solid var(--primary)' : '1px solid var(--border)',
        borderRadius:   'var(--radius)',
        boxShadow:      isDragging ? 'none' : 'var(--elevation-sm)',
        transition:     'opacity 0.15s, box-shadow 0.15s, border-color 0.15s',
        position:       'relative',
      }}
      className="group"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Drag handle */}
          <div
            ref={drag as unknown as React.RefObject<HTMLDivElement>}
            style={{
              cursor:     'grab',
              color:      'var(--muted-foreground)',
              paddingTop: 2,
              flexShrink: 0,
            }}
            title="Drag to reorder"
          >
            <GripVertical style={{ width: 16, height: 16 }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {stage.isComplete
                ? <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--primary)', flexShrink: 0 }} />
                : <AlertCircle  style={{ width: 14, height: 14, color: 'var(--muted-foreground)', flexShrink: 0 }} />}
              <h4 style={{ color: 'var(--foreground)', margin: 0 }} className="truncate">
                {stage.name || 'Unnamed Stage'}
              </h4>
            </div>

            {/* Payment type badge — Revenue Sharing */}
            {stage.typeOfPayment === 'revenue-sharing' && (
              <div className="flex items-center gap-1 mb-2">
                <div
                  style={{
                    display:      'inline-flex',
                    alignItems:   'center',
                    gap:          4,
                    padding:      '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background:   'color-mix(in srgb, var(--primary) 10%, transparent)',
                    border:       '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
                  }}
                >
                  {/* Dollar-sign icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: 'var(--primary)', flexShrink: 0 }}
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span
                    style={{
                      fontSize:   'var(--text-label)',
                      color:      'var(--primary)',
                      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Revenue Sharing
                  </span>
                </div>
              </div>
            )}

            {/* Dependency badge */}
            {hasDependency && dependentStage && (
              <div className="flex items-center gap-1 mb-2">
                <Link style={{ width: 12, height: 12, color: 'var(--muted-foreground)', flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-label)', color: 'var(--muted-foreground)' }} className="truncate">
                  Depends on: {dependentStage.name}
                </span>
              </div>
            )}

            {/* Payment summary chip — click to expand */}
            {stage.isComplete && summary && (
              <div
                onClick={e => { e.stopPropagation(); setIsExpanded(v => !v); }}
                style={{
                  background:   'color-mix(in srgb, var(--muted) 60%, transparent)',
                  borderRadius: 'var(--radius-sm)',
                  padding:      '8px 10px',
                  marginBottom: 6,
                  cursor:       'pointer',
                  border:       '1px solid var(--border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--muted) 60%, transparent)')}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', margin: '0 0 2px' }}>
                      {summary.count}{' '}
                      {summary.type === 'manual' ? 'Manual' : (summary.frequency ?? '')} Payment{summary.count !== 1 ? 's' : ''}
                    </p>
                    <p style={{ color: 'var(--primary)', fontSize: 'var(--text-label)', margin: 0 }}>
                      Total: {summary.total}
                    </p>
                  </div>
                  {isExpanded
                    ? <ChevronUp  style={{ width: 14, height: 14, color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    : <ChevronDown style={{ width: 14, height: 14, color: 'var(--muted-foreground)', flexShrink: 0 }} />}
                </div>
                {dateRange && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-label)', margin: '4px 0 0' }}>
                    {dateRange}
                  </p>
                )}
              </div>
            )}

            {/* Expanded breakdown table */}
            {isExpanded && stage.isComplete && (
              <div
                style={{
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow:     'hidden',
                  marginBottom: 6,
                }}
              >
                <div style={{ background: 'color-mix(in srgb, var(--muted) 50%, transparent)', padding: '6px 10px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 'var(--text-label)', color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                    Payment Breakdown
                  </span>
                </div>
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}>
                        {['Payment', 'Amount', 'Due Date'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '4px 8px', fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', borderBottom: '1px solid var(--border)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stage.isManualEntry ? (
                        stage.manualPayments.map(payment => (
                          <tr key={payment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '4px 8px', fontSize: 'var(--text-label)', color: 'var(--foreground)' }}>{payment.paymentName}</td>
                            <td style={{ padding: '4px 8px', fontSize: 'var(--text-label)', color: 'var(--foreground)' }}>{payment.paymentAmount}</td>
                            <td style={{ padding: '4px 8px', fontSize: 'var(--text-label)', color: 'var(--muted-foreground)' }}>
                              {payment.paymentDueDate
                                ? new Date(payment.paymentDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        // Use resolved count (works for both number-of-terms and date-range modes)
                        Array.from({ length: expandedCount }).map((_, idx) => {
                          const freqMonths   = FREQ_MONTHS[stage.paymentFrequency] ?? 1;
                          const baseDate     = stage.usePaymentDateRange && stage.paymentStartDate
                            ? new Date(stage.paymentStartDate)
                            : (stage.firstPaymentDate ? new Date(stage.firstPaymentDate) : null);
                          let dueDateStr = '—';
                          if (baseDate) {
                            const d = new Date(baseDate);
                            d.setMonth(d.getMonth() + idx * freqMonths);
                            dueDateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          }
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '4px 8px', fontSize: 'var(--text-label)', color: 'var(--foreground)' }}>Payment {idx + 1}</td>
                              <td style={{ padding: '4px 8px', fontSize: 'var(--text-label)', color: 'var(--foreground)' }}>{stage.amount || '—'}</td>
                              <td style={{ padding: '4px 8px', fontSize: 'var(--text-label)', color: 'var(--muted-foreground)' }}>{dueDateStr}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(stage.id)}
              style={{
                padding:      '4px 10px',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background:   'var(--card)',
                color:        'var(--primary)',
                cursor:       'pointer',
                fontSize:     'var(--text-label)',
                whiteSpace:   'nowrap',
                transition:   'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}
            >
              {stage.isComplete ? 'Edit' : 'Set Up'}
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                if (confirm(`Delete "${stage.name || 'this stage'}"?`)) onDelete(stage.id);
              }}
              style={{
                padding:      4,
                border:       'none',
                borderRadius: 'var(--radius-sm)',
                background:   'transparent',
                color:        'var(--destructive)',
                cursor:       'pointer',
                opacity:      0,
                transition:   'opacity 0.15s, background 0.15s',
              }}
              className="group-hover:opacity-100"
              title="Delete stage"
              onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--destructive) 10%, transparent)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
