import type { ProfileResponse } from '../types/api';

type SocialLinksProps = {
  profile: ProfileResponse | null | undefined;
  includeEmail?: boolean;
  className?: string;
};

type SocialLink = {
  label: string;
  href: string;
};

export function SocialLinks({ profile, includeEmail = false, className = 'social-links' }: SocialLinksProps) {
  const links = [
    includeEmail && profile?.email
      ? {
          label: 'Email',
          href: `mailto:${profile.email}`,
        }
      : null,
    profile?.githubUrl
      ? {
          label: 'GitHub',
          href: profile.githubUrl,
        }
      : null,
    profile?.linkedinUrl
      ? {
          label: 'LinkedIn',
          href: profile.linkedinUrl,
        }
      : null,
    profile?.telegramUrl
      ? {
          label: 'Telegram',
          href: profile.telegramUrl,
        }
      : null,
  ].filter((link): link is SocialLink => Boolean(link));

  if (!links.length) {
    return null;
  }

  return (
    <div className={className}>
      {links.map((link) => (
        <a key={link.href} href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
          {link.label}
        </a>
      ))}
    </div>
  );
}
