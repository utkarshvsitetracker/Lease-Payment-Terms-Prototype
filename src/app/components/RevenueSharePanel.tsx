import type { CSSProperties } from 'react';
import { AlertTriangle, ChevronDown, X } from 'lucide-react';
import type { RevenueShareConfigData, RevenueShareTenantRow } from './LeasePaymentTerms';

// ─── Mock tenant data ─────────────────────────────────────────────────────────
// In production, replace with an API call or prop fetching active tenants for
// this lease from Sitetracker (e.g. GET /api/leases/:id/tenants).
export const MOCK_AVAILABLE_TENANTS: {
  id: string;
  name: string;
  monthlyRent: number;
}[] = [
  { id: 't1', name: 'RetailCo (Unit 101)',     monthlyRent: 8_500  },
  { id: 't2', name: 'OfficeHub (Suite 200)',   monthlyRent: 12_000 },
  { id: 't3', name: 'TechStart (Floor 3)',     monthlyRent: 6_750  },
  { id: 't4', name: 'MediCare (Suite 405)',    monthlyRent: 9_200  },
  { id: 't5', name: 'FoodCourt (Retail B)',    monthlyRent: 15_000 },
];

const TOTAL_TENANT_REVENUE = MOCK_AVAILABLE_TENANTS.reduce(
  (sum, t) => sum + t.monthlyRent,
  0,
); // 51 450

// ─── Shared style helpers ─────────────────────────────────────────────────────
const FONT   = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";
const FONT_T = "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

const pctInput: CSSProperties = {
  flex: 1,
  padding: '6px 0 6px 8px',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--foreground)',
  fontSize: 'var(--text-base)',
  fontFamily: FONT,
  minWidth: 0,
};

const suffixSpan: CSSProperties = {
  padding: '0 8px',
  color: 'var(--muted-foreground)',
  fontSize: 'var(--text-base)',
  fontFamily: FONT,
  userSelect: 'none',
  flexShrink: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const cleanPct = (raw: string) =>
  raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./, '$1');

const cleanAmt = (raw: string) =>
  raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./, '$1');

