import { api } from "../api.js";
import { currentUser, deleteAccount, mountGoogleButton, restoreSession, signOut } from "../auth.js";
import { LANGUAGES, lang, setLanguage, t } from "../i18n.js";
import { clearLocalProgress, mergeOnSignIn, profile, pushNow, settings } from "../progress.js";
import { applyFontSize, applyTheme, boot, confirmDialog, esc, icon, isDark, setTitle, share, toast } from "../ui.js";

await boot("settings");
setTitle(t("settingsNav"));
await restoreSession();

const page = document.getElementById("page");

function accountPanel() {
  const user = currentUser();
  if (!user) {
    return `<section class="panel stack">
      <h2 class="title">${esc(t("backupProgressTitle"))}</h2>
      <p class="soft">${esc(t("backupProgressSub"))}</p>
      <div id="google" style="min-height:44px;max-width:360px"></div>
      <p class="caption" id="signin-error" hidden></p>
    </section>`;
  }
  const p = profile();
  const name = user.displayName || p.name;
  const avatar = user.photoURL
    ? `<img class="avatar" src="${esc(user.photoURL)}" alt="" width="56" height="56" referrerpolicy="no-referrer">`
    : `<span class="avatar">${esc(name.charAt(0).toUpperCase())}</span>`;
  const freq = [
    ["daily", "dailyDigest", "dailyDigestDesc"],
    ["weekly", "weeklyDigest", "weeklyDigestDesc"],
    ["monthly", "monthlyDigest", "monthlyDigestDesc"],
    ["none", "noEmails", "noEmailsDesc"],
  ];
  return `<section class="panel stack">
    <div style="display:flex;align-items:center;gap:14px">${avatar}
      <span class="col-text"><b class="heading">${esc(name)}</b><span class="caption">${esc(user.email)}</span></span>
    </div>
    <div class="stack-sm">
      <h3 class="overline">${esc(t("emailNotifications"))}</h3>
      <div class="group" role="radiogroup" aria-label="${esc(t("emailNotifications"))}" style="background:var(--surface-raised)">
        ${freq.map(([v, l, d]) => `<button class="row" type="button" role="radio" aria-checked="${settings.newsletter === v}" data-freq="${v}">
          <span class="grow"><b>${esc(t(l))}</b><span class="caption">${esc(t(d))}</span></span>
          ${icon(settings.newsletter === v ? "check-circle" : "circle", settings.newsletter === v ? "fill" : "regular")}
        </button>`).join("")}
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn secondary" type="button" id="signout">${icon("sign-out")}${esc(t("signOut"))}</button>
    </div>
    <details class="stack-sm">
      <summary class="link" style="cursor:pointer;color:var(--danger)">${esc(t("dangerZone"))}</summary>
      <div class="panel stack-sm" style="background:var(--danger-soft);margin-top:10px">
        <p style="color:var(--danger)">${esc(t("dangerZoneWarning"))}</p>
        <p class="caption">${esc(t("deleteAccountDetail"))}</p>
        <div><button class="btn danger sm" type="button" id="delete">${esc(t("deleteAccount"))}</button></div>
      </div>
    </details>
  </section>`;
}

function render() {
  const p = profile();
  page.innerHTML = `
    <div class="page-head"><div><h1 class="display">${esc(t("dashboardAndSettings"))}</h1></div></div>
    <div class="settings-grid">
      <div class="col">
        ${accountPanel()}
        <div class="stats">
          <div class="stat"><b>${p.streak}</b><span>${esc(t("streak"))}</span></div>
          <div class="stat"><b>${p.versesRead}</b><span>${esc(t("versesReadSub"))}</span></div>
          <div class="stat"><b>${p.minutes}m</b><span>${esc(t("minutes"))}</span></div>
        </div>
        <section class="stack-sm">
          <h2 class="overline">${esc(t("practiceTools"))}</h2>
          <nav class="group">
            <a class="row" href="journey.html">${icon("flame", "duotone")}<span class="grow">${esc(t("dailyJourney"))}</span><i class="ph ph-caret-right chev" aria-hidden="true"></i></a>
            <a class="row" href="notes.html">${icon("note-pencil", "duotone")}<span class="grow">${esc(t("notesAndReflections"))}</span><i class="ph ph-caret-right chev" aria-hidden="true"></i></a>
            <a class="row" href="history.html">${icon("clock-counter-clockwise", "duotone")}<span class="grow">${esc(t("readingHistory"))}</span><i class="ph ph-caret-right chev" aria-hidden="true"></i></a>
            <a class="row" href="offline.html">${icon("download-simple", "duotone")}<span class="grow">${esc(t("offlineLibrary"))}</span><i class="ph ph-caret-right chev" aria-hidden="true"></i></a>
          </nav>
        </section>
        <section class="stack-sm">
          <h2 class="overline">${esc(t("helpSupportTitle"))}</h2>
          <nav class="group">
            <button class="row" type="button" id="share-app">${icon("export", "duotone")}<span class="grow">${esc(t("shareWisdom"))}</span></button>
            <a class="row" href="contact/">${icon("envelope-simple", "duotone")}<span class="grow">${esc(t("contactUsTitle"))}</span><i class="ph ph-caret-right chev" aria-hidden="true"></i></a>
            <a class="row" href="correction.html">${icon("pencil-line", "duotone")}<span class="grow">${esc(t("verseLanguageCorrectionTitle"))}</span><i class="ph ph-caret-right chev" aria-hidden="true"></i></a>
            <a class="row" href="privacy/">${icon("shield-check", "duotone")}<span class="grow">${esc(t("privacyPolicyTitle"))}</span><i class="ph ph-caret-right chev" aria-hidden="true"></i></a>
            <a class="row" href="terms/">${icon("file-text", "duotone")}<span class="grow">${esc(t("termsTitle"))}</span><i class="ph ph-caret-right chev" aria-hidden="true"></i></a>
          </nav>
        </section>
      </div>

      <div class="col">
        <section class="stack-sm">
          <h2 class="overline">${esc(t("language"))}</h2>
          <div class="lang-grid" role="radiogroup" aria-label="${esc(t("language"))}">
            ${LANGUAGES.map((l) => `<button class="lang-option" type="button" role="radio" aria-checked="${l.code === lang}" data-lang="${l.code}"><b>${esc(l.native)}</b><span>${esc(l.name)}</span></button>`).join("")}
          </div>
        </section>
        <section class="stack-sm">
          <h2 class="overline">${esc(t("readingSettings"))}</h2>
          <div class="group">
            <label class="row">${icon("speaker-high", "duotone")}<span class="grow">${esc(t("autoPlayAudioLabel"))}</span>
              <span class="switch"><input type="checkbox" id="autoplay" ${settings.autoPlay ? "checked" : ""}><span></span></span></label>
            <div class="row">${icon("text-aa", "duotone")}<span class="grow">${esc(t("fontSizeLabel"))}</span>
              <button class="icon-btn filled" type="button" id="smaller" aria-label="${esc(t("smallerText"))}">${icon("minus")}</button>
              <b class="num" id="size" style="width:2ch;text-align:center">${settings.fontSize}</b>
              <button class="icon-btn filled" type="button" id="larger" aria-label="${esc(t("largerText"))}">${icon("plus")}</button>
            </div>
          </div>
          <p class="scripture panel" id="preview">${esc(t("fontPreview"))}</p>
        </section>
        <section class="stack-sm">
          <h2 class="overline">${esc(t("appearance"))}</h2>
          <div class="segmented" role="radiogroup" aria-label="${esc(t("appearance"))}">
            ${[["system", "themeSystem"], ["light", "themeLight"], ["dark", "themeDark"]].map(([v, k]) => `<button type="button" role="radio" aria-selected="${settings.theme === v}" aria-checked="${settings.theme === v}" data-theme="${v}">${esc(t(k))}</button>`).join("")}
          </div>
        </section>
      </div>
    </div>`;
  wire();
}

