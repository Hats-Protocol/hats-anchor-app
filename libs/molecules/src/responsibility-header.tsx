'use client';

import { useMediaStyles } from 'hooks';
import { pick } from 'lodash';
import { BsBoxArrowUpRight, BsCheck2Square } from 'react-icons/bs';
import { Authority } from 'types';
import { Button, cn, Link, Tooltip } from 'ui';
import { getHostnameFromURL, ipfsUrl } from 'utils';

const ResponsibilityHeader = ({
  label,
  imageUrl,
  link,
  editingItem,
  isExpanded,
}: {
  label?: string;
  imageUrl?: string;
  link?: string;
  editingItem?: Authority;
  isExpanded?: boolean;
}) => {
  const { isMobile } = useMediaStyles();

  const localImageUrl = editingItem ? editingItem.imageUrl : imageUrl;
  const isIpfs = localImageUrl?.startsWith('ipfs://');
  const { label: currentLabel, link: currentLink } = pick(editingItem, ['label', 'link']);
  const hostname = getHostnameFromURL(currentLink || link);

  return (
    <div className='flex w-full items-center gap-1'>
      {localImageUrl ? (
        <img
          src={isIpfs ? ipfsUrl(localImageUrl?.slice(7)) || '' : localImageUrl}
          className='size-6 rounded-full'
          alt='responsibility'
        />
      ) : (
        <div className='flex size-6 items-center justify-center rounded-full bg-white'>
          <BsCheck2Square className='size-4 text-gray-500' />
        </div>
      )}
      <div className='w-full min-w-0 flex-1'>
        <p
          // TODO ideally this is a heading when expanded
          // eslint-disable-next-line no-nested-ternary
          className={cn('line-clamp-2 text-left', isExpanded ? (isMobile ? 'font-bold' : 'font-normal') : 'font-light')}
        >
          {currentLabel || label || 'New Responsibility'}
        </p>
      </div>
      {!isMobile && (currentLink || link) && (
        // TODO convert to text
        <Link href={currentLink || link || ''} isExternal onClick={() => {}}>
          <Tooltip label={hostname}>
            <Button
              variant='link'
              aria-label='Responsibility Link'
              className='text-functional-link-primary hover:text-functional-link-primary/80'
            >
              <BsBoxArrowUpRight className='!size-3' />
            </Button>
          </Tooltip>
        </Link>
      )}
    </div>
  );
};

export { ResponsibilityHeader };
