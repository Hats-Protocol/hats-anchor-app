'use client';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { map, nth } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { label: 'Transactions', href: 'transactions' },
  { label: 'Assets', href: 'assets' },
  { label: 'Members', href: 'members' },
  { label: 'Manage', href: 'manage' },
];

export const CouncilButtons = () => {
  const pathname = usePathname();
  const slug = nth(pathname.split('/'), 2);

  return (
    <ButtonGroup isAttached position='absolute' top={-5} bg='white'>
      {map(LINKS, ({ label, href }) => (
        <Link href={`/councils/${slug}/${href}`} passHref key={href}>
          <Button
            variant={pathname.includes(href) ? 'primary' : 'outlineMatch'}
            colorScheme='blue.500'
          >
            {label}
          </Button>
        </Link>
      ))}
    </ButtonGroup>
  );
};
