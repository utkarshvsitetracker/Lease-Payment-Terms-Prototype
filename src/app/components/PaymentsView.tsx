import React, { useState, useMemo } from 'react';
import { Loader2, Table2, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import type { GeneratedPayment } from './LeasePaymentTerms';

interface PaymentsViewProps {
  payments: GeneratedPayment[];
  isGenerating: boolean;
  onGeneratePayments: () => void;
  onClearPayments: () => void;
  hasStages: boolean;
  onAcceptAndCreate: () => void;
}

type SortField = 'payment' | 'stageName' | 'amount' | 'paymentDueDate';
type SortDirection = 'asc' | 'desc';

export function PaymentsView({ payments, isGenerating, onGeneratePayments, onClearPayments, hasStages, onAcceptAndCreate }: PaymentsViewProps) {
  const [sortField, setSortField] = useState<SortField>('paymentDueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedPayments = useMemo(() => {
    const sorted = [...payments];

    sorted.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'paymentDueDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (sortField === 'amount') {
        aValue = parseFloat(aValue.replace(/[$,]/g, '')) || 0;
        bValue = parseFloat(bValue.replace(/[$,]/g, '')) || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [payments, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 text-primary" />
      : <ArrowDown className="w-4 h-4 text-primary" />;
  };

  if (payments.length === 0) {
    return (
      <div className="h-full bg-card border border-border rounded-[var(--radius)] flex items-center justify-center">
        <div className="text-center p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <Table2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-foreground mb-2">No Payments Generated</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Configure your payment stages on the left, then generate your payment schedule
          </p>
          <button
            onClick={onGeneratePayments}
            disabled={!hasStages || isGenerating}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-[var(--radius)] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-elevation-sm flex items-center gap-3 mx-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Payments...</span>
              </>
            ) : (
              'Generate and Preview Payments'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-card border border-border rounded-[var(--radius)] shadow-elevation-sm">

        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground mb-1">Generated Payments Preview</h2>
              <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                {filteredAndSortedPayments.length} payment{filteredAndSortedPayments.length !== 1 ? 's' : ''} · Review and accept to create
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClearPayments}
                className="px-4 py-2 border border-destructive bg-destructive/10 text-destructive rounded-[var(--radius)] hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center gap-2"
              >
                Clear Payments
              </button>
              <button
                onClick={onGeneratePayments}
                disabled={isGenerating}
                className="px-4 py-2 border border-border bg-secondary text-secondary-foreground rounded-[var(--radius)] hover:bg-muted transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  'Regenerate'
                )}
              </button>
              <button
                onClick={onAcceptAndCreate}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-[var(--radius)] hover:opacity-90 transition-all shadow-elevation-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept and Create All Payments</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        <div
          className="p-4"
          style={{
            borderBottom: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
          }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
            <div>
              <h4
                className="mb-1"
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: '14px',
                  fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Payment Schedule Generated
              </h4>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                Review the payment schedule below. To modify payments, edit the stages on the left
                and click &ldquo;Regenerate&rdquo;. When ready, click &ldquo;Accept and Create All Payments&rdquo; to finalize.
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-max w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {/* Payment Name */}
                <th
                  className="text-left p-4 text-foreground font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                  style={{ fontSize: '14px' }}
                  onClick={() => handleSort('payment')}
                >
                  <div className="flex items-center gap-2">
                    <span>Payment</span>
                    {getSortIcon('payment')}
                  </div>
                </th>
                {/* Stage Name */}
                <th
                  className="text-left p-4 text-foreground font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                  style={{ fontSize: '14px' }}
                  onClick={() => handleSort('stageName')}
                >
                  <div className="flex items-center gap-2">
                    <span>Stage Name</span>
                    {getSortIcon('stageName')}
                  </div>
                </th>
                {/* Due Date */}
                <th
                  className="text-left p-4 text-foreground font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                  style={{ fontSize: '14px' }}
                  onClick={() => handleSort('paymentDueDate')}
                >
                  <div className="flex items-center gap-2">
                    <span>Due Date</span>
                    {getSortIcon('paymentDueDate')}
                  </div>
                </th>
                {/* Base Amount */}
                <th className="text-left p-4 text-foreground font-medium" style={{ fontSize: '14px' }}>
                  Base Amount
                </th>
                {/* Escalator Applied */}
                <th className="text-left p-4 text-foreground font-medium" style={{ fontSize: '14px' }}>
                  Escalator Applied
                </th>
                {/* Escalation Applied */}
                <th className="text-left p-4 text-foreground font-medium" style={{ fontSize: '14px' }}>
                  Escalation Applied
                </th>
                {/* Final Amount */}
                <th
                  className="text-left p-4 text-foreground font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                  style={{ fontSize: '14px' }}
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-2">
                    <span>Final Amount</span>
                    {getSortIcon('amount')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPayments.map((payment, index) => {
                const isEscalated = !!payment.escalationRate;
                const hasRS = !!payment.revenueShareAmount;
                return (
                  <React.Fragment key={payment.id}>
                    <tr
                      className={`hover:bg-muted/30 transition-colors ${hasRS ? '' : 'border-b border-border'} ${index % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}
                      style={isEscalated ? { background: index % 2 === 0 ? 'color-mix(in srgb, var(--primary) 3%, var(--card))' : 'color-mix(in srgb, var(--primary) 5%, var(--muted))' } : {}}
                    >
                      {/* Payment Name */}
                      <td className="p-4 text-foreground" style={{ fontSize: '14px' }}>{payment.payment}</td>

                      {/* Stage Name */}
                      <td className="p-4 text-foreground" style={{ fontSize: '14px' }}>{payment.stageName}</td>

                      {/* Due Date */}
                      <td className="p-4 text-foreground" style={{ fontSize: '14px' }}>{payment.paymentDueDate}</td>

                      {/* Base Amount */}
                      <td className="p-4" style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
                        {payment.baseAmount}
                      </td>

                      {/* Escalator Applied (name) */}
                      <td className="p-4">
                        {payment.escalatorsApplied ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '1px 7px', borderRadius: 'var(--radius)',
                            fontSize: '14px',
                            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                            color: 'var(--primary)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}>
                            {payment.escalatorsApplied}
                          </span>
                        ) : (
                          <span className="text-muted-foreground" style={{ fontSize: '14px' }}>—</span>
                        )}
                      </td>

                      {/* Escalation Applied (rate) */}
                      <td className="p-4">
                        {payment.escalationRate ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '1px 7px', borderRadius: 'var(--radius)',
                            fontSize: '14px',
                            background: 'color-mix(in srgb, var(--chart-3) 10%, transparent)',
                            color: 'var(--chart-3)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}>
                            {payment.escalationRate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground" style={{ fontSize: '14px' }}>—</span>
                        )}
                      </td>

                      {/* Final Amount */}
                      <td
                        className="p-4"
                        style={{
                          fontSize: '14px',
                          color: isEscalated ? 'var(--primary)' : 'var(--foreground)',
                          fontWeight: isEscalated ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                        }}
                      >
                        {payment.amount}
                      </td>
                    </tr>

                    {/* Revenue Share sub-row */}
                    {hasRS && (
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--chart-3) 6%, var(--card))' }}>
                        <td style={{ padding: '5px 16px 5px 32px', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderLeft: '2px solid var(--chart-3)', paddingLeft: 8 }}>
                            <TrendingUp style={{ width: 11, height: 11, color: 'var(--chart-3)', flexShrink: 0 }} />
                            <span style={{ color: 'var(--foreground)', fontFamily: "'SF Pro Text', sans-serif", fontSize: '13px' }}>
                              Revenue Share
                            </span>
                            <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'color-mix(in srgb, var(--chart-3) 12%, transparent)', color: 'var(--chart-3)', border: '1px solid color-mix(in srgb, var(--chart-3) 22%, transparent)', fontFamily: "'SF Pro Text', sans-serif", whiteSpace: 'nowrap' }}>
                              Rev. Share
                            </span>
                          </div>
                          {payment.revenueShareBreakdown && (
                            <p style={{ margin: '2px 0 0', paddingLeft: 25, fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'SF Pro Text', sans-serif", whiteSpace: 'normal', maxWidth: 320 }}>
                              {payment.revenueShareBreakdown}
                            </p>
                          )}
                        </td>
                        {/* Stage Name */}
                        <td style={{ padding: '5px 16px', fontSize: '13px', color: 'var(--muted-foreground)', fontFamily: "'SF Pro Text', sans-serif" }}>
                          {payment.stageName}
                        </td>
                        {/* Due Date, Base Amount, Escalator Applied, Escalation Applied */}
                        <td colSpan={4} />
                        {/* Final Amount — revenue share amount */}
                        <td style={{ padding: '5px 16px', fontSize: '13px', color: 'var(--chart-3)', fontFamily: "'SF Pro Text', sans-serif", fontWeight: 600 }}>
                          {payment.revenueShareAmount}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
