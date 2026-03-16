import React from "react";
import { createRoot } from "react-dom/client";
import { StudioPage } from "./studio/page";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StudioPage />
  </React.StrictMode>
);
