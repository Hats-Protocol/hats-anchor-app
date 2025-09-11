'use client';

import { useCouncilDetails, useSafeDetails } from 'hooks';
import { get, map, nth, size, toNumber } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { Button, cn } from 'ui';
import { parseCouncilSlug } from 'utils';

const LINKS = [
  { label: 'Transactions', href: 'transactions' },
  { label: 'Assets', href: 'assets' },
  { label: 'Join', href: 'join' },
  { label: 'Members', href: 'members' },
  { label: 'Manage', href: 'manage' },
];

const CouncilButtons = () => {
  const pathname = usePathname();
  const slug = nth(pathname.split('/'), 2);
  const { chainId, address } = parseCouncilSlug(slug as string);

  const { data: councilDetails } = useCouncilDetails({ chainId: chainId || undefined, address });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');

  const { data: signers } = useSafeDetails({
    chainId: chainId || undefined,
    safeAddress: get(councilDetails, 'safe'),
  });

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';
  const isTxAssets = posthog.isFeatureEnabled('tx-assets') || process.env.NODE_ENV !== 'production';

  const devLink = isDev ? [{ label: 'Dev', href: 'dev' }] : [];
  const links = [...LINKS, ...devLink];

  // ! ButtonGroup is not compatible with LinkButton

  return (
    <div className='absolute top-[-20px] flex rounded-full bg-white'>
      {map(links, ({ label, href }, i) => {
        const isFirst = i === 0;
        const isLast = i === links.length - 1;

        // TODO check that signers are still active wearers/eligible
        // In dev mode, always show join button; in prod, hide when council is full
        if (href === 'join' && !isDev && size(signers) === toNumber(primarySignerHat?.maxSupply)) {
          return null;
        }

        return (
          <Link
            href={(href === 'transactions' || href === 'assets') && !isTxAssets ? '#' : `/councils/${slug}/${href}`}
            key={href}
            className={cn(
              '-ml-[1px]',
              (href === 'transactions' || href === 'assets') && !isTxAssets && 'cursor-default',
            )}
          >
            <div className='relative'>
              <Button
                variant={pathname.includes(href) ? 'default' : 'outline'}
                className={cn(
                  'rounded-none border border-black font-normal',
                  isFirst ? 'rounded-l-full' : isLast ? 'rounded-r-full' : '',
                )}
                disabled={(href === 'transactions' || href === 'assets') && !isTxAssets}
              >
                {label}
              </Button>

              {href === 'transactions' && !isTxAssets && (
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
