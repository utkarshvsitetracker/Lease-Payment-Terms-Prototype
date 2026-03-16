import { useState } from 'react';
import { TrendingUp, Tag } from 'lucide-react';
import type { GeneratedPayment } from './LeasePaymentTerms';
import { DiscountModal, type DiscountApplyData } from './DiscountModal';

interface PaymentTableProps {
  payments: GeneratedPayment[];
  onApplyEscalator: () => void;
}

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

export function PaymentTable({ payments, onApplyEscalator }: PaymentTableProps) {
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const handleDiscountApply = (data: DiscountApplyData) => {
    // In production this would mutate the payments via a callback.
    // For now we log the data and close the modal.
    console.log('Discount applied:', data);
    setShowDiscountModal(false);
  };

  return (
    <>
      <div
        className="overflow-hidden rounded-[var(--radius)]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--muted) 50%, transparent)',
          }}
        >
          <h2 style={{ color: 'var(--foreground)' }}>Generated Payments</h2>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Apply Escalator */}
            <button
              onClick={onApplyEscalator}
              className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] transition-colors"
              style={{
                color:      'var(--primary-foreground)',
                background: 'var(--primary)',
                border:     'none',
                cursor:     'pointer',
                fontSize:   'var(--text-base)',
                fontFamily: FONT,
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Apply Escalator</span>
            </button>

            {/* Apply Discount */}
            <button
              onClick={() => setShowDiscountModal(true)}
              disabled={payments.length === 0}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '8px 16px',
                borderRadius: 'var(--radius)',
                border:       '1px solid var(--border)',
                background:   'var(--card)',
                color:        payments.length === 0 ? 'var(--muted-foreground)' : 'var(--foreground)',
                cursor:       payments.length === 0 ? 'not-allowed' : 'pointer',
                fontSize:     'var(--text-base)',
                fontFamily:   FONT,
                opacity:      payments.length === 0 ? 0.5 : 1,
                transition:   'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                if (payments.length > 0) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--card)';
              }}
            >
              <Tag style={{ width: 15, height: 15 }} />
              <span>Apply Discount</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Payment', 'Stage Name', 'Escalators Applied', 'Amount', 'Discount', 'Payment Due Date', 'Status', 'Payment Date'].map(col => (
                  <th
                    key={col}
                    className="text-left p-3"
                    style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-normal)', fontSize: 'var(--text-base)', fontFamily: FONT }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr
                  key={payment.id}
                  style={{
                    background: index % 2 === 0 ? 'var(--card)' : 'color-mix(in srgb, var(--muted) 15%, transparent)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <td className="p-3" style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>{payment.payment}</td>
                  <td className="p-3" style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>{payment.stageName}</td>
                  <td className="p-3" style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>{payment.escalatorsApplied || '—'}</td>
                  <td className="p-3" style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>{payment.amount}</td>
                  <td className="p-3" style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>
                    {payment.discount || '—'}
                  </td>
                  <td className="p-3" style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>{payment.paymentDueDate}</td>
                  <td className="p-3">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-[var(--radius-sm)]"
                      style={{
                        fontSize:   'var(--text-label)',
                        fontFamily: FONT,
                        background: 'color-mix(in srgb, var(--chart-4) 15%, transparent)',
                        color:      'var(--foreground)',
                        border:     '1px solid color-mix(in srgb, var(--chart-4) 35%, transparent)',
                      }}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-3" style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>{payment.paymentDate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <DiscountModal
          payments={payments}
          onClose={() => setShowDiscountModal(false)}
          onApply={handleDiscountApply}
        />
      )}
    </>
  );
}
