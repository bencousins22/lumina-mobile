# Legacy WebUI → Next.js Integration Mapping

Date: 2026-01-13

Purpose
- Provide a complete inventory of the legacy `webui/components` bundle, propose where each piece should map into the new Next.js UI, and document recommended Agent Zero API integration points and event-bridge surface. This document is strictly advisory — it does not modify legacy files.

Scope
- All legacy UI folders under the `webui/components` and top-level `webui` assets you provided (chat, messages, modals, sidebar, settings, projects, notifications, attachments, css, js, public assets).

1) Inventory (grouped)
- chat
  - `chat/*` (input, attachments, top-section, speech)
  - `chat/attachments/*` (attachmentsStore.js, dragDropOverlay.html, inputPreview.html)
  - `chat/input/*` (chat-bar.html, chat-bar-input.html, input-store.js, progress.html)
  - `chat/speech/*` (speech-store.js)
- messages
  - `messages/*` (action-buttons, resize/message-resize-store.js)
- modals
  - `modals/context/*` (context-store.js, context.html)
  - `modals/file-browser/*` (file-browser-store.js, file-browser.html)
  - `modals/full-screen-input/*` (full-screen-store.js, full-screen-input.html)
  - `modals/history/*` (history-store.js, history.html)
  - `modals/image-viewer/*` (image-viewer-store.js, image-viewer.html)
- notifications
  - `notifications/*` (notification-store.js, notification-icons.html, notification-modal.html, notification-toast-stack.html)
- projects
  - `projects/*` (project-create.html, project-edit-*.html, projects-store.js, project-list.html, project-selector.html)
- settings
  - `settings/*` (a2a, backup, external, mcp, memory, secrets, speech, tunnel — many html and store.js files)
