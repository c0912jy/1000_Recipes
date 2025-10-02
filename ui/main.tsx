import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/base.css";

const el = document.getElementById("root");
if (!el) throw new Error("missing #root");
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

