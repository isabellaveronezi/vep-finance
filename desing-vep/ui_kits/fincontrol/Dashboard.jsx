// Dashboard.jsx — VeP Finance UI Kit
const { useState } = React;

const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const TRANSACTIONS = [
  { id:1, desc:'Salário mensal',   tipo:'ENTRADA', valor:6800,   data:'20/04', cat:'💼 Trabalho',    status:'PAGO',      cartao:null },
  { id:2, desc:'Supermercado',     tipo:'SAIDA',   valor:312.40, data:'19/04', cat:'🛒 Alimentação', status:'PAGO',      cartao:'Nubank' },
  { id:3, desc:'Netflix',          tipo:'SAIDA',   valor:55.90,  data:'18/04', cat:'🎬 Streaming',   status:'PARCELADO', cartao:'Inter' },
  { id:4, desc:'Aluguel',          tipo:'SAIDA',   valor:1800,   data:'01/04', cat:'🏠 Moradia',     status:'PENDENTE',  cartao:null },
  { id:5, desc:'Combustível',      tipo:'SAIDA',   valor:180,    data:'17/04', cat:'🚗 Transporte',  status:'PAGO',      cartao:'Nubank' },
  { id:6, desc:'Academia',         tipo:'SAIDA',   valor:99.90,  data:'15/04', cat:'💪 Saúde',       status:'PAGO',      cartao:null },
];

const CATS = [
  { nome:'Alimentação', total:528,  cor:'#6366f1' },
  { nome:'Moradia',     total:1800, cor:'#f59e0b' },
  { nome:'Transporte',  total:288,  cor:'#10b981' },
  { nome:'Saúde',       total:210,  cor:'#ef4444' },
  { nome:'Streaming',   total:112,  cor:'#8b5cf6' },
  { nome:'Outros',      total:351,  cor:'#94a3b8' },
];

const BS = { PAGO:{bg:'#d1fae5',c:'#065f46'}, PENDENTE:{bg:'#fef3c7',c:'#92400e'}, PARCELADO:{bg:'#dbeafe',c:'#1e40af'} };
const BL = { PAGO:'Pago', PENDENTE:'Pendente', PARCELADO:'Parcelado' };

const LAYOUTS = [
  { id:'default', label:'Padrão' },
  { id:'compact', label:'Compacto' },
  { id:'wide',    label:'Amplo' },
];

function MetricCard({ label, value, sub, iconPath, iconBg, iconColor, T, compact }) {
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding: compact ? '14px 16px' : '18px 20px', display:'flex', flexDirection:'column', gap: compact?6:10, transition:'background 0.2s, border-color 0.2s' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, color:T.fg2 }}>{label}</span>
        <div style={{ width:30, height:30, borderRadius:8, background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={iconPath}/></svg>
        </div>
      </div>
      <div>
        <div style={{ fontFamily:'Inter,sans-serif', fontSize: compact?18:22, fontWeight:700, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', color:T.fg }}>{fmt(value)}</div>
        <div style={{ fontSize:11, color:T.fg2, marginTop:2 }}>{sub}</div>
      </div>
    </div>
  );
}

function DonutChart({ data, T }) {
  const total = data.reduce((s,d)=>s+d.total,0);
  let angle = -90;
  const r=70, cx=90, cy=90;
  const segs = data.map(d => {
    const sweep = (d.total/total)*360;
    const s1 = angle*Math.PI/180, s2 = (angle+sweep)*Math.PI/180;
    const x1=cx+r*Math.cos(s1), y1=cy+r*Math.sin(s1);
    const x2=cx+r*Math.cos(s2), y2=cy+r*Math.sin(s2);
    const p = `M ${x1} ${y1} A ${r} ${r} 0 ${sweep>180?1:0} 1 ${x2} ${y2}`;
    angle += sweep;
    return { ...d, path:p };
  });
  return (
    <svg width="180" height="180" style={{flexShrink:0}}>
      {segs.map((s,i) => <path key={i} d={s.path} fill="none" stroke={s.cor} strokeWidth="28" strokeLinecap="butt"/>)}
      <circle cx={cx} cy={cy} r={44} fill={T.card}/>
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="11" fill={T.fg2} fontFamily="Inter">Total</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="12" fontWeight="700" fill={T.fg} fontFamily="Inter">{fmt(data.reduce((s,d)=>s+d.total,0))}</text>
    </svg>
  );
}

function TxRow({ t, T }) {
  const bs = BS[t.status];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, border:`1px solid ${T.border}`, borderRadius:10, padding:'9px 14px', background:T.card, transition:'background 0.1s' }}
      onMouseEnter={e=>e.currentTarget.style.background=T.hover}
      onMouseLeave={e=>e.currentTarget.style.background=T.card}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={t.tipo==='ENTRADA'?'#10b981':'#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {t.tipo==='ENTRADA'
          ? <><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></>
          : <><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></>}
      </svg>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:T.fg }}>{t.desc}</p>
        <p style={{ fontSize:11, color:T.fg2, marginTop:1 }}>{t.data} · {t.cat}{t.cartao?` · ${t.cartao}`:''}</p>
      </div>
      <span style={{ fontFamily:'Inter', fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums', color:t.tipo==='ENTRADA'?'#10b981':'#ef4444', flexShrink:0 }}>
        {t.tipo==='ENTRADA'?'+':'−'}{fmt(t.valor)}
      </span>
      <span style={{ display:'inline-flex', alignItems:'center', height:20, padding:'0 7px', borderRadius:9999, fontSize:11, fontWeight:500, background:bs.bg, color:bs.c, flexShrink:0 }}>
        {BL[t.status]}
      </span>
    </div>
  );
}

