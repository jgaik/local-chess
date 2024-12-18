import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import "./index.scss";
import "@yamori-design/styles/dist/global.css";
import "@yamori-design/styles/dist/components/dialog.css";
import "@yamori-design/styles/dist/components/button.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
