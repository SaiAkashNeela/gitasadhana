import { homeHref } from "../route.js";
import { t } from "../i18n.js";
import { boot, emptyState, esc } from "../ui.js";

await boot("");
document.getElementById("page").innerHTML = emptyState("compass", t("pageNotFound"), t("pageNotFoundBody"), `<a class="btn" href="${homeHref()}">${esc(t("home"))}</a>`);
