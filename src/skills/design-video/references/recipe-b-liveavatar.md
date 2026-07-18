# Recipe B — Live avatar embed (GATED: marketing/sales only)

Table of contents:
1. The trust gate (read this FIRST — most requests fail it)
2. Pick the integration path (Embed / FULL / LITE)
3. The backend / frontend split (the non-negotiable)
4. The Embed path (simplest — one server call, one iframe)
5. FULL / LITE in brief
6. The runtime guards (click-to-start, AI disclosure, teardown, keep-alive)
7. Sandbox testing
8. Accept / reject

A live avatar is a real-time, lip-synced video avatar that speaks and reacts —
HeyGen LiveAvatar. It is powerful and almost always the WRONG call. This recipe is
**gated**: build it only after the surface clears the trust gate, and even then
prefer Recipe A first. Patterns condensed from
HeyGen's public LiveAvatar agent skills (liveavatar-integrate, liveavatar-debug).

## 1. The trust gate (read FIRST — most requests fail it)

Apply the HARD trust rule from SKILL.md against the active project register:

| Register | Live avatar verdict |
|---|---|
| **A regulated trust portal** (serious-trust / fintech) | BANNED in-product. Allowed ONLY on a pure marketing/sales surface, and even there default to Recipe A first. Avatar over data/compliance = FAIL. |
| **An analyst data product** (analyst-terminal) | NO live avatar anywhere in the terminal. The credible move is programmatic/data-driven video (see `recipe-programmatic.md`). |
| **A warm consumer app** (warm-premium-fun-but-calm) | Defensible on marketing / onboarding welcome. Keep it calm, click-to-start, escapable. |

If the surface is in-product on a trust/data brand, **STOP** and surface a
User-Challenge: what the user asked, what the register implies, the cost if wrong.
Default to downgrade (B → A → no video). Only proceed past this gate when the
surface is genuinely high-intent marketing/sales AND the register permits it.

## 2. Pick the integration path (assess, don't ask what the code answers)

Scan the codebase for signals before asking the user (mirrors
`liveavatar-integrate` Step 1): existing LLM SDK (OpenAI/Anthropic), TTS
(ElevenLabs/PlayHT), STT (Deepgram/Whisper), LiveKit/Agora, an existing
`*_API_KEY`, a static site with no backend. Then route to ONE path — pick the
simplest that works; do not offer a menu:

```
No backend, or just an avatar on a page          -> EMBED   (iframe; §4)
No existing AI stack (no STT/LLM/TTS)             -> FULL Mode (standard)
Own LLM but no STT/TTS                            -> FULL + Custom LLM
Complete pipeline (STT + LLM + TTS) already       -> LITE Mode
ElevenLabs Conversational AI agent already        -> LITE + ElevenLabs plugin
Own LiveKit / Agora infra                          -> LITE + BYO WebRTC
```

For a marketing hero where the avatar just talks, **Embed** is almost always right.
FULL/LITE are for genuinely conversational product-y experiences — which on a trust
brand the trust gate has usually already excluded.

## 3. The backend / frontend split (the non-negotiable)

`X-API-KEY` is a SECRET — **backend only**. The browser only ever receives a
short-lived session/client token. **If the API key appears in client code, stop and
restructure.** (liveavatar-integrate L116.)

- Backend route holds `X-API-KEY`, calls LiveAvatar to mint the embed/session token.
- Frontend gets the `url` / `livekit_client_token` (safe for browsers) and nothing
  else.
- **FULL and LITE are different protocols — never mix them.** FULL = LiveKit data
  channels (`avatar.*` / `user.*`). LITE = WebSocket (`agent.*` / `session.*`).
- **Context makes the avatar conversational.** In FULL Mode, no `context_id` = a
  silent avatar with NO error. Always create at least `"You are a helpful assistant."`

## 4. The Embed path (simplest — one server call, one iframe)

**Server (backend, `X-API-KEY`):** mint the embed; never expose the key.

```bash
curl -X POST https://api.liveavatar.com/v2/embeddings \
  -H "X-API-KEY: $LIVEAVATAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "avatar_id": "<avatar_id>", "context_id": "<context_id>" }'
# -> { "data": { "url": "https://embed.liveavatar.com/v1/<id>", "script": "<iframe …>" } }
```

**Frontend:** drop the returned URL into an iframe — but **behind an explicit click**
and inside a reserved, token-styled box. Do NOT render the iframe on page load (it
opens a paid live session). The poster + "Talk to our AI guide" button is what loads;
the iframe mounts only on click.

