// Categorias.jsx — VeP Finance UI Kit
const { useState } = React;

const fmtCat = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const CATS_DATA = [
  { id:1, nome:'Alimentação', icone:'🛒', cor:'#fef3c7', tipo:'SAIDA',   gasto:528,   limite:1200 },
  { id:2, nome:'Moradia',     icone:'🏠', cor:'#fee2e2', tipo:'SAIDA',   gasto:1950,  limite:1800 },
  { id:3, nome:'Transporte',  icone:'🚗', cor:'#dbeafe', tipo:'SAIDA',   gasto:288,   limite:400  },
  { id:4, nome:'Saúde',       icone:'💪', cor:'#d1fae5', tipo:'SAIDA',   gasto:187,   limite:null },
  { id:5, nome:'Streaming',   icone:'🎬', cor:'#ede9fe', tipo:'SAIDA',   gasto:77.80, limite:100  },
  { id:6, nome:'Trabalho',    icone:'💼', cor:'#f0fdf4', tipo:'ENTRADA', gasto:8000,  limite:null },
  { id:7, nome:'Lazer',       icone:'🎮', cor:'#fdf4ff', tipo:'SAIDA',   gasto:220,   limite:300  },
  { id:8, nome:'Educação',    icone:'📚', cor:'#eff6ff', tipo:'SAIDA',   gasto:0,     limite:500  },
];

function CategoriasPage({ T }) {
  const [modal, setModal]   = useState(false);
  const [filtro, setFiltro] = useState('TODOS');
  const cats = CATS_DATA.filter(c => filtro==='TODOS' || c.tipo===filtro);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:22,maxWidth:860}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,letterSpacing:'-0.01em',color:T.fg}}>Categorias</h1>
          <p style={{fontSize:12,color:T.fg2,marginTop:2}}>{CATS_DATA.length} categorias cadastradas</p>
        </div>
        <button onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:6,height:36,padding:'0 14px',background:T.primary,color:T.primaryFg,border:'none',borderRadius:8,fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:500,cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova categoria
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:4,background:T.muted,borderRadius:10,padding:3,width:'fit-content',border:`1px solid ${T.border}`}}>
        {[['TODOS','Todas'],['SAIDA','Despesas'],['ENTRADA','Receitas']].map(([val,lbl])=>(
          <button key={val} onClick={()=>setFiltro(val)}
            style={{padding:'5px 14px',borderRadius:8,border:'none',fontFamily:'Inter',fontSize:12,fontWeight:500,cursor:'pointer',background:filtro===val?T.card:'transparent',color:filtro===val?T.fg:T.fg2,boxShadow:filtro===val?'0 1px 3px rgba(0,0,0,0.08)':'none',transition:'all 0.1s'}}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Category grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
        {cats.map(cat => {
          const pct = cat.limite ? Math.min((cat.gasto/cat.limite)*100,100) : null;
          const barCor = !pct ? '#94a3b8' : pct>=100?'#ef4444':pct>=80?'#f59e0b':pct>=60?'#eab308':'#10b981';
          return (
            <div key={cat.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16,display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:42,height:42,borderRadius:10,background:cat.cor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{cat.icone}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                  <p style={{fontSize:14,fontWeight:600,color:T.fg}}>{cat.nome}</p>
                  <span style={{fontSize:11,padding:'2px 7px',borderRadius:9999,background:cat.tipo==='ENTRADA'?'#d1fae5':'#f1f5f9',color:cat.tipo==='ENTRADA'?'#065f46':T.fg2,fontWeight:500}}>{cat.tipo==='ENTRADA'?'Receita':'Despesa'}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:T.fg2,marginBottom:pct!==null?8:0}}>
                  <span>Gasto: <strong style={{color:T.fg}}>{fmtCat(cat.gasto)}</strong></span>
                  {cat.limite && <span>Limite: <strong style={{color:T.fg}}>{fmtCat(cat.limite)}</strong></span>}
                </div>
                {pct !== null && (
                  <div style={{height:5,background:T.muted,borderRadius:9999,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:barCor,borderRadius:9999,transition:'width 0.3s'}}/>
                  </div>
                )}
              </div>
              <button style={{width:26,height:26,border:'none',background:'transparent',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:T.fg2,flexShrink:0}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hover}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.83 2.83 0 014 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>
            </div>
          );
        })}
      </div>

      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}} onClick={()=>setModal(false)}>
          <div style={{background:T.card,borderRadius:16,padding:28,width:380,boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:20,color:T.fg}}>Nova categoria</h2>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div>
                <label style={{fontSize:12,fontWeight:500,display:'block',marginBottom:4,color:T.fg}}>Nome</label>
                <input placeholder="Ex: Alimentação" style={{width:'100%',height:36,border:`1px solid ${T.border}`,borderRadius:8,padding:'0 12px',fontFamily:'Inter',fontSize:13,outline:'none',background:T.input,color:T.fg}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:500,display:'block',marginBottom:4,color:T.fg}}>Emoji (ícone)</label>
                <input placeholder="Ex: 🛒" style={{width:'100%',height:36,border:`1px solid ${T.border}`,borderRadius:8,padding:'0 12px',fontFamily:'Inter',fontSize:16,outline:'none',background:T.input,color:T.fg}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:500,display:'block',marginBottom:4,color:T.fg}}>Tipo</label>
                <select style={{width:'100%',height:36,border:`1px solid ${T.border}`,borderRadius:8,padding:'0 12px',fontFamily:'Inter',fontSize:13,background:T.input,color:T.fg}}>
                  <option>Despesa</option><option>Receita</option>
                </select>
              </div>
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

Object.assign(window, { CategoriasPage });
