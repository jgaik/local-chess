import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DialogProvider } from "@yamori-design/react-components";
import { App } from "./app";
import "@yamori-design/styles/dist/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DialogProvider>
      <App />
    </DialogProvider>
  </StrictMode>
);
