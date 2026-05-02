// Metas.jsx — VeP Finance UI Kit
const { useState } = React;

const fmtM = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const METAS = [
  { id:1, nome:'Reserva de emergência', icone:'🛡️', valorObj:30000, valorAtual:18500, aporte:1500, prazo:'Dez 2026' },
  { id:2, nome:'Viagem Europa',          icone:'✈️', valorObj:15000, valorAtual:4200,  aporte:800,  prazo:'Jun 2027' },
  { id:3, nome:'Notebook novo',          icone:'💻', valorObj:6000,  valorAtual:6000,  aporte:null, prazo:null },
  { id:4, nome:'Entrada do apartamento', icone:'🏠', valorObj:80000, valorAtual:12000, aporte:3000, prazo:'Jan 2029' },
];

function ProgressRing({ pct, cor, size=64 }) {
  const r = (size-8)/2, circ = 2*Math.PI*r;
  const offset = circ - (Math.min(pct,100)/100)*circ;
  return (
    <svg width={size} height={size} style={{flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={cor} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{transition:'stroke-dashoffset 0.5s'}}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill={cor} fontFamily="Inter">{Math.round(pct)}%</text>
    </svg>
  );
}

function MetasPage({ T }) {
  const [modal, setModal] = useState(false);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:22,maxWidth:860}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,letterSpacing:'-0.01em',color:T.fg}}>Metas</h1>
          <p style={{fontSize:12,color:T.fg2,marginTop:2}}>Acompanhe seus objetivos financeiros</p>
        </div>
        <button onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:6,height:36,padding:'0 14px',background:T.primary,color:T.primaryFg,border:'none',borderRadius:8,fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:500,cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova meta
        </button>
      </div>

      {/* Summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[
          {label:'Total acumulado', val:40700,  color:'#10b981'},
          {label:'Meta ativa com maior progresso', val:'Notebook ✅', isText:true, color:T.fg},
          {label:'Aporte mensal total', val:5300, color:'#6366f1'},
        ].map(item=>(
          <div key={item.label} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:'14px 18px'}}>
            <p style={{fontSize:11,color:T.fg2,marginBottom:4}}>{item.label}</p>
            <p style={{fontFamily: item.isText?'Inter':'Inter',fontSize:item.isText?14:18,fontWeight:700,fontVariantNumeric:'tabular-nums',color:item.color}}>
              {item.isText ? item.val : fmtM(item.val)}
            </p>
          </div>
        ))}
      </div>

      {/* Meta cards */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {METAS.map(meta => {
          const pct = Math.min((meta.valorAtual/meta.valorObj)*100, 100);
          const concluida = pct >= 100;
          const faltante = meta.valorObj - meta.valorAtual;
          const cor = concluida ? '#10b981' : pct >= 70 ? '#6366f1' : pct >= 40 ? '#f59e0b' : '#94a3b8';
          const mesesFaltam = meta.aporte && faltante > 0 ? Math.ceil(faltante/meta.aporte) : null;

          return (
            <div key={meta.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:18,display:'flex',gap:14}}>
              <ProgressRing pct={pct} cor={cor}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6}}>
                  <div>
                    <span style={{fontSize:16,marginRight:6}}>{meta.icone}</span>
                    <span style={{fontSize:14,fontWeight:600,color:T.fg}}>{meta.nome}</span>
                  </div>
                  {concluida && <span style={{fontSize:11,fontWeight:600,background:'#d1fae5',color:'#065f46',padding:'2px 8px',borderRadius:9999}}>Concluída ✓</span>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                  <div><p style={{fontSize:10,color:T.fg2}}>Acumulado</p><p style={{fontFamily:'Inter',fontSize:13,fontWeight:700,fontVariantNumeric:'tabular-nums',color:'#10b981'}}>{fmtM(meta.valorAtual)}</p></div>
                  <div><p style={{fontSize:10,color:T.fg2}}>Objetivo</p><p style={{fontFamily:'Inter',fontSize:13,fontWeight:700,fontVariantNumeric:'tabular-nums',color:T.fg}}>{fmtM(meta.valorObj)}</p></div>
                  {meta.aporte && <div><p style={{fontSize:10,color:T.fg2}}>Aporte/mês</p><p style={{fontFamily:'Inter',fontSize:13,fontWeight:600,color:T.fg}}>{fmtM(meta.aporte)}</p></div>}
                  {mesesFaltam && <div><p style={{fontSize:10,color:T.fg2}}>Conclusão</p><p style={{fontSize:13,fontWeight:600,color:T.fg}}>{meta.prazo}</p></div>}
                </div>
                {!concluida && (
                  <div style={{height:5,background:T.muted,borderRadius:9999,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:cor,borderRadius:9999,transition:'width 0.3s'}}/>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal nova meta */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}} onClick={()=>setModal(false)}>
          <div style={{background:T.card,borderRadius:16,padding:28,width:400,boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:20,color:T.fg}}>Nova meta</h2>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {[['Nome da meta','text','Ex: Reserva de emergência'],['Valor objetivo','text','R$ 0,00'],['Aporte mensal','text','R$ 0,00 (opcional)']].map(([lbl,type,ph])=>(
                <div key={lbl}>
                  <label style={{fontSize:12,fontWeight:500,display:'block',marginBottom:4,color:T.fg}}>{lbl}</label>
                  <input type={type} placeholder={ph} style={{width:'100%',height:36,border:`1px solid ${T.border}`,borderRadius:8,padding:'0 12px',fontFamily:'Inter,sans-serif',fontSize:13,outline:'none',background:T.input,color:T.fg}}/>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
              <button onClick={()=>setModal(false)} style={{height:36,padding:'0 14px',border:`1px solid ${T.border}`,borderRadius:8,background:T.card,color:T.fg,fontFamily:'Inter,sans-serif',fontSize:13,cursor:'pointer'}}>Cancelar</button>
              <button onClick={()=>setModal(false)} style={{height:36,padding:'0 14px',background:T.primary,color:T.primaryFg,border:'none',borderRadius:8,fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:500,cursor:'pointer'}}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MetasPage });
