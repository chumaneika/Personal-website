import { lazy, ReactElement, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { LoginRoute, ProtectedRoute } from './RouteGuards';

const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then(({ DashboardPage }) => ({ default: DashboardPage })),
);
const LoginPage = lazy(() => import('../pages/LoginPage').then(({ LoginPage }) => ({ default: LoginPage })));
const MessageDetailPage = lazy(() =>
  import('../pages/MessageDetailPage').then(({ MessageDetailPage }) => ({ default: MessageDetailPage })),
);
const MessagesPage = lazy(() => import('../pages/MessagesPage').then(({ MessagesPage }) => ({ default: MessagesPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(({ NotFoundPage }) => ({ default: NotFoundPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(({ ProfilePage }) => ({ default: ProfilePage })));
const ProjectFormPage = lazy(() =>
  import('../pages/ProjectFormPage').then(({ ProjectFormPage }) => ({ default: ProjectFormPage })),
);
const ProjectsPage = lazy(() => import('../pages/ProjectsPage').then(({ ProjectsPage }) => ({ default: ProjectsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(({ SettingsPage }) => ({ default: SettingsPage })));
const SkillFormPage = lazy(() =>
  import('../pages/SkillFormPage').then(({ SkillFormPage }) => ({ default: SkillFormPage })),
);
const SkillsPage = lazy(() => import('../pages/SkillsPage').then(({ SkillsPage }) => ({ default: SkillsPage })));

function lazyRoute(element: ReactElement) {
  return <Suspense fallback={<p className="surface-state">Loading page...</p>}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <LoginRoute />,
    children: [
      {
        path: '/login',
        element: lazyRoute(<LoginPage />),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: lazyRoute(<DashboardPage />),
          },
          {
            path: 'profile',
            element: lazyRoute(<ProfilePage />),
          },
          {
            path: 'projects',
            element: lazyRoute(<ProjectsPage />),
          },
          {
            path: 'projects/new',
            element: lazyRoute(<ProjectFormPage />),
          },
          {
            path: 'projects/:id/edit',
            element: lazyRoute(<ProjectFormPage />),
          },
          {
            path: 'skills',
            element: lazyRoute(<SkillsPage />),
          },
          {
            path: 'skills/new',
            element: lazyRoute(<SkillFormPage />),
          },
          {
            path: 'skills/:id/edit',
            element: lazyRoute(<SkillFormPage />),
          },
          {
            path: 'messages',
            element: lazyRoute(<MessagesPage />),
          },
          {
            path: 'messages/:id',
            element: lazyRoute(<MessageDetailPage />),
          },
          {
            path: 'settings',
            element: lazyRoute(<SettingsPage />),
          },
          {
            path: '*',
            element: lazyRoute(<NotFoundPage />),
          },
        ],
      },
    ],
  },
]);
