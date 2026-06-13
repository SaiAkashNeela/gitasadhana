import { Send } from "lucide-react";
import { Card, PageFrame, SectionHeading } from "../components/site-shell";
import type { AuthSession } from "../lib/backend";
import type { ChatMessage } from "../lib/app-types";
import { getLanguageLabel, type LanguageCode } from "../lib/gita-data";
import { t } from "../lib/mobile-i18n";
import { cn } from "../lib/utils";
import type { Dispatch, RefObject, SetStateAction } from "react";

export function AiPage({
  messages,
  chatInput,
  setChatInput,
  sending,
  chatError,
  onSend,
  signedInUser,
  googleButtonRef,
  language,
}: {
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: Dispatch<SetStateAction<string>>;
  sending: boolean;
  chatError: string | null;
  onSend: () => void;
  signedInUser: AuthSession["user"] | null;
  googleButtonRef: RefObject<HTMLDivElement | null>;
  language: LanguageCode;
}) {
  return (
    <PageFrame>
      <section>
        <SectionHeading
          eyebrow={t("assistant", language)}
          title={t("gitaAi", language)}
          sub={`${t("dailyWisdom", language)} · ${getLanguageLabel(language)}`}
        />
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="size-12 overflow-hidden rounded-2xl border border-amber-200/60 shadow-lg shadow-amber-900/10">
                <img
                  src="/favicon-logo.png"
                  alt={t("gitaAi", language)}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-serif text-2xl text-foreground">{t("gitaAi", language)}</p>
                <p className="text-sm text-muted-foreground">{t("aiPanelSubtitle", language)}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("aiIntro", language)}
            </p>
            {!signedInUser && <div ref={googleButtonRef} className="mt-4" />}
            <div className="mt-5 space-y-2">
              {[
                t("aiPromptOne", language),
                t("aiPromptTwo", language),
                t("aiPromptThree", language),
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setChatInput(prompt)}
                  className="w-full rounded-[22px] border border-black/5 bg-white/90 px-4 py-3 text-left text-sm text-foreground transition hover:border-amber-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-end gap-3">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onSend();
                  }
                }}
                rows={2}
                placeholder={t("askAboutBhagavadGita", language)}
                className="min-h-[58px] flex-1 resize-none rounded-[22px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={onSend}
                disabled={sending || !chatInput.trim()}
                className="inline-flex size-12 items-center justify-center rounded-full bg-[#a96616] text-white shadow-lg shadow-amber-900/20 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            {chatError && <p className="mt-3 text-sm text-[#a6472a]">{chatError}</p>}
          </Card>

          <Card className="min-h-[380px] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              {t("conversation", language)}
            </p>
            <div className="mt-4 max-h-[530px] space-y-3 overflow-y-auto pr-1 scroll-hide">
              {messages.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-amber-200 bg-amber-50/55 px-8 text-center">
                  <div className="size-14 overflow-hidden rounded-full border border-amber-200">
                    <img
                      src="/favicon-logo.png"
                      alt={t("gitaAi", language)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-4 font-serif text-2xl text-foreground">Hare Krishna</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t("startWithQuestion", language)}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-[22px] px-4 py-3 text-sm leading-relaxed",
                        message.role === "user"
                          ? "rounded-br-md bg-[#a96616] text-white"
                          : "rounded-bl-md bg-amber-50 text-foreground",
                      )}
                    >
                      {message.text}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <p className="text-sm text-muted-foreground">{t("aiTyping", language)}</p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </PageFrame>
  );
}
