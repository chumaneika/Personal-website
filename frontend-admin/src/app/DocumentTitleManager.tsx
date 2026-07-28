import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  getAdminCanonicalUrl,
  getAdminDocumentTitle,
  getAdminMetaDescription,
  getAdminOpenGraphMetadata,
  getAdminTwitterCardMetadata,
} from './documentTitles';

function setMetaDescription(description: string) {
  let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.append(metaDescription);
  }

  metaDescription.content = description;
}

function setCanonicalUrl(url: string) {
  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.append(canonicalLink);
  }

  canonicalLink.href = url;
}

function setOpenGraphMetadata(metadata: Record<string, string>) {
  Object.entries(metadata).forEach(([property, content]) => {
    let metaElement = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);

    if (!metaElement) {
      metaElement = document.createElement('meta');
      metaElement.setAttribute('property', property);
      document.head.append(metaElement);
    }

    metaElement.content = content;
  });
}

function setTwitterCardMetadata(metadata: Record<string, string>) {
  Object.entries(metadata).forEach(([name, content]) => {
    let metaElement = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

    if (!metaElement) {
      metaElement = document.createElement('meta');
      metaElement.name = name;
      document.head.append(metaElement);
    }

    metaElement.content = content;
  });
}

export function DocumentTitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getAdminDocumentTitle(pathname);
    setMetaDescription(getAdminMetaDescription(pathname));
    setCanonicalUrl(getAdminCanonicalUrl(pathname, window.location.origin));
    setOpenGraphMetadata(getAdminOpenGraphMetadata(pathname, window.location.origin));
    setTwitterCardMetadata(getAdminTwitterCardMetadata(pathname));
  }, [pathname]);

  return <Outlet />;
}
