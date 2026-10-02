import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const root = document.getElementById("root");

if (!root) {
  throw new Error("React root element #root was not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
