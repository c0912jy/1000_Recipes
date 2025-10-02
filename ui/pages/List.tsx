import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type Recipe = {
  id: number;
  name: string;
  image: string;
  difficulty: string;
  tags?: string[];
  mealType?: string[];
};

type ListRes = { recipes: Recipe[]; total: number; limit: number; skip: number };

const BASE = "https://dummyjson.com";
const PER_PAGE = 12;

export default function List() {
  const [sp, setSp] = useSearchParams();
  const page = Math.max(1, Number(sp.get("p") || "1"));

  const [data, setData] = useState<ListRes>({ recipes: [], total: 0, limit: PER_PAGE, skip: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let ok = true;
    setLoading(true);
    const skip = (page - 1) * PER_PAGE;
    fetch(`${BASE}/recipes?limit=${PER_PAGE}&skip=${skip}`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: ListRes) => {
        if (!ok) return;
        setData(j);
        setErr("");
      })
      .catch((e: unknown) => ok && setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => ok && setLoading(false));
    return () => {
      ok = false;
    };
  }, [page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data.total || 0) / PER_PAGE)), [data.total]);
  const go = (p: number) => setSp({ p: String(p) });

  if (loading) return <p className="status">Loading recipes…</p>;
  if (err) return <p className="status error">Error: {err}</p>;

  return (
    <>
      <h1 className="brand">천개의 레시피</h1>

      <div className="gallery">
        {data.recipes.map((r) => (
          <Link key={r.id} to={`/r/${r.id}`} className="tile">
            <div className="thumb" style={{ backgroundImage: `url(${r.image})` }} />
            <div className="meta">
              <div className="ttl" title={r.name}>{r.name}</div>
              <div className="badges">
                <span className="badge blue">{r.difficulty}</span>
                {(r.tags?.length ? r.tags : r.mealType ?? []).slice(0, 2).map((t) => (
                  <span key={t} className="badge">{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="pager">
        <button className="btn" onClick={() => go(Math.max(1, page - 1))} disabled={page === 1}>
          이전
        </button>
        {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`btn ${p === page ? "btn--active" : ""}`}
            onClick={() => go(p)}
          >
            {p}
          </button>
        ))}
        <button className="btn" onClick={() => go(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
          다음
        </button>
      </div>
    </>
  );
}
