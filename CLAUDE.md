# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Neptun** ("Planshet Predsedatelya" / Chairman's Tablet) — an enterprise management platform for AO "Uzbekgidroenergo" (Uzbek Hydropower Company). Covers energy production monitoring, HRM, finance, legal documents, chancellery, and situation center operations.

Built on Angular 20 with PrimeNG (Sakai template), fully standalone components (no NgModules).

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build → dist/sakai-ng/
npm test           # Unit tests via Karma + Jasmine
npm run format     # Prettier formatting
```

Docker:
```bash
docker compose up --build   # Build and serve via nginx on port 4200
```

## Architecture

### Path Alias
`@/*` maps to `src/app/*` (configured in `tsconfig.json`).

### Core Layer (`src/app/core/`)
- **`services/api.service.ts`** — Base HTTP service. All domain services extend it. Backend URL: `https://prime.speedwagon.uz`. Constants `BASE_URL`, `FLAT` (`/flat`), `API_V3` (`/api/v3`).
- **`services/auth.service.ts`** — Sign-in, sign-out, token refresh orchestration. Role checks: `hasRole()`, `isAdmin()`, `isSc()`, `isAssistant()`.
- **`services/jwt.service.ts`** — JWT token in `localStorage` (`access_token` key). Uses `jwt-decode`.
- **`services/token-refresh.service.ts`** — Concurrent refresh coordination with BehaviorSubject mutex.
- **`services/config.service.ts`** — Runtime config from `window.__APP_CONFIG__` (Docker/nginx injection), merged with defaults.
- **`interceptor/auth.interceptor.ts`** — Attaches Bearer token; handles 401 → token refresh → retry.
- **`interceptor/error.interceptor.ts`** — Catches non-401 HTTP errors, shows localized toasts.
- **`guards/auth.guard.ts`** — Functional `CanActivateFn` guards: `authGuard`, `adminGuard`, `scGuard`, `raisGuard`.
- **`components/base-crud.component.ts`** — Generic `BaseCrudComponent<T, TPayload>` directive. Extend it, implement `buildForm()`, `buildPayload()`, `patchFormForEdit()`, and call `loadItems()` in `ngOnInit()`.
- **`interfaces/`** — TypeScript interfaces for all domain entities.
- **`validators/`** — Custom form validators (e.g., `date-range.validator.ts`).

### Layout (`src/app/layout/`)
- **`app.layout.ts`** — Shell: topbar + sidebar + `<router-outlet>` + footer.
- **`app.topbar.ts`** — Logo, hamburger, dark mode toggle, language switcher, SOS button, fast calls, calendar, inbox, profile menu.
- **`service/layout.service.ts`** — Uses Angular signals for menu mode, dark theme, sidebar state. Default: Aura preset, dark theme, static menu.
- **`component/dialog/`** — Reusable dialog components: delete/approve confirmation, file upload/viewer, input-text, input-number, textarea, date-picker, select, group-select.

### Pages (`src/app/pages/`)
Organized by business domain: `situation-center/`, `hrm/`, `financial-block/`, `invest/`, `chancellery/`, `legal-documents/`, `planning/`, `media/`, `dashboard/`, `auth/`, etc.

### Routing (`src/app.routes.ts`)
- All routes eagerly loaded except `auth/` (lazy).
- `/dashboard` renders outside AppLayout; most other pages render inside it.
- Frontend guards: `authGuard` (authenticated), `adminGuard` (admin role), `scGuard` (sc role), `raisGuard` (sc/assistant/rais/investment/chancellery roles).
- User roles: `admin`, `sc`, `rais`, `assistant`, `investment`, `chancellery`, `first deputy`.

### HRM Access Control (backend-enforced)

The frontend `adminGuard` on HRM routes is only a UI gate. The real access control is on the backend:

| Role | Read HRM | Write HRM | Own data via `/my-*` |
|------|----------|-----------|----------------------|
| `hrm_admin` | All | All | Yes |
| `hrm_manager` | All | All | Yes |
| `hrm_employee` | Own only | Own only (vacations etc.) | Yes |
| `rais` | All (read-only) | No | Yes |
| Any authenticated | No | No | Yes |

- Backend middleware: `RequireAnyRole("hrm_admin", "hrm_manager", "hrm_employee", "rais")` for reads, `RequireAnyRoleForWrite("hrm_admin", "hrm_manager", "hrm_employee")` blocks `rais` from POST/PATCH/DELETE.
- `hrm_employee` handlers filter by `claims.ContactID` — get-all returns only own record, get-by-id checks ownership.
- `/my-*` endpoints (profile, vacations, leave-balance, notifications, tasks, documents, salary, training, competencies) are available to any authenticated user, auto-filtered by `claims.ContactID`.

### Authentication Flow
1. `POST /auth/sign-in` → returns `{ access_token }` (JWT stored in localStorage).
2. Refresh token stored as HTTP-only cookie (`withCredentials: true`).
3. Auth interceptor attaches Bearer token to all requests.
4. On 401 → `POST /auth/refresh` (cookie-based) → retry original request.
5. Refresh failure → logout → redirect to `/auth/login`.

### i18n
- `@ngx-translate/core` with 4 languages: `ru` (default), `uz-latn`, `uz-cyrl`, `en`.
- Translation files: `src/assets/i18n/{ru,en,uz-latn,uz-cyrl}.json`.
- Language preference stored in `localStorage` (`selectedLanguage` key).
- Keys organized as `COMMON.*`, `MENU.*`, `HRM.*`, `ERRORS.*`, etc.
- Use `translate` pipe in templates, `TranslateService.instant()` in TypeScript.

## Code Conventions

- **Standalone components only** — no NgModules.
- **Component selector prefix:** `p` (kebab-case for elements, camelCase for directives).
- **Component class suffix:** none (ESLint rule disables the suffix requirement).
- **Indent:** 4 spaces, single quotes, no trailing commas, semicolons required.
- **Print width:** 250 (Prettier).
- **Reactive forms** for all form handling.
- **Subscription cleanup:** `Subject`-based `destroy$` pattern with `takeUntil`.
- **Toast messages:** always use translation keys via `TranslateService`.
- **Domain services** extend `ApiService` to inherit `HttpClient` and base URL.
- **Error handling:** 3-layer — auth interceptor (401), error interceptor (other HTTP), global ErrorHandler (unhandled).
