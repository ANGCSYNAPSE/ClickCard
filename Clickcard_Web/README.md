# ClickCard — Web App

The authenticated **product** for ClickCard: register/login, dashboard, profile,
digital card, studio, share & QR, analytics, billing, settings. Runs on **port
3001** so it can run alongside the marketing site (port 3000).

> Sibling apps: [`../website`](../website) (marketing landing) and
> `../admin-panel` (admin).

## Stack

| Concern    | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | Next.js 14 (Pages Router) + TypeScript              |
| Styling    | Tailwind CSS + CSS-variable theme tokens (light/dark)|
| State/data | Redux Toolkit (slices + async thunks)               |
| HTTP       | axios client with JWT + auto-refresh interceptors   |
| Forms      | Formik + Yup                                        |
| QR / icons | qrcode.react · lucide-react                         |

## Architecture

```
src/
  apiRoutes/      # single registry of every backend path (the API seam)
  lib/            # axiosClient (token+refresh), tokenService, validation, guards, cn
  services/       # thin per-domain wrappers over axios (auth/profile/share)
  store/          # configureStore + typed hooks + Providers
    slices/       # auth · registration · profile · share · ui
  components/
    ui/           # design system: Button, Input, OtpInput, Logo, ThemeToggle…
    auth/         # AuthShell, SocialButtons
    app/          # AppShell (sidebar+topbar), ComingSoon
    system/       # Toaster
  pages/          # routes (below)
  types/          # domain types mirroring the API contract
```

### Routes

- `/` → redirects to `/dashboard` (signed in) or `/login`
- `/signup` — 4-step registration (email → OTP → username → done)
- `/login` — passwordless email/username + OTP
- `/dashboard`, `/profile`, `/card`, `/studio`, `/share`, `/analytics`,
  `/billing`, `/settings` — guarded by `useRequireAuth`

## Backend integration

All calls flow through `src/services/*` → `apiClient` (`src/lib/axiosClient.ts`)
using paths from `src/apiRoutes`. Repoint via `NEXT_PUBLIC_API_BASE_URL`. Tokens
are attached in the request interceptor; a 401 transparently refreshes via
`/api/users/refresh-token` (single-flight with a queued retry) before retrying.

Copy `.env.example` → `.env.local`.

## Run

```bash
npm install
npm run dev      # http://localhost:3001
npm run build
```

### ⚠️ Networks with TLS interception (corporate proxy / antivirus)

If `npm install` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, your network is
intercepting TLS. Preferred fix — point Node at your corporate root CA:

```bash
setx NODE_EXTRA_CA_CERTS "C:\path\to\corp-root-ca.pem"
```

Dev-only workaround (insecure, never in CI/prod): `npm config set strict-ssl false`.

Fonts are loaded **browser-side** via `<link>` in `_document.tsx` (not
`next/font`'s server fetch) so build/dev work behind such proxies.
