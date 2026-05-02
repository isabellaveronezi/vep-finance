// Cartoes.jsx — FinControl UI Kit
const { useState } = React;

const fmtC = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const CARTOES = [
  { id:1, nome:'Nubank',    bandeira:'Visa',       limite:5000,  utilizado:1240, saldoAPagar:980,  cor:'#8b5cf6', diaFech:10, diaVenc:17 },
  { id:2, nome:'Inter',     bandeira:'Mastercard', limite:4000,  utilizado:3800, saldoAPagar:2100, cor:'#f97316', diaFech:5,  diaVenc:12 },
  { id:3, nome:'C6 Bank',   bandeira:'Visa',       limite:8000,  utilizado:650,  saldoAPagar:650,  cor:'#171717', diaFech:15, diaVenc:22 },
  { id:4, nome:'Itaú Gold', bandeira:'Visa',       limite:12000, utilizado:4200, saldoAPagar:3900, cor:'#3b82f6', diaFech:20, diaVenc:27 },
];

const FATURAS = [
  { mes:'Jan', valor:1800 }, { mes:'Fev', valor:2200 }, { mes:'Mar', valor:1600 },
  { mes:'Abr', valor:2800 }, { mes:'Mai', valor:1400 }, { mes:'Jun', valor:3100 },
];

function CreditCard({ cartao, selected, onClick }) {
  const disponivel = cartao.limite - cartao.saldoAPagar;
  const pct = Math.min((cartao.utilizado / cartao.limite) * 100, 100);
  return (
    <div onClick={onClick} style={{
      borderRadius:20, padding:22, color:T.primaryFg, background:cartao.cor,
      boxShadow: selected ? `0 8px 30px ${cartao.cor}60` : '0 4px 16px rgba(0,0,0,0.15)',
      cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s',
      transform: selected ? 'translateY(-3px)' : 'none',
    }}>
      {/* Top */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <p style={{ fontSize:10, opacity:0.75, fontWeight:500 }}>Cartão de crédito</p>
          <p style={{ fontSize:17, fontWeight:700, marginTop:3 }}>{cartao.nome}</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          {cartao.bandeira && <span style={{ fontSize:10, opacity:0.7 }}>{cartao.bandeira}</span>}
        </div>
      </div>
      {/* Values */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {[['Utilizado',fmtC(cartao.utilizado)],['Disponível',fmtC(disponivel)],['Limite total',fmtC(cartao.limite)],['Próx. fatura',fmtC(cartao.saldoAPagar)]].map(([l,v])=>(
          <div key={l}><p style={{ fontSize:10, opacity:0.7 }}>{l}</p><p style={{ fontFamily:'Inter,monospace', fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{v}</p></div>
        ))}
      </div>
      {/* Progress */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, opacity:0.7, marginBottom:4 }}>
          <span>Uso do limite</span><span>{pct.toFixed(0)}%</span>
        </div>
        <div style={{ height:5, borderRadius:9999, background:'rgba(255,255,255,0.3)' }}>
          <div style={{ height:'100%', borderRadius:9999, background:T.card, width:`${pct}%`, transition:'width 0.3s' }}/>
        </div>
      </div>
      {/* Dates */}
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, opacity:0.7, borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:10 }}>
        <span>Fecha dia {cartao.diaFech}</span><span>Vence dia {cartao.diaVenc}</span>
      </div>
    </div>
  );
}

function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map(d=>d.valor));
  return (
    <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:60 }}>
      {data.map(d => (
        <div key={d.mes} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ width:'100%', background:color, borderRadius:'3px 3px 0 0', opacity: d.mes==='Abr' ? 1 : 0.4, height: `${(d.valor/max)*48}px`, transition:'height 0.3s' }}/>
          <span style={{ fontSize:9, color:'#aaa' }}>{d.mes}</span>
        </div>
      ))}
    </div>
  );
}

function CartoesPage({ T = window.LIGHT }) {
  const [selected, setSelected] = useState(0);
  const cartao = CARTOES[selected];

  const totalLimite    = CARTOES.reduce((s,c)=>s+c.limite,0);
  const totalUtilizado = CARTOES.reduce((s,c)=>s+c.utilizado,0);
  const totalDisp      = totalLimite - CARTOES.reduce((s,c)=>s+c.saldoAPagar,0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24, maxWidth:940 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.01em' }}>Cartões</h1>
          <p style={{ fontSize:12, color:T.fg2, marginTop:2 }}>{CARTOES.length} cartões cadastrados</p>
        </div>
        <button style={{ display:'flex', alignItems:'center', gap:6, height:36, padding:'0 14px', background:'#0f172a', color:T.primaryFg, border:'none', borderRadius:8, fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:500, cursor:'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo cartão
        </button>
      </div>

      {/* Summary chips */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Limite total', val:totalLimite, color:T.fg2 },
          { label:'Total utilizado', val:totalUtilizado, color:'#ef4444' },
          { label:'Disponível total', val:totalDisp, color:'#10b981' },
        ].map(item=>(
          <div key={item.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:'14px 18px' }}>
            <p style={{ fontSize:11, color:T.fg2, marginBottom:4 }}>{item.label}</p>
            <p style={{ fontFamily:'Inter,monospace', fontSize:18, fontWeight:700, fontVariantNumeric:'tabular-nums', color:item.color }}>{fmtC(item.val)}</p>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
        {CARTOES.map((c,i)=><CreditCard key={c.id} cartao={c} selected={selected===i} onClick={()=>setSelected(i)}/>)}
      </div>

      {/* Detail panel */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:22 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:cartao.cor }}/>
          <span style={{ fontSize:14, fontWeight:600 }}>{cartao.nome} — Histórico de faturas</span>
        </div>
        <MiniBarChart data={FATURAS} color={cartao.cor}/>
        <div style={{ display:'flex', gap:10, marginTop:14 }}>
          {[
            { label:'Fatura atual', val:cartao.saldoAPagar, color:cartao.cor },
            { label:`Vence dia ${cartao.diaVenc}`, val:null, color:T.fg2 },
            { label:'Fechar dia', val:null, extra:`${cartao.diaFech} do mês`, color:T.fg2 },
          ].map(item=>(
            <div key={item.label} style={{ flex:1, background:T.muted, borderRadius:10, padding:'12px 14px', border:`1px solid ${T.border}` }}>
              <p style={{ fontSize:10, color:T.fg2, marginBottom:3 }}>{item.label}</p>
              <p style={{ fontFamily: item.val!==null ? 'Inter,monospace' : 'Inter,sans-serif', fontSize:14, fontWeight:600, color:item.color, fontVariantNumeric:'tabular-nums' }}>
                {item.val !== null ? fmtC(item.val) : (item.extra || '—')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CartoesPage });
