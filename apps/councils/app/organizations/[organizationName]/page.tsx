'use client';
import { ORDERED_CHAINS } from '@hatsprotocol/config';
import { useOrganization } from 'hooks';
import { map, sortBy } from 'lodash';
import { useParams } from 'next/navigation';
import { SupportedChains } from 'types';
import { Alert, AlertDescription, AlertTitle, HatDeco, Link, Skeleton } from 'ui';
import { chainIdToString } from 'utils';
import { getAddress } from 'viem';

import { AddCouncilButton } from '../../../components/add-council-button';
import { CouncilHeaderCard } from '../../../components/council-header';

const LoadingSkeleton = () => {
  return (
    <div className='mt-4 flex min-h-screen max-w-[1400px] flex-col gap-6 px-2 md:mx-auto md:mt-4 md:gap-8 md:px-10'>
      <div className='flex flex-col gap-2 md:gap-4'>
        {[1, 2].map((i) => (
          <Skeleton key={i} className='bg-functional-link-primary/10 h-[125px] w-full rounded-lg' />
        ))}
      </div>
    </div>
  );
};

export default function OrganizationPage() {
  const params = useParams();
  const organizationName = params.organizationName as string;

  const { data: organization, isLoading, error } = useOrganization(organizationName);

  interface ErrorPageProps {
    title: string;
    description: string;
  }

  // TODO: Move this into a shared components in either libs or somewhere else in councils -- we now use it in a few places
  const ErrorPage = ({ title, description }: ErrorPageProps) => {
    return (
      <div className='p-20'>
        <Alert variant='default' className='mx-auto max-w-lg'>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!organization) {
    return (
      <ErrorPage
        title='Organization Not Found'
        description="The requested organization wasn't found. Double check the organization's name"
      />
    );
  }

  if (error) {
    return <ErrorPage title='Error Loading Organization' description="The requested organization can't be loaded." />;
  }

  const sortedCouncils = sortBy(organization.councils, (council) =>
    ORDERED_CHAINS.indexOf(council.chain as SupportedChains),
  );

  // TODO handle different link for MHSG [TEMP]
  return (
    <div className='mx-auto mt-8 flex min-h-screen max-w-[1400px] flex-col gap-6 px-2 md:mt-8 md:gap-8 md:px-6'>
      <div className='flex flex-col gap-2 md:gap-4'>
        {map(sortedCouncils, (item) => (
          <Link
            key={item.id}
            className='hover:text-foreground/80 w-full text-left text-inherit hover:opacity-80'
            href={`/councils/${chainIdToString(item.chain)}:${getAddress(item.hsg)}/members`}
          >
            <CouncilHeaderCard chainId={item.chain} address={getAddress(item.hsg)} withLinks={false} />
          </Link>
        ))}
        <div className='mb-6 flex justify-center'>
          <AddCouncilButton organizationName={organization.name} />
        </div>
      </div>

      <HatDeco />
    </div>
  );
}