function wire() {
  const google = document.getElementById("google");
  if (google) {
    mountGoogleButton(google, {
      locale: lang,
      theme: isDark() ? "dark" : "light",
      onSignedIn: async (res) => {
        let serverLang = null;
        try {
          serverLang = await mergeOnSignIn(res.user);
        } catch {}
        if (res.isNewUser && res.user.email) api("/mail/welcome", { method: "POST", body: { email: res.user.email, name: res.user.displayName || "Seeker" } }).catch(() => {});
        toast(t("googleSignInSuccessToast"));
        if (serverLang) setLanguage(serverLang);
        else render();
      },
      onError: () => {
        const el = document.getElementById("signin-error");
        el.hidden = false;
        el.textContent = t("signInFailToast");
      },
    }).catch(() => {
      const el = document.getElementById("signin-error");
      el.hidden = false;
      el.textContent = t("signInFailToast");
    });
  }

  page.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLanguage(b.dataset.lang)));
  document.getElementById("autoplay").addEventListener("change", (e) => (settings.autoPlay = e.target.checked));
  const size = (d) => {
    settings.fontSize = settings.fontSize + d;
    applyFontSize();
    document.getElementById("size").textContent = settings.fontSize;
  };
  document.getElementById("smaller").addEventListener("click", () => size(-1));
  document.getElementById("larger").addEventListener("click", () => size(1));
  page.querySelectorAll("[data-theme]").forEach((b) =>
    b.addEventListener("click", () => {
      settings.theme = b.dataset.theme;
      applyTheme();
      render();
    }),
  );
  document.getElementById("share-app").addEventListener("click", () => share(t("shareAppMessage"), "https://gitasadhana.com"));

  page.querySelectorAll("[data-freq]").forEach((b) =>
    b.addEventListener("click", async () => {
      const prev = settings.newsletter;
      settings.newsletter = b.dataset.freq;
      render();
      if (b.dataset.freq === "none") return;
      try {
        await api("/mail/newsletter", { method: "POST", body: { email: currentUser().email, frequency: b.dataset.freq } });
        toast(t("changesSavedNote"));
      } catch {
        settings.newsletter = prev;
        render();
        toast(t("emailPrefsFailed"), { kind: "error" });
      }
    }),
  );
  document.getElementById("signout")?.addEventListener("click", async () => {
    if (!(await confirmDialog({ title: t("signOutTitle"), message: t("signOutConfirmMessage"), confirm: t("signOutTitle") }))) return;
    const synced = await pushNow();
    await signOut();
    // The account's data is on the server now; don't leave it for the next person on this browser,
    // whose sign-in would merge it into their account. Unsynced changes are kept rather than lost.
    if (synced) clearLocalProgress();
    toast(t("signedOutSuccessToast"));
    render();
  });
  document.getElementById("delete")?.addEventListener("click", async () => {
    const ok = await confirmDialog({ title: t("dangerZone"), message: `${t("dangerZoneWarning")} ${t("deleteAccountDetail")}`, confirm: t("delete"), danger: true });
    if (!ok) return;
    try {
      await deleteAccount();
      clearLocalProgress();
      toast(t("accountDeletedToast"));
      render();
    } catch {
      toast(t("accountDeleteFailedToast"), { kind: "error" });
    }
  });
}

render();
