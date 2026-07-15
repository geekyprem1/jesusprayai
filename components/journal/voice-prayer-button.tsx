"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

type VoiceCaps = {
  whisper: boolean;
  browser: boolean;
};

type Props = {
  /** Append or set transcript into the prayer body */
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

type Mode = "idle" | "recording" | "transcribing" | "listening";

/**
 * Voice prayer:
 * 1) Whisper (if OPENAI_API_KEY) — record → upload → text
 * 2) Browser Web Speech API — free, Chrome/Edge best
 */
export function VoicePrayerButton({ onTranscript, disabled }: Props) {
  const [caps, setCaps] = useState<VoiceCaps>({ whisper: false, browser: true });
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    void fetch("/api/ai/transcribe")
      .then((r) => r.json())
      .then((j: VoiceCaps & { ok?: boolean }) => {
        setCaps({
          whisper: Boolean(j.whisper),
          browser: j.browser !== false,
        });
      })
      .catch(() => {
        setCaps({ whisper: false, browser: true });
      });

    return () => {
      stopTimer();
      stopStream();
      try {
        recognitionRef.current?.stop?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function startTimer() {
    setSeconds(0);
    stopTimer();
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        // Auto-stop long recordings (Whisper quality + cost)
        if (s >= 90) {
          void stopRecording();
        }
        return s + 1;
      });
    }, 1000);
  }

  const browserSpeechAvailable = useCallback(() => {
    if (typeof window === "undefined") return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  async function startWhisperRecording() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        void finishWhisperUpload(recorder.mimeType || "audio/webm");
      };

      recorder.start(250);
      setMode("recording");
      startTimer();
    } catch {
      setError("Microphone permission denied or unavailable.");
      setMode("idle");
    }
  }

  async function finishWhisperUpload(mimeType: string) {
    stopTimer();
    stopStream();
    setMode("transcribing");

    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    if (blob.size < 1000) {
      setError("Recording too short. Hold the mic a bit longer.");
      setMode("idle");
      return;
    }

    try {
      const form = new FormData();
      form.append("audio", blob, "prayer.webm");
      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        ok: boolean;
        text?: string;
        error?: string;
      };

      if (!json.ok || !json.text) {
        setError(json.error ?? "Could not transcribe. Try browser voice or type.");
        setMode("idle");
        return;
      }

      onTranscript(json.text.trim());
      setError(null);
    } catch {
      setError("Upload failed. Check connection and try again.");
    }
    setMode("idle");
  }

  function stopRecording() {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    } else {
      stopTimer();
      stopStream();
      setMode("idle");
    }
    mediaRecorderRef.current = null;
  }

  function startBrowserSpeech() {
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError(
        "Browser speech not supported here. Use Chrome/Edge, or set OPENAI_API_KEY for Whisper."
      );
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    let finalText = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript as string;
        if (event.results[i].isFinal) {
          finalText += (finalText ? " " : "") + piece.trim();
        } else {
          interim += piece;
        }
      }
      // Live preview via interim not required — apply finals as we go
      if (finalText) {
        // Don't spam parent every result; store for stop
      }
      void interim;
    };

    recognition.onerror = () => {
      setError("Browser speech error. Check mic permission or try Whisper.");
      setMode("idle");
      stopTimer();
    };

    recognition.onend = () => {
      stopTimer();
      if (finalText.trim()) {
        onTranscript(finalText.trim());
        setError(null);
      }
      setMode("idle");
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      setMode("listening");
      startTimer();
    } catch {
      setError("Could not start browser speech.");
      setMode("idle");
    }
  }

  function stopBrowserSpeech() {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    stopTimer();
    setMode("idle");
  }

  async function onPrimaryClick() {
    if (disabled) return;

    if (mode === "recording") {
      stopRecording();
      return;
    }
    if (mode === "listening") {
      stopBrowserSpeech();
      return;
    }
    if (mode === "transcribing") return;

    // Prefer Whisper when available (better accuracy for prayer)
    if (caps.whisper) {
      await startWhisperRecording();
      return;
    }

    if (caps.browser && browserSpeechAvailable()) {
      startBrowserSpeech();
      return;
    }

    setError(
      "No voice engine ready. Add OPENAI_API_KEY for Whisper, or use Chrome/Edge for free browser speech."
    );
  }

  const busy = mode === "transcribing";
  const active = mode === "recording" || mode === "listening";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={active ? "destructive" : "secondary"}
          size="sm"
          className="gap-1.5"
          disabled={disabled || busy}
          onClick={() => void onPrimaryClick()}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : active ? (
            mode === "recording" ? (
              <Square className="size-3.5 fill-current" />
            ) : (
              <MicOff className="size-4" />
            )
          ) : (
            <Mic className="size-4" />
          )}
          {busy
            ? "Transcribing…"
            : mode === "recording"
              ? `Stop · ${seconds}s`
              : mode === "listening"
                ? `Stop listen · ${seconds}s`
                : caps.whisper
                  ? "Voice prayer"
                  : "Voice (browser)"}
        </Button>
        <span className="text-[11px] text-muted-foreground sm:text-xs">
          {caps.whisper
            ? "Whisper (OpenAI) · up to ~90s"
            : browserSpeechAvailable()
              ? "Free browser speech · Chrome/Edge best"
              : "Mic needs Whisper key or Chrome"}
        </span>
      </div>
      {error && (
        <p className="text-xs text-destructive break-words">{error}</p>
      )}
    </div>
  );
}
