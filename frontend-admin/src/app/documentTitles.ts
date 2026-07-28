const ADMIN_NAME = 'Malik Admin';

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

function withAdminName(title: string) {
  return `${title} | ${ADMIN_NAME}`;
}

export function getAdminDocumentTitle(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);
  const staticTitles: Record<string, string> = {
    '/': withAdminName('Dashboard'),
    '/login': withAdminName('Sign In'),
    '/profile': withAdminName('Profile'),
    '/projects': withAdminName('Projects'),
    '/projects/new': withAdminName('Create Project'),
    '/articles': withAdminName('Articles'),
    '/articles/new': withAdminName('Create Article'),
    '/skills': withAdminName('Skills'),
    '/skills/new': withAdminName('Add Skill'),
    '/skill-categories': withAdminName('Skill Categories'),
    '/skill-categories/new': withAdminName('Add Skill Category'),
    '/messages': withAdminName('Messages'),
    '/settings': withAdminName('Settings'),
  };
  const staticTitle = staticTitles[normalizedPathname];

  if (staticTitle) {
    return staticTitle;
  }

  const projectSettingsMatch = normalizedPathname.match(/^\/projects\/(\d+)\/settings$/);
  if (projectSettingsMatch) {
    return withAdminName(`Project Settings #${projectSettingsMatch[1]}`);
  }

  const projectEditMatch = normalizedPathname.match(/^\/projects\/(\d+)\/edit$/);
  if (projectEditMatch) {
    return withAdminName(`Edit Project #${projectEditMatch[1]}`);
  }

  const articleEditMatch = normalizedPathname.match(/^\/articles\/(\d+)\/edit$/);
  if (articleEditMatch) {
    return withAdminName(`Edit Article #${articleEditMatch[1]}`);
  }

  const skillEditMatch = normalizedPathname.match(/^\/skills\/(\d+)\/edit$/);
  if (skillEditMatch) {
    return withAdminName(`Edit Skill #${skillEditMatch[1]}`);
  }

  const categoryEditMatch = normalizedPathname.match(/^\/skill-categories\/(\d+)\/edit$/);
  if (categoryEditMatch) {
    return withAdminName(`Edit Skill Category #${categoryEditMatch[1]}`);
  }

  const messageMatch = normalizedPathname.match(/^\/messages\/(\d+)$/);
  if (messageMatch) {
    return withAdminName(`Message #${messageMatch[1]}`);
  }

  return withAdminName('Page Not Found');
}

export function getAdminMetaDescription(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);
  const staticDescriptions: Record<string, string> = {
    '/': 'Overview of portfolio content, activity, and administration metrics in Malik Admin.',
    '/login': 'Secure sign-in page for the Malik portfolio administration interface.',
    '/profile': 'Manage the public profile, biography, contact links, and personal details.',
    '/projects': 'Manage portfolio projects, publication statuses, links, and project content.',
    '/projects/new': 'Create a new portfolio project and configure its content, links, and status.',
    '/articles': 'Manage portfolio articles, publication statuses, summaries, and content.',
    '/articles/new': 'Create a new engineering article for the public portfolio.',
    '/skills': 'Manage portfolio skills, proficiency levels, categories, visibility, and order.',
    '/skills/new': 'Add a new skill to the portfolio and configure its category and visibility.',
    '/skill-categories': 'Manage the categories used to organize portfolio skills.',
    '/skill-categories/new': 'Create a new category for organizing portfolio skills.',
    '/messages': 'Review and manage contact messages received through the public portfolio.',
    '/settings': 'Manage the administrator account, password, API details, and backend status.',
  };
  const staticDescription = staticDescriptions[normalizedPathname];

  if (staticDescription) {
    return staticDescription;
  }

  const projectSettingsMatch = normalizedPathname.match(/^\/projects\/(\d+)\/settings$/);
  if (projectSettingsMatch) {
    return `Configure portfolio project #${projectSettingsMatch[1]}, including its content, links, dates, and publication status.`;
  }

  const projectEditMatch = normalizedPathname.match(/^\/projects\/(\d+)\/edit$/);
  if (projectEditMatch) {
    return `Edit the content, links, dates, and publication status of portfolio project #${projectEditMatch[1]}.`;
  }

  const articleEditMatch = normalizedPathname.match(/^\/articles\/(\d+)\/edit$/);
  if (articleEditMatch) {
    return `Edit the title, summary, content, cover image, and publication status of article #${articleEditMatch[1]}.`;
  }

  const skillEditMatch = normalizedPathname.match(/^\/skills\/(\d+)\/edit$/);
  if (skillEditMatch) {
    return `Edit the category, proficiency level, visibility, and order of portfolio skill #${skillEditMatch[1]}.`;
  }

  const categoryEditMatch = normalizedPathname.match(/^\/skill-categories\/(\d+)\/edit$/);
  if (categoryEditMatch) {
    return `Edit portfolio skill category #${categoryEditMatch[1]} and its displayed name.`;
  }

  const messageMatch = normalizedPathname.match(/^\/messages\/(\d+)$/);
  if (messageMatch) {
    return `Read and manage contact message #${messageMatch[1]} in the Malik administration interface.`;
  }

  return 'The requested administration page could not be found in Malik Admin.';
}

export function getAdminCanonicalUrl(pathname: string, origin: string) {
  return new URL(normalizePathname(pathname), `${origin.replace(/\/+$/, '')}/`).toString();
}

export function getAdminOpenGraphMetadata(pathname: string, origin: string) {
  const normalizedPathname = normalizePathname(pathname);

  return {
    'og:title': getAdminDocumentTitle(normalizedPathname),
    'og:description': getAdminMetaDescription(normalizedPathname),
    'og:url': getAdminCanonicalUrl(normalizedPathname, origin),
    'og:type': 'website',
    'og:site_name': ADMIN_NAME,
    'og:locale': 'en_US',
  };
}

export function getAdminTwitterCardMetadata(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);

  return {
    'twitter:card': 'summary',
    'twitter:title': getAdminDocumentTitle(normalizedPathname),
    'twitter:description': getAdminMetaDescription(normalizedPathname),
  };
}