// ─── Props ────────────────────────────────────────────────────────────────────
interface RevenueSharePanelProps {
  /** The base rent amount string from the stage (e.g. "5000") */
  baseRent: string;
  config: RevenueShareConfigData;
  onChange: (config: RevenueShareConfigData) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RevenueSharePanel({
  baseRent,
  config,
  onChange,
}: RevenueSharePanelProps) {
  const update = (partial: Partial<RevenueShareConfigData>) =>
    onChange({ ...config, ...partial });

  // ── Structure change: resets rows + totalSharePct; keeps min-guarantee ───
  const handleStructureChange = (
    structure: RevenueShareConfigData['structure'],
  ) => {
    onChange({
      ...config,
      structure,
      totalSharePct: '',
      tenantRows: [],
    });
  };

  // ── Tenant row management ─────────────────────────────────────────────────
  const addedIds = config.tenantRows.map(r => r.tenantId);
  const availableTenants = MOCK_AVAILABLE_TENANTS.filter(
    t => !addedIds.includes(t.id),
  );

  const addTenantRow = (tenantId: string) => {
    const tenant = MOCK_AVAILABLE_TENANTS.find(t => t.id === tenantId);
    if (!tenant) return;
    const baseNum = parseFloat(baseRent.replace(/[$,]/g, '')) || 0;
    const row: RevenueShareTenantRow = {
      id:         `row-${Date.now()}`,
      tenantId:   tenant.id,
      tenantName: tenant.name,
      // For "per-tenant-base-rent" the source is always the base rent amount
      tenantRent:
        config.structure === 'per-tenant-base-rent'
          ? baseNum
          : tenant.monthlyRent,
      sharePct: '',
    };
    update({ tenantRows: [...config.tenantRows, row] });
  };

  const removeRow = (id: string) =>
    update({ tenantRows: config.tenantRows.filter(r => r.id !== id) });

  const updateRowPct = (id: string, raw: string) =>
    update({
      tenantRows: config.tenantRows.map(r =>
        r.id === id ? { ...r, sharePct: cleanPct(raw) } : r,
      ),
    });

  // ── Live calculation ──────────────────────────────────────────────────────
  const baseNum = parseFloat(baseRent.replace(/[$,]/g, '')) || 0;
  let revenueShare = 0;
  const tenantBreakdowns: { name: string; share: number }[] = [];

  if (config.structure === 'total-tenant-revenue') {
    const pct = parseFloat(config.totalSharePct) || 0;
    revenueShare = TOTAL_TENANT_REVENUE * (pct / 100);
  } else if (
    config.structure === 'per-tenant-revenue' ||
    config.structure === 'per-tenant-base-rent'
  ) {
    config.tenantRows.forEach(row => {
      const pct    = parseFloat(row.sharePct) || 0;
      const source =
        config.structure === 'per-tenant-base-rent'
          ? baseNum
          : row.tenantRent;
      const share = source * (pct / 100);
      revenueShare += share;
      tenantBreakdowns.push({ name: row.tenantName, share });
    });
  }

  let totalPayment = baseNum + revenueShare;
  const minGuaranteeNum =
    parseFloat(config.minGuaranteeAmount.replace(/[$,]/g, '')) || 0;
  if (config.hasMinGuarantee && minGuaranteeNum > 0) {
    totalPayment = Math.max(totalPayment, minGuaranteeNum);
  }

  // ── Percentage validation (B / C only) ───────────────────────────────────
  const totalPct = config.tenantRows.reduce(
    (s, r) => s + (parseFloat(r.sharePct) || 0),
    0,
  );
  const showPctWarning =
    (config.structure === 'per-tenant-revenue' ||
      config.structure === 'per-tenant-base-rent') &&
    totalPct > 100;

  // ── Segmented control options ─────────────────────────────────────────────
  const structures: {
    key: RevenueShareConfigData['structure'];
    label: string;
    desc: string;
  }[] = [
    {
      key:   'total-tenant-revenue',
      label: '% of Total Tenant Revenue',
      desc:  'One % applied to the combined rent of all active tenants',
    },
    {
      key:   'per-tenant-revenue',
      label: '% of Individual Tenant Revenue',
      desc:  'Each tenant contributes a % of their own rent',
    },
    {
      key:   'per-tenant-base-rent',
      label: '% of Base Rent per Tenant',
      desc:  'Each tenant contributes a % of the landlord\'s base rent',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Divider + header */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
          {/* Revenue-share icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }}
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <div>
            <h4 style={{ color: 'var(--foreground)', margin: 0 }}>
              Revenue Share Configuration
            </h4>
            <p
              style={{
                color:      'var(--muted-foreground)',
                fontSize:   'var(--text-label)',
                fontFamily: FONT,
                marginTop:  4,
                marginBottom: 0,
              }}
            >
              Define how the revenue share component is calculated and added on
              top of the base rent.
            </p>
          </div>
        </div>
      </div>

      {/* ── Structure selector ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          style={{
            display:    'block',
            color:      'var(--foreground)',
            fontFamily: FONT_T,
            fontSize:   'var(--text-label)',
          }}
        >
          Revenue Share Type{' '}
          <span style={{ color: 'var(--destructive)' }}>*</span>
        </label>

        {/* Three-option segmented control */}
        <div
          style={{
            display:      'flex',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow:     'hidden',
          }}
        >
          {structures.map((s, i) => {
            const isActive = config.structure === s.key;
            return (
              <button
                key={s.key}
                onClick={() => handleStructureChange(s.key)}
                style={{
                  flex:        1,
                  padding:     '9px 10px',
                  border:      'none',
                  borderLeft:  i > 0 ? '1px solid var(--border)' : 'none',
                  background:  isActive ? 'var(--primary)' : 'var(--card)',
                  color:       isActive ? 'var(--primary-foreground)' : 'var(--foreground)',
                  cursor:      'pointer',
                  fontSize:    'var(--text-label)',
                  fontFamily:  FONT,
                  lineHeight:  1.4,
                  textAlign:   'center',
                  transition:  'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'color-mix(in srgb, var(--muted) 60%, transparent)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'var(--card)';
                  }
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Active structure description */}
        {config.structure && (
          <p
            style={{
              color:      'var(--muted-foreground)',
              fontSize:   'var(--text-label)',
              fontFamily: FONT,
              margin:     0,
            }}
          >
            {structures.find(s => s.key === config.structure)?.desc}
          </p>
        )}
      </div>

      {/* ── Structure A ─────────────────────────────────────────────────────── */}
      {config.structure === 'total-tenant-revenue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Revenue Share % input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                display:    'block',
                color:      'var(--foreground)',
                fontFamily: FONT_T,
                fontSize:   'var(--text-label)',
              }}
            >
              Revenue Share %
            </label>
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                background:   'var(--input-background)',
                overflow:     'hidden',
              }}
              onFocusCapture={e =>
                ((e.currentTarget as HTMLDivElement).style.outline =
                  '2px solid var(--ring)')
              }
              onBlurCapture={e =>
                ((e.currentTarget as HTMLDivElement).style.outline = 'none')
              }
            >
              <input
                type="text"
                inputMode="decimal"
                value={config.totalSharePct}
                onChange={e => update({ totalSharePct: cleanPct(e.target.value) })}
                placeholder="0.00"
                style={{
                  ...pctInput,
                  padding: '11px 0 11px 12px',
                }}
              />
              <span style={{ ...suffixSpan, padding: '0 12px 0 4px' }}>%</span>
            </div>
          </div>

          {/* Tenant revenue info box */}
          <div
            style={{
              borderRadius: 'var(--radius)',
              border:       '1px solid var(--border)',
              overflow:     'hidden',
            }}
          >
            <div
              style={{
                padding:         '7px 12px',
                background:      'var(--muted)',
                borderBottom:    '1px solid var(--border)',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'space-between',
              }}
            >
              <label
                style={{
                  color:      'var(--foreground)',
                  fontFamily: FONT_T,
                  fontSize:   'var(--text-label)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Active Tenant Rents
              </label>
              <span
                style={{
                  fontSize:   'var(--text-label)',
                  fontFamily: FONT,
                  color:      'var(--muted-foreground)',
                }}
              >
                Source data — from lease
              </span>
            </div>
            <div style={{ background: 'var(--card)' }}>
              {MOCK_AVAILABLE_TENANTS.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    display:         'flex',
                    justifyContent:  'space-between',
                    padding:         '6px 12px',
                    borderBottom:
                      i < MOCK_AVAILABLE_TENANTS.length - 1
                        ? '1px solid var(--border)'
                        : 'none',
                  }}
                >
                  <span
                    style={{
                      color:      'var(--foreground)',
                      fontSize:   'var(--text-label)',
                      fontFamily: FONT,
                    }}
                  >
                    {t.name}
                  </span>
                  <span
                    style={{
                      color:      'var(--muted-foreground)',
                      fontSize:   'var(--text-label)',
                      fontFamily: FONT,
                    }}
                  >
                    {fmt(t.monthlyRent)}/mo
                  </span>
                </div>
              ))}
              {/* Total row */}
              <div
                style={{
                  display:         'flex',
                  justifyContent:  'space-between',
                  padding:         '7px 12px',
                  borderTop:       '1px solid var(--border)',
                  background:      'color-mix(in srgb, var(--muted) 50%, transparent)',
                }}
              >
                <span
                  style={{
                    color:      'var(--foreground)',
                    fontSize:   'var(--text-label)',
                    fontFamily: FONT_T,
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  Total Tenant Revenue
                </span>
                <span
                  style={{
                    color:      'var(--foreground)',
                    fontSize:   'var(--text-label)',
                    fontFamily: FONT,
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  {fmt(TOTAL_TENANT_REVENUE)}/mo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Structure B / C — per-tenant table ──────────────────────────────── */}
      {(config.structure === 'per-tenant-revenue' ||
        config.structure === 'per-tenant-base-rent') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* % warning */}
          {showPctWarning && (
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          8,
                padding:      '8px 12px',
                borderRadius: 'var(--radius)',
                background:   'color-mix(in srgb, var(--chart-4) 12%, transparent)',
                border:       '1px solid color-mix(in srgb, var(--chart-4) 35%, transparent)',
              }}
            >
              <AlertTriangle
                style={{ width: 13, height: 13, color: 'var(--chart-4)', flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize:   'var(--text-label)',
                  fontFamily: FONT,
                  color:      'var(--foreground)',
                }}
              >
                Total percentage across tenants exceeds 100%&nbsp;(
                {totalPct.toFixed(1)}%)
              </span>
            </div>
          )}

          {/* Tenant table */}
          {config.tenantRows.length > 0 && (
            <div
              style={{
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow:     'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display:           'grid',
                  gridTemplateColumns: '2fr 1.5fr 100px 32px',
                  gap:               12,
                  padding:           '8px 12px',
                  background:        'var(--muted)',
                  borderBottom:      '1px solid var(--border)',
                  alignItems:        'center',
                }}
              >
                <label
                  style={{
                    color:      'var(--foreground)',
                    fontFamily: FONT_T,
                    fontSize:   'var(--text-label)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  Tenant
                </label>
                <label
                  style={{
                    color:      'var(--foreground)',
                    fontFamily: FONT_T,
                    fontSize:   'var(--text-label)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  {config.structure === 'per-tenant-revenue'
                    ? 'Their Rent'
                    : 'Base Rent (Source)'}
                </label>
                <label
                  style={{
                    color:      'var(--foreground)',
                    fontFamily: FONT_T,
                    fontSize:   'var(--text-label)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  Share %
                </label>
                <div />
              </div>

              {/* Rows */}
              {config.tenantRows.map((row, i) => (
                <div
                  key={row.id}
                  style={{
                    display:           'grid',
                    gridTemplateColumns: '2fr 1.5fr 100px 32px',
                    gap:               12,
                    padding:           '8px 12px',
                    borderBottom:
                      i < config.tenantRows.length - 1
                        ? '1px solid var(--border)'
                        : 'none',
                    alignItems: 'center',
                    background: 'var(--card)',
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      'color-mix(in srgb, var(--muted) 40%, transparent)')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      'var(--card)')
                  }
                >
                  {/* Tenant name */}
                  <span
                    style={{
                      color:        'var(--foreground)',
                      fontSize:     'var(--text-base)',
                      fontFamily:   FONT,
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                    }}
                  >
                    {row.tenantName}
                  </span>

                  {/* Rent (read-only) */}
                  <span
                    style={{
                      color:      'var(--muted-foreground)',
                      fontSize:   'var(--text-base)',
                      fontFamily: FONT,
                    }}
                  >
                    {fmt(row.tenantRent)}/mo
                  </span>

                  {/* Share % input */}
                  <div
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      border:       '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      background:   'var(--input-background)',
                      overflow:     'hidden',
                    }}
                    onFocusCapture={e =>
                      ((e.currentTarget as HTMLDivElement).style.outline =
                        '2px solid var(--ring)')
                    }
                    onBlurCapture={e =>
                      ((e.currentTarget as HTMLDivElement).style.outline = 'none')
                    }
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.sharePct}
                      onChange={e => updateRowPct(row.id, e.target.value)}
                      placeholder="0"
                      style={pctInput}
                    />
                    <span style={suffixSpan}>%</span>
                  </div>

                  {/* Remove row */}
                  <button
                    onClick={() => removeRow(row.id)}
                    title="Remove tenant"
                    style={{
                      width:          28,
                      height:         28,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      background:     'transparent',
                      border:         'none',
                      cursor:         'pointer',
                      color:          'var(--muted-foreground)',
                      borderRadius:   'var(--radius-sm)',
                      flexShrink:     0,
                      transition:     'color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        'var(--destructive)';
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'color-mix(in srgb, var(--destructive) 10%, transparent)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        'var(--muted-foreground)';
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'transparent';
                    }}
                  >
                    <X style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add tenant dropdown */}
          {availableTenants.length > 0 ? (
            <div style={{ position: 'relative' }}>
              <select
                value=""
                onChange={e => {
                  if (e.target.value) addTenantRow(e.target.value);
                }}
                style={{
                  width:        '100%',
                  appearance:   'none',
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background:   'var(--input-background)',
                  padding:      '9px 36px 9px 12px',
                  color:        'var(--foreground)',
                  fontSize:     'var(--text-base)',
                  fontFamily:   FONT,
                  cursor:       'pointer',
                }}
              >
                <option value="">+ Add tenant from lease…</option>
                {availableTenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {fmt(t.monthlyRent)}/mo
                  </option>
                ))}
              </select>
              <ChevronDown
                style={{
                  position:       'absolute',
                  right:          12,
                  top:            '50%',
                  transform:      'translateY(-50%)',
                  width:          14,
                  height:         14,
                  color:          'var(--muted-foreground)',
                  pointerEvents:  'none',
                }}
              />
            </div>
          ) : (
            config.tenantRows.length > 0 && (
              <p
                style={{
                  color:      'var(--muted-foreground)',
                  fontSize:   'var(--text-label)',
                  fontFamily: FONT,
                  margin:     0,
                }}
              >
                All available tenants have been added.
              </p>
            )
          )}

          {config.tenantRows.length === 0 && availableTenants.length > 0 && (
            <p
              style={{
                color:      'var(--muted-foreground)',
                fontSize:   'var(--text-label)',
                fontFamily: FONT,
                margin:     0,
                padding:    '8px 0',
              }}
            >
              No tenants added yet. Use the dropdown above to add a tenant row.
            </p>
          )}
        </div>
      )}

      {/* ── Minimum Guarantee (all structures once one is selected) ─────────── */}
      {config.structure && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Toggle row */}
          <div
            style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'space-between',
              padding:         '12px 14px',
              borderRadius:    'var(--radius)',
              background:      'color-mix(in srgb, var(--muted) 35%, transparent)',
              border:          '1px solid var(--border)',
            }}
          >
            <div>
              <p
                style={{
                  margin:     0,
                  color:      'var(--foreground)',
                  fontFamily: FONT_T,
                  fontSize:   'var(--text-label)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 3,
                }}
              >
                Minimum Guarantee
              </p>
              <p
                style={{
                  margin:     0,
                  color:      'var(--muted-foreground)',
                  fontSize:   'var(--text-label)',
                  fontFamily: FONT,
                }}
              >
                Total landlord payment will never fall below this amount
              </p>
            </div>

            {/* Toggle switch */}
            <label
              style={{
                position:   'relative',
                display:    'inline-flex',
                alignItems: 'center',
                cursor:     'pointer',
                flexShrink: 0,
                marginLeft: 16,
              }}
            >
              <input
                type="checkbox"
                checked={config.hasMinGuarantee}
                onChange={e => update({ hasMinGuarantee: e.target.checked })}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <div
                style={{
                  width:        36,
                  height:       20,
                  borderRadius: 999,
                  background:   config.hasMinGuarantee
                    ? 'var(--primary)'
                    : 'var(--border)',
                  position:   'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position:     'absolute',
                    top:          2,
                    left:         2,
                    width:        16,
                    height:       16,
                    background:   'white',
                    borderRadius: '50%',
                    boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
                    transition:   'transform 0.2s',
                    transform:    config.hasMinGuarantee
                      ? 'translateX(16px)'
                      : 'translateX(0)',
                  }}
                />
              </div>
            </label>
          </div>

          {/* Minimum guarantee amount field */}
          {config.hasMinGuarantee && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label
                style={{
                  display:    'block',
                  color:      'var(--foreground)',
                  fontFamily: FONT_T,
                  fontSize:   'var(--text-label)',
                }}
              >
                Minimum Guarantee Amount
              </label>
              <div
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background:   'var(--input-background)',
                  overflow:     'hidden',
                }}
                onFocusCapture={e =>
                  ((e.currentTarget as HTMLDivElement).style.outline =
                    '2px solid var(--ring)')
                }
                onBlurCapture={e =>
                  ((e.currentTarget as HTMLDivElement).style.outline = 'none')
                }
              >
                <span
                  style={{
                    padding:    '0 4px 0 12px',
                    color:      config.minGuaranteeAmount
                      ? 'var(--foreground)'
                      : 'var(--muted-foreground)',
                    fontSize:   'var(--text-base)',
                    fontFamily: FONT,
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                >
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={config.minGuaranteeAmount}
                  onChange={e =>
                    update({ minGuaranteeAmount: cleanAmt(e.target.value) })
                  }
                  placeholder="0.00"
                  style={{
                    flex:       1,
                    padding:    '11px 12px 11px 0',
                    background: 'transparent',
                    border:     'none',
                    outline:    'none',
                    color:      'var(--foreground)',
                    fontSize:   'var(--text-base)',
                    fontFamily: FONT,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Live Payment Preview ─────────────────────────────────────────────── */}
      {config.structure && (
        <div
          style={{
            borderRadius: 'var(--radius)',
            border:       '1px solid var(--border)',
            overflow:     'hidden',
          }}
        >
          {/* Preview header */}
          <div
            style={{
              padding:      '9px 14px',
              background:   'color-mix(in srgb, var(--muted) 60%, transparent)',
              borderBottom: '1px solid var(--border)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'space-between',
            }}
          >
            <label
              style={{
                color:      'var(--foreground)',
                fontFamily: FONT_T,
                fontSize:   'var(--text-label)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Payment Preview
            </label>
            <span
              style={{
                fontSize:   'var(--text-label)',
                fontFamily: FONT,
                color:      'var(--muted-foreground)',
              }}
            >
              Live — updates as you type
            </span>
          </div>

          {/* Preview body */}
          <div
            style={{
              padding:       '12px 14px',
              background:    'var(--card)',
              display:       'flex',
              flexDirection: 'column',
              gap:           8,
            }}
          >
            {/* Base Rent */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>
                Base Rent
              </span>
              <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>
                {fmt(baseNum)}
              </span>
            </div>

            {/* Revenue Share row (and tenant breakdowns) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>
                  Revenue Share
                  {config.structure === 'total-tenant-revenue' && config.totalSharePct
                    ? ` (${config.totalSharePct}% of ${fmt(TOTAL_TENANT_REVENUE)})`
                    : ''}
                </span>
                <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: FONT }}>
                  +{fmt(revenueShare)}
                </span>
              </div>

              {/* Per-tenant sub-rows */}
              {tenantBreakdowns.map((tb, i) => (
                <div
                  key={i}
                  style={{
                    display:         'flex',
                    justifyContent:  'space-between',
                    alignItems:      'baseline',
                    paddingLeft:     16,
                  }}
                >
                  <span
                    style={{
                      color:      'var(--muted-foreground)',
                      fontSize:   'var(--text-label)',
                      fontFamily: FONT,
                    }}
                  >
                    ↳ {tb.name}
                  </span>
                  <span
                    style={{
                      color:      'var(--muted-foreground)',
                      fontSize:   'var(--text-label)',
                      fontFamily: FONT,
                    }}
                  >
                    +{fmt(tb.share)}
                  </span>
                </div>
              ))}
            </div>

            {/* Min guarantee row */}
            {config.hasMinGuarantee && minGuaranteeNum > 0 && (
              <div
                style={{
                  display:         'flex',
                  justifyContent:  'space-between',
                  alignItems:      'baseline',
                }}
              >
                <span
                  style={{
                    color:      'var(--muted-foreground)',
                    fontSize:   'var(--text-base)',
                    fontFamily: FONT,
                  }}
                >
                  Min. Guarantee Floor
                </span>
                <span
                  style={{
                    color:      'var(--foreground)',
                    fontSize:   'var(--text-base)',
                    fontFamily: FONT,
                  }}
                >
                  {fmt(minGuaranteeNum)}
                </span>
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 4 }} />

            {/* Total */}
            <div
              style={{
                display:         'flex',
                justifyContent:  'space-between',
                alignItems:      'baseline',
              }}
            >
              <span
                style={{
                  color:      'var(--foreground)',
                  fontSize:   'var(--text-base)',
                  fontFamily: FONT_T,
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Total Landlord Payment
              </span>
              <span
                style={{
                  color:      'var(--primary)',
                  fontSize:   'var(--text-base)',
                  fontFamily: FONT_T,
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {fmt(totalPayment)}
              </span>
            </div>

            {/* Min-guarantee notice */}
            {config.hasMinGuarantee &&
              minGuaranteeNum > 0 &&
              baseNum + revenueShare < minGuaranteeNum && (
                <p
                  style={{
                    margin:     0,
                    color:      'var(--muted-foreground)',
                    fontSize:   'var(--text-label)',
                    fontFamily: FONT,
                    fontStyle:  'italic',
                  }}
                >
                  Minimum guarantee applied — calculated total was{' '}
                  {fmt(baseNum + revenueShare)}.
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}