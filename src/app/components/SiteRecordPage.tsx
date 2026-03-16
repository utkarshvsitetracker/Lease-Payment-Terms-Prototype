import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import svgPaths from '../../imports/svg-d9xqjv4uhe';
import {
  ChevronDown, ChevronRight, X, Upload, Trash2, Plus,
  Search, Info, CalendarDays, Check,
} from 'lucide-react';

// ─── Font constants ────────────────────────────────────────────────────────────
const SF  = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";
const SFT = "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Brand logo ───────────────────────────────────────────────────────────────
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

// ─── Global Header ────────────────────────────────────────────────────────────
function GlobalHeader() {
  return (
    <div style={{ height: 48, background: '#fff', borderBottom: '1px solid #E5E4E3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
      <div style={{ width: 200 }}><SiteTrackerLogo /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 440, margin: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 32, border: '1px solid #DDDBDA', borderRadius: 4, padding: '0 10px', background: '#fff' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 14.7573 14.784"><path clipRule="evenodd" d={svgPaths.p9ff2c00} fill="#B0ADAB" fillRule="evenodd" /></svg>
          <span style={{ color: '#706E6B', fontSize: 13, fontFamily: SFT }}>Search...</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 41, height: 24, border: '1px solid #706E6B', borderRadius: 3, background: 'white', cursor: 'pointer', gap: 2 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 14.7544 14.7731"><path clipRule="evenodd" d={svgPaths.pe454320} fill="#706E6B" fillRule="evenodd" /></svg>
          <svg width="9" height="6" fill="none" viewBox="0 0 11.0769 7.38462"><path clipRule="evenodd" d={svgPaths.p3424d180} fill="#706E6B" fillRule="evenodd" /></svg>
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

// ─── Global Navigation — route-aware ──────────────────────────────────────────
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

// ─── Stage Progress Bar ───────────────────────────────────────────────────────
const STAGES = ['Draft', 'Open', 'Needs Review', 'Closed'];

function StageBar({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', width: '100%', height: 32, background: 'var(--primary)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
      {STAGES.map((stage, i) => {
        const isFirst = i === 0;
        const isLast  = i === STAGES.length - 1;
        const isActive = stage === active;
        return (
          <div key={stage} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'var(--primary)', cursor: 'pointer' }}>
            {!isFirst && (
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 20, pointerEvents: 'none', zIndex: 1 }}>
                <svg height="32" width="20" viewBox="0 0 20 32" preserveAspectRatio="none">
                  <polygon points="0,0 0,32 10,16" fill="rgba(0,0,0,0.12)" />
                </svg>
              </div>
            )}
            {!isLast && (
              <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 20, pointerEvents: 'none', zIndex: 1 }}>
                <svg height="32" width="20" viewBox="0 0 20 32" preserveAspectRatio="none">
                  <polygon points="0,0 20,16 0,32" fill="rgba(255,255,255,0.08)" />
                </svg>
              </div>
            )}
            <span style={{ fontFamily: SFT, fontSize: 13, color: '#fff', fontWeight: isActive ? 700 : 400, zIndex: 2, position: 'relative' }}>
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Secondary sub-tabs ───────────────────────────────────────────────────────
type SubTab = 'agreements' | 'obligations' | 'clauses' | 'workitems' | 'files' | 'financials';

const SUB_TABS: { id: SubTab; label: string; iconColor: string; iconChar: string }[] = [
  { id: 'agreements',  label: 'Agreements',        iconColor: '#00847C', iconChar: '⚡' },
  { id: 'obligations', label: 'Obligations',        iconColor: '#5B5FC7', iconChar: '📋' },
  { id: 'clauses',     label: 'Agreement Clauses',  iconColor: '#E07B39', iconChar: '📄' },
  { id: 'workitems',   label: 'Workitems',          iconColor: '#449488', iconChar: '✓' },
  { id: 'files',       label: 'Files',              iconColor: '#7F8DE1', iconChar: '📁' },
  { id: 'financials',  label: 'Financials',         iconColor: '#91B678', iconChar: '$' },
];

function SubTabBar({ active, onChange }: { active: SubTab; onChange: (t: SubTab) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', flexShrink: 0, paddingLeft: 8, overflowX: 'auto' }}>
      {SUB_TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: SF, fontSize: 13,
              color: isActive ? 'var(--foreground)' : '#3E3E3C',
              fontWeight: isActive ? 700 : 400,
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1, whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            <span style={{ width: 14, height: 14, borderRadius: 3, background: tab.iconColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', flexShrink: 0 }}>
              {tab.iconChar}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Agreements Table ─────────────────────────────────────────────────────────
interface Agreement {
  id: string; name: string; type: string;
  status: 'Active' | 'Draft' | 'Expired';
  executionDate: string; counterparty: string;
}

const MOCK_AGREEMENTS: Agreement[] = [
  { id: 'A-0000027', name: 'EnergySync Interconnect-',    type: 'Power Purchase',        status: 'Active', executionDate: '15/11/2024', counterparty: 'Pixaro Tech Energy Systems' },
  { id: 'A-0000023', name: 'GridSync 2025 Agreement',     type: 'Interconnection',        status: 'Active', executionDate: '25/01/2025', counterparty: 'Deccan Solar Solutions' },
  { id: 'A-0000025', name: 'NodeConnect 340 Deal Final',  type: 'Service & Operations',   status: 'Active', executionDate: '10/03/2025', counterparty: 'Solaris Tech and Co.' },
];

const TH: React.CSSProperties = {
  textAlign: 'left', padding: '8px 12px',
  fontFamily: SFT, fontSize: 12, color: '#3E3E3C', fontWeight: 700,
  borderBottom: '1px solid #DDDBDA', background: '#F7F8F7', whiteSpace: 'nowrap',
};
const TD: React.CSSProperties = {
  padding: '8px 12px', fontFamily: SFT, fontSize: 13, color: '#3E3E3C',
  borderBottom: '1px solid #EFEFEF', whiteSpace: 'nowrap',
};

function StatusBadge({ status }: { status: Agreement['status'] }) {
  const map = {
    Active:  { bg: 'color-mix(in srgb, #2E7D32 12%, transparent)', color: '#2E7D32', border: 'color-mix(in srgb, #2E7D32 28%, transparent)' },
    Draft:   { bg: 'color-mix(in srgb, #706E6B 12%, transparent)', color: '#706E6B', border: 'color-mix(in srgb, #706E6B 28%, transparent)' },
    Expired: { bg: 'color-mix(in srgb, #C23934 12%, transparent)', color: '#C23934', border: 'color-mix(in srgb, #C23934 28%, transparent)' },
  }[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: SFT, background: map.bg, color: map.color, border: `1px solid ${map.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: map.color, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function AgreementsTable({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ border: '1px solid #DDDBDA', borderRadius: 4, overflow: 'hidden', margin: '12px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderBottom: '1px solid #DDDBDA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 29, height: 29, borderRadius: 4, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="19" fill="none" viewBox="0 0 15.1539 20.5276">
              <path d="M12.308 0H0v20.528h15.154V2.846L12.308 0zm0 0v2.846h2.846M2.308 7.692h10.538M2.308 10.77h10.538M2.308 13.846h7.692" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: SF, fontWeight: 700, fontSize: 16, color: '#080707' }}>
            Agreements ({MOCK_AGREEMENTS.length})
          </span>
        </div>
        <button
          onClick={onNew}
          style={{ height: 32, padding: '0 16px', background: '#fff', border: '1px solid #DDDBDA', borderRadius: 4, cursor: 'pointer', color: 'var(--primary)', fontFamily: SFT, fontSize: 13, whiteSpace: 'nowrap' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#EBF5F4')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
        >
          New Agreement
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  Agreement ID
                  <svg width="10" height="14" fill="none" viewBox="0 0 10.4923 14.1538">
                    <path clipRule="evenodd" d={svgPaths.p38996700} fill="var(--primary)" fillRule="evenodd" />
                  </svg>
                  <ChevronDown style={{ width: 13, height: 13, color: '#706E6B' }} />
                </div>
              </th>
              {['Agreement Name', 'Type', 'Status', 'Execution Date', 'Primary Counterparty'].map(col => (
                <th key={col} style={TH}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    {col} <ChevronDown style={{ width: 13, height: 13, color: '#706E6B' }} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_AGREEMENTS.map((agr, idx) => (
              <tr key={agr.id}
                style={{ background: idx % 2 === 0 ? '#fff' : '#FAFAFA' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F0FAF9')}
                onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFAFA')}
              >
                <td style={{ ...TD, color: 'var(--primary)', cursor: 'pointer' }}>{agr.id}</td>
                <td style={TD}>{agr.name}</td>
                <td style={TD}>{agr.type}</td>
                <td style={TD}><StatusBadge status={agr.status} /></td>
                <td style={TD}>{agr.executionDate}</td>
                <td style={{ ...TD, color: 'var(--primary)' }}>{agr.counterparty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '8px 14px', background: '#fff', borderTop: '1px solid #EFEFEF' }}>
        <span style={{ fontFamily: SFT, fontSize: 12, color: '#3E3E3C' }}>Rows per page: 5</span>
        <ChevronDown style={{ width: 12, height: 12, color: '#706E6B' }} />
        <span style={{ fontFamily: SFT, fontSize: 12, color: '#3E3E3C', marginLeft: 8 }}>Viewing 1-3 of 3</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#706E6B', padding: 2 }} disabled>
          <ChevronRight style={{ width: 14, height: 14, transform: 'rotate(180deg)' }} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3E3E3C', padding: 2 }} disabled>
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

// ─── Primary tabs ─────────────────────────────────────────────────────────────
type PrimaryTab = 'details' | 'owners' | 'tenants' | 'projects' | 'agreements' | 'inventory' | 'assets' | 'equipments' | 'access' | 'files';

const PRIMARY_TABS: { id: PrimaryTab; label: string }[] = [
  { id: 'details',     label: 'Details' },
  { id: 'owners',      label: 'Owners' },
  { id: 'tenants',     label: 'Tenants' },
  { id: 'projects',    label: 'Projects' },
  { id: 'agreements',  label: 'Agreements' },
  { id: 'inventory',   label: 'Inventory' },
  { id: 'assets',      label: 'Assets' },
  { id: 'equipments',  label: 'Equipments' },
  { id: 'access',      label: 'Access' },
  { id: 'files',       label: 'Files' },
];

function PrimaryTabBar({ active, onChange }: { active: PrimaryTab; onChange: (t: PrimaryTab) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #DDDBDA', background: '#fff', flexShrink: 0, overflowX: 'auto' }}>
      {PRIMARY_TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            height: 40, padding: '0 12px', background: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: SF, fontSize: 13, color: '#080707', flexShrink: 0, whiteSpace: 'nowrap',
            fontWeight: isActive ? 700 : 400,
            boxShadow: isActive ? 'inset 0px -2px 0px 0px var(--primary)' : 'inset 0px -1px 0px 0px #DDDBDA',
          }}>
            {tab.label}
          </button>
        );
      })}
      <button style={{ height: 40, padding: '0 12px', background: '#fff', border: 'none', cursor: 'pointer', fontFamily: SF, fontSize: 13, color: '#080707', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, boxShadow: 'inset 0px -1px 0px 0px #DDDBDA' }}>
        More <svg width="6" height="4" fill="none" viewBox="0 0 5.53846 3.69231"><path clipRule="evenodd" d={svgPaths.p3424d180} fill="#706E6B" fillRule="evenodd" /></svg>
      </button>
    </div>
  );
}

// ─── Progress Indicator ───────────────────────────────────────────────────────
function ProgressIndicator({ step, total = 3 }: { step: number; total?: number }) {
  const pct = total === 1 ? 0 : ((step - 1) / (total - 1)) * 100;
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', height: 16, margin: '0 16px' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: '#C9C7C5', top: '50%', transform: 'translateY(-50%)' }} />
      <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 2, background: 'var(--primary)', top: '50%', transform: 'translateY(-50%)', transition: 'width 0.3s ease' }} />
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < step;
        const isActive = i === step - 1;
        const pos = total === 1 ? 50 : (i / (total - 1)) * 100;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${pos}%`, transform: 'translateX(-50%)',
            width: isActive ? 16 : 8, height: isActive ? 16 : 8, borderRadius: '50%',
            background: isFilled ? 'var(--primary)' : '#C9C7C5',
            border: isActive ? '3px solid white' : 'none',
            boxShadow: isActive ? '0 0 0 1px var(--primary)' : 'none',
            transition: 'all 0.2s', zIndex: 1,
          }} />
        );
      })}
    </div>
  );
}

// ─── Reusable form primitives ─────────────────────────────────────────────────
function FLabel({ label, required, info }: { label: string; required?: boolean; info?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
      {required && <span style={{ color: '#A61A14', fontFamily: SFT, fontSize: 12 }}>*</span>}
      <span style={{ fontFamily: SFT, fontSize: 12, color: '#3E3E3C' }}>{label}</span>
      {info && <Info style={{ width: 11, height: 11, color: '#706E6B', flexShrink: 0 }} />}
    </div>
  );
}

function FInput({ value, onChange, readOnly, placeholder }: { value: string; onChange?: (v: string) => void; readOnly?: boolean; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange?.(e.target.value)}
      readOnly={readOnly} placeholder={placeholder}
      style={{ height: 32, padding: '0 10px', border: '1px solid #DDDBDA', borderRadius: 4, background: readOnly ? '#ECEBEA' : '#fff', fontFamily: SFT, fontSize: 13, color: readOnly ? '#706E6B' : '#080707', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
  );
}

function FSelect({ value, onChange, options, placeholder = 'Placeholder' }: { value: string; onChange?: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange?.(e.target.value)}
        style={{ width: '100%', height: 32, padding: '0 28px 0 10px', border: '1px solid #DDDBDA', borderRadius: 4, background: '#fff', fontFamily: SFT, fontSize: 13, color: value ? '#080707' : '#706E6B', appearance: 'none', cursor: 'pointer', outline: 'none' }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#706E6B', pointerEvents: 'none' }} />
    </div>
  );
}

function FSearch({ value, onChange, placeholder = 'Placeholder' }: { value: string; onChange?: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DDDBDA', borderRadius: 4, background: '#fff', height: 32 }}>
      <input type="text" value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: SFT, fontSize: 13, color: value ? '#080707' : '#706E6B', padding: '0 8px', outline: 'none' }} />
      <Search style={{ width: 14, height: 14, color: '#706E6B', marginRight: 8, flexShrink: 0 }} />
    </div>
  );
}

function FDate({ value, onChange }: { value: string; onChange?: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DDDBDA', borderRadius: 4, background: '#fff', height: 32 }}>
      <input type="date" value={value} onChange={e => onChange?.(e.target.value)}
        style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: SFT, fontSize: 13, color: value ? '#080707' : '#706E6B', padding: '0 8px', outline: 'none' }} />
      <CalendarDays style={{ width: 14, height: 14, color: '#666D71', marginRight: 8, flexShrink: 0 }} />
    </div>
  );
}

