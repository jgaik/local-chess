import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "@yamori-design/styles/dist/global.css";
import { DialogProvider } from "@yamori-design/react-components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DialogProvider>
      <App />
    </DialogProvider>
  </StrictMode>
);