- sidebar
  - `sidebar/*` (left-sidebar.html, sidebar-store.js, bottom/preferences/*, chats/*, tasks/*, top-section/*)
- welcome
  - `welcome/*` (welcome-screen.html, welcome-store.js)
- utilities / top-level
  - `js/*` (AlpineStore.js, api.js, components.js, initFw.js, messages.js, modals.js, settings.js, speech_browser.js, transformers@3.0.2.js, sw.js, time-utils.js, timeout.js)
  - `css/*` (buttons.css, messages.css, modals.css, notification.css, settings.css, speech.css, toast.css)
  - `public/*` (icons, svg, splash.jpg)

2) Mapping to the Next UI (high-level)
- Guiding principle: keep legacy files unmodified. For each legacy feature, either (A) mount it isolated (iframe or web-component), or (B) port to React progressively and use adapter wrappers for parity.

- Chat (priority 1)
  - Legacy: `chat/*`, `chat/input/*`, `chat/attachments/*`
  - Map to: new UI `components/chat/*` (`chat-panel.tsx`, `chat-message.tsx`, `code-block.tsx`, `chat-bar.tsx` to implement). If implementing as adapter: add `legacy-chat-wrapper.tsx` which mounts the legacy chat bundle in an iframe or custom element and exposes an event API.
  - UI pieces to create/verify:
    - `ChatPanel`: mount point, props: `projectId`, `initialConversationId`, `featureFlags`.
    - `ChatInput`: wrapper that either uses `input-store` behavior or proxies events to legacy bundle.
    - `Attachments`: proxy upload events to `lib/a2a-client.ts` / attachment store.
  - Events/API: `sendMessage`, `onMessage`, `onTyping`, `onUploadStart`, `onUploadComplete`.

- Messages
  - Legacy: `messages/*`, action-buttons, resize
  - Map to: `components/chat/` (`chat-message.tsx`, `action-buttons`), but can initially render legacy messages inside `legacy-messages-wrapper`.
  - Keep message resize and action buttons behavior (copy/share/save) behind adapter events.

- Modals & Overlays
  - Legacy: `modals/*`
  - Map to: `components/ui/modal.tsx` + `components/modals/*` or `legacy-modal-wrapper` for complex legacy markup. Use event bridge to request open/close.

- Sidebar & Navigation
  - Legacy: `sidebar/*` (chats, tasks, top-section)
  - Map to: `components/navigation/*` and `components/sidebar/*` (`mobile-sidebar.tsx`, `mobile-navigation.tsx`). Sidebar mount can lazy-load legacy bundle and delegate clicks via the event bridge.

- Settings & Admin
  - Legacy: `settings/*` (mcp, memory, backup, speech, tunnel, secrets)
  - Map to: `components/settings/*` (we already have `components/settings/settings-panel.tsx`). Use adapter for features requiring legacy UI until ported.

- Projects
  - Legacy: `projects/*`
  - Map to: `components/projects/*` (`projects-panel.tsx`). For editing flows, either port forms into React or mount legacy form in wrapper.

- Notifications & Welcome
  - Legacy: `notifications/*`, `welcome/*`
  - Map to: `components/ui/toast.tsx`, `components/welcome/welcome-screen.tsx`. Replace native notifications progressively or proxy legacy notification events to `use-toast`.

3) Agent Zero API integration surface
- Existing client files to reuse (in this repo): `lib/agent-zero-client.ts`, `lib/a2a-client.ts`, `lib/auth.ts`, `lib/supabase.ts`, `lib/utils.ts`.
- Key capabilities the UI needs:
  - Send/receive chat messages (streaming + historic retrieval).
  - Manage projects and their metadata.
  - File attachments (upload, progress, retrieval).
  - Settings and secrets (read/write via secure endpoints).
  - Notifications and scheduler events.

- Recommended high-level API methods (adapter surface)
  - sendMessage({ projectId, conversationId, content, metadata }) → returns messageId | stream
  - fetchConversation({ projectId, conversationId, cursor, limit }) → messages[]
  - onMessage(callback) — subscribe for real-time messages (websocket / SSE / RPC)
  - uploadAttachment({ projectId, file }) → { uploadId } and events `onUploadProgress(uploadId, pct)`
  - listProjects(), getProject(projectId), updateProject(projectId, data)
  - getSettings(), updateSettings()

- Integration notes per legacy feature
  - Legacy `attachmentsStore.js` → plug into `lib/a2a-client.ts` for upload endpoints and then forward upload progress events to the wrapper.
  - Legacy `messages.js` & `transformers@3.0.2.js` → if legacy JS performs client-side model work, isolate it; prefer routing calls through `lib/agent-zero-client.ts` where model orchestration lives.
  - Legacy `history-store.js` → map to `fetchConversation` API and hook into `components/chat/history` panel.

4) Event Bridge API (recommended minimal set)
- Bridge methods (both directions):
  - from Next → Legacy: `init(context)`, `sendMessage(payload)`, `openModal(name, params)`, `navigate(route)`, `uploadFile(meta)`, `setFeatureFlags(flags)`
  - from Legacy → Next: `messageCreated(msg)`, `requestOpenModal(name, params)`, `attachmentUploaded(meta)`, `analyticsEvent(event)`
- Implementation recommendations:
  - If iframe: use `window.postMessage` with origin checks; wrapper registers a single `postMessage` channel and forwards events to React via a `LegacyBridge` context.
  - If same-origin web-component: use `CustomEvent` on the element and well-defined method calls on the element instance (e.g., `el.sendMessage(...)`).

5) Per-component integration notes & acceptance criteria (sample)
- Chat panel
  - Integration: mount legacy chat in sandbox; map `sendMessage` to `lib/agent-zero-client.ts.sendMessage` where possible. Ensure file uploads use `lib/a2a-client.ts`.
  - Acceptance: user can send a message, receive bot reply, attachment uploads work and show progress, chat history loads.
- File browser modal
  - Integration: mount `file-browser.html` in modal wrapper or port to React form. Ensure file listing uses backend `listProjectFiles` endpoint.
  - Acceptance: user can open file browser, select and attach a file to a message, and view image previews.

6) Testing & QA
- Add E2E tests for each batch using Playwright (we have `playwright.config.ts`) to assert visual parity and workflows.
- Smoke tests:
  - Chat send/receive
  - Attachment upload
  - Open/close modals
  - Sidebar navigation
- Accessibility checks using Axe or Playwright accessibility plugin.

7) Rollout & Feature Flags
- Wrap each integrated area with a feature flag. Release behind `legacy.chat.enabled`, `legacy.sidebar.enabled` etc.

8) Next immediate steps (actionable)
1. Generate an inventory CSV from the legacy folder listing (path, suggested batch, dependencies) — I can produce this automatically if you want.
2. Choose primary integration mode: `iframe` (fast, highest isolation) or `web-component` (lighter, same-origin API). Recommend `iframe` for initial integration.
3. Prototype: implement `legacy-chat-wrapper` that mounts `webui/index.html` or a minimal `chat` entry inside an iframe and wire a `postMessage` bridge to `components/chat/chat-panel.tsx`.

Appendix: Helpful repo references
- New app client hooks: `hooks/use-agent-zero.ts`, `lib/agent-zero-client.ts`, `lib/a2a-client.ts` — reuse these for integration.
- New UI components folder: `components/chat/`, `components/ui/`, `components/modals/` — add wrappers named `legacy-*-wrapper.tsx` when needed.

If you want, I can now:
- produce the inventory CSV listing every legacy file you provided and suggested batch (automated), or
- scaffold a prototype `legacy-chat-wrapper` React component in `components/chat/` that mounts the legacy chat in an iframe and implements the `postMessage` bridge.
