const { useState, useEffect, useMemo } = React;
const { HashRouter, Routes, Route, Link, useParams, useSearchParams, useNavigate } = ReactRouterDOM;
const html = htm.bind(React.createElement);

const BASE = "https://dummyjson.com";
const PAGE_SIZE = 12;

function request(url){
  return fetch(url,{headers:{Accept:"application/json"}})
    .then(r=>{ if(!r.ok) throw new Error(`HTTP ${r.status} at ${r.url}`); return r.json(); });
}

function ListPage(){
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const [data,setData] = useState({recipes:[], total:0});
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState("");

  useEffect(()=>{
    let alive = true;
    setLoading(true);
    const skip = (page-1)*PAGE_SIZE;
    request(`${BASE}/recipes?limit=${PAGE_SIZE}&skip=${skip}`)
      .then(d=>{ if(!alive) return; setData(d); setErr(""); })
      .catch(e=>{ if(!alive) return; setErr(e.message); })
      .finally(()=> alive && setLoading(false));
    return ()=>{ alive=false; };
  },[page]);

  const totalPages = useMemo(()=> Math.max(1, Math.ceil((data.total||0)/PAGE_SIZE)), [data.total]);
  const go = (p)=> setSearchParams({ page: String(p) });

  return html`
    <div className="wrap">
      <header>천개의 레시피</header>
      ${err && html`<div className="err">${err}</div>`}

      <div className="grid">
        ${(loading ? Array.from({length:12}) : data.recipes).map((r,i)=> html`
          <${Link} className="card" key=${r?.id ?? i} to=${`/recipe/${r?.id ?? 0}`}>
            <div className="thumb" style=${{backgroundImage: loading ? "" : `url(${r.image})`}} />
            <div className="card-body">
              <div className="ttl" title=${r?.name}>${loading ? " " : r.name}</div>
              ${!loading && html`
                <div className="chips">
                  ${((r.tags ?? r.mealType ?? []).slice(0,3)).map(t=> html`<span className="chip" key=${t}>${t}</span>`)}
                </div>
              `}
            </div>
          </${Link}>
        `)}
      </div>

      <div className="pg">
        <button className="btn" onClick=${()=>go(Math.max(1,page-1))} disabled=${page===1}>이전</button>
        ${Array.from({length: Math.min(10,totalPages)},(_,i)=>i+1).map(p=> html`
          <button key=${p} className=${`btn ${p===page?'active':''}`} onClick=${()=>go(p)}>${p}</button>
        `)}
        <button className="btn" onClick=${()=>go(Math.min(totalPages,page+1))} disabled=${page===totalPages}>다음</button>
      </div>
    </div>
  `;
}

function DetailPage(){
  const { id } = useParams();
  const nav = useNavigate();
  const [r,setR] = useState(null);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState("");

  useEffect(()=>{
    let alive = true;
    setLoading(true);
    const rid = Number(id);
    request(`${BASE}/recipes/${rid}`)
      .then(d=>{ if(!alive) return; setR(d); setErr(""); })
      .catch(e=>{ if(!alive) return; setErr(e.message); })
      .finally(()=> alive && setLoading(false));
    return ()=>{ alive=false; };
  },[id]);

  if(loading) return html`<div className="wrap"><header>천개의 레시피</header><div style=${{padding:16}}>Loading…</div></div>`;
  if(err) return html`<div className="wrap"><header>천개의 레시피</header><div className="err">${err}</div></div>`;

  return html`
    <div className="wrap">
      <header>천개의 레시피</header>
      <div className="row" style=${{marginTop:16}}>
        <div className="avatar" style=${{backgroundImage:`url(${r.image})`}} />
        <div>
          <h2 style=${{margin:"0 0 6px 0"}}>${r.name}</h2>
          <div style=${{color:"#475569"}}>총 ${r.prepTimeMinutes + r.cookTimeMinutes}분 · 준비 ${r.prepTimeMinutes}분 · 조리 ${r.cookTimeMinutes}분</div>
          <div style=${{marginTop:8,display:"flex",gap:6}}>
            ${(r.tags ?? r.mealType ?? []).slice(0,3).map(t=> html`<span key=${t} className="chip">${t}</span>`)}
          </div>
        </div>
      </div>

      <div className="box"><b>재료</b><br/>${(r.ingredients||[]).join(", ")}</div>

      <div style=${{marginTop:18}}>
        <b>레시피</b>
        <ol style=${{marginTop:6,lineHeight:1.8}}>
          ${(r.instructions||[]).map((s,i)=> html`<li key=${i}>${s}</li>`)}
        </ol>
      </div>

      <div style=${{marginTop:18}}>
        <b>요리 정보</b>
        <div style=${{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:6}}>
          <div>유형: ${r.cuisine}</div>
          <div>칼로리/1인분: ${r.caloriesPerServing}</div>
          <div>평점: ${r.rating}</div>
          <div>리뷰 수: ${r.reviewCount ?? "-"}</div>
        </div>
      </div>

      <div style=${{marginTop:18}}>
        <button className="link" onClick=${()=>nav(-1)}>← 목록으로</button>
      </div>
    </div>
  `;
}

function App(){
  return html`
    <${HashRouter}>
      <${Routes}>
        <${Route} path="/" element=${html`<${ListPage}/>`} />
        <${Route} path="/recipe/:id" element=${html`<${DetailPage}/>`} />
      </${Routes}>
    </${HashRouter}>
  `;
}

ReactDOM.createRoot(document.getElementById("root")).render(html`<${App}/>`);
