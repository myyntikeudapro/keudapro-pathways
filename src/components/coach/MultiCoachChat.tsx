import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, UserCheck, Mail, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoachPanel, CoachType } from "@/contexts/CoachPanelContext";

import coachAna from "@/assets/coach-ana.png";
import coachVeli from "@/assets/coach-veli.png";
import coachReitti from "@/assets/coach-reitti.png";

type Msg = { role: "user" | "assistant"; content: string };

const coachConfig: Record<CoachType, {
  name: string;
  role: string;
  image: string;
  greeting: string;
  endpoint: string;
  emailSubject: string;
}> = {
  ana: {
    name: "Ana",
    role: "Työhönvalmentaja",
    image: coachAna,
    greeting: "Hei! Olen Ana, työhönvalmentajasi. Kerro – missä tilanteessa olet juuri nyt?",
    endpoint: "coach-chat",
    emailSubject: "Keskusteluhistoria – Ana Työhönvalmentaja",
  },
  veli: {
    name: "Veli",
    role: "Osaamisen kehittämisen valmentaja",
    image: coachVeli,
    greeting: "Hei! Olen Veli, osaamisen kehittämisen valmentajasi. Mikä osaamiseen liittyvä asia mietityttää sinua juuri nyt?",
    endpoint: "veli-coach-chat",
    emailSubject: "Keskusteluhistoria – Veli Osaamisen valmentaja",
  },
  reitti: {
    name: "Reittivalmentaja",
    role: "Ura- ja opinto-ohjaaja",
    image: coachReitti,
    greeting: "Hei! Olen reittivalmentajasi – autan sinua löytämään oikean koulutus- tai urapolun. Kerro, missä tilanteessa olet?",
    endpoint: "route-coach-chat",
    emailSubject: "Keskusteluhistoria – Reittivalmentaja",
  },
};

export function MultiCoachChat() {
  const { activeChat, closeChat, openPanel } = useCoachPanel();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const [currentCoach, setCurrentCoach] = useState<CoachType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = activeChat ? coachConfig[activeChat] : null;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showCoachCTA = userMessageCount >= 5;

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

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed");

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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Pahoittelen – minulla on tekninen ongelma juuri nyt. Ota yhteyttä suoraan: keudapro@keuda.fi" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading || !config) return;
      const userMsg: Msg = { role: "user", content: text.trim() };
      const history = messages.filter((m) => !(m === messages[0] && m.content === config.greeting));
      const newAll = [...history, userMsg];
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      streamChat(newAll, config.endpoint);
    },
    [messages, isLoading, streamChat, config]
  );

  const handleSaveSession = (target: "self" | "coach") => {
    if (!config) return;
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Sinä" : config.name}: ${m.content}`)
      .join("\n\n");
    const subject = encodeURIComponent(config.emailSubject);
    const body = encodeURIComponent(transcript);
    const to = target === "coach" ? "keudapro@keuda.fi" : "";
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
    setShowEndSession(false);
  };

  if (!activeChat || !config) return null;

  return (
    <div className="fixed z-[62] inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[380px] md:h-[540px] transition-all duration-200 ease-out opacity-100 translate-y-0 pointer-events-auto">
      <div className="flex flex-col h-full md:rounded-2xl overflow-hidden border border-border shadow-2xl bg-background">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-foreground" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-2">
            <button onClick={() => { closeChat(); openPanel(); }} className="p-1 rounded hover:bg-background/10 transition-colors" aria-label="Takaisin">
              <ArrowLeft className="w-4 h-4 text-background" />
            </button>
            <img src={config.image} alt={config.name} className="w-7 h-7 rounded-full object-cover border border-background/30" />
            <div>
              <span className="text-sm font-semibold text-background">{config.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-background/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {config.role}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 2 && (
              <button onClick={() => setShowEndSession(true)} className="text-[10px] text-background/50 hover:text-background/80 transition-colors px-2">
                Päätä sessio
              </button>
            )}
            <button onClick={closeChat} className="text-background/70 hover:text-background transition-colors" aria-label="Sulje chat">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-muted/30">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-foreground text-background rounded-bl-md"
              )}>
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-foreground rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {showCoachCTA && !isLoading && (
            <div className="flex justify-center pt-2">
              <a
                href="https://calendar.app.google/KEf8whD71iKruG979"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-sm text-secondary hover:bg-secondary/20 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Jutele oikean valmentajan kanssa
                <span className="font-semibold">Varaa aika →</span>
              </a>
            </div>
          )}

          {showEndSession && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Tallenna keskustelu tai lähetä valmentajalle</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSaveSession("self")}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Lähetä itsellesi sähköpostiin
                </button>
                <button
                  onClick={() => handleSaveSession("coach")}
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
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border bg-background space-y-1.5" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kirjoita viesti..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
              aria-label="Lähetä"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="italic">AI-valmentaja – ei ihminen. Ei tallenna tietojasi.</span>
            <a href="mailto:keudapro@keuda.fi" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              keudapro@keuda.fi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
