import React, { useState, useMemo } from 'react';
import { X, User, AlertCircle, CheckCircle2 } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SplitBeneficiary {
  id: string;
  name: string;
  role: string;
  email: string;
  percentage: string;
  included: boolean;
}

export interface SplitPaymentConfig {
  beneficiaries: SplitBeneficiary[];
}

// ─── Mock contacts (stand-ins for real Contact records) ────────────────────────

const MOCK_CONTACTS = [
  { id: 'c1', name: 'John Smith',       role: 'Property Owner',  email: 'john.smith@example.com'     },
  { id: 'c2', name: 'Sarah Johnson',    role: 'Co-Owner',        email: 'sarah.j@example.com'         },
  { id: 'c3', name: 'Michael Chen',     role: 'Partner',         email: 'm.chen@example.com'          },
  { id: 'c4', name: 'Emily Rodriguez',  role: 'Investor',        email: 'e.rodriguez@example.com'     },
  { id: 'c5', name: 'David Kim',        role: 'Stakeholder',     email: 'd.kim@example.com'           },
];

export const buildDefaultBeneficiaries = (): SplitBeneficiary[] =>
  MOCK_CONTACTS.map(c => ({ ...c, percentage: '', included: false }));

// ─── Styles ────────────────────────────────────────────────────────────────────

const FONT   = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";
const FONT_T = "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Component ─────────────────────────────────────────────────────────────────

interface SplitPaymentModalProps {
  config: SplitPaymentConfig;
  onSave: (config: SplitPaymentConfig) => void;
  onClose: () => void;
}

export function SplitPaymentModal({ config, onSave, onClose }: SplitPaymentModalProps) {
  const [rows, setRows] = useState<SplitBeneficiary[]>(
    config.beneficiaries.length > 0 ? config.beneficiaries : buildDefaultBeneficiaries()
  );

  const total = useMemo(() => {
    return rows
      .filter(r => r.included)
      .reduce((sum, r) => sum + (parseFloat(r.percentage) || 0), 0);
  }, [rows]);

  const includedCount = rows.filter(r => r.included).length;
  const isValid = includedCount > 0 && Math.abs(total - 100) < 0.01;

  const toggleIncluded = (id: string) => {
    setRows(prev => prev.map(r =>
      r.id === id ? { ...r, included: !r.included, percentage: !r.included ? r.percentage : '' } : r
    ));
  };

  const setPct = (id: string, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    setRows(prev => prev.map(r => r.id === id ? { ...r, percentage: value } : r));
  };

  const handleSave = () => {
    onSave({ beneficiaries: rows });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 201,
          width: 520,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontFamily: FONT, fontWeight: 600, fontSize: 16, color: 'var(--foreground)', margin: 0 }}>
              Split Payments
            </h3>
            <p style={{ fontFamily: FONT_T, fontSize: 12, color: 'var(--muted-foreground)', margin: '2px 0 0' }}>
              Assign payment percentages to beneficiaries. Total must equal 100%.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted-foreground)', padding: 4, borderRadius: 4,
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Beneficiary rows */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '28px 1fr 100px',
            gap: '0 12px',
            padding: '8px 20px',
            background: 'var(--muted)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div />
            <span style={{ fontFamily: FONT_T, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Beneficiary
            </span>
            <span style={{ fontFamily: FONT_T, fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>
              Split %
            </span>
          </div>

          {rows.map(row => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 100px',
                gap: '0 12px',
                alignItems: 'center',
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
                background: row.included ? 'color-mix(in srgb, var(--primary) 4%, var(--card))' : 'var(--card)',
                transition: 'background 0.15s',
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={row.included}
                onChange={() => toggleIncluded(row.id)}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
              />

              {/* Contact info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary)', color: 'var(--primary-foreground)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, fontFamily: FONT,
                }}>
                  {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.name}
                  </p>
                  <p style={{ fontFamily: FONT_T, fontSize: 11, color: 'var(--muted-foreground)', margin: 0 }}>
                    {row.role}
                  </p>
                </div>
              </div>

              {/* Percentage input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={row.percentage}
                  onChange={e => setPct(row.id, e.target.value)}
                  disabled={!row.included}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '6px 28px 6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: row.included ? 'var(--background)' : 'var(--muted)',
                    color: row.included ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontFamily: FONT_T,
                    fontSize: 13,
                    textAlign: 'right',
                    outline: 'none',
                    cursor: row.included ? 'text' : 'not-allowed',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  fontFamily: FONT_T, fontSize: 12, color: 'var(--muted-foreground)',
                  pointerEvents: 'none',
                }}>%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          background: 'var(--card)',
          gap: 12,
        }}>
          {/* Total indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {includedCount === 0 ? (
              <span style={{ fontFamily: FONT_T, fontSize: 12, color: 'var(--muted-foreground)' }}>
                Select beneficiaries to assign splits
              </span>
            ) : isValid ? (
              <>
                <CheckCircle2 size={15} color="var(--success, #16a34a)" />
                <span style={{ fontFamily: FONT_T, fontSize: 13, fontWeight: 600, color: 'var(--success, #16a34a)' }}>
                  100% — ready to save
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={15} color="var(--destructive, #dc2626)" />
                <span style={{ fontFamily: FONT_T, fontSize: 13, fontWeight: 600, color: 'var(--destructive, #dc2626)' }}>
                  Total: {total.toFixed(1)}% — must equal 100%
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                height: 34, padding: '0 16px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                background: 'var(--card)',
                color: 'var(--foreground)',
                fontFamily: FONT, fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              style={{
                height: 34, padding: '0 16px',
                border: 'none',
                borderRadius: 'var(--radius)',
                background: isValid ? 'var(--primary)' : 'var(--muted)',
                color: isValid ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                fontFamily: FONT, fontSize: 13, fontWeight: 500,
                cursor: isValid ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
            >
              Save Split
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
