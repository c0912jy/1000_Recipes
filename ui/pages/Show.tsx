import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Detail = {
  id: number;
  name: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: string;
  cuisine: string;
  caloriesPerServing: number;
  rating: number;
  tags: string[];
  mealType: string[];
};

const BASE = "https://dummyjson.com";

export default function Show() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    let ok = true;
    setLoading(true);
    const rid = Number(id);
    fetch(`${BASE}/recipes/${rid}`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: Detail) => {
        if (!ok) return;
        setData(j);
        setErr("");
      })
      .catch((e: unknown) => ok && setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => ok && setLoading(false));
    return () => {
      ok = false;
    };
  }, [id]);

  if (loading) return <p className="status">Loading…</p>;
  if (err) return <p className="status error">Error: {err}</p>;
  if (!data) return <p className="status">Not found.</p>;

  const total = data.prepTimeMinutes + data.cookTimeMinutes;

  return (
    <div className="sheet">
      <Link to="/" className="link">← 목록</Link>

      <div className="sheet-main">
        <div className="shot">
          <img src={data.image} alt={data.name} />
        </div>

        <div className="sheet-info">
          <div className="head">
            <h1>{data.name}</h1>
            <span className="pill">{data.difficulty}</span>
          </div>

          <div className="block">
            <div><b>총 시간</b> {total}분</div>
            <div><b>준비</b> {data.prepTimeMinutes}분</div>
            <div><b>조리</b> {data.cookTimeMinutes}분</div>
          </div>

          <div className="badges">
            {data.tags.slice(0, 4).map((t, i) => (
              <span key={i} className="badge">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="block dim">
        <h2>재료</h2>
        <p className="list">{data.ingredients.join(", ")}</p>
      </div>

      <div className="block">
        <h2>레시피</h2>
        <ol className="steps">
          {data.instructions.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </div>

      <div className="block">
        <h2>요리 정보</h2>
        <div className="grid">
          <div>유형: {data.cuisine}</div>
          <div>칼로리/1인분: {data.caloriesPerServing}</div>
          <div>평점: {data.rating}</div>
          <div>특징: {data.mealType.join(", ")}</div>
        </div>
      </div>
    </div>
  );
}
