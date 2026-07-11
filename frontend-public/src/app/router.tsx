import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProjectDetailsPage } from '../pages/ProjectDetailsPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ResumePage } from '../pages/ResumePage';
import { SkillsPage } from '../pages/SkillsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'projects/:slug',
        element: <ProjectDetailsPage />,
      },
      {
        path: 'skills',
        element: <SkillsPage />,
      },
      {
        path: 'resume',
        element: <ResumePage />,
      },
      {
        path: 'contacts',
        element: <ContactPage />,
      },
      {
        path: 'contact',
        element: <Navigate to="/contacts" replace />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
