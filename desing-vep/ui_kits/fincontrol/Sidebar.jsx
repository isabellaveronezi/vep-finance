// Sidebar.jsx — VeP Finance UI Kit
const { useState } = React;

const NAV = [
  { id:'dashboard',     label:'Dashboard',      d:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { id:'transacoes',    label:'Transações',      d:'M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3' },
  { id:'categorias',    label:'Categorias',      d:'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01' },
  { id:'cartoes',       label:'Cartões',         d:'M1 4h22v16H1zM1 10h22' },
  { id:'contas-fixas',  label:'Contas Fixas',    d:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8' },
  { id:'dividas',       label:'Dívidas',         d:'M23 18L13.5 8.5 8.5 13.5 1 6M17 18h6v-6' },
  { id:'orcamentos',    label:'Orçamentos',      d:'M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4z' },
  { id:'metas',         label:'Metas',           d:'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4l3 3' },
  { id:'alertas',       label:'Alertas',         d:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' },
  { id:'configuracoes', label:'Configurações',   d:'M12 15a3 3 0 100-6 3 3 0 000 6z' },
];

function Sidebar({ activePage, onNavigate, T, dark, onToggleDark, activePagesSet }) {
  return (
    <aside style={{
      width:224, minHeight:'100vh', flexShrink:0,
      background:T.sidebar, borderRight:`1px solid ${T.border}`,
      padding:'16px 12px', display:'flex', flexDirection:'column',
      transition:'background 0.2s, border-color 0.2s',
    }}>
      {/* Brand */}
      <div style={{ padding:'4px 10px 20px', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:26, height:26, background:T.primary, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:9, fontWeight:900, color:T.primaryFg, letterSpacing:'-0.02em' }}>VeP</span>
        </div>
        <span style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em', color:T.fg }}>VeP Finance</span>
      </div>

      {/* Nav */}
      <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
        {NAV.map(({ id, label, d }) => {
          const isActive = activePage === id;
          const isClickable = activePagesSet.has(id);
          return (
            <button key={id} onClick={() => isClickable && onNavigate(id)}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'7px 12px', borderRadius:8, border:'none',
                fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500,
                cursor: isClickable ? 'pointer' : 'default',
                background: isActive ? T.primary : 'transparent',
                color: isActive ? T.primaryFg : T.fg2,
                textAlign:'left', width:'100%',
                opacity: !isClickable && !isActive ? 0.4 : 1,
                transition:'background 0.1s, color 0.1s',
              }}
              onMouseEnter={e => { if (!isActive && isClickable) { e.currentTarget.style.background=T.hover; e.currentTarget.style.color=T.fg; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=T.fg2; }}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d={d}/>
              </svg>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:12, marginTop:8 }}>
        <button onClick={onToggleDark}
          style={{
            display:'flex', alignItems:'center', gap:10,
            width:'100%', padding:'7px 12px', border:'none', borderRadius:8,
            background:'transparent', fontFamily:'Inter, sans-serif',
            fontSize:13, fontWeight:500, color:T.fg2, cursor:'pointer',
            transition:'background 0.1s',
          }}
          onMouseEnter={e=>e.currentTarget.style.background=T.hover}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {dark
              ? <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
              : <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            }
          </svg>
          {dark ? 'Modo claro' : 'Modo escuro'}
        </button>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
