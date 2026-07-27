# Frontend Admin Constitution

This app is the private admin panel for Malik Alikberov's personal website.
There is only one system user: the site owner/admin. Public visitors are not
users of this application.

## Scope

- Work only inside `frontend-admin` unless a task explicitly asks otherwise.
- Do not change `frontend-public` or `backend` from admin-only tasks.
- Do not add public-site-only flows to the admin panel.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- SCSS
- Axios
- TanStack Query
- React Hook Form
- Zod

Do not add Redux, Zustand, Tailwind, Next.js, UI-kit libraries, or
microfrontends.

## Backend Contract

The backend is a Spring Boot REST API. Admin endpoints are protected with a
server-side HTTP session. The browser receives an HttpOnly session cookie and
must never persist credentials or authentication headers.

The API root is:

```env
VITE_ADMIN_API_URL=http://localhost:8080/api
```

When the environment variable is absent, the frontend falls back to `/api`.
Admin paths are called beneath the API root, for example `/admin/me` and
`/admin/projects`.

## Authentication

Login flow:

1. The admin enters email and password on `/login`.
2. Before an unsafe request, the frontend obtains a CSRF token from
   `GET /auth/csrf`.
3. The frontend sends credentials once to `POST /auth/login`.
4. The backend creates a server-side session and returns an HttpOnly cookie.
5. Axios sends cookies with `withCredentials`; no password, Basic header, or
   token is stored in browser storage.
6. Protected routes validate the session with `GET /admin/me`.
7. Logout uses CSRF-protected `POST /auth/logout`, then clears the TanStack
   Query cache.
8. A `401` response redirects to `/login`.
9. Production uses HTTPS, a Secure SameSite session cookie, HSTS, and forwarded
   HTTPS headers from the reverse proxy.

## Admin API Modules

Keep HTTP calls out of UI components. Use modules under `src/shared/api`:

- `httpClient.ts`
- `auth.ts`
- `dashboard.ts`
- `profile.ts`
- `projects.ts`
- `articles.ts`
- `skills.ts`
- `skillCategories.ts`
- `messages.ts`
- `meta.ts`
- `health.ts`

Shared API contracts live in `src/shared/types/api.ts`.

## Routes

- `/login`
- `/`
- `/profile`
- `/projects`
- `/projects/new`
- `/projects/:id/edit`
- `/projects/:id/settings`
- `/articles`
- `/articles/new`
- `/articles/:id/edit`
- `/skills`
- `/skills/new`
- `/skills/:id/edit`
- `/skill-categories`
- `/skill-categories/new`
- `/skill-categories/:id/edit`
- `/messages`
- `/messages/:id`
- `/settings`

`/login` is public. Every other route is protected.

## Feature Boundaries

Implemented admin domains:

- Dashboard summary
- Public profile management
- Project CRUD and status management
- Article CRUD and publication status management
- Skill CRUD and visibility management
- Skill category CRUD
- Contact message viewing and status management
- Technical settings/session page

Do not add image upload, admin user management, or registration until the
backend exposes those endpoints. Password change is available through
`POST /admin/account/password`.

## UI

The admin panel should be dense, calm, and work-focused:

- Use tables and compact lists for content management.
- Use status chips for publication, visibility, and message states.
- Use clear loading, error, empty, and mutation success states.
- Use native confirmation before destructive deletes.
- Keep forms responsive and avoid marketing-style landing sections.