function DashboardPage({ T, onNavigate, layout, onLayoutChange }) {
  const [mes, setMes] = useState(3); // Abril

  const compact = layout === 'compact';
  const wide    = layout === 'wide';

  const metrics = [
    { label:'Receitas', value:6800,   sub:'entradas recebidas no mês', iconPath:'M23 6L13.5 15.5 8.5 10.5 1 18M17 6h6v6', iconBg:'#d1fae5', iconColor:'#10b981' },
    { label:'Despesas', value:4289.50,sub:'R$ 3.100,00 já pago',       iconPath:'M23 18L13.5 8.5 8.5 13.5 1 6M17 18h6v-6',iconBg:'#fee2e2', iconColor:'#ef4444' },
    { label:'Saldo',    value:2510.50,sub:'você está no positivo',      iconPath:'M20 12V22H4V12M22 7H2v5h20V7zM12 22V7',  iconBg:'#dbeafe', iconColor:'#3b82f6' },
    { label:'Gasto / dia',value:142.98,sub:'11 dias restantes',         iconPath:'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',    iconBg:'#ede9fe', iconColor:'#8b5cf6' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22, maxWidth: wide ? 1200 : 1060 }}>

      {/* Header with logo */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
              <span style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.04em', color:T.fg }}>VeP</span>
              <span style={{ fontSize:26, fontWeight:300, letterSpacing:'-0.02em', color:T.fg }}>Finance</span>
            </div>
            <p style={{ fontSize:12, color:T.fg2, marginTop:1 }}>Bem-vindo de volta!</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Layout switcher */}
          <div style={{ display:'flex', background:T.muted, borderRadius:9, padding:3, gap:2, border:`1px solid ${T.border}` }}>
            {LAYOUTS.map(l => (
              <button key={l.id} onClick={() => onLayoutChange(l.id)}
                style={{ padding:'4px 10px', borderRadius:7, border:'none', fontFamily:'Inter', fontSize:11, fontWeight:500, cursor:'pointer', background: layout===l.id ? T.card : 'transparent', color: layout===l.id ? T.fg : T.fg2, boxShadow: layout===l.id ? `0 1px 3px rgba(0,0,0,0.1)` : 'none', transition:'all 0.1s' }}>
                {l.label}
              </button>
            ))}
          </div>
          {/* Month selector */}
          <div style={{ display:'flex', alignItems:'center', gap:6, background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:'6px 10px' }}>
            <button onClick={() => setMes(m=>(m-1+12)%12)} style={{ background:'none', border:'none', cursor:'pointer', color:T.fg2, fontSize:16, lineHeight:1, padding:'0 2px' }}>‹</button>
            <span style={{ fontSize:13, fontWeight:500, minWidth:72, textAlign:'center', color:T.fg }}>{MONTHS[mes].slice(0,3)} 2026</span>
            <button onClick={() => setMes(m=>(m+1)%12)} style={{ background:'none', border:'none', cursor:'pointer', color:T.fg2, fontSize:16, lineHeight:1, padding:'0 2px' }}>›</button>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display:'grid', gridTemplateColumns: wide ? 'repeat(4,1fr)' : compact ? 'repeat(4,1fr)' : 'repeat(4,1fr)', gap: compact?8:12 }}>
        {metrics.map(m => <MetricCard key={m.label} {...m} T={T} compact={compact}/>)}
      </div>

      {/* Body */}
      {wide ? (
        // Wide layout — chart full width on right
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }}>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:20, transition:'background 0.2s' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.fg }}>Transações recentes</div>
              <button onClick={()=>onNavigate('transacoes')} style={{ fontSize:12, color:T.fg2, background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Ver todas</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {TRANSACTIONS.map(t=><TxRow key={t.id} t={t} T={T}/>)}
            </div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:20, transition:'background 0.2s' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:14, color:T.fg }}>Por categoria</div>
            <DonutChart data={CATS} T={T}/>
            <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:10 }}>
              {CATS.map(c=>(
                <div key={c.nome} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:c.cor, flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:12, color:T.fg2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nome}</span>
                  <span style={{ fontSize:12, fontFamily:'Inter', fontWeight:600, fontVariantNumeric:'tabular-nums', color:T.fg }}>{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Default / compact layout
        <div style={{ display:'grid', gridTemplateColumns: compact ? '260px 1fr' : '300px 1fr', gap:14 }}>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:18, transition:'background 0.2s' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:14, color:T.fg }}>Por categoria</div>
            <DonutChart data={CATS} T={T}/>
            <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:8 }}>
              {CATS.map(c=>(
                <div key={c.nome} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:c.cor, flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:11, color:T.fg2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nome}</span>
                  <span style={{ fontSize:11, fontFamily:'Inter', fontWeight:600, fontVariantNumeric:'tabular-nums', color:T.fg }}>{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:18, transition:'background 0.2s' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.fg }}>Transações recentes</div>
              <button onClick={()=>onNavigate('transacoes')} style={{ fontSize:12, color:T.fg2, background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Ver todas</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {TRANSACTIONS.slice(0, compact ? 4 : 6).map(t=><TxRow key={t.id} t={t} T={T}/>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DashboardPage });
