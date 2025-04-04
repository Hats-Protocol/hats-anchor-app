'use client';
import { useOrganization } from 'hooks';
import { useParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle, ErrorPage, Link, Skeleton } from 'ui';
import { chainIdToString } from 'utils';
import { logger } from 'utils';
import { getAddress } from 'viem';

import { AddCouncilButton } from '../../../components/add-council-button';
import { CouncilHeaderCard } from '../../../components/council-header';

export default function OrganizationPage() {
  const params = useParams();
  const organizationName = params.organizationName as string;

  logger.info('organizationName', organizationName);
  const { data: organization, isLoading, error } = useOrganization(organizationName);
  logger.info('organization', organization);

  interface ErrorPageProps {
    title: string;
    description: string;
  }

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

  return (
    <div className='mt-8 flex min-h-screen max-w-[1400px] flex-col gap-6 px-2 md:mt-20 md:gap-8 md:px-10'>
      <div className='flex flex-col gap-2 md:gap-4'>
        {organization.councils.map((item) => (
          <Link
            href={`/councils/${chainIdToString(item.chain)}:${getAddress(item.hsg)}/members`}
            className='hover:text-foreground/80 text-inherit hover:no-underline'
            key={item.id}
          >
            <CouncilHeaderCard chainId={item.chain} address={getAddress(item.hsg)} withLinks={false} />
          </Link>
        ))}
        <div className='mb-6 flex justify-center'>
          <AddCouncilButton organizationName={organization.name} />
        </div>
      </div>
    </div>
  );
}