```html
<figure class="avatar" style="aspect-ratio: 16 / 9; background: var(--surface);">
  <!-- Loads on click ONLY. data-embed-url comes from the server route, never the key. -->
  <button type="button" data-start-avatar data-embed-url="https://embed.liveavatar.com/v1/<id>">
    Talk to our AI guide   <!-- honest: it is AI, and it is the user's choice to start -->
  </button>
  <figcaption>You're about to start a live AI video session.</figcaption>
</figure>
```

On click, replace the button with:

```html
<iframe
  src="https://embed.liveavatar.com/v1/<id>"
  allow="microphone"            <!-- REQUIRED or the avatar can't hear -->
  title="LiveAvatar (AI presenter)"
  style="width:100%; aspect-ratio:16/9; border:none;"
></iframe>
```

Gotchas: `allow="microphone"` is required; the API key must stay server-side; no
`context_id` = a non-conversational avatar.

## 5. FULL / LITE in brief

- **FULL Mode:** LiveAvatar runs ASR + (optionally your) LLM + TTS + video. Token
  via `POST /v1/sessions/token`, then `POST /v1/sessions/start` returns
  `livekit_url` + `livekit_client_token` (→ frontend) for the video room. Events ride
  LiveKit data channels.
- **LITE Mode:** you bring STT+LLM+TTS; LiveAvatar only renders video from your
  audio. Start returns `livekit_url`+`livekit_client_token` (→ frontend, video) plus
  `ws_url` (→ your backend, audio over WebSocket). **Audio MUST be PCM 16-bit, 24 kHz,
  mono, base64** — wrong format = garbled avatar with NO error. Wait for
  `{"state":"connected"}` before sending; bookend turns with
  `agent.start_listening`/`agent.stop_listening`; send `agent.speak` chunks under one
  `event_id` then `agent.speak_end`.

Full session lifecycles, event tables, and audio-streaming code are in the source
skill (`liveavatar-integrate` references). Defer to it for the deep build — this
skill's value-add is the trust gate + the front-end guards in §6.

## 6. The runtime guards (front-end correctness)

- **Click-to-start, never on load.** A live session = a paid RTC connection. It must
  begin from an explicit user action with a clear "live AI session" affordance.
- **AI disclosure is visible and honest.** Label the presenter as AI (button copy,
  iframe `title`, an on-screen badge). Never imply a human. Compliance-honesty fails
  a disguised synthetic face — and that disguise is exactly the trust rule's target.
- **Teardown on unmount / leave.** Always `DELETE /v1/sessions` (Bearer
  session_token) and close the WebSocket when the user leaves or the component
  unmounts. Orphaned sessions burn credits until the 5-min timeout. One live session
  per page, max.
- **Keep-alive.** Sessions die after 5 min idle — send a keep-alive every 2-3 min
  during an active conversation (FULL: `POST /v1/sessions/keep-alive`; LITE:
  `session.keep_alive` over the WebSocket).
- **Reserved box + text fallback.** The avatar lives in an aspect-ratio box (CLS 0)
  and the surface still makes its point in real text if the user never starts it.
- **Reduced motion / opt-out.** Nothing about a live avatar should ambush the user;
  it is always opt-in and always escapable.

## 7. Sandbox testing (free, no credits)

Test before going live with `"is_sandbox": true`. Sandbox avatar IDs differ by
surface: session sandbox = `dd73ea75-1218-4ef3-92ce-606d5f7fbc0a`; embed sandbox =
`65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0`. ~1-min sessions, auto-terminate — expected.
Swap to the production avatar only when wired correctly.

Common live-avatar failures (from `liveavatar-debug`): silent avatar = missing
`context_id` or `allow="microphone"`; garbled LITE audio = wrong PCM rate; 401 =
wrong auth header (`X-API-KEY` on `/token`, `Bearer` on `/start`); dropped LITE
events = sent before `connected`, or `agent.*` vs `avatar.*` mixed.

## 8. Accept / reject (qualitative)

Accept ONLY when: the surface is high-intent marketing/sales AND the register
permits a live avatar; the key is server-side; the session is click-to-start;
the presenter is disclosed as AI; teardown + keep-alive + one-session-per-page are
wired; a text fallback carries the message. Reject (and downgrade) when: the surface
is in-product on a trust/data brand; the avatar autostarts; the key is in the client;
no teardown (credit leak); or the synthetic face is passed off as human.
