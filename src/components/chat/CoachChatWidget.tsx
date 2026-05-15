import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;

const GREETING = "Hei! Olen täällä sinua varten. Kerro – missä tilanteessa olet juuri nyt?";

export function CoachChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [showEndSession, setShowEndSession] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showCoachCTA = userMessageCount >= 5;

  useEffect(() => {
    const handler = () => setShowPulse(false);
    window.addEventListener("scroll", handler, { once: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: GREETING }]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    setIsLoading(true);
    let assistantSoFar = "";

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
      const resp = await fetch(CHAT_URL, {
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
        {
          role: "assistant",
          content: "Pahoittelen – minulla on tekninen ongelma juuri nyt. Ota yhteyttä suoraan: keudapro@keuda.fi",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMsg: Msg = { role: "user", content: text.trim() };
      const history = messages.filter((m) => !(m === messages[0] && m.content === GREETING));
      const newAll = [...history, userMsg];
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      streamChat(newAll);
    },
    [messages, isLoading, streamChat]
  );

  const handleSaveSession = () => {
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Sinä" : "Valmentaja"}: ${m.content}`)
      .join("\n\n");
    const subject = encodeURIComponent("Keskusteluhistoria – KeudaPRO Työhönvalmentaja");
    const body = encodeURIComponent(transcript);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    setShowEndSession(false);
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-200 ease-out",
          "bottom-0 right-0 md:bottom-24 md:right-6",
          "w-full md:w-[360px]",
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-[100dvh] md:h-[520px] md:rounded-2xl overflow-hidden border border-border shadow-2xl bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-foreground">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-background">Työhönvalmentaja AI</span>
              <span className="flex items-center gap-1 text-xs text-background/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 2 && (
                <button
                  onClick={() => setShowEndSession(true)}
                  className="text-[10px] text-background/50 hover:text-background/80 transition-colors px-2"
                >
                  Päätä sessio
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-background/70 hover:text-background transition-colors"
                aria-label="Sulje chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-foreground text-background rounded-bl-md"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-foreground rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-background/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Coach CTA after 5 messages */}
            {showCoachCTA && !isLoading && (
              <div className="flex justify-center pt-2">
                <a
                  href="https://calendar.google.com/calendar/embed?src=myynti%40keudapro.com&ctz=Europe%2FHelsinki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-sm text-secondary hover:bg-secondary/20 transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  Haluatko jutella oikean valmentajan kanssa?
                  <span className="font-semibold">Varaa aika →</span>
                </a>
              </div>
            )}

            {/* End session dialog */}
            {showEndSession && (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Haluatko tallentaa keskustelun sähköpostiisi?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSession}
                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Kyllä
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
          <div className="p-3 border-t border-border bg-background space-y-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
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
              <a
                href="mailto:keudapro@keuda.fi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                keudapro@keuda.fi
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-lg transition-all duration-200",
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-105",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100",
          "px-4 py-3 md:px-5 md:py-3.5"
        )}
        aria-label="Avaa työhönvalmentaja"
      >
        {showPulse && (
          <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-30" />
        )}
        <MessageCircle className="w-5 h-5 relative" />
        <span className="text-sm font-medium hidden sm:inline relative">Työhönvalmentaja</span>
      </button>
    </>
  );
}
