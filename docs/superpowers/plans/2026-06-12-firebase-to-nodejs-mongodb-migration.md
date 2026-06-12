# Firebase to Node.js/MongoDB Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the app’s Firebase-backed backend with a private Node.js API and MongoDB persistence while keeping the Capacitor app’s login, sync, and AI/email flows working.

**Architecture:** The Capacitor app becomes a thin client over a custom API. Google and Apple sign-in will happen on-device, then the app will exchange the provider token with the backend for an app JWT. User progress, chat history, and profile data will live in MongoDB, while mail sending and AI chat move behind REST endpoints that preserve the current front-end behavior.

**Tech Stack:** Node.js, TypeScript, Express, MongoDB, Mongoose, JWT, Google token verification, Apple identity token verification, Capacitor, fetch-based API client, Docker.

---

### Task 1: Map the current Firebase contract and lock the replacement surface

**Files:**
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/lib/firebase.ts`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/lib/api/email.functions.ts`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/hooks/useGitaAI.tsx`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/hooks/useUserProgress.tsx`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/app/screens.tsx`

- [ ] **Step 1: Identify every Firebase call path**

Record the current auth, sync, email, and AI entry points so the replacement API can keep the same behavior and data shape.

- [ ] **Step 2: Define the new API contract**

Document the endpoints the app needs:

```ts
POST /auth/google
POST /auth/apple
GET /auth/me
POST /auth/logout
POST /users/me/sync
DELETE /users/me
POST /ai/chat
POST /mail/contact
POST /mail/correction
POST /mail/newsletter
POST /mail/welcome
```

- [ ] **Step 3: Keep the client-facing state model stable**

Preserve the current `user`, `profile`, `bookmarks`, `notes`, `history`, `favorites`, `completedVerses`, `readDates`, and download fields so the UI does not need a rewrite.

### Task 2: Build the private Node.js backend

**Files:**
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/package.json`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/tsconfig.json`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/server.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/app.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/config.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/db.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/models/User.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/models/Chat.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/models/AuditLog.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/routes/auth.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/routes/users.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/routes/chat.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/routes/mail.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/services/google.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/services/apple.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/services/jwt.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/services/mail.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/src/services/gitaChat.ts`
- Create: `/Users/saiakashneela/Github/peaceful-gita/backend/.env.example`

- [ ] **Step 1: Implement MongoDB-backed user persistence**

Store profile, syncable reading state, chat history, and provider identity in MongoDB.

- [ ] **Step 2: Implement provider token exchange**

Verify Google ID tokens and Apple identity tokens on the server, then mint an app JWT for the client.

- [ ] **Step 3: Implement the chat/mail endpoints**

Keep the same response semantics the app expects, including rate limiting and success/error shapes.

- [ ] **Step 4: Add an operational Dockerfile**

Create a backend `Dockerfile` suitable for running against an external MongoDB instance.

### Task 3: Replace Firebase client code with backend adapters

**Files:**
- Delete or replace: `/Users/saiakashneela/Github/peaceful-gita/src/lib/firebase.ts`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/lib/api/email.functions.ts`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/lib/seeding.ts`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/hooks/useGitaAI.tsx`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/hooks/useUserProgress.tsx`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/app/screens.tsx`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/app/components/ui.tsx` if auth UI helpers need it

- [ ] **Step 1: Replace Firestore reads/writes with HTTP calls**

Move cloud sync, chat sync, and email functions to the backend API without changing the localStorage-first behavior.

- [ ] **Step 2: Introduce a local auth session adapter**

Expose the same `user`-shaped data to the UI, but source it from the app JWT and backend `/auth/me`.

- [ ] **Step 3: Keep guest mode unchanged**

Make unauthenticated usage continue to work exactly as it does now.

### Task 4: Rewire Google and Apple login for Capacitor

**Files:**
- Modify: `/Users/saiakashneela/Github/peaceful-gita/src/app/screens.tsx`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/capacitor.config.ts`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/ios/App/App/Info.plist` if native URL handling needs adjustment
- Modify: `/Users/saiakashneela/Github/peaceful-gita/android/app/src/main/AndroidManifest.xml` if callback handling needs adjustment

- [ ] **Step 1: Keep Google sign-in on Android**

Use the native Google sign-in plugin, send the ID token to the backend, and store the returned app session.

- [ ] **Step 2: Keep Apple sign-in on iOS**

Use the native Apple sign-in plugin, send the identity token to the backend, and store the returned app session.

- [ ] **Step 3: Preserve web fallback**

If the web build remains supported, use a browser-based OAuth flow that also exchanges tokens with the backend.

### Task 5: Remove Firebase dependency wiring

**Files:**
- Modify: `/Users/saiakashneela/Github/peaceful-gita/package.json`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/firebase.json`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/functions/package.json`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/functions/src/index.ts`
- Modify: `/Users/saiakashneela/Github/peaceful-gita/functions/tsconfig.json`
- Delete if no longer needed: `/Users/saiakashneela/Github/peaceful-gita/functions/`

- [ ] **Step 1: Remove Firebase-specific build/runtime assumptions**

Stop the app from depending on Firebase config files, callable functions, or Firestore initialization.

- [ ] **Step 2: Preserve only the code that is still useful**

Keep any reusable content generation or email templates by moving them into the new backend if needed.

### Task 6: Verify the migration with focused build checks

**Files:**
- All modified files above

- [ ] **Step 1: Run the frontend build**

Confirm the Capacitor app still compiles with the new backend adapters.

- [ ] **Step 2: Run the backend build**

Confirm the Node.js API type-checks and starts cleanly.

- [ ] **Step 3: Sanity-check auth and sync flows**

Exercise Google sign-in on Android and Apple sign-in on iOS after the code changes are in place.

## Self-Review

- Spec coverage: Google sign-in on Android, Google+Apple on iOS, MongoDB persistence, Dockerized Node backend, and Capacitor-safe client adapters are each covered by a task.
- Placeholder scan: No TBD blocks or vague “handle edge cases later” steps remain.
- Type consistency: The plan uses one auth/session model and one backend API surface consistently across all tasks.
