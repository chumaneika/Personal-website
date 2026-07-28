import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('healthz', './routes/healthz.ts'),
  layout('./app/AppLayout.tsx', [
    index('./pages/HomePage.tsx'),
    route('about', './pages/AboutPage.tsx'),
    route('projects', './pages/ProjectsPage.tsx'),
    route('projects/:slug', './pages/ProjectDetailsPage.tsx'),
    route('blog', './pages/BlogPage.tsx'),
    route('blog/:slug', './pages/ArticleDetailsPage.tsx'),
    route('skills', './pages/SkillsPage.tsx'),
    route('resume', './pages/ResumePage.tsx'),
    route('contacts', './pages/ContactPage.tsx'),
    route('contact', './routes/contact-redirect.ts'),
    route('*', './pages/NotFoundPage.tsx'),
  ]),
] satisfies RouteConfig;
