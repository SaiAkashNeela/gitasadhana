import { api } from "../api.js";
import { currentUser } from "../auth.js";
import { LANGUAGES, lang, languageName, t } from "../i18n.js";
import { store } from "../store.js";
import { boot, esc, icon, setTitle } from "../ui.js";

await boot("ai");
setTitle(`Gita AI · ${t("bhagavadGita")}`);

const CHAT = "gita_ai_chat";
const LANG = "gita_ai_language";
let messages = store.get(CHAT, []);
let aiLang = store.get(LANG, null);
let sending = false;
let limitReached = false;
let error = null;

function guestId() {
  let id = store.getString("gita_guest_session_id");
  if (!id) {
    id = crypto.randomUUID?.() ?? `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    store.set("gita_guest_session_id", id);
  }
  return id;
}

const page = document.getElementById("page");

function renderPicker() {
  page.innerHTML = `
    <div class="page-head"><div><h1 class="display">Gita AI</h1><p class="soft">${esc(t("gitaAiIntro"))}</p></div></div>
    <div class="panel stack" style="max-width:720px">
      <h2 class="heading">${esc(t("gitaAiLanguageQuestion"))}</h2>
      <div class="lang-grid">${LANGUAGES.map((l) => `<button type="button" class="lang-option" data-lang="${l.code}" aria-checked="${l.code === (aiLang ?? lang)}"><b>${esc(l.native)}</b><span>${esc(l.name)}</span></button>`).join("")}</div>
    </div>`;
  page.querySelectorAll("[data-lang]").forEach((b) =>
    b.addEventListener("click", () => {
      aiLang = b.dataset.lang;
      store.set(LANG, aiLang);
      renderChat();
    }),
  );
}

function renderChat() {
  page.innerHTML = `
    <div class="page-head">
      <div><h1 class="display">Gita AI</h1></div>
      <button class="btn ghost sm" type="button" id="change-lang">${icon("translate")}${esc(languageName(aiLang))}</button>
      <button class="icon-btn" type="button" id="clear" aria-label="${esc(t("clearChat"))}">${icon("arrow-counter-clockwise")}</button>
    </div>
    <section class="chat" aria-label="Gita AI">
      <div class="chat-log" id="log" aria-live="polite"></div>
      <form class="chat-compose" id="compose">
        <label class="visually-hidden" for="msg">${esc(t("messageToGitaAi"))}</label>
        <textarea id="msg" rows="1" placeholder="${esc(t("gitaAiPlaceholder"))}"></textarea>
        <button class="play-btn" type="submit" style="width:48px;height:48px" aria-label="${esc(t("send"))}" id="send">${icon("paper-plane-right", "fill")}</button>
      </form>
    </section>`;
  document.getElementById("change-lang").addEventListener("click", renderPicker);
  document.getElementById("clear").addEventListener("click", () => {
    messages = [];
    limitReached = false;
    error = null;
    store.set(CHAT, messages);
    paintLog();
  });
  const msg = document.getElementById("msg");
  msg.addEventListener("input", () => {
    msg.style.height = "auto";
    msg.style.height = `${Math.min(160, msg.scrollHeight)}px`;
  });
  msg.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  document.getElementById("compose").addEventListener("submit", (e) => {
    e.preventDefault();
    send();
  });
  paintLog();
  msg.focus();
}

function paintLog() {
  const log = document.getElementById("log");
  if (!messages.length && !sending) {
    log.innerHTML = `<div class="chat-empty">
      <img src="assets/icons/emblem.png" alt="" width="76" height="76">
      <h2 class="title">${esc(t("gitaAiEmptyTitle"))}</h2>
      <p class="soft">${esc(t("gitaAiEmptyBody"))}</p>
      ${["aiPrompt1", "aiPrompt2", "aiPrompt3"].map((k) => `<button class="prompt" type="button" data-prompt="${esc(t(k))}">${esc(t(k))}</button>`).join("")}
    </div>`;
    log.querySelectorAll("[data-prompt]").forEach((b) => b.addEventListener("click", () => {
      const msg = document.getElementById("msg");
      msg.value = b.dataset.prompt;
      msg.focus();
    }));
    return;
  }
  log.innerHTML = messages.map((m) => `<div class="bubble ${m.role}">${esc(m.text)}</div>`).join("") +
    (sending ? `<div class="bubble model" aria-label="${esc(t("sending"))}"><span class="typing"><span></span><span></span><span></span></span></div>` : "") +
    (limitReached ? `<div class="panel stack-sm" style="text-align:center;background:var(--flame-soft)"><b class="heading">${esc(t("gitaAiLimitTitle"))}</b><p class="soft">${esc(t("gitaAiLimitBody"))}</p></div>` : "") +
    (error ? `<div class="panel stack-sm" style="text-align:center"><b>${esc(error === "offline" ? t("gitaAiOfflineTitle") : t(error))}</b>${error === "offline" ? `<p class="soft">${esc(t("gitaAiOfflineBody"))}</p>` : ""}</div>` : "");
  log.scrollTop = log.scrollHeight;
  const btn = document.getElementById("send");
  if (btn) btn.disabled = sending || limitReached;
}

async function send() {
  const msg = document.getElementById("msg");
  const text = msg.value.trim();
  if (!text || sending || limitReached) return;
  msg.value = "";
  msg.style.height = "auto";
  error = null;
  const history = messages.slice(-20).map((m) => ({ role: m.role, text: m.text }));
  const user = { id: `${Date.now()}-user`, role: "user", text, ts: Date.now() };
  messages = [...messages, user];
  sending = true;
  paintLog();
  try {
    const res = await api("/ai/chat", {
      method: "POST",
      body: { message: text, history, language: aiLang ?? lang },
      headers: currentUser() ? {} : { "x-guest-id": guestId() },
    });
    if (res.limitReached) {
      limitReached = true;
      messages = messages.filter((m) => m.id !== user.id);
    } else {
      messages = [...messages, { id: `${Date.now()}-model`, role: "model", text: res.reply ?? "", ts: Date.now() }];
    }
  } catch (e) {
    const m = String(e.message).toLowerCase();
    error = m === "offline" ? "offline" : m.includes("rate") ? "gitaAiRateLimited" : m.includes("available") ? "gitaAiUnavailable" : "gitaAiError";
    messages = messages.filter((x) => x.id !== user.id);
    document.getElementById("msg").value = text;
  } finally {
    sending = false;
    store.set(CHAT, messages);
    if (currentUser()) api("/chat/me", { method: "PUT", body: { messages, language: aiLang ?? lang } }).catch(() => {});
    paintLog();
  }
}

// Signed in: merge the account's chat history once.
if (currentUser()) {
  api("/chat/me").then((res) => {
    const seen = new Set();
    messages = [...messages, ...(res.messages ?? [])].filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true))).sort((a, b) => a.ts - b.ts);
    store.set(CHAT, messages);
    if (document.getElementById("log")) paintLog();
  }).catch(() => {});
}

aiLang ? renderChat() : renderPicker();
