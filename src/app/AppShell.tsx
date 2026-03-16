import svgPaths from '../imports/svg-d9xqjv4uhe';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LeasePaymentTerms } from './components/LeasePaymentTerms';

// ─── Icon helpers ────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 14.7573 14.784">
      <path clipRule="evenodd" d={svgPaths.p9ff2c00} fill="#B0ADAB" fillRule="evenodd" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="13" height="8" fill="none" viewBox="0 0 13.5462 8">
      <path clipRule="evenodd" d={svgPaths.p3898d880} fill="#706E6B" fillRule="evenodd" />
    </svg>
  );
}

function IconChevronDownSm() {
  return (
    <svg width="11" height="7" fill="none" viewBox="0 0 11.0769 7.38462">
      <path clipRule="evenodd" d={svgPaths.p3424d180} fill="#706E6B" fillRule="evenodd" />
    </svg>
  );
}

function IconWaffle() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
      <path d={svgPaths.p9ba100} fill="#706E6B" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 14.7692 14.7692">
      <path clipRule="evenodd" d={svgPaths.p19d35c00} fill="white" fillRule="evenodd" />
    </svg>
  );
}

function IconQuestion() {
  return (
    <svg width="15" height="22" fill="none" viewBox="0 0 14.7343 22.202">
      <path clipRule="evenodd" d={svgPaths.p5333380} fill="#706E6B" fillRule="evenodd" />
    </svg>
  );
}

function IconSetup() {
  return (
    <svg width="21" height="22" fill="none" viewBox="0 0 20.3342 22.1538">
      <path clipRule="evenodd" d={svgPaths.p1e2920a0} fill="#706E6B" fillRule="evenodd" />
    </svg>
  );
}

function IconNotification() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 22.1538 22.1611">
      <path clipRule="evenodd" d={svgPaths.p61b0f00} fill="#706E6B" fillRule="evenodd" />
    </svg>
  );
}

function IconGlobalCreate() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p8b28000} fill="#706E6B" />
    </svg>
  );
}

// ─── Logo (SITETRACKER wordmark) ─────────────────────────────────────────────

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

// ─── Global Header ───────────────────────────────────────────────────────────

function GlobalHeader() {
  return (
    <div
      className="w-full flex-shrink-0 flex items-center justify-between px-4"
      style={{
        height: 48,
        background: '#ffffff',
        borderBottom: '1px solid #E5E4E3',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center" style={{ width: 200 }}>
        <SiteTrackerLogo />
      </div>

      {/* Center: Search */}
      <div
        className="flex items-center gap-2 flex-1 mx-8"
        style={{ maxWidth: 401 }}
      >
        <div
          className="flex items-center gap-2 w-full rounded-[4px] px-2"
          style={{
            height: 32,
            border: '1px solid #DDDBDA',
            background: '#ffffff',
          }}
        >
          <IconSearch />
          <span style={{ color: '#706E6B', fontSize: 13, fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            Search...
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Favorite button (simplified) */}
        <button
          className="flex items-center justify-center"
          style={{ width: 32, height: 24, border: '1px solid #706E6B', borderRadius: 3, background: 'white', cursor: 'pointer' }}
          aria-label="Favorites"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 14.7544 14.7731">
            <path clipRule="evenodd" d={svgPaths.pe454320} fill="#706E6B" fillRule="evenodd" />
          </svg>
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Create">
          <IconGlobalCreate />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Help">
          <IconQuestion />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Setup">
          <IconSetup />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Notifications">
          <IconNotification />
        </button>

        {/* Avatar */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 32, height: 32, borderRadius: '100%', background: '#00847C' }}
        >
          <IconUser />
        </div>
      </div>
    </div>
  );
}

// ─── Global Navigation ───────────────────────────────────────────────────────

interface NavTabProps {
  label: string;
  active?: boolean;
}

function NavTab({ label, active = false }: NavTabProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 relative flex-shrink-0 cursor-pointer"
      style={{
        height: 40,
        background: active ? '#EBF5F4' : '#ffffff',
      }}
    >
      <span style={{
        color: '#080707',
        fontSize: 13,
        fontFamily: "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: '20px',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <IconChevronDown />
    </div>
  );
}

function GlobalNavigation() {
  return (
    <div
      className="w-full flex-shrink-0 flex items-center relative"
      style={{
        height: 40,
        background: '#ffffff',
        boxShadow: 'inset 0px -3px 0px 0px #00847C',
        zIndex: 9,
      }}
    >
      {/* Left items */}
      <div className="flex items-center gap-6 pl-6">
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="App switcher">
          <IconWaffle />
        </button>
        <span style={{
          color: '#000000',
          fontSize: 18,
          fontFamily: "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
          lineHeight: '27px',
          whiteSpace: 'nowrap',
        }}>
          Site Central
        </span>

        {/* Tabs */}
        <div className="flex items-center">
          <NavTab label="Sites" active />
          <NavTab label="Site Inquiry" />
          <NavTab label="Leases" />

          {/* More tab (no chevron-down, uses different arrow) */}
          <div
            className="flex items-center gap-3 px-3 py-2 cursor-pointer flex-shrink-0"
            style={{ height: 40, background: '#ffffff' }}
          >
            <span style={{
              color: '#080707',
              fontSize: 13,
              fontFamily: "'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
              lineHeight: '20px',
            }}>
              More
            </span>
            <IconChevronDownSm />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────

export function AppShell() {
  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', width: '100%', background: '#F3F2F2', overflow: 'hidden' }}
    >
      {/* Chrome */}
      <GlobalHeader />
      <GlobalNavigation />

      {/* Body — the padded area around the dark container */}
      <div
        className="flex-1 overflow-hidden"
        style={{ padding: 12, background: '#F3F2F2' }}
      >
        {/* Dark gray frame container — the "canvas" from the Figma */}
        <div
          className="w-full h-full overflow-hidden"
          style={{
            background: '#6E6E6E',
            borderRadius: 4,
          }}
        >
          {/* The actual module — fills the dark container */}
          <DndProvider backend={HTML5Backend}>
            <LeasePaymentTerms />
          </DndProvider>
        </div>
      </div>
    </div>
  );
}