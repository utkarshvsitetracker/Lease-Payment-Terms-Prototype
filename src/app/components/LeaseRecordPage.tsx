import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import svgPaths from '../../imports/svg-d9xqjv4uhe';
import { ChevronDown, ChevronRight, X, FileText, Upload, Trash2, Pencil } from 'lucide-react';
import { LeasePaymentTerms, type GeneratedPayment, type PaymentStage } from './LeasePaymentTerms';
import { PaymentsLedger, type LedgerPayment, type PaymentStatus, type ChildPayment } from './PaymentsLedger';
import { EmptyState } from './EmptyState';

// ─── Font constants ────────────────────────────────────────────────────────────
const SF  = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";
const SFT = "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Global chrome ─────────────────────────────────────────────────────────────

function SiteTrackerLogo() {
  return (
    <svg width="200" height="18" fill="none" viewBox="0 0 200 17.7365">
      <path d={svgPaths.p3d058dc0} fill="#22333B" />
      <path d={svgPaths.p141f7100} fill="#22333B" />
      <path d={svgPaths.p234cf900} fill="#22333B" />
      <path d={svgPaths.p2c003d00} fill="#22333B" />
      <path d={svgPaths.pbb21c80}  fill="#22333B" />
      <path d={svgPaths.p1d69f100} fill="#22333B" />
      <path d={svgPaths.p5fe2420}  fill="#22333B" />
      <path d={svgPaths.p28ee6380} fill="#798488" />
      <path d={svgPaths.pfc19f00}  fill="#22333B" />
      <path d={svgPaths.p39527a80} fill="#22333B" />
      <path d={svgPaths.p2e708230} fill="#22333B" />
      <path d={svgPaths.pd44a980}  fill="#22333B" />
      <path d={svgPaths.p84d7a00}  fill="#22333B" />
    </svg>
  );
}

