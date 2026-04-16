import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const alreadyDismissed = sessionStorage.getItem("bg-music-dismissed");
    if (!alreadyDismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15;
      audioRef.current.play();
      setIsPlaying(true);
    }
    setShowPrompt(false);
  };

  const dismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem("bg-music-dismissed", "1");
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = 0.15;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/bg-music.wav" loop preload="none" />

      {/* Prompt toast */}
      {showPrompt && (
        <div className="fixed bottom-6 left-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl shadow-lg px-4 py-3 max-w-xs">
            <Volume2 className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">Haluatko kuunnella taustamusiikkia?</p>
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={play}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Kyllä
              </button>
              <button
                onClick={dismiss}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Sulje"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent toggle (after interaction) */}
      {(isPlaying || dismissed) && !showPrompt && (
        <button
          onClick={toggle}
          className={cn(
            "fixed bottom-6 left-6 z-50 p-2.5 rounded-full shadow-lg border border-border transition-all duration-200",
            isPlaying ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
          )}
          aria-label={isPlaying ? "Mykistä musiikki" : "Soita musiikkia"}
        >
          {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      )}
    </>
  );
}
