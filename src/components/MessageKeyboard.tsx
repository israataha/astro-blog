import { For, Show, createSignal, onCleanup, onMount } from "solid-js";

type KeyDef = {
  code: string;
  label: string;
  shift?: string;
  wide?: string;
  special?: boolean;
};

const LAYOUT: KeyDef[][] = [
  [
    { code: "Backquote", label: "`", shift: "~" },
    { code: "Digit1", label: "1", shift: "!" },
    { code: "Digit2", label: "2", shift: "@" },
    { code: "Digit3", label: "3", shift: "#" },
    { code: "Digit4", label: "4", shift: "$" },
    { code: "Digit5", label: "5", shift: "%" },
    { code: "Digit6", label: "6", shift: "^" },
    { code: "Digit7", label: "7", shift: "&" },
    { code: "Digit8", label: "8", shift: "*" },
    { code: "Digit9", label: "9", shift: "(" },
    { code: "Digit0", label: "0", shift: ")" },
    { code: "Minus", label: "-", shift: "_" },
    { code: "Equal", label: "=", shift: "+" },
    { code: "Backspace", label: "⌫", wide: "wide-2", special: true },
  ],
  [
    { code: "Tab", label: "Tab", wide: "wide-1-5", special: true },
    { code: "KeyQ", label: "Q" },
    { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" },
    { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" },
    { code: "KeyU", label: "U" },
    { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" },
    { code: "BracketLeft", label: "[", shift: "{" },
    { code: "BracketRight", label: "]", shift: "}" },
    { code: "Backslash", label: "\\", shift: "|", wide: "wide-1-5" },
  ],
  [
    { code: "CapsLock", label: "Caps", wide: "wide-1-75", special: true },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";", shift: ":" },
    { code: "Quote", label: "'", shift: '"' },
    { code: "Enter", label: "Enter", wide: "wide-2-25", special: true },
  ],
  [
    { code: "ShiftLeft", label: "Shift", wide: "wide-2-25", special: true },
    { code: "KeyZ", label: "Z" },
    { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" },
    { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" },
    { code: "KeyM", label: "M" },
    { code: "Comma", label: ",", shift: "<" },
    { code: "Period", label: ".", shift: ">" },
    { code: "Slash", label: "/", shift: "?" },
    { code: "ShiftRight", label: "Shift", wide: "wide-2-25", special: true },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", wide: "wide-1-25", special: true },
    { code: "AltLeft", label: "Alt", wide: "wide-1-25", special: true },
    { code: "MetaLeft", label: "⌘", wide: "wide-1-25", special: true },
    { code: "Space", label: "", wide: "space", special: true },
    { code: "MetaRight", label: "⌘", wide: "wide-1-25", special: true },
    { code: "AltRight", label: "Alt", wide: "wide-1-25", special: true },
    { code: "ControlRight", label: "Ctrl", wide: "wide-1-5", special: true },
  ],
];

const KEY_CODES = new Set(LAYOUT.flat().map((key) => key.code));

function findKeyDef(code: string) {
  return LAYOUT.flat().find((key) => key.code === code) ?? null;
}

type Status = "idle" | "sending" | "success" | "error";

export default function MessageKeyboard() {
  const [message, setMessage] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [soundOn, setSoundOn] = createSignal(true);
  const [pressed, setPressed] = createSignal<Record<string, boolean>>({});
  const [capsLock, setCapsLock] = createSignal(false);
  const [status, setStatus] = createSignal<Status>("idle");
  const [errorMsg, setErrorMsg] = createSignal("");

  let textareaRef: HTMLTextAreaElement | undefined;
  let emailRef: HTMLInputElement | undefined;
  let audioCtx: AudioContext | null = null;
  const heldKeys = new Set<string>();

  function markPressed(code: string, value: boolean) {
    setPressed((prev) => {
      if (!!prev[code] === value) return prev;
      return { ...prev, [code]: value };
    });
  }

  function ensureAudio() {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  }

  function makeNoiseBuffer(ctx: AudioContext, duration: number, decayPower = 8) {
    const size = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      const t = i / size;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decayPower);
    }
    return buffer;
  }

  function playNoiseBurst(
    ctx: AudioContext,
    when: number,
    opts: { duration: number; freq: number; q: number; gain: number; type?: BiquadFilterType },
  ) {
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, opts.duration);

    const filter = ctx.createBiquadFilter();
    filter.type = opts.type ?? "bandpass";
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.q;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.max(opts.gain, 0.0001), when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + opts.duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(when);
    src.stop(when + opts.duration);
  }

  function playKeySound(code: string) {
    if (!soundOn()) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isSpace = code === "Space";
    const isMod = /^(Shift|Control|Alt|Meta|CapsLock|Tab|Enter|Backspace)/.test(code);
    const jitter = () => Math.random() - 0.5;

    if (isSpace) {
      playNoiseBurst(ctx, now, {
        duration: 0.04,
        freq: 900 + jitter() * 80,
        q: 0.7,
        gain: 0.28,
        type: "lowpass",
      });
      playNoiseBurst(ctx, now + 0.008, {
        duration: 0.03,
        freq: 420 + jitter() * 40,
        q: 1.1,
        gain: 0.16,
      });
      return;
    }

    playNoiseBurst(ctx, now, {
      duration: isMod ? 0.014 : 0.01,
      freq: isMod ? 4200 : 6200 + jitter() * 500,
      q: 1.8,
      gain: isMod ? 0.2 : 0.26,
      type: "highpass",
    });

    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.setValueAtTime(isMod ? 1800 : 2400 + jitter() * 200, now);
    click.frequency.exponentialRampToValueAtTime(900, now + 0.012);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(isMod ? 0.035 : 0.045, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.015);

    playNoiseBurst(ctx, now + 0.012 + jitter() * 0.003, {
      duration: isMod ? 0.028 : 0.018,
      freq: isMod ? 1400 : 2100 + jitter() * 150,
      q: 0.9,
      gain: isMod ? 0.18 : 0.14,
    });
  }

  function isShiftHeld() {
    return heldKeys.has("ShiftLeft") || heldKeys.has("ShiftRight");
  }

  function charForKey(code: string, shiftKey = false) {
    const def = findKeyDef(code);
    if (!def) return null;
    if (code === "Space") return " ";
    if (code === "Enter") return "\n";
    if (code === "Tab") return null;
    if (code === "Backspace") return null;
    if (
      code.startsWith("Shift") ||
      code.startsWith("Control") ||
      code.startsWith("Alt") ||
      code.startsWith("Meta") ||
      code === "CapsLock"
    ) {
      return null;
    }

    const useShift = shiftKey || isShiftHeld();
    let char = useShift && def.shift ? def.shift : def.label;
    if (/^[A-Z]$/.test(def.label)) {
      const upper = capsLock() !== useShift;
      char = upper ? def.label : def.label.toLowerCase();
    }
    return char;
  }

  function restoreCaret(start: number, end: number) {
    requestAnimationFrame(() => {
      const el = textareaRef;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start, end);
    });
  }

  function insertText(text: string) {
    const el = textareaRef;
    if (!el) {
      setMessage((value) => value + text);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = message();
    const next = value.slice(0, start) + text + value.slice(end);
    setMessage(next);
    restoreCaret(start + text.length, start + text.length);
  }

  function deleteBackward() {
    const el = textareaRef;
    if (!el) {
      setMessage((value) => value.slice(0, -1));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = message();
    if (start !== end) {
      setMessage(value.slice(0, start) + value.slice(end));
      restoreCaret(start, start);
      return;
    }
    if (start === 0) return;
    setMessage(value.slice(0, start - 1) + value.slice(end));
    restoreCaret(start - 1, start - 1);
  }

  function applyKeyAction(code: string, shiftKey = false) {
    if (code === "Backspace") {
      deleteBackward();
      return;
    }
    if (code === "Tab") {
      emailRef?.focus();
      return;
    }
    if (code === "CapsLock") {
      setCapsLock((value) => !value);
      return;
    }
    const char = charForKey(code, shiftKey);
    if (char != null) insertText(char);
  }

  function pressKey(code: string, options: { fromClick?: boolean; shiftKey?: boolean } = {}) {
    if (heldKeys.has(code) && !options.fromClick) return;
    heldKeys.add(code);
    if (code !== "CapsLock") markPressed(code, true);
    playKeySound(code);
    if (options.fromClick) {
      applyKeyAction(code, options.shiftKey);
      if (code !== "Tab") textareaRef?.focus();
    }
  }

  function releaseKey(code: string) {
    heldKeys.delete(code);
    if (code === "CapsLock") return;
    markPressed(code, false);
  }

  function isTypingInOtherField(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (!target || target === textareaRef) return false;
    return (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    );
  }

  function onPhysicalKeyDown(event: KeyboardEvent) {
    const code = event.code;
    if (!KEY_CODES.has(code)) return;
    // Let the email field (and any other inputs) behave normally
    if (isTypingInOtherField(event)) return;

    // Visual + sound for every matching key
    if (!event.repeat) pressKey(code, { fromClick: false });

    // Don't steal browser shortcuts — but focus the message so paste/select-all land there
    if (event.metaKey || event.ctrlKey) {
      textareaRef?.focus();
      if (code === "CapsLock") {
        requestAnimationFrame(() => {
          setCapsLock(event.getModifierState?.("CapsLock") ?? capsLock());
        });
      }
      return;
    }

    // Tab / Shift+Tab should move focus (message → email), not insert a tab character
    if (code === "Tab") return;

    // Own the keystroke so typing works even when the textarea isn't focused
    event.preventDefault();

    if (code === "CapsLock") {
      requestAnimationFrame(() => {
        setCapsLock(event.getModifierState?.("CapsLock") ?? capsLock());
      });
      return;
    }

    applyKeyAction(code, event.shiftKey);
    textareaRef?.focus();
  }

  function onPhysicalKeyUp(event: KeyboardEvent) {
    const code = event.code;
    if (!KEY_CODES.has(code)) return;
    if (isTypingInOtherField(event)) return;
    releaseKey(code);
    if (code === "CapsLock") {
      setCapsLock(event.getModifierState?.("CapsLock") ?? capsLock());
    }
  }

  async function onSubmit(event: Event) {
    event.preventDefault();
    const body = message().trim();
    if (!body) {
      setStatus("error");
      setErrorMsg("Write a message before sending.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "keyboard-message",
          message: body,
          email: email().trim(),
          "bot-field": "",
        }).toString(),
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      setStatus("success");
      setMessage("");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg("Couldn’t send right now. Try again, or email me directly.");
    }
  }

  onMount(() => {
    textareaRef?.focus();

    const unlock = () => ensureAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("keydown", onPhysicalKeyDown);
    window.addEventListener("keyup", onPhysicalKeyUp);

    onCleanup(() => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("keydown", onPhysicalKeyDown);
      window.removeEventListener("keyup", onPhysicalKeyUp);
      void audioCtx?.close();
    });
  });

  return (
    <div class="message-keyboard space-y-5 mt-5 md:mt-6">
      <Show when={status() === "success"}>
        <p
          class="rounded-lg border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 px-4 py-3 text-sm text-black dark:text-white"
          role="status"
        >
          Message sent — thanks for writing. I’ll get back to you if you left an email.
        </p>
      </Show>

      <Show when={status() === "error"}>
        <p
          class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {errorMsg()}
        </p>
      </Show>

      <form class="space-y-4" onSubmit={onSubmit}>
        <div class="space-y-2">
          <label for="message-body" class="block text-sm font-semibold text-black dark:text-white">
            Message
          </label>
          <textarea
            id="message-body"
            name="message"
            ref={textareaRef}
            rows={5}
            required
            value={message()}
            onInput={(event) => {
              setMessage(event.currentTarget.value);
              if (status() !== "idle" && status() !== "sending") setStatus("idle");
            }}
            placeholder="Type here or click the keys below…"
            class="w-full resize-y min-h-[7rem] rounded-lg px-3 py-2 outline-none text-black dark:text-white bg-white dark:bg-black/50 border border-black/20 dark:border-white/20 focus:border-black focus:dark:border-white transition-colors font-mono text-sm leading-relaxed"
          />
        </div>

        <div class="space-y-2">
          <label for="message-email" class="block text-sm font-semibold text-black dark:text-white">
            Your email <span class="font-normal text-black/50 dark:text-white/50">(optional)</span>
          </label>
          <input
            id="message-email"
            name="email"
            type="email"
            ref={emailRef}
            value={email()}
            onInput={(event) => setEmail(event.currentTarget.value)}
            placeholder="so I can reply"
            class="w-full rounded-lg px-3 py-2 outline-none text-black dark:text-white bg-white dark:bg-black/50 border border-black/20 dark:border-white/20 focus:border-black focus:dark:border-white transition-colors"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white blend"
              onClick={() => {
                setMessage("");
                textareaRef?.focus();
              }}
            >
              Clear
            </button>
            <label class="inline-flex items-center gap-2 text-sm font-semibold text-black/60 dark:text-white/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={soundOn()}
                onChange={(event) => setSoundOn(event.currentTarget.checked)}
                class="accent-[var(--color-accent)]"
              />
              Sound
            </label>
          </div>

          <button
            type="submit"
            disabled={status() === "sending"}
            class="px-4 py-2 btn-accent font-medium rounded transition-colors blend disabled:opacity-60"
          >
            {status() === "sending" ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>

      <div class="mk-board" aria-label="On-screen keyboard">
        <For each={LAYOUT}>
          {(row) => (
            <div class="mk-row">
              <For each={row}>
                {(key) => {
                  const isPressed = () =>
                    key.code === "CapsLock" ? capsLock() : !!pressed()[key.code];
                  return (
                    <button
                      type="button"
                      classList={{
                        "mk-key": true,
                        special: !!key.special,
                        pressed: isPressed(),
                        "wide-1-25": key.wide === "wide-1-25",
                        "wide-1-5": key.wide === "wide-1-5",
                        "wide-1-75": key.wide === "wide-1-75",
                        "wide-2": key.wide === "wide-2",
                        "wide-2-25": key.wide === "wide-2-25",
                        space: key.wide === "space",
                      }}
                      aria-label={key.code === "Space" ? "Space" : key.label || key.code}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        pressKey(key.code, { fromClick: true, shiftKey: event.shiftKey });
                      }}
                      onPointerUp={() => releaseKey(key.code)}
                      onPointerLeave={() => {
                        if (heldKeys.has(key.code)) releaseKey(key.code);
                      }}
                      onPointerCancel={() => releaseKey(key.code)}
                    >
                      <span class="mk-label">{key.label}</span>
                    </button>
                  );
                }}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
