// Orcamentos.jsx — FinControl UI Kit
const { useState } = React;

const fmtO = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const CARDS_DATA = [
  { cat:'🛒 Alimentação', cor:'#fef3c7', gasto:528,   limite:1200, txCount:8  },
  { cat:'🏠 Moradia',     cor:'#fee2e2', gasto:1950,  limite:1800, txCount:2  },
  { cat:'🚗 Transporte',  cor:'#dbeafe', gasto:288,   limite:400,  txCount:5  },
  { cat:'💪 Saúde',       cor:'#d1fae5', gasto:187,   limite:null, txCount:3  },
  { cat:'🎬 Streaming',   cor:'#ede9fe', gasto:261,   limite:300,  txCount:4  },
  { cat:'💼 Trabalho',    cor:'#f4f4f5', gasto:0,     limite:null, txCount:0  },
];

function BarraProg({ pct }) {
  const c = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : pct >= 60 ? '#eab308' : '#10b981';
  const clamped = Math.min(pct, 100);
  return (
    <div style={{ height:8, background:T.hover, borderRadius:9999, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${clamped}%`, background:c, borderRadius:9999, transition:'width 0.3s' }}/>
    </div>
  );
}

function OrcamentosPage({ T = window.LIGHT }) {
  const [editingIdx, setEditingIdx]   = useState(null);
  const [limitInput, setLimitInput]   = useState('');
  const [cards, setCards]             = useState(CARDS_DATA);
  const [showModal, setShowModal]     = useState(false);
  const totalGasto = cards.reduce((s,c)=>s+c.gasto,0);
  const tetoMensal = 6000;
  const tetoPct = (totalGasto/tetoMensal)*100;

  function saveLimit(idx) {
    const val = parseFloat(limitInput.replace(',','.'));
    if (!isNaN(val) && val > 0) {
      setCards(cs => cs.map((c,i) => i===idx ? {...c,limite:val} : c));
    }
    setEditingIdx(null);
    setLimitInput('');
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22, maxWidth:860 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.01em' }}>Orçamentos</h1>
          <p style={{ fontSize:12, color:T.fg2, marginTop:2, textTransform:'capitalize' }}>abril de 2026</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ display:'flex', alignItems:'center', gap:6, height:34, padding:'0 12px', background:T.card, color:T.fg, border:`1px solid ${T.border}`, borderRadius:8, fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:500, cursor:'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Limite por categoria
          </button>
          <button style={{ display:'flex', alignItems:'center', gap:6, height:34, padding:'0 12px', background:T.primary, color:T.primaryFg, border:'none', borderRadius:8, fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:500, cursor:'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16h16V8l-6-6zM14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Registrar gasto
          </button>
        </div>
      </div>

      {/* Teto mensal geral */}
      <div style={{ border:'1.5px solid rgba(99,102,241,0.3)', background:'rgba(99,102,241,0.04)', borderRadius:14, padding:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:'#6366f1' }}>Teto mensal geral</p>
            <p style={{ fontSize:11, color:T.fg2 }}>Limite: {fmtO(tetoMensal)}</p>
          </div>
        </div>
        <BarraProg pct={tetoPct}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginTop:8 }}>
          <span style={{ color:T.fg2 }}>Gasto: <strong style={{color:T.fg}}>{fmtO(totalGasto)}</strong></span>
          <span style={{ color:T.fg2 }}>Restante: <strong style={{color:T.fg}}>{fmtO(tetoMensal-totalGasto)}</strong></span>
          <span style={{ fontWeight:600, color: tetoPct>=100?'#ef4444':tetoPct>=80?'#f59e0b':'#10b981' }}>{Math.round(tetoPct)}%</span>
        </div>
      </div>

      {/* Category cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {cards.map((card, idx) => {
          const temLimite = card.limite !== null;
          const pct = temLimite ? (card.gasto / card.limite) * 100 : 0;
          const excedeu = temLimite && card.gasto > card.limite;
          const isEditing = editingIdx === idx;

          return (
            <div key={card.cat} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:16 }}>
              {/* Head */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:card.cor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                    {card.cat.split(' ')[0]}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500 }}>{card.cat.split(' ').slice(1).join(' ')}</p>
                    <p style={{ fontSize:11, color:T.fg2 }}>
                      {temLimite ? `Limite: ${fmtO(card.limite)}` : 'Sem limite definido'}
                    </p>
                  </div>
                </div>
                <button onClick={()=>{ setEditingIdx(idx); setLimitInput(card.limite ? String(card.limite) : ''); }}
                  style={{ width:26, height:26, border:'none', background:'transparent', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f4f4f5'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 3a2.83 2.83 0 014 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </button>
              </div>

              {/* Inline edit */}
              {isEditing && (
                <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                  <input value={limitInput} onChange={e=>setLimitInput(e.target.value)}
                    placeholder="Ex: 1000"
                    style={{ flex:1, height:32, border:`1px solid ${T.border}`, borderRadius:7, padding:'0 10px', fontFamily:'Inter,sans-serif', fontSize:12, outline:'none' }}/>
                  <button onClick={()=>saveLimit(idx)} style={{ height:32, padding:'0 10px', background:T.primary, color:T.primaryFg, border:'none', borderRadius:7, fontFamily:'Inter,sans-serif', fontSize:12, cursor:'pointer' }}>Salvar</button>
                  <button onClick={()=>setEditingIdx(null)} style={{ height:32, padding:'0 10px', background:'transparent', border:`1px solid ${T.border}`, borderRadius:7, fontFamily:'Inter,sans-serif', fontSize:12, cursor:'pointer' }}>×</button>
                </div>
              )}

              {/* Progress */}
              {temLimite && <div style={{marginBottom:8}}><BarraProg pct={pct}/></div>}

              {/* Footer */}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                <span style={{ color:T.fg2 }}>Gasto: <strong style={{color:T.fg}}>{fmtO(card.gasto)}</strong></span>
                {temLimite && (
                  excedeu
                    ? <span style={{ color:'#ef4444', fontWeight:600 }}>Excedeu {fmtO(card.gasto - card.limite)}</span>
                    : <span style={{ color:T.fg2 }}>Restante: <strong style={{color:T.fg}}>{fmtO(card.limite - card.gasto)}</strong></span>
                )}
                {temLimite && <span style={{ fontWeight:600, color: pct>=100?'#ef4444':pct>=80?'#f59e0b':'#10b981' }}>{Math.round(pct)}%</span>}
              </div>

              {/* Lancamentos chip */}
              {card.txCount > 0 && (
                <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between', background:T.muted, borderRadius:8, padding:'7px 10px', cursor:'pointer', fontSize:11, color:T.fg2 }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f4f4f5'}
                  onMouseLeave={e=>e.currentTarget.style.background='#f9fafb'}>
                  <span>{card.txCount} lançamento{card.txCount!==1?'s':''}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { OrcamentosPage });
