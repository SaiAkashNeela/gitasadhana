import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

document.documentElement.classList.remove("dark");

const mobileAppUrl = import.meta.env.VITE_MOBILE_APP_URL?.trim();
function getMobileRedirectUrl() {
  if (!mobileAppUrl) return null;

  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const currentHash = window.location.hash;
  const currentUrl = new URL(window.location.href);
  const mobileUrl = new URL(mobileAppUrl);

  if (currentPath === "/privacy" || currentPath === "/terms") {
    mobileUrl.hash = currentPath === "/privacy" ? "#/help/privacy" : "#/help/terms";
    mobileUrl.search = "";
    return mobileUrl.toString();
  }

  if (currentHash.includes("privacy")) {
    mobileUrl.hash = "#/help/privacy";
    mobileUrl.search = "";
    return mobileUrl.toString();
  }

  if (currentHash.includes("terms")) {
    mobileUrl.hash = "#/help/terms";
    mobileUrl.search = "";
    return mobileUrl.toString();
  }

  if (currentUrl.origin === mobileUrl.origin && currentUrl.pathname === mobileUrl.pathname && currentUrl.hash === mobileUrl.hash) {
    return null;
  }

  return mobileUrl.toString();
}

const shouldRedirectToMobileApp =
  Boolean(mobileAppUrl) && window.matchMedia("(max-width: 1024px) and (pointer: coarse)").matches;

const mobileRedirectUrl = shouldRedirectToMobileApp ? getMobileRedirectUrl() : null;

if (mobileRedirectUrl && window.location.href !== mobileRedirectUrl) {
  window.location.replace(mobileRedirectUrl);
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
