'use client';

import { map, nth } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { Button, cn } from 'ui';

const LINKS = [
  { label: 'Transactions', href: 'transactions' },
  { label: 'Assets', href: 'assets' },
  { label: 'Members', href: 'members' },
  { label: 'Manage', href: 'manage' },
];

const CouncilButtons = () => {
  const pathname = usePathname();
  const slug = nth(pathname.split('/'), 2);

  const isDev = process.env.NODE_ENV !== 'production' || posthog.isFeatureEnabled('dev');

  const devLink = isDev ? [{ label: 'Dev', href: 'dev' }] : [];
  const links = [...LINKS, ...devLink];

  // ! ButtonGroup is not compatible with LinkButton

  return (
    <div className='absolute top-[-20px] flex rounded-full bg-white'>
      {map(links, ({ label, href }, i) => {
        const isFirst = i === 0;
        const isLast = i === links.length - 1;
        return (
          <Link
            href={href === 'transactions' || href === 'assets' ? '#' : `/councils/${slug}/${href}`}
            key={href}
            className={cn('-ml-[1px]', (href === 'transactions' || href === 'assets') && 'cursor-default')}
          >
            <div className='relative'>
              <Button
                variant={pathname.includes(href) ? 'default' : 'outline'}
                className={cn(
                  'rounded-none border border-black font-normal',
                  isFirst ? 'rounded-l-full' : isLast ? 'rounded-r-full' : '',
                )}
                disabled={href === 'transactions' || href === 'assets'}
              >
                {label}
              </Button>

              {href === 'transactions' && (
                <span className='bg-functional-success absolute -bottom-2 -right-4 z-[2] flex h-4 w-10 items-center justify-center rounded-full text-xs font-bold text-white'>
                  soon
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export { CouncilButtons };
