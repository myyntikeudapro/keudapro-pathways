import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, UserCheck, Mail, ArrowLeft, Bot } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCoachPanel, CoachType } from "@/contexts/CoachPanelContext";

import { coachRegistry, PKS_COACH_ID, canOpenCoach } from "@/data/coachRegistry";
import { Button } from "@/components/ui/button";
import service from "@/data/tyohonvalmennusPks.json";
import { PksEmploymentContact } from "@/components/noste/PksEmploymentContact";
import { filterAdviserActions, sanitizeAdviserAnswer } from "../../../supabase/functions/pks-service-adviser/policy";
import { trackPksAction } from "@/lib/pksAnalytics";

type Msg = { role: "user" | "assistant"; content: string };

const EMAIL_SUBJECT = "KeudaPRO – Muistio AI-valmentajakeskustelusta";

const formatTranscript = (
  coachName: string,
  coachRole: string,
  messages: Msg[],
): string => {
  const date = new Date().toLocaleString("fi-FI", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const header = [
    "KeudaPRO – Muistio AI-valmentajakeskustelusta",
    "============================================",
    `Valmentaja: ${coachName} (${coachRole})`,
    `Päiväys: ${date}`,
    "",
    "--- Keskustelu ---",
    "",
  ].join("\n");
  const body = messages
    .map((m) => `${m.role === "user" ? "Asiakas" : coachName}:\n${m.content}`)
    .join("\n\n");
  const footer = [
    "",
    "",
    "--- Huom ---",
    "Tämä muistio on koottu AI-valmentajan kanssa käydystä keskustelusta.",
    "Hinnoittelu ja tarjoukset hoituvat ihmisvalmentajan kautta: keudapro@keuda.fi",
  ].join("\n");
  return header + body + footer;
};

export function MultiCoachChat() {
  const { activeChat } = useCoachPanel();
  const { pathname } = useLocation();
  if (!activeChat || !canOpenCoach(activeChat, undefined, pathname)) return null;
  // Unmount on member changes/close: drafts, history and pending responses cannot cross members.
  return <CoachChatSession key={activeChat} />;
}

function CoachChatSession() {
  const { activeChat, closeChat, openPanel } = useCoachPanel();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<"self" | "coach" | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [currentCoach, setCurrentCoach] = useState<CoachType | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [adviserFailed, setAdviserFailed] = useState(false);
  const [feedback, setFeedback] = useState<"helpful" | "unhelpful" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = activeChat ? coachRegistry[activeChat] : null;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isPublicAdviser = activeChat === PKS_COACH_ID;
  const showCoachCTA = !isPublicAdviser && userMessageCount >= 5;
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  // Reset messages when coach changes
  useEffect(() => {
    if (activeChat && activeChat !== currentCoach) {
      setMessages([]);
      setCurrentCoach(activeChat);
      setShowEndSession(false);
    }
  }, [activeChat, currentCoach]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeChat && messages.length === 0 && config) {
      setMessages([{ role: "assistant", content: config.greeting }]);
    }
  }, [activeChat, messages.length, config]);

  useEffect(() => {
    if (activeChat) inputRef.current?.focus();
  }, [activeChat]);
  useEffect(() => {
    if (!isPublicAdviser) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !document.querySelector('[role="listbox"]')) closeChat(); };
    const onCookies = () => closeChat();
    window.addEventListener("keydown", onKey);
    window.addEventListener("keudapro:open-cookie-consent", onCookies);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keudapro:open-cookie-consent", onCookies);
    };
  }, [isPublicAdviser, closeChat]);

  const streamChat = useCallback(async (allMessages: Msg[], endpoint: string) => {
    setIsLoading(true);
    let assistantSoFar = "";
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`;

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const resp = await fetch(url, {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed");
      if (endpoint === "pks-service-adviser") {
        const payload = await resp.json();
        const answer = sanitizeAdviserAnswer(payload.answer);
        if (!answer) throw new Error("Invalid response");
        const actions = filterAdviserActions(payload.actions);
        setMessages(prev => [...prev, { role: "assistant", content: answer }]);
        setShowEntry(actions.includes("entry") || actions.includes("copy-message"));
        setAdviserFailed(false);
        setFeedback(null);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      if (controller.signal.aborted) return;
      if (endpoint === "pks-service-adviser") setAdviserFailed(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: endpoint === "pks-service-adviser" ? "Palveluneuvoja ei ole juuri nyt käytettävissä. Löydät palvelutiedot usein kysytyistä kysymyksistä ja mukaanpääsyohjeesta." : "Pahoittelen – minulla on tekninen ongelma juuri nyt. Ota yhteyttä suoraan: keudapro@keuda.fi" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading || !config || (isPublicAdviser && (text.trim().length > 2000 || messages.filter(m => m.role === "user").length >= 10))) return;
      const userMsg: Msg = { role: "user", content: text.trim() };
      const history = messages.filter((m) => !(m === messages[0] && m.content === config.greeting));
      const newAll = [...history, userMsg];
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      streamChat(newAll, config.endpoint);
    },
    [messages, isLoading, streamChat, config, isPublicAdviser]
  );

  const openPreview = (target: "self" | "coach") => {
    if (!config || isPublicAdviser) return;
    setTranscriptDraft(formatTranscript(config.name, config.role, messages));
    setPreviewTarget(target);
    setShowEndSession(false);
  };

  const sendPreview = () => {
    if (!config || !previewTarget || isPublicAdviser) return;
    const subject = encodeURIComponent(EMAIL_SUBJECT);
    const body = encodeURIComponent(transcriptDraft);
    const to = previewTarget === "coach" ? "keudapro@keuda.fi" : "";
    try {
      const win = window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
      // Popup blockers / missing mail client → win is null on most browsers
      if (win === null) {
        // Fallback: try same-window navigation
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      }
      toast.success(
        previewTarget === "coach"
          ? "Muistio avattiin sähköpostiohjelmassa – tarkista vielä ja paina Lähetä"
          : "Muistio avattiin sähköpostiohjelmassa omaan osoitteeseesi",
        { description: "Jos ikkuna ei auennut, salli ponnahdusikkunat selaimessa." }
      );
      setPreviewTarget(null);
    } catch (err) {
      console.error("mailto open failed:", err);
      toast.error("Lähetys ei onnistunut", {
        description: "Sähköpostiohjelmaa ei voitu avata. Kopioi muistio ja lähetä se manuaalisesti osoitteeseen keudapro@keuda.fi.",
      });
    }
  };

  if (!activeChat || !config) return null;

  return (
    <div role="dialog" aria-modal="false" aria-label={config.name} className={cn("fixed z-[62] inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[380px] transition-all duration-200 ease-out opacity-100 translate-y-0 pointer-events-auto", isPublicAdviser ? "md:h-[min(760px,calc(100dvh-3rem))]" : "md:h-[540px]")}>
      <div className="flex flex-col h-full md:rounded-2xl overflow-hidden border border-border shadow-2xl bg-background">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-foreground" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => { closeChat(); if (!isPublicAdviser) openPanel(); }} className="shrink-0 text-background hover:bg-background/10" aria-label="Takaisin">
              <ArrowLeft className="w-4 h-4 text-background" />
            </Button>
            {config.image ? <img src={config.image} alt={config.name} className="w-7 h-7 rounded-full object-cover border border-background/30" /> : <Bot className="w-7 h-7 shrink-0 text-background" aria-label="Tekoäly" />}
            <div className="min-w-0">
              <span className="text-sm font-semibold text-background">{config.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-background/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {config.role}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isPublicAdviser && messages.length > 2 && (
              <button onClick={() => setShowEndSession(true)} className="text-[10px] text-background/50 hover:text-background/80 transition-colors px-2">
                Päätä sessio
              </button>
            )}
            <Button variant="ghost" size="icon" onClick={closeChat} className="shrink-0 text-background/70 hover:text-background" aria-label="Sulje chat">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-muted/30">
          {isPublicAdviser && messages.length <= 1 && <div className="flex flex-wrap gap-2">{["Miten pääsen mukaan?", "Sopiiko valmennus minulle?", "Mitä valmennuksessa tehdään?", "Kesto ja tapaamiset"].map(text => <Button key={text} variant="outline" size="sm" className="h-auto whitespace-normal text-left" onClick={() => send(text)} disabled={isLoading}>{text}</Button>)}</div>}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] break-words px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-foreground text-background rounded-bl-md"
              )}>
                {m.content}
              </div>
            </div>
          ))}
          {isPublicAdviser && userMessageCount > 0 && !isLoading && !adviserFailed && <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span>Auttoiko vastaus?</span>{(["helpful", "unhelpful"] as const).map(value => <Button key={value} size="sm" variant={feedback === value ? "default" : "outline"} disabled={feedback !== null} onClick={() => { setFeedback(value); trackPksAction("answer_feedback", value); }}>{value === "helpful" ? "Kyllä" : "Ei"}</Button>)}</div>}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-foreground rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          {isPublicAdviser && showEntry && !adviserFailed && <PksEmploymentContact compact />}
          {isPublicAdviser && adviserFailed && <div className="space-y-3 border-t border-border pt-3"><p className="text-sm text-foreground">{service.faq[0].answer}</p><PksEmploymentContact compact /></div>}

          {showCoachCTA && !isLoading && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <button
                onClick={() => setShowEndSession(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4" />
                Lähetä muistio ihmisvalmentajalle
              </button>
              <a
                href="https://calendar.app.google/KEf8whD71iKruG979"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-sm text-secondary hover:bg-secondary/20 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Tai varaa aika valmentajalle →
              </a>
            </div>
          )}

          {!isPublicAdviser && showEndSession && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Tallenna keskustelu tai lähetä valmentajalle</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openPreview("self")}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Lähetä itsellesi sähköpostiin
                </button>
                <button
                  onClick={() => openPreview("coach")}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  <UserCheck className="w-3 h-3" />
                  Lähetä valmentajalle (keudapro@keuda.fi)
                </button>
                <button
                  onClick={() => setShowEndSession(false)}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Ei kiitos
                </button>
              </div>
            </div>
          )}

          {!isPublicAdviser && previewTarget && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Tarkista ja muokkaa muistiota</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {previewTarget === "coach"
                    ? "Lähetetään: keudapro@keuda.fi"
                    : "Lähetetään: omaan sähköpostiisi"}
                </p>
              </div>
              <textarea
                value={transcriptDraft}
                onChange={(e) => setTranscriptDraft(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono leading-relaxed resize-y"
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={sendPreview}
                  disabled={!transcriptDraft.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Lähetä nyt
                </button>
                <button
                  onClick={() => setPreviewTarget(null)}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Peruuta
                </button>
              </div>
            </div>
          )}
        </div>

        {isPublicAdviser && <div className="p-3 border-t border-border bg-background space-y-3">
          <p className="text-xs text-muted-foreground">Lähde: <a href="/tyohonvalmennus-pks#ukk" onClick={closeChat} className="underline">{service.title}</a> · Helsinki, Espoo ja Vantaa</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="cta" asChild><a href="/tyohonvalmennus-pks#mukaan" onClick={closeChat}>Näin pääset mukaan</a></Button>
            <Button variant="outline" asChild><a href="/tyohonvalmennus-pks#ukk" onClick={closeChat}>Usein kysytyt kysymykset</a></Button>
          </div>
          <p className="text-xs text-muted-foreground">Kopioitava viestipohja ja oman työllisyyspalvelun yhteydenottotavat löytyvät mukaanpääsyohjeesta.</p>
        </div>}
        {/* Input */}
        <div className="p-3 border-t border-border bg-background space-y-1.5" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kirjoita viesti..."
              className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              disabled={isLoading || (isPublicAdviser && userMessageCount >= 10)}
              maxLength={isPublicAdviser ? 2000 : undefined}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || (isPublicAdviser && userMessageCount >= 10)}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
              aria-label="Lähetä"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          {isPublicAdviser && userMessageCount >= 10 && <p className="text-xs text-muted-foreground">Keskustelun viestiraja täyttyi. Voit jatkaa UKK:sta tai mukaanpääsyohjeesta.</p>}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="italic">{isPublicAdviser ? "Tekoäly, ei oma valmentajasi. Älä kirjoita henkilötietoja. Viestit käsitellään AI-palvelussa; keskustelu on tässä selaimessa vain avoimen paneelin ajan." : "AI-valmentaja – ei ihminen. Ei tallenna tietojasi."}</span>
            {!isPublicAdviser && <a href="mailto:keudapro@keuda.fi" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              keudapro@keuda.fi
            </a>}
          </div>
        </div>
      </div>
    </div>
  );
}
