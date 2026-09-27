import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./app/App";
import { siteMetadata } from "./lib/site-metadata";

// Force Light Mode
document.documentElement.classList.remove("dark");
document.title = `${siteMetadata.brandName} | ${siteMetadata.tagline}`;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
