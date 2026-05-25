import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ToastProvider } from "./Toast.tsx";
import { HostLayoutProvider } from "./layouts/LayoutContext.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HostLayoutProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HostLayoutProvider>
  </React.StrictMode>
);
