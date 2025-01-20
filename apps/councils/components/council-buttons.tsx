'use client';

import { map, nth } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { Button, ButtonGroup } from 'ui';

const LINKS = [
  { label: 'Transactions', href: 'transactions' },
  { label: 'Assets', href: 'assets' },
  { label: 'Members', href: 'members' },
  { label: 'Manage', href: 'manage' },
];

export const CouncilButtons = () => {
  const pathname = usePathname();
  const slug = nth(pathname.split('/'), 2);

  const isDev = process.env.NODE_ENV !== 'production' || posthog.isFeatureEnabled('dev');

  const devLink = isDev ? [{ label: 'Dev', href: 'dev' }] : [];
  const links = [...LINKS, ...devLink];

  return (
    <ButtonGroup className='absolute top-[-5px] bg-white' orientation='horizontal'>
      {map(links, ({ label, href }) => (
        <Link href={`/councils/${slug}/${href}`} passHref key={href}>
          <Button variant={pathname.includes(href) ? 'default' : 'outline-blue'}>{label}</Button>
        </Link>
      ))}
    </ButtonGroup>
  );
};
