'use client';
import { useOrganization } from 'hooks';
import { useParams } from 'next/navigation';
import { logger } from 'utils';

import { CouncilHeader } from '../../../components/council-header';

export default function OrganizationPage() {
  const params = useParams();
  const organizationName = params.organizationName as string;

  const { data: organization, isLoading, error } = useOrganization(organizationName);
  logger.info('organization', organization);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading organization</div>;
  }

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className='flex min-h-screen flex-col bg-gray-50'>
      <div className='mx-auto w-full max-w-[1200px] bg-gray-50 py-6 md:py-10'>
        <h1>{organization.name}</h1>
        <h2>Councils</h2>
        <ul>
          {organization.councils.map((council) => (
            <li key={council.id}>{council.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
