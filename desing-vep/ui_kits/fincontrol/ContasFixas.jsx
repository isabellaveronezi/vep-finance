// ContasFixas.jsx — VeP Finance UI Kit
const { useState } = React;

const fmtCF = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const CONTAS = [
  { id:1, desc:'Aluguel',         cat:'🏠 Moradia',     valor:1800,  dia:5,  status:'PENDENTE',  recorrente:true  },
  { id:2, desc:'Internet Vivo',   cat:'📡 Serviços',    valor:109.90,dia:10, status:'PAGO',      recorrente:true  },
  { id:3, desc:'Energia Enel',    cat:'⚡ Serviços',    valor:187.40,dia:12, status:'PAGO',      recorrente:true  },
  { id:4, desc:'Seguro do carro', cat:'🚗 Transporte',  valor:320,   dia:15, status:'PENDENTE',  recorrente:true  },
  { id:5, desc:'Condomínio',      cat:'🏠 Moradia',     valor:550,   dia:5,  status:'PAGO',      recorrente:true  },
  { id:6, desc:'Plano de saúde',  cat:'💊 Saúde',       valor:489,   dia:20, status:'PAGO',      recorrente:true  },
  { id:7, desc:'Spotify',         cat:'🎵 Streaming',   valor:21.90, dia:18, status:'PAGO',      recorrente:true  },
  { id:8, desc:'Assinatura Adobe',cat:'🎨 Serviços',    valor:89,    dia:22, status:'PENDENTE',  recorrente:false },
];

const BS = { PAGO:{bg:'#d1fae5',c:'#065f46'}, PENDENTE:{bg:'#fef3c7',c:'#92400e'} };

function ContasFixasPage({ T }) {
  const [contas, setContas] = useState(CONTAS);
  const [modal, setModal]   = useState(false);

  function toggleStatus(id) {
    setContas(cs => cs.map(c => c.id===id ? {...c, status: c.status==='PAGO'?'PENDENTE':'PAGO'} : c));
  }

  const totalMensal  = contas.reduce((s,c)=>s+c.valor,0);
  const totalPago    = contas.filter(c=>c.status==='PAGO').reduce((s,c)=>s+c.valor,0);
  const totalPendente= contas.filter(c=>c.status==='PENDENTE').reduce((s,c)=>s+c.valor,0);
  const pendentes    = contas.filter(c=>c.status==='PENDENTE');

  return (
    <div style={{display:'flex',flexDirection:'column',gap:22,maxWidth:860}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,letterSpacing:'-0.01em',color:T.fg}}>Contas Fixas</h1>
          <p style={{fontSize:12,color:T.fg2,marginTop:2}}>{contas.length} contas cadastradas</p>
        </div>
        <button onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:6,height:36,padding:'0 14px',background:T.primary,color:T.primaryFg,border:'none',borderRadius:8,fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:500,cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova conta fixa
        </button>
      </div>

      {/* Summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[
          {label:'Total mensal',   val:totalMensal,   color:T.fg},
          {label:'Já pago',        val:totalPago,     color:'#10b981'},
          {label:'Pendente',       val:totalPendente, color:'#f59e0b'},
        ].map(item=>(
          <div key={item.label} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:'14px 18px'}}>
            <p style={{fontSize:11,color:T.fg2,marginBottom:4}}>{item.label}</p>
            <p style={{fontFamily:'Inter',fontSize:18,fontWeight:700,fontVariantNumeric:'tabular-nums',color:item.color}}>{fmtCF(item.val)}</p>
          </div>
        ))}
      </div>

      {/* Alert pendentes */}
      {pendentes.length > 0 && (
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{fontSize:13,color:'#92400e',fontWeight:500}}>
            {pendentes.length} conta{pendentes.length>1?'s':''} pendente{pendentes.length>1?'s':''} — vence{pendentes.length>1?'m':''} em breve
          </span>
        </div>
      )}

      {/* List */}
      <div style={{display:'flex',flexDirection:'column',gap:4}}>
        {/* Pendentes first */}
        {['PENDENTE','PAGO'].map(grupo => {
          const grupo_contas = contas.filter(c=>c.status===grupo);
          if (!grupo_contas.length) return null;
          return (
            <div key={grupo}>
              <p style={{fontSize:11,fontWeight:600,color:T.fg2,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6,marginTop:4}}>
                {grupo==='PENDENTE'?'⚠️ Pendentes':'✓ Pagas'}
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:3}}>
                {grupo_contas.map(c => {
                  const bs = BS[c.status];
                  return (
                    <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,border:`1px solid ${T.border}`,borderRadius:10,padding:'11px 16px',background:T.card,transition:'background 0.1s'}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.hover}
                      onMouseLeave={e=>e.currentTarget.style.background=T.card}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:13,fontWeight:500,color:T.fg}}>{c.desc}</p>
                        <p style={{fontSize:11,color:T.fg2,marginTop:1}}>{c.cat} · Vence dia {c.dia}{c.recorrente?' · Recorrente':''}</p>
                      </div>
                      <span style={{fontFamily:'Inter',fontSize:14,fontWeight:700,fontVariantNumeric:'tabular-nums',color:T.fg,flexShrink:0}}>{fmtCF(c.valor)}</span>
                      <button onClick={()=>toggleStatus(c.id)}
                        style={{display:'inline-flex',alignItems:'center',height:22,padding:'0 8px',borderRadius:9999,fontSize:11,fontWeight:500,background:bs.bg,color:bs.c,border:'none',cursor:'pointer',flexShrink:0}}>
                        {c.status==='PAGO'?'Pago':'Pendente'}
                      </button>
                      <button style={{width:26,height:26,border:'none',background:'transparent',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#ef4444',flexShrink:0}}
                        onMouseEnter={e=>e.currentTarget.style.background=T.hover}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}} onClick={()=>setModal(false)}>
          <div style={{background:T.card,borderRadius:16,padding:28,width:380,boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:20,color:T.fg}}>Nova conta fixa</h2>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {[['Descrição','Ex: Aluguel'],['Valor','R$ 0,00'],['Dia de vencimento','Ex: 5']].map(([lbl,ph])=>(
                <div key={lbl}>
                  <label style={{fontSize:12,fontWeight:500,display:'block',marginBottom:4,color:T.fg}}>{lbl}</label>
                  <input placeholder={ph} style={{width:'100%',height:36,border:`1px solid ${T.border}`,borderRadius:8,padding:'0 12px',fontFamily:'Inter',fontSize:13,outline:'none',background:T.input,color:T.fg}}/>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
              <button onClick={()=>setModal(false)} style={{height:36,padding:'0 14px',border:`1px solid ${T.border}`,borderRadius:8,background:T.card,color:T.fg,fontFamily:'Inter',fontSize:13,cursor:'pointer'}}>Cancelar</button>
              <button onClick={()=>setModal(false)} style={{height:36,padding:'0 14px',background:T.primary,color:T.primaryFg,border:'none',borderRadius:8,fontFamily:'Inter',fontSize:13,fontWeight:500,cursor:'pointer'}}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ContasFixasPage });
