'use client';

import { CirclePlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from 'ui';

interface AddCouncilButtonProps {
  organizationName: string;
}

export function AddCouncilButton({ organizationName }: AddCouncilButtonProps) {
  return (
    <Link href={`/councils/new?organizationName=${encodeURIComponent(organizationName)}`}>
      <Button variant='outline-blue' className='w-fit rounded-full'>
        <CirclePlus className='text-functional-link-primary h-4 w-4' />
        Add a Council
      </Button>
    </Link>
  );
}
