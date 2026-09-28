import { api } from "../api.js";
import { currentUser } from "../auth.js";
import { t } from "../i18n.js";
import { boot, esc, icon, setTitle, toast } from "../ui.js";

await boot("settings");
setTitle(t("contactUsTitle"));

const user = currentUser();
document.getElementById("page").innerHTML = `
  <div class="page-head"><div><h1 class="display">${esc(t("contactUsTitle"))}</h1></div></div>
  <div class="form">
    <a class="row panel" href="mailto:hello@gitasadhana.com" style="border:0">${icon("envelope-simple", "duotone")}<span class="grow"><b>hello@gitasadhana.com</b><span class="caption">${esc(t("emailUsDirectly"))}</span></span></a>
    <form class="form" id="form" novalidate>
      <div class="field">
        <label for="email">${esc(t("yourEmail"))}</label>
        <input id="email" type="email" autocomplete="email" required value="${esc(user?.email ?? "")}" ${user ? "readonly" : ""}>
      </div>
      <div class="field">
        <label for="message">${esc(t("messageLabel"))}</label>
        <textarea id="message" required placeholder="${esc(t("contactMessagePlaceholder"))}"></textarea>
      </div>
      <p class="form-error" id="error" role="alert" hidden></p>
      <div><button class="btn" type="submit" id="submit">${icon("paper-plane-right")}${esc(t("submitBtn"))}</button></div>
    </form>
  </div>`;

const form = document.getElementById("form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  const err = document.getElementById("error");
  if (!email || !message || !form.email.checkValidity()) {
    err.hidden = false;
    err.textContent = t("allFieldsRequired");
    return;
  }
  err.hidden = true;
  const btn = document.getElementById("submit");
  btn.disabled = true;
  btn.textContent = t("sending");
  try {
    await api("/mail/contact", { method: "POST", body: { email, message }, token: null });
    toast(t("messageSentToast"));
    form.message.value = "";
  } catch {
    err.hidden = false;
    err.textContent = t("sendFailed");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${icon("paper-plane-right")}${esc(t("submitBtn"))}`;
  }
});