function GlobalHeader() {
  return (
    <div style={{ height: 48, background: '#fff', borderBottom: '1px solid #E5E4E3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, zIndex: 10 }}>
      <div style={{ width: 200 }}><SiteTrackerLogo /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 400, margin: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 32, border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 8px', background: '#fff' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 14.7573 14.784"><path clipRule="evenodd" d={svgPaths.p9ff2c00} fill="#B0ADAB" fillRule="evenodd" /></svg>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', fontFamily: SFT }}>Search...</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 24, border: '1px solid #706E6B', borderRadius: 3, background: 'white', cursor: 'pointer' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 14.7544 14.7731"><path clipRule="evenodd" d={svgPaths.pe454320} fill="#706E6B" fillRule="evenodd" /></svg>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d={svgPaths.p8b28000} fill="#706E6B" /></svg>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="15" height="22" fill="none" viewBox="0 0 14.7343 22.202"><path clipRule="evenodd" d={svgPaths.p5333380} fill="#706E6B" fillRule="evenodd" /></svg>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="21" height="22" fill="none" viewBox="0 0 20.3342 22.1538"><path clipRule="evenodd" d={svgPaths.p1e2920a0} fill="#706E6B" fillRule="evenodd" /></svg>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 22.1538 22.1611"><path clipRule="evenodd" d={svgPaths.p61b0f00} fill="#706E6B" fillRule="evenodd" /></svg>
        </button>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 14.7692 14.7692"><path clipRule="evenodd" d={svgPaths.p19d35c00} fill="white" fillRule="evenodd" /></svg>
        </div>
      </div>
    </div>
  );
}

function GlobalNavigation() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isSites   = location.pathname === '/';
  const isLeases  = location.pathname === '/lease';

  const tabs = [
    { label: 'Sites',        path: '/',       active: isSites  },
    { label: 'Site Inquiry', path: undefined, active: false    },
    { label: 'Agreements',   path: '/lease',  active: isLeases },
    { label: 'More',         path: undefined, active: false, isMore: true },
  ];

  return (
    <div style={{ height: 40, background: '#fff', boxShadow: 'inset 0px -3px 0px 0px var(--primary)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingLeft: 24 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d={svgPaths.p9ba100} fill="#706E6B" /></svg>
        </button>
        <span style={{ fontFamily: SFT, fontSize: 18, color: '#000', whiteSpace: 'nowrap' }}>Site Central</span>
        <div style={{ display: 'flex', alignItems: 'center', height: 40 }}>
          {tabs.map(tab => (
            <div
              key={tab.label}
              onClick={() => tab.path && navigate(tab.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                height: 37, padding: '0 12px',
                background: tab.active ? '#EBF5F4' : '#fff',
                cursor: tab.path ? 'pointer' : 'default',
                boxShadow: tab.active ? 'inset 0px 3px 0px 0px var(--primary)' : 'none',
                position: 'relative',
              }}
            >
              <span style={{ fontFamily: SFT, fontSize: 13, color: '#080707', fontWeight: tab.active ? 700 : 400 }}>
                {tab.label}
              </span>
              {tab.isMore ? (
                <svg width="11" height="7" fill="none" viewBox="0 0 11.0769 7.38462"><path clipRule="evenodd" d={svgPaths.p3424d180} fill="#706E6B" fillRule="evenodd" /></svg>
              ) : (
                <svg width="13" height="8" fill="none" viewBox="0 0 13.5462 8"><path clipRule="evenodd" d={svgPaths.p3898d880} fill="#706E6B" fillRule="evenodd" /></svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Record Bar ────────────────────────────────────────────────────────────────

function RecordBar() {
  return (
    <div style={{
      background: 'var(--background)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 14.7692 14.7692">
            <path clipRule="evenodd" d={svgPaths.p19d35c00} fill="white" fillRule="evenodd" />
          </svg>
        </div>
        <div>
          <p style={{ fontFamily: SFT, fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.4 }}>Agreement</p>
          <p style={{ fontFamily: SFT, fontWeight: 700, fontSize: 'var(--text-h3)', color: 'var(--foreground)', margin: 0 }}>Site Lease Name</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Follow */}
        <button style={{ height: 28, padding: '0 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--foreground)', fontFamily: SFT, fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Follow
        </button>
        {/* Edit / New Item / ▼ grouped */}
        <div style={{ display: 'flex', height: 28 }}>
          <button style={{ padding: '0 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: 'var(--radius) 0 0 var(--radius)', cursor: 'pointer', color: 'var(--foreground)', fontFamily: SFT, fontSize: 'var(--text-base)', whiteSpace: 'nowrap' }}>
            Edit
          </button>
          <button style={{ padding: '0 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRight: 'none', cursor: 'pointer', color: 'var(--foreground)', fontFamily: SFT, fontSize: 'var(--text-base)', whiteSpace: 'nowrap' }}>
            New Item
          </button>
          <button style={{ width: 28, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0 var(--radius) var(--radius) 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronDown style={{ width: 13, height: 13, color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Record Tabs ───────────────────────────────────────────────────────────────

type RecordTab = 'details' | 'critical-dates' | 'clauses' | 'payment-terms' | 'payments' | 'history';

const RECORD_TABS: { id: RecordTab; label: string }[] = [
  { id: 'details',        label: 'Details'       },
  { id: 'critical-dates', label: 'Obligations'    },
  { id: 'clauses',        label: 'Clauses'        },
  { id: 'payment-terms',  label: 'Payment Terms'  },
  { id: 'payments',       label: 'Payments'       },
  { id: 'history',        label: 'History'        },
];

function RecordTabs({ active, onChange }: { active: RecordTab; onChange: (t: RecordTab) => void }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--background)', flexShrink: 0, paddingLeft: 4 }}>
      {RECORD_TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            height: 36, padding: '0 14px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: SF, fontSize: 'var(--text-base)', color: isActive ? 'var(--primary)' : '#3E3E3C',
            fontWeight: isActive ? 700 : 400, flexShrink: 0, whiteSpace: 'nowrap',
            borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Read-only inline-edit field ──────────────────────────────────────────────

function ReadField({ label, value = '', fullWidth = false, isLink = false }: {
  label: string; value?: string; fullWidth?: boolean; isLink?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 2, gridColumn: fullWidth ? '1 / -1' : undefined, padding: '8px 12px 8px 0', position: 'relative', minHeight: 52 }}
      onMouseEnter={e => { const b = e.currentTarget.querySelector<HTMLElement>('.rf-edit'); if (b) b.style.opacity = '1'; }}
      onMouseLeave={e => { const b = e.currentTarget.querySelector<HTMLElement>('.rf-edit'); if (b) b.style.opacity = '0'; }}
    >
      <span style={{ fontFamily: SFT, fontSize: 'var(--text-label)', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
        {label}
      </span>
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false); }}
          style={{
            border: '1px solid var(--primary)', borderRadius: 'var(--radius)',
            padding: '2px 6px', fontFamily: SFT, fontSize: 'var(--text-base)',
            color: 'var(--foreground)', outline: 'none', background: 'var(--input-background)',
            width: '100%', boxSizing: 'border-box',
          }}
        />
      ) : (
        <span style={{
          fontFamily: SFT, fontSize: 'var(--text-base)', lineHeight: 1.5, minHeight: 20,
          color: isLink && val ? 'var(--primary)' : val ? 'var(--foreground)' : 'var(--muted-foreground)',
        }}>
          {val || '—'}
        </span>
      )}
      {!editing && (
        <button
          className="rf-edit"
          onClick={() => setEditing(true)}
          style={{
            position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)',
            opacity: 0, transition: 'opacity 0.1s',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 3, color: 'var(--muted-foreground)',
            display: 'flex', alignItems: 'center',
          }}
        >
          <Pencil style={{ width: 11, height: 11 }} />
        </button>
      )}
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function CollapsibleSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', background: 'var(--muted)', border: 'none',
          borderTop: '1px solid var(--border)', borderBottom: open ? '1px solid var(--border)' : 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {open
          ? <ChevronDown style={{ width: 13, height: 13, color: 'var(--muted-foreground)', flexShrink: 0 }} />
          : <ChevronRight style={{ width: 13, height: 13, color: 'var(--muted-foreground)', flexShrink: 0 }} />
        }
        <span style={{ fontFamily: SFT, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--foreground)' }}>
          {title}
        </span>
      </button>
      {open && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          padding: '0 16px 4px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--background)',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Details Tab ──────────────────────────────────────────────────────────────

function DetailsTab() {
  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <CollapsibleSection title="Lease Details">
        <ReadField label="Lease Name"             value="Site 1" />
        <ReadField label="Site"                   value="Morinville" isLink />
        <ReadField label="Master Lease Agreement" value="" />
        <ReadField label="Landlord"               value="" />
        <ReadField label="Ownership Type"         value="" />
        <ReadField label="Lease Type"             value="Site" />
        <ReadField label="Status"                 value="Open" />
        <ReadField label="Lease Term (Months)"    value="120" />
        <ReadField label="Lease Number"           value="123" />
        <ReadField label="Owner"                  value="Utkarsh Vasist" isLink />
        <ReadField label="Record Type"            value="Site Lease" />
      </CollapsibleSection>

      <CollapsibleSection title="Description">
        <ReadField label="Lease Description" value="" fullWidth />
      </CollapsibleSection>

      <CollapsibleSection title="Dates">
        <ReadField label="Commencement Date"  value="2/1/2026" />
        <ReadField label="End Date"           value="2/1/2036" />
        <ReadField label="Commencement Notes" value="10 Year" fullWidth />
      </CollapsibleSection>
    </div>
  );
}

// ─── Payment Terms List Tab ────────────────────────────────────────────────────

interface PaymentTermRecord {
  id: string; name: string; lease: string; accountingType: string;
  createdDate: string; stages: PaymentStage[];
}

function PaymentTermsTab({ onNew, terms, onOpen }: {
  onNew: () => void; terms: PaymentTermRecord[]; onOpen: (id: string) => void;
}) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--muted)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 4, background: '#449488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText style={{ width: 14, height: 14, color: '#fff' }} />
            </div>
            <span style={{ fontFamily: SF, fontWeight: 700, fontSize: 'var(--text-h4)', color: 'var(--foreground)' }}>
              Payment Terms ({terms.length})
            </span>
          </div>
          <button
            onClick={onNew}
            style={{ height: 30, padding: '0 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--primary)', fontFamily: SFT, fontSize: 'var(--text-base)' }}
          >
            New
          </button>
        </div>

        {terms.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Name', 'Lease', 'Accounting Type', 'Created'].map(col => (
                  <th key={col} style={{ textAlign: 'left', padding: '8px 12px', fontFamily: SFT, fontSize: 'var(--text-base)', color: '#3E3E3C', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {terms.map((term, idx) => (
                <tr key={term.id} onClick={() => onOpen(term.id)}
                  style={{ background: idx % 2 === 0 ? 'var(--background)' : 'var(--muted)', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, var(--background))')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'var(--background)' : 'var(--muted)')}
                >
                  <td style={{ padding: '8px 12px', fontFamily: SFT, fontSize: 'var(--text-base)', color: 'var(--primary)', textDecoration: 'underline' }}>{term.name}</td>
                  <td style={{ padding: '8px 12px', fontFamily: SFT, fontSize: 'var(--text-base)', color: 'var(--foreground)' }}>{term.lease}</td>
                  <td style={{ padding: '8px 12px', fontFamily: SFT, fontSize: 'var(--text-base)', color: 'var(--foreground)' }}>{term.accountingType}</td>
                  <td style={{ padding: '8px 12px', fontFamily: SFT, fontSize: 'var(--text-base)', color: 'var(--muted-foreground)' }}>{term.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
            <EmptyState
              title="No Payment Terms Found"
              description="Create a Payment Term to define and manage your lease payment schedules."
              action={
                <button
                  onClick={onNew}
                  style={{
                    height: 32, padding: '0 20px', background: 'var(--primary)',
                    border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
                    color: 'var(--primary-foreground)', fontFamily: SF, fontSize: 'var(--text-base)',
                  }}
                >
                  New Payment Term
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Placeholder Tab ───────────────────────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState title={`No ${label} Found`} description={`${label} information will appear here once records are added.`} />
    </div>
  );
}

// ─── New Payment Terms Modal ───────────────────────────────────────────────────

interface NewTermsForm { name: string; lease: string; accountingType: string; }

const inputBase: React.CSSProperties = {
  height: 30, padding: '0 8px',
  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  background: 'var(--input-background)', color: 'var(--foreground)',
  fontFamily: SFT, fontSize: 'var(--text-base)', outline: 'none', width: '100%', boxSizing: 'border-box',
};

function FieldWrap({ label, required, children, fullWidth = false }: {
  label: string; required?: boolean; children: React.ReactNode; fullWidth?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {required && <span style={{ color: 'var(--destructive)', fontFamily: SFT, fontSize: 'var(--text-base)' }}>*</span>}
        <label style={{ fontFamily: SFT, fontSize: 'var(--text-label)', color: '#3E3E3C' }}>{label}</label>
      </div>
      {children}
    </div>
  );
}

function TInput({ placeholder = '', value, onChange, readOnly }: { placeholder?: string; value: string; onChange?: (v: string) => void; readOnly?: boolean }) {
  return (
    <input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
      readOnly={readOnly} style={{ ...inputBase, background: readOnly ? 'var(--muted)' : 'var(--input-background)', color: readOnly ? 'var(--muted-foreground)' : 'var(--foreground)' }} />
  );
}

function TSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputBase, appearance: 'none', paddingRight: 28, cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
    </div>
  );
}

function NewPaymentTermsModal({ onClose, onCreate }: {
  onClose: () => void; onCreate: (data: NewTermsForm) => void;
}) {
  const [form, setForm] = useState<NewTermsForm>({ name: '', lease: 'Site 1', accountingType: '' });
  const valid = !!(form.name && form.lease && form.accountingType);
  const set = (k: keyof NewTermsForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--card)', borderRadius: 8, width: 600, maxWidth: '95vw', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: SFT, fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
            New Lease Payment Terms
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 4, display: 'flex', alignItems: 'center' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <FieldWrap label="Lease Payment Term Name" required>
              <TInput value={form.name} onChange={set('name')} placeholder="Enter name" />
            </FieldWrap>
            <FieldWrap label="Lease" required>
              <TInput value={form.lease} onChange={set('lease')} />
            </FieldWrap>
          </div>
          <FieldWrap label="Accounting Type" required>
            <TSelect value={form.accountingType} onChange={set('accountingType')} options={[
              { value: '', label: 'Select accounting type' },
              { value: 'Payable', label: 'Payable' },
              { value: 'Receivable', label: 'Receivable' },
            ]} />
          </FieldWrap>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <FieldWrap label="Created By ID"><TInput value="" readOnly /></FieldWrap>
            <FieldWrap label="Modified By ID"><TInput value="" readOnly /></FieldWrap>
          </div>
        </div>
        <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--border)', background: 'var(--muted)', borderRadius: '0 0 8px 8px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ height: 32, padding: '0 16px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--foreground)', fontFamily: SFT, fontSize: 'var(--text-base)' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (valid) onCreate(form); }} disabled={!valid}
            style={{ height: 32, padding: '0 16px', background: valid ? 'var(--primary)' : 'var(--border)', border: 'none', borderRadius: 'var(--radius)', cursor: valid ? 'pointer' : 'not-allowed', color: valid ? 'var(--primary-foreground)' : 'var(--muted-foreground)', fontFamily: SFT, fontSize: 'var(--text-base)' }}
          >
            Create and Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Files Right Panel ────────────────────────────────────────────────────────

interface UploadedFile { id: string; name: string; size: number; uploadedAt: string; }

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeTag({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pdf:  { bg: 'color-mix(in srgb, #C23934 12%, transparent)', color: '#C23934', label: 'PDF' },
    doc:  { bg: 'color-mix(in srgb, #2B5CE6 12%, transparent)', color: '#2B5CE6', label: 'DOC' },
    docx: { bg: 'color-mix(in srgb, #2B5CE6 12%, transparent)', color: '#2B5CE6', label: 'DOC' },
    xls:  { bg: 'color-mix(in srgb, #027E46 12%, transparent)', color: '#027E46', label: 'XLS' },
    xlsx: { bg: 'color-mix(in srgb, #027E46 12%, transparent)', color: '#027E46', label: 'XLS' },
    csv:  { bg: 'color-mix(in srgb, #027E46 12%, transparent)', color: '#027E46', label: 'CSV' },
    png:  { bg: 'color-mix(in srgb, #E67E22 12%, transparent)', color: '#E67E22', label: 'IMG' },
    jpg:  { bg: 'color-mix(in srgb, #E67E22 12%, transparent)', color: '#E67E22', label: 'IMG' },
    jpeg: { bg: 'color-mix(in srgb, #E67E22 12%, transparent)', color: '#E67E22', label: 'IMG' },
    zip:  { bg: 'color-mix(in srgb, #8E44AD 12%, transparent)', color: '#8E44AD', label: 'ZIP' },
  };
  const { bg, color, label } = map[ext] ?? { bg: 'color-mix(in srgb, #706E6B 12%, transparent)', color: '#706E6B', label: 'FILE' };
  return (
    <div style={{ width: 32, height: 32, borderRadius: 3, flexShrink: 0, background: bg, border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 8, fontWeight: 700, color, fontFamily: SFT, letterSpacing: '0.4px' }}>{label}</span>
    </div>
  );
}

function FilesPanel() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList) => {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setFiles(prev => [
      ...prev,
      ...Array.from(fileList).map(file => ({
        id: `f-${Date.now()}-${Math.random()}`,
        name: file.name, size: file.size, uploadedAt: now,
      })),
    ]);
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--background)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      width: 260,
      flexShrink: 0,
    }}>
      {/* "Files" tab-style header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        height: 36,
        flexShrink: 0,
        background: 'var(--background)',
      }}>
        <span style={{
          fontFamily: SF,
          fontSize: 'var(--text-base)',
          fontWeight: 700,
          color: 'var(--primary)',
          borderBottom: '2px solid var(--primary)',
          paddingBottom: 2,
          lineHeight: '34px',
        }}>
          Files
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          margin: '10px 12px',
          borderRadius: 'var(--radius)',
          border: `1px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
          background: isDragging ? 'color-mix(in srgb, var(--primary) 5%, var(--background))' : 'var(--background)',
          padding: '14px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          transition: 'background 0.15s, border-color 0.15s',
          flexShrink: 0,
        }}
      >
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }}
          onChange={e => { if (e.target.files) { addFiles(e.target.files); e.target.value = ''; } }} />
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            height: 28, padding: '0 12px',
            background: 'var(--background)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: SFT, fontSize: 'var(--text-base)', color: 'var(--foreground)',
          }}
        >
          <Upload style={{ width: 12, height: 12, color: 'var(--muted-foreground)' }} />
          Upload Files
        </button>
        <span style={{ fontFamily: SFT, fontSize: 'var(--text-label)', color: 'var(--muted-foreground)' }}>
          Or drop files here
        </span>
      </div>

      {/* File list — scrollable */}
      {files.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
          {files.map((file, idx) => (
            <div
              key={file.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 12px',
                background: idx % 2 === 0 ? 'var(--background)' : 'var(--muted)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <FileTypeTag name={file.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: SFT, fontSize: 'var(--text-base)', color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.name}
                </p>
                <p style={{ margin: '1px 0 0', fontFamily: SFT, fontSize: 'var(--text-label)', color: 'var(--muted-foreground)' }}>
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2, display: 'flex', alignItems: 'center', borderRadius: 3, flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--destructive)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
              >
                <Trash2 style={{ width: 12, height: 12 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lease Record Page ────────────────────────────────────────────────────────

export function LeaseRecordPage() {
  const [activeTab, setActiveTab] = useState<RecordTab>('details');
  const [showModal, setShowModal] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermRecord[]>([]);
  const [editingTerm, setEditingTerm] = useState<PaymentTermRecord | null>(null);
  const [ledgerPayments, setLedgerPayments] = useState<LedgerPayment[]>([]);

  const handleCreate = (data: NewTermsForm) => {
    const newTerm: PaymentTermRecord = {
      id: `pt-${Date.now()}`, name: data.name, lease: data.lease,
      accountingType: data.accountingType,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      stages: [],
    };
    setPaymentTerms(prev => [...prev, newTerm]);
    setShowModal(false);
    setEditingTerm(newTerm);
  };

  const handleBuilderBack = (currentStages: PaymentStage[]) => {
    if (editingTerm)
      setPaymentTerms(prev => prev.map(t => t.id === editingTerm.id ? { ...t, stages: currentStages } : t));
    setEditingTerm(null);
  };

  const handleAcceptAndCreate = (generatedPayments: GeneratedPayment[], currentStages: PaymentStage[]) => {
    if (editingTerm)
      setPaymentTerms(prev => prev.map(t => t.id === editingTerm.id ? { ...t, stages: currentStages } : t));
    const created: LedgerPayment[] = generatedPayments.map(gp => {
      const rsChild: ChildPayment | null = gp.revenueShareAmount
        ? {
            id: `rs-${gp.id}`,
            description: 'Revenue Share',
            amount: gp.revenueShareAmount,
            date: gp.paymentDueDate,
            type: 'revenue-share',
            notes: gp.revenueShareBreakdown ?? '',
          }
        : null;
      return {
        ...gp,
        status: 'Scheduled' as PaymentStatus,
        actualPaymentDate: '', actualAmountPaid: '', notes: '',
        childPayments: rsChild ? [rsChild] : [],
        isAdhoc: false, escalationImpacted: false,
      };
    });
    setLedgerPayments(prev => [...prev, ...created]);
    setEditingTerm(null);
    setActiveTab('payments');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--muted)' }}>
      <GlobalHeader />
      <GlobalNavigation />

      {/* Page body — padded container */}
      <div style={{ flex: 1, overflow: 'hidden', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>

        {/* ── Record Bar — full-width, its own separate container ── */}
        <RecordBar />

        {/* ── Two separate containers side by side ── */}
        <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0, overflow: 'hidden' }}>

          {/* Left container — tab bar + tab content */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}>
            {/* Tab bar */}
            <RecordTabs
              active={activeTab}
              onChange={tab => { if (editingTerm) setEditingTerm(null); setActiveTab(tab); }}
            />

            {/* Tab content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: editingTerm ? 'hidden' : 'auto' }}>

              {activeTab === 'details' && <DetailsTab />}

              {activeTab === 'payment-terms' && (
                editingTerm ? (
                  <DndProvider backend={HTML5Backend}>
                    <LeasePaymentTerms
                      key={editingTerm.id}
                      termName={editingTerm.name}
                      accountingType={editingTerm.accountingType}
                      initialStages={editingTerm.stages}
                      onBack={handleBuilderBack}
                      onAcceptAndCreate={handleAcceptAndCreate}
                    />
                  </DndProvider>
                ) : (
                  <PaymentTermsTab
                    onNew={() => setShowModal(true)}
                    terms={paymentTerms}
                    onOpen={id => { const t = paymentTerms.find(t => t.id === id); if (t) setEditingTerm(t); }}
                  />
                )
              )}

              {activeTab === 'payments' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {ledgerPayments.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <EmptyState
                        title="No Payments Found"
                        description="Generate and accept payments from the Payment Terms tab to see them here."
                        action={
                          <button
                            onClick={() => setActiveTab('payment-terms')}
                            style={{ height: 32, padding: '0 20px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--primary-foreground)', fontFamily: SF, fontSize: 'var(--text-base)' }}
                          >
                            Go to Payment Terms
                          </button>
                        }
                      />
                    </div>
                  ) : (
                    <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                      <PaymentsLedger payments={ledgerPayments} onUpdatePayments={setLedgerPayments} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'critical-dates' && <PlaceholderTab label="Obligations" />}
              {activeTab === 'clauses'        && <PlaceholderTab label="Clauses" />}
              {activeTab === 'history'        && <PlaceholderTab label="History" />}
            </div>
          </div>

          {/* Right container — Files panel, hidden only while editing payment terms */}
          {!editingTerm && <FilesPanel />}
        </div>
      </div>

      {showModal && (
        <NewPaymentTermsModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}