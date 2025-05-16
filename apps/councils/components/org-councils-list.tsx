'use client';

import { ORDERED_CHAINS } from '@hatsprotocol/config';
import { useHatsDetails } from 'hats-hooks';
import { uniqueHats } from 'hats-utils';
import { useCouncilsDetails, useOrganization } from 'hooks';
import { concat, flatten, map, size, sortBy } from 'lodash';
import { useParams } from 'next/navigation';
import { AppHat, ExtendedHSGV2, SupportedChains } from 'types';
import { ErrorPage, HatDeco, Link } from 'ui';
import { chainIdToString } from 'utils';
import { getAddress } from 'viem';

import { AddCouncilButton } from './add-council-button';
import { CouncilHeaderCard } from './council-header';
import { CouncilHeaderSkeletons } from './council-header-skeletons';

const hatWithChainId = (hat: Partial<AppHat> | undefined, chainId: number | undefined) => ({
  ...hat,
  chainId,
});

export const OrgCouncilsList = () => {
  const params = useParams();
  const organizationName = params.name as string;

  const { data: organization, isLoading, error } = useOrganization(organizationName);
  const councils = map(organization?.councils, (council) => ({
    hsg: getAddress(council.hsg),
    chainId: council.chain,
  }));
  // const initialChainId = councils?.[0]?.chainId;
  const { data: orgCouncils } = useCouncilsDetails(councils);
  const orgCouncilsWithChain = map(orgCouncils, (council, index) => ({
    ...council,
    chainId: councils[index].chainId,
  }));
  const allHats = uniqueHats(
    flatten(
      map(orgCouncilsWithChain, (council) =>
        concat(
          map(council?.signerHats, (hat) => hatWithChainId(hat, council?.chainId)),
          hatWithChainId(council?.ownerHat, council?.chainId),
        ),
      ),
    ) as Partial<AppHat>[],
  );
  const { data: manyHatsDetails } = useHatsDetails({
    hats: allHats,
  });
  const orgCouncilsWithDetails = map(orgCouncilsWithChain, (council) => ({
    ...council,
    ownerHat: manyHatsDetails.find((hat) => hat?.id === council?.ownerHat?.id && hat?.chainId === council?.chainId),
    signerHats: manyHatsDetails.filter(
      (hat) => map(council?.signerHats, 'id')?.includes(hat.id) && hat?.chainId === council?.chainId,
    ),
  }));

  // TODO: Move this into a shared components in either libs or somewhere else in councils -- we now use it in a few places

  if (isLoading) {
    return <CouncilHeaderSkeletons />;
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

  const sortedCouncils = sortBy(orgCouncilsWithDetails, (council) =>
    ORDERED_CHAINS.indexOf(council.chainId as SupportedChains),
  );

  // TODO handle different link for MHSG [TEMP]
  return (
    <div className='mx-auto mt-8 flex min-h-screen max-w-[1400px] flex-col gap-6 px-2 md:mt-8 md:gap-8 md:px-6'>
      <div className='flex flex-col gap-2 md:gap-4'>
        {map(sortedCouncils, (council) => {
          const isMHSG = size(council.signerHats) > 1;
          return (
            <Link
              key={council.id}
              className='hover:text-foreground/80 w-full text-left text-inherit hover:opacity-80'
              href={`/councils/${chainIdToString(council.chainId)}:${council.id ? getAddress(council.id) : '#'}/${isMHSG ? 'manage' : 'members'}`}
            >
              <CouncilHeaderCard
                chainId={council.chainId}
                address={council.id ? getAddress(council.id) : undefined}
                withLinks={false}
                initialCouncilDetails={council as ExtendedHSGV2}
              />
            </Link>
          );
        })}
        <div className='mb-6 flex justify-center'>
          <AddCouncilButton organizationName={organization.name} />
        </div>
      </div>

      <HatDeco />
    </div>
  );
};
