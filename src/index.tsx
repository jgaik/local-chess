import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import "@yamori-design/styles/dist/global.css";
import "@yamori-design/styles/dist/components/button.css";
import "@yamori-design/styles/dist/components/details.css";
import "@yamori-design/styles/dist/components/dialog.css";
import "@yamori-design/styles/dist/components/list.css";
import "@yamori-design/styles/dist/layouts/navigation-bar-layout.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
