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

The backend is a Spring Boot REST API. Admin endpoints are protected with HTTP
Basic Auth. The frontend must not implement token-login flows that the backend
does not expose.

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
2. The frontend creates `Basic base64(email + ':' + password)`.
3. The frontend validates credentials with `GET /admin/me`.
4. Only a successful `{ email, role }` response stores the Basic header in
   `sessionStorage`.
5. The raw password must not be stored.
6. Logout clears `sessionStorage` and the TanStack Query cache.
7. A `401` response clears the session and redirects to `/login`.
8. Production must use HTTPS because Basic credentials are not encrypted by
   base64.

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

Do not add image upload, admin user management, password change, or registration
until the backend exposes those endpoints.

## UI

The admin panel should be dense, calm, and work-focused:

- Use tables and compact lists for content management.
- Use status chips for publication, visibility, and message states.
- Use clear loading, error, empty, and mutation success states.
- Use native confirmation before destructive deletes.
- Keep forms responsive and avoid marketing-style landing sections.
