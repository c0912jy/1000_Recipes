import { HashRouter, Routes, Route } from "react-router-dom";
import List from "./pages/List";
import Show from "./pages/Show";

export default function App() {
  return (
    <HashRouter>
      <div className="shell">
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/r/:id" element={<Show />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