function SectionBand({ title }: { title: string }) {
  return (
    <div style={{ background: '#F3F2F2', border: '1px solid #DDDBDA', borderRadius: 4, padding: '8px 14px', fontFamily: SFT, fontSize: 14, fontWeight: 700, color: '#080707', marginBottom: 14, flexShrink: 0 }}>
      {title}
    </div>
  );
}

// ─── Checkbox with teal check ─────────────────────────────────────────────────
function TealCheckbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 16, height: 16, borderRadius: 2, border: '1px solid #DDDBDA',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer', position: 'relative',
        }}
      >
        {checked && (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5L5.2 9.75L11 4" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontFamily: SFT, fontSize: 13, color: '#080707' }}>{label}</span>
    </label>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function ModalShell({ step, total, title, subtitle, onCancel, onBack, onNext, nextLabel = 'Next', nextEnabled = true, children }: {
  step: number; total: number; title: string; subtitle?: string;
  onCancel: () => void; onBack?: () => void; onNext: () => void;
  nextLabel?: string; nextEnabled?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{
        background: '#fff', borderRadius: 4, width: 880, maxWidth: '98vw',
        maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #C9C7C5', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
          <button onClick={onCancel} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#706E6B', display: 'flex', alignItems: 'center', padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
          <p style={{ fontFamily: SF, fontWeight: 700, fontSize: 20, color: '#080707', margin: 0 }}>{title}</p>
          {subtitle && <p style={{ fontFamily: SFT, fontSize: 13, color: '#706E6B', margin: 0 }}>{subtitle}</p>}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{ height: 56, background: '#F3F2F2', borderTop: '1px solid #C9C7C5', display: 'flex', alignItems: 'center', padding: '0 14px', flexShrink: 0, gap: 8 }}>
          <button onClick={onCancel}
            style={{ height: 32, padding: '0 16px', background: '#fff', border: '1px solid var(--primary)', borderRadius: 4, cursor: 'pointer', color: 'var(--primary)', fontFamily: SF, fontSize: 13, flexShrink: 0 }}>
            Cancel
          </button>
          <ProgressIndicator step={step} total={total} />
          {onBack && step > 1 && (
            <button onClick={onBack}
              style={{ height: 32, padding: '0 16px', background: '#fff', border: '1px solid #DDDBDA', borderRadius: 4, cursor: 'pointer', color: '#3E3E3C', fontFamily: SF, fontSize: 13, flexShrink: 0 }}>
              Back
            </button>
          )}
          <button
            onClick={nextEnabled ? onNext : undefined}
            style={{ height: 32, padding: '0 20px', borderRadius: 4, border: 'none', cursor: nextEnabled ? 'pointer' : 'not-allowed', fontFamily: SF, fontSize: 13, flexShrink: 0, whiteSpace: 'nowrap', background: nextEnabled ? 'var(--primary)' : '#C9C7C5', color: nextEnabled ? '#fff' : '#F3F2F2' }}>
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Select Agreement Type ───────────────────────────────────────────
const AGREEMENT_TYPES = ['Site Lease', 'Power Purchase', 'Tenant Lease'];

function Step1SelectType({ selected, onChange }: { selected: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', minHeight: 260 }}>
      <p style={{ fontFamily: SF, fontWeight: 700, fontSize: 16, color: '#080707', marginBottom: 24, marginTop: 0 }}>
        Select an agreement type to get started
      </p>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <FLabel label="Agreement Type" required />
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              width: '100%', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 12px', border: '1px solid #DDDBDA', borderRadius: 4, background: '#fff',
              cursor: 'pointer', fontFamily: SFT, fontSize: 13, color: selected ? '#080707' : '#706E6B',
              textAlign: 'left',
            }}>
            <span>{selected || 'Select agreement type...'}</span>
            <ChevronDown style={{ width: 14, height: 14, color: '#706E6B', flexShrink: 0 }} />
          </button>
          {open && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #DDDBDA', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 30, marginTop: 2 }}>
              {AGREEMENT_TYPES.map(type => (
                <button key={type} onClick={() => { onChange(type); setOpen(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: selected === type ? '#EBF5F4' : '#fff', border: 'none', cursor: 'pointer', fontFamily: SFT, fontSize: 13, color: '#080707' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#EBF5F4')}
                  onMouseLeave={e => (e.currentTarget.style.background = selected === type ? '#EBF5F4' : '#fff')}>
                  {selected === type && <Check style={{ width: 12, height: 12, color: 'var(--primary)', marginRight: 6 }} />}
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
        {selected && (
          <p style={{ fontFamily: SFT, fontSize: 12, color: '#706E6B', marginTop: 6 }}>
            You selected: <strong style={{ color: 'var(--primary)' }}>{selected}</strong>. Click Next to continue.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Agreement Details + Next Steps checkboxes ────────────────────────
interface AgreementDetails {
  leaseName: string; site: string; masterLease: string; landlord: string;
  ownershipType: string; leaseType: string; status: string; leaseNumber: string;
  description: string; executionDate: string; originationDate: string;
  expirationDate: string; terminationDate: string;
  addParties: boolean; uploadAgreement: boolean;
}

const INITIAL_DETAILS: AgreementDetails = {
  leaseName: '', site: 'Draft', masterLease: '', landlord: '', ownershipType: '',
  leaseType: '', status: '', leaseNumber: '', description: '',
  executionDate: '2020-04-28', originationDate: '2020-04-28',
  expirationDate: '2040-04-27', terminationDate: '',
  addParties: true, uploadAgreement: true,
};

function Step2Details({ data, onChange }: { data: AgreementDetails; onChange: (d: AgreementDetails) => void }) {
  const set = (k: keyof AgreementDetails) => (v: string | boolean) => onChange({ ...data, [k]: v });

  const termMonths = data.expirationDate && data.executionDate
    ? Math.max(0, Math.round((new Date(data.expirationDate).getTime() - new Date(data.executionDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
    : 0;

  const needsStep3 = data.addParties || data.uploadAgreement;

  return (
    <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Required note */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <span style={{ fontFamily: SFT, fontSize: 12, color: '#706E6B' }}>
          <span style={{ color: '#A61A14' }}>*</span> = Required Information
        </span>
      </div>

      {/* ── Lease Details ── */}
      <SectionBand title="Lease Details" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 20 }}>
        {/* Lease (required) */}
        <div>
          <FLabel label="Lease" required info />
          <FInput value={data.leaseName} onChange={v => set('leaseName')(v)} />
        </div>
        {/* Site */}
        <div>
          <FLabel label="Site" info />
          <FSelect value={data.site} onChange={v => set('site')(v)} options={['Draft', 'Open', 'Active']} />
        </div>
        {/* Master Lease Agreement */}
        <div>
          <FLabel label="Master Lease Agreement" info />
          <FSearch value={data.masterLease} onChange={v => set('masterLease')(v)} />
        </div>
        {/* Landlord */}
        <div>
          <FLabel label="Landlord" info />
          <FSearch value={data.landlord} onChange={v => set('landlord')(v)} />
        </div>
        {/* Ownership Type */}
        <div>
          <FLabel label="Ownership Type" />
          <FSelect value={data.ownershipType} onChange={v => set('ownershipType')(v)} options={['Owned', 'Leased', 'Licensed']} />
        </div>
        {/* Lease Type */}
        <div>
          <FLabel label="Lease Type" />
          <FSelect value={data.leaseType} onChange={v => set('leaseType')(v)} options={['Site Lease', 'Ground Lease', 'Rooftop Lease']} />
        </div>
        {/* Status */}
        <div>
          <FLabel label="Status" />
          <FSelect value={data.status} onChange={v => set('status')(v)} options={['Draft', 'Open', 'Active', 'Expired']} />
        </div>
        {/* empty spacer */}
        <div />
        {/* Lease Number */}
        <div>
          <FLabel label="Lease Number" info />
          <FInput value={data.leaseNumber} onChange={v => set('leaseNumber')(v)} />
        </div>
        {/* Owner (read-only) */}
        <div>
          <FLabel label="Owner" info />
          <FInput value="" readOnly />
        </div>
        {/* Lease Description — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FLabel label="Lease Description" info />
          <textarea value={data.description} onChange={e => set('description')(e.target.value)} rows={4}
            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #DDDBDA', borderRadius: 4, background: '#fff', fontFamily: SFT, fontSize: 13, color: '#080707', outline: 'none', resize: 'vertical' }} />
        </div>
      </div>

      {/* ── Dates ── */}
      <SectionBand title="Dates" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 16 }}>
        <div>
          <FLabel label="Execution Date" info />
          <FDate value={data.executionDate} onChange={v => set('executionDate')(v)} />
        </div>
        <div>
          <FLabel label="Origination Date" info />
          <FDate value={data.originationDate} onChange={v => set('originationDate')(v)} />
        </div>
        <div>
          <FLabel label="Expiration Date" info />
          <FDate value={data.expirationDate} onChange={v => set('expirationDate')(v)} />
        </div>
        <div>
          <FLabel label="Termination Date" info />
          <FDate value={data.terminationDate} onChange={v => set('terminationDate')(v)} />
        </div>
        <div>
          <FLabel label="Term Length (months)" />
          <div style={{ fontFamily: SFT, fontSize: 14, color: '#080707', marginTop: 4 }}>{termMonths}</div>
          <div style={{ fontFamily: SFT, fontSize: 12, color: '#706E6B', fontStyle: 'italic', marginTop: 2 }}>This field is calculated upon save</div>
        </div>
      </div>

      {/* ── Next Steps ── */}
      <SectionBand title="Next Steps" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
        <TealCheckbox
          checked={data.addParties}
          onChange={v => set('addParties')(v)}
          label="Add Agreement Parties?"
        />
        <TealCheckbox
          checked={data.uploadAgreement}
          onChange={v => set('uploadAgreement')(v)}
          label="Upload Agreement?"
        />
        {!needsStep3 && (
          <p style={{ fontFamily: SFT, fontSize: 12, color: '#706E6B', margin: '4px 0 0' }}>
            No additional steps — clicking Save will create the agreement.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Upload + Parties (conditional) ───────────────────────────────────
interface UploadedFile { id: string; name: string; size: string; }
interface Party { id: string; accountId: string; role: string; description: string; isPrimary: boolean; }

function Step3Upload({
  showUpload, showParties,
  files, onAddFile, onRemoveFile,
  parties, onAddParty, onUpdateParty, onRemoveParty,
}: {
  showUpload: boolean; showParties: boolean;
  files: UploadedFile[];
  onAddFile: (f: UploadedFile) => void;
  onRemoveFile: (id: string) => void;
  parties: Party[];
  onAddParty: () => void;
  onUpdateParty: (id: string, k: keyof Party, v: string | boolean) => void;
  onRemoveParty: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFiles = (fl: FileList) => {
    Array.from(fl).forEach(f => {
      const kb = Math.round(f.size / 1024);
      onAddFile({ id: `f-${Date.now()}-${Math.random()}`, name: f.name, size: `${kb} KB` });
    });
  };

  return (
    <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Upload Agreement */}
      {showUpload && (
        <>
          <SectionBand title="Upload Agreement" />
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
            style={{ border: `1px dashed ${drag ? 'var(--primary)' : '#DDDBDA'}`, borderRadius: 4, background: drag ? '#EBF5F4' : '#FAFAFA', padding: 16, marginBottom: 20 }}
          >
            <input ref={inputRef} type="file" multiple style={{ display: 'none' }}
              onChange={e => { if (e.target.files) { handleFiles(e.target.files); e.target.value = ''; } }} />

            {files.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 64 }}>
                <button onClick={() => inputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', background: '#fff', border: '1px solid var(--primary)', borderRadius: 4, cursor: 'pointer', color: 'var(--primary)', fontFamily: SFT, fontSize: 13 }}>
                  <Upload style={{ width: 13, height: 13 }} /> Upload Files
                </button>
                <span style={{ fontFamily: SFT, fontSize: 13, color: '#706E6B' }}>or drop files here</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 40, background: '#C23934', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 8, color: '#fff', fontWeight: 700, fontFamily: SFT }}>PDF</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontFamily: SFT, fontSize: 13, color: '#080707' }}>{f.name}</p>
                      <p style={{ margin: 0, fontFamily: SFT, fontSize: 11, color: '#706E6B' }}>{f.size}</p>
                    </div>
                    <button onClick={() => onRemoveFile(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#706E6B', display: 'flex', alignItems: 'center' }}>
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                ))}
                <button onClick={() => inputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontFamily: SFT, fontSize: 12, marginTop: 4 }}>
                  <Plus style={{ width: 12, height: 12 }} /> Add more
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Agreement Parties */}
      {showParties && (
        <>
          <SectionBand title="Agreement Parties" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
            {parties.map(party => (
              <div key={party.id} style={{ border: '1px solid #DDDBDA', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F7F8F7', borderBottom: '1px solid #DDDBDA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ChevronDown style={{ width: 14, height: 14, color: '#706E6B' }} />
                    <span style={{ fontFamily: SF, fontWeight: 700, fontSize: 13, color: '#080707' }}>
                      {party.accountId || 'Account Name'}
                    </span>
                  </div>
                  <button onClick={() => onRemoveParty(party.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#706E6B', display: 'flex', alignItems: 'center' }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                    <div>
                      <FLabel label="Account ID" info />
                      <FSearch value={party.accountId} onChange={v => onUpdateParty(party.id, 'accountId', v)} />
                    </div>
                    <div>
                      <FLabel label="Role" required info />
                      <FSelect value={party.role} onChange={v => onUpdateParty(party.id, 'role', v)} options={['Landlord', 'Tenant', 'Counterparty']} />
                    </div>
                  </div>
                  <div>
                    <FLabel label="Description" info />
                    <FInput value={party.description} onChange={v => onUpdateParty(party.id, 'description', v)} />
                  </div>
                  <TealCheckbox
                    checked={party.isPrimary}
                    onChange={v => onUpdateParty(party.id, 'isPrimary', v)}
                    label="Is Primary?"
                  />
                </div>
              </div>
            ))}
            <button onClick={onAddParty}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', background: '#fff', border: '1px solid #DDDBDA', borderRadius: 4, cursor: 'pointer', color: 'var(--primary)', fontFamily: SFT, fontSize: 13, alignSelf: 'flex-start' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EBF5F4')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
              <Plus style={{ width: 13, height: 13 }} /> Add New Party
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── New Agreement Flow ───────────────────────────────────────────────────────
function NewAgreementFlow({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [step, setStep]               = useState(1);
  const [agreementType, setAgreementType] = useState('');
  const [details, setDetails]         = useState<AgreementDetails>(INITIAL_DETAILS);
  const [files, setFiles]             = useState<UploadedFile[]>([]);
  const [parties, setParties]         = useState<Party[]>([]);

  // Step 3 is only shown if either next-step checkbox is ticked
  const needsStep3 = details.addParties || details.uploadAgreement;
  const totalSteps = needsStep3 ? 3 : 2;

  const addParty    = () => setParties(prev => [...prev, { id: `p-${Date.now()}`, accountId: '', role: '', description: '', isPrimary: false }]);
  const updateParty = (id: string, k: keyof Party, v: string | boolean) => setParties(prev => prev.map(p => p.id === id ? { ...p, [k]: v } : p));
  const removeParty = (id: string) => setParties(prev => prev.filter(p => p.id !== id));

  const handleNext = () => {
    if (step === 1) { setStep(2); return; }
    if (step === 2 && needsStep3) { setStep(3); return; }
    // step 2 with no extras, or step 3 → finish
    onComplete();
  };

  const stepMeta = [
    { title: 'New Lease Agreement', subtitle: undefined,                         nextLabel: 'Next',        nextEnabled: !!agreementType },
    { title: 'New Agreement',       subtitle: 'Add Agreement Details',            nextLabel: needsStep3 ? 'Save & Next' : 'Save', nextEnabled: !!details.leaseName },
    { title: 'New Agreement',       subtitle: 'Upload Document and Add Parties',  nextLabel: 'Save',        nextEnabled: true },
  ];
  const meta = stepMeta[step - 1];

  return (
    <ModalShell
      step={step} total={totalSteps}
      title={meta.title} subtitle={meta.subtitle}
      onCancel={onClose}
      onBack={step > 1 ? () => setStep(s => s - 1) : undefined}
      onNext={handleNext}
      nextLabel={meta.nextLabel}
      nextEnabled={meta.nextEnabled}
    >
      {step === 1 && <Step1SelectType selected={agreementType} onChange={setAgreementType} />}
      {step === 2 && <Step2Details data={details} onChange={setDetails} />}
      {step === 3 && (
        <Step3Upload
          showUpload={details.uploadAgreement}
          showParties={details.addParties}
          files={files}
          onAddFile={f => setFiles(prev => [...prev, f])}
          onRemoveFile={id => setFiles(prev => prev.filter(f => f.id !== id))}
          parties={parties}
          onAddParty={addParty}
          onUpdateParty={updateParty}
          onRemoveParty={removeParty}
        />
      )}
    </ModalShell>
  );
}

// ─── Site Record Page ─────────────────────────────────────────────────────────
export function SiteRecordPage() {
  const navigate    = useNavigate();
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('agreements');
  const [subTab, setSubTab]         = useState<SubTab>('agreements');
  const [showModal, setShowModal]   = useState(false);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F3F3F3', fontFamily: SFT }}>
      <GlobalHeader />
      <GlobalNavigation />

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Record bar */}
        <div style={{ background: '#F7F8F7', border: '1px solid #DDDBDA', borderRadius: 4, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 4, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                <rect x="1" y="4" width="18" height="14" rx="1" stroke="white" strokeWidth="1.5" />
                <path d="M1 8h18" stroke="white" strokeWidth="1.5" />
                <path d="M7 4V2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 4V2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: SFT, fontSize: 12, color: '#3E3E3C', margin: 0, lineHeight: 1.4 }}>Site</p>
              <p style={{ fontFamily: SFT, fontWeight: 700, fontSize: 18, color: '#080707', margin: 0 }}>Move wires</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', background: '#fff', border: '1px solid #DDDBDA', borderRadius: 4, cursor: 'pointer', fontFamily: SFT, fontSize: 13, color: 'var(--primary)' }}>
              + Follow
            </button>
            <div style={{ display: 'flex', height: 32 }}>
              {['Edit', 'New Item'].map((label, i) => (
                <button key={label} style={{ padding: '0 12px', background: '#fff', border: '1px solid #DDDBDA', borderRight: 'none', borderRadius: i === 0 ? '4px 0 0 4px' : 0, cursor: 'pointer', fontFamily: SFT, fontSize: 13, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                  {label}
                </button>
              ))}
              <button style={{ width: 28, background: '#fff', border: '1px solid #DDDBDA', borderRadius: '0 4px 4px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronDown style={{ width: 13, height: 13, color: '#706E6B' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Info bar */}
        <div style={{ background: '#fff', border: '1px solid #DDDBDA', borderRadius: 4, padding: '12px 16px', display: 'flex', gap: 48, flexShrink: 0 }}>
          {[{ label: 'Site Type', value: 'RFI-123456', link: true }, { label: 'Site Status', value: '06/25/2024' }, { label: 'Full Address', value: '06/01/2024' }].map(field => (
            <div key={field.label}>
              <p style={{ fontFamily: SFT, fontSize: 12, color: '#000', margin: '0 0 2px' }}>{field.label}</p>
              <p style={{ fontFamily: SFT, fontSize: 13, color: field.link ? 'var(--primary)' : '#080707', margin: 0 }}>{field.value}</p>
            </div>
          ))}
        </div>

        {/* Stage progress */}
        <StageBar active="Open" />

        {/* Main content */}
        <div style={{ background: '#fff', border: '1px solid #DDDBDA', borderRadius: 4, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <PrimaryTabBar active={primaryTab} onChange={setPrimaryTab} />

          {primaryTab === 'agreements' && (
            <>
              <SubTabBar active={subTab} onChange={setSubTab} />
              {subTab === 'agreements' ? (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <AgreementsTable onNew={() => setShowModal(true)} />
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#706E6B', fontFamily: SFT, fontSize: 14 }}>No records found</p>
                </div>
              )}
            </>
          )}

          {primaryTab !== 'agreements' && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#706E6B', fontFamily: SFT, fontSize: 14 }}>Select the Agreements tab to manage agreements</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewAgreementFlow
          onClose={() => setShowModal(false)}
          onComplete={() => { setShowModal(false); navigate('/lease'); }}
        />
      )}
    </div>
  );
}