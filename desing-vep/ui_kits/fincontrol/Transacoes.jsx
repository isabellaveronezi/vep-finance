// Transacoes.jsx — FinControl UI Kit
const { useState } = React;

const fmtTx = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const ALL_TX = [
  { id:1,  desc:'Salário mensal',      tipo:'ENTRADA', valor:6800,   data:'20/04/2026', cat:'💼 Trabalho',     catId:'trab',  status:'PAGO',      cartao:null,    parcela:null },
  { id:2,  desc:'Supermercado Extra',  tipo:'SAIDA',   valor:312.40, data:'19/04/2026', cat:'🛒 Alimentação',  catId:'alim',  status:'PAGO',      cartao:'Nubank',parcela:null },
  { id:3,  desc:'Netflix',             tipo:'SAIDA',   valor:55.90,  data:'18/04/2026', cat:'🎬 Streaming',    catId:'strea', status:'PARCELADO', cartao:'Inter', parcela:'2/12' },
  { id:4,  desc:'Aluguel',             tipo:'SAIDA',   valor:1800,   data:'01/04/2026', cat:'🏠 Moradia',      catId:'mor',   status:'PENDENTE',  cartao:null,    parcela:null },
  { id:5,  desc:'Combustível',         tipo:'SAIDA',   valor:180,    data:'17/04/2026', cat:'🚗 Transporte',   catId:'transp',status:'PAGO',      cartao:'Nubank',parcela:null },
  { id:6,  desc:'Academia Smart Fit',  tipo:'SAIDA',   valor:99.90,  data:'15/04/2026', cat:'💪 Saúde',        catId:'sau',   status:'PAGO',      cartao:null,    parcela:null },
  { id:7,  desc:'Spotify',             tipo:'SAIDA',   valor:21.90,  data:'14/04/2026', cat:'🎵 Streaming',    catId:'strea', status:'PAGO',      cartao:'Inter', parcela:'1/12' },
  { id:8,  desc:'Freelance web',       tipo:'ENTRADA', valor:1200,   data:'12/04/2026', cat:'💼 Trabalho',     catId:'trab',  status:'PAGO',      cartao:null,    parcela:null },
  { id:9,  desc:'Farmácia',            tipo:'SAIDA',   valor:87.50,  data:'10/04/2026', cat:'💊 Saúde',        catId:'sau',   status:'PAGO',      cartao:'Nubank',parcela:null },
  { id:10, desc:'Restaurante',         tipo:'SAIDA',   valor:135,    data:'09/04/2026', cat:'🍽️ Alimentação',  catId:'alim',  status:'PAGO',      cartao:'Nubank',parcela:null },
];

const CATS_FILTER = [
  {id:'alim',label:'🛒 Alimentação'},{id:'mor',label:'🏠 Moradia'},
  {id:'transp',label:'🚗 Transporte'},{id:'sau',label:'💪 Saúde'},
  {id:'strea',label:'🎬 Streaming'},{id:'trab',label:'💼 Trabalho'},
];

const BS = { PAGO:{bg:'#d1fae5',c:'#065f46'}, PENDENTE:{bg:'#fef3c7',c:'#92400e'}, PARCELADO:{bg:'#dbeafe',c:'#1e40af'} };
const BL = { PAGO:'Pago', PENDENTE:'Pendente', PARCELADO:'Parcelado' };

function Select({ value, onChange, children, width=140 }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ height:36, padding:'0 10px', border:`1px solid ${T.border}`, borderRadius:8, fontFamily:'Inter,sans-serif', fontSize:13, color:T.fg, background:T.card, cursor:'pointer', width }}>
      {children}
    </select>
  );
}

function TransacoesPage({ T = window.LIGHT }) {
  const [busca, setBusca]   = useState('');
  const [tipo, setTipo]     = useState('TODOS');
  const [status, setStatus] = useState('TODOS');
  const [cat, setCat]       = useState('TODOS');
  const [modal, setModal]   = useState(false);

  const filtered = ALL_TX.filter(t => {
    if (tipo !== 'TODOS' && t.tipo !== tipo) return false;
    if (status !== 'TODOS' && t.status !== status) return false;
    if (cat !== 'TODOS' && t.catId !== cat) return false;
    if (busca && !t.desc.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const totalIn  = filtered.filter(t=>t.tipo==='ENTRADA'&&t.status==='PAGO').reduce((s,t)=>s+t.valor,0);
  const totalOut = filtered.filter(t=>t.tipo==='SAIDA'&&t.status==='PAGO').reduce((s,t)=>s+t.valor,0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18, maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.01em' }}>Transações</h1>
          <p style={{ fontSize:12, color:T.fg2, marginTop:2 }}>{ALL_TX.length} lançamentos</p>
        </div>
        <button onClick={()=>setModal(true)} style={{ display:'flex', alignItems:'center', gap:6, height:36, padding:'0 14px', background:'#0f172a', color:T.primaryFg, border:'none', borderRadius:8, fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:500, cursor:'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova transação
        </button>
      </div>

      {/* Totals row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[{label:'Entradas (pagas)',val:totalIn,c:'#10b981',icon:'up'},{label:'Saídas (pagas)',val:totalOut,c:'#ef4444',icon:'down'}].map(item=>(
          <div key={item.label} style={{ display:'flex', alignItems:'center', gap:10, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', background:T.card }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={item.c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.icon==='up'
                ? <><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></>
                : <><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></>}
            </svg>
            <div>
              <p style={{ fontSize:11, color:T.fg2 }}>{item.label}</p>
              <p style={{ fontSize:14, fontFamily:'Inter', fontWeight:600, fontVariantNumeric:'tabular-nums', color:item.c }}>{fmtTx(item.val)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:160 }}>
          <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#aaa', pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar..."
            style={{ width:'100%', height:36, paddingLeft:32, paddingRight:12, border:`1px solid ${T.border}`, borderRadius:8, fontFamily:'Inter,sans-serif', fontSize:13, outline:'none' }}/>
        </div>
        <Select value={tipo} onChange={setTipo} width={148}>
          <option value="TODOS">Todos os tipos</option>
          <option value="ENTRADA">Receitas</option>
          <option value="SAIDA">Despesas</option>
        </Select>
        <Select value={status} onChange={setStatus} width={148}>
          <option value="TODOS">Todos os status</option>
          <option value="PAGO">Pago</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PARCELADO">Parcelado</option>
        </Select>
        <Select value={cat} onChange={setCat} width={170}>
          <option value="TODOS">Todas as categorias</option>
          {CATS_FILTER.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0
        ? <p style={{ textAlign:'center', color:'#aaa', padding:'40px 0', border:`1px solid ${T.border}`, borderRadius:10 }}>Nenhuma transação encontrada.</p>
        : <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          {filtered.map(t => {
            const bs = BS[t.status];
            return (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 16px', background:T.card, transition:'background 0.1s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                onMouseLeave={e=>e.currentTarget.style.background='white'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.tipo==='ENTRADA'?'#10b981':'#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {t.tipo==='ENTRADA'
                    ? <><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></>
                    : <><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></>}
                </svg>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.desc}</p>
                  <p style={{ fontSize:11, color:T.fg2, marginTop:1 }}>
                    {t.data} · {t.cat}{t.cartao?` · ${t.cartao}`:''}{t.parcela?` · ${t.parcela}x`:''}
                  </p>
                </div>
                <span style={{ fontFamily:'Inter', fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums', color:t.tipo==='ENTRADA'?'#10b981':'#ef4444', flexShrink:0 }}>
                  {t.tipo==='ENTRADA'?'+':'−'}{fmtTx(t.valor)}
                </span>
                <span style={{ display:'inline-flex', alignItems:'center', height:20, padding:'0 7px', borderRadius:9999, fontSize:11, fontWeight:500, background:bs.bg, color:bs.c, flexShrink:0, cursor:'pointer' }}>
                  {BL[t.status]}
                </span>
                <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                  {['M17 3a2.83 2.83 0 014 4L7.5 20.5 2 22l1.5-5.5L17 3z','M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2'].map((d,i)=>(
                    <button key={i} style={{ width:28, height:28, border:'none', background:'transparent', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:i===1?'#ef4444':'#666' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f4f4f5'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      }

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }} onClick={()=>setModal(false)}>
          <div style={{ background:T.card, borderRadius:16, padding:28, width:420, boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }} onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Nova transação</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[['Descrição','text','Ex: Supermercado Extra'],['Data','date',''],['Valor','text','R$ 0,00']].map(([lbl,type,ph])=>(
                <div key={lbl}>
                  <label style={{ fontSize:12, fontWeight:500, display:'block', marginBottom:4, color:'#374151' }}>{lbl}</label>
                  <input type={type} placeholder={ph} style={{ width:'100%', height:36, border:`1px solid ${T.border}`, borderRadius:8, padding:'0 12px', fontFamily:'Inter,sans-serif', fontSize:13, outline:'none' }}/>
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['Tipo',['Despesa','Receita']],['Status',['Pago','Pendente','Parcelado']]].map(([lbl,opts])=>(
                  <div key={lbl}>
                    <label style={{ fontSize:12, fontWeight:500, display:'block', marginBottom:4, color:'#374151' }}>{lbl}</label>
                    <select style={{ width:'100%', height:36, border:`1px solid ${T.border}`, borderRadius:8, padding:'0 10px', fontFamily:'Inter,sans-serif', fontSize:13 }}>
                      {opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button onClick={()=>setModal(false)} style={{ height:36, padding:'0 14px', border:`1px solid ${T.border}`, borderRadius:8, background:T.card, fontFamily:'Inter,sans-serif', fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button onClick={()=>setModal(false)} style={{ height:36, padding:'0 14px', background:'#0f172a', color:T.primaryFg, border:'none', borderRadius:8, fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:500, cursor:'pointer' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TransacoesPage });
