import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

document.documentElement.classList.remove("dark");

const mobileAppUrl = import.meta.env.VITE_MOBILE_APP_URL?.trim();
const shouldRedirectToMobileApp =
  Boolean(mobileAppUrl) && window.matchMedia("(max-width: 1024px) and (pointer: coarse)").matches;

if (shouldRedirectToMobileApp && mobileAppUrl && window.location.href !== mobileAppUrl) {
  window.location.replace(mobileAppUrl);
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
