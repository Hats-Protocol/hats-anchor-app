'use client';

import { hatIdDecimalToHex, hatIdDecimalToIp, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { useTreeDetails } from 'hats-hooks';
import { compact, get, includes, isEmpty, keys, map } from 'lodash';
import { DevInfo } from 'molecules';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Link } from 'ui';
import { hatLink, slugify } from 'utils';
import { Hex } from 'viem';

import { ModuleLink } from './module-link';
import { SimulationDetails } from './simulation-details';

interface HatToCreate {
  id: bigint;
}

const APP_URL = 'https://pro.hatsprotocol.xyz';

const HatValue = ({
  hatId,
  chainId,
  hatKey,
  existingHatIds,
  hatsToCreate,
}: {
  hatId: bigint;
  chainId: number;
  hatKey: string;
  existingHatIds: Hex[] | undefined;
  hatsToCreate: HatToCreate[] | undefined;
}) => {
  if (existingHatIds && includes(existingHatIds, hatIdDecimalToHex(hatId))) {
    return (
      <Link href={hatLink({ chainId, hatId: hatIdDecimalToHex(hatId) })} isExternal>
        {hatIdDecimalToIp(hatId)}
      </Link>
    );
  }
  if (
    (hatsToCreate && includes(map(hatsToCreate, 'id') as unknown as bigint[], hatId)) ||
    (hatKey === 'topHat' && (!existingHatIds || isEmpty(existingHatIds)))
  ) {
    return <p className='text-green-700'>{hatIdDecimalToIp(hatId)} New</p>;
  }
  return <p className='text-orange-700'>{hatIdDecimalToIp(hatId)} Skipped</p>;
};

const CreateFormDevDetails = () => {
  const { form, hatIds, moduleAddresses, organization, hatsToCreate } = useCouncilForm();

  const chainId = form.watch('chain')?.value ? Number(form.watch('chain')?.value) : 11155111;
  const organizationName =
    typeof form.watch('organizationName') === 'object'
      ? (form.watch('organizationName') as { value: string; label: string })?.value
      : (form.watch('organizationName') as string);
  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';
  const treeId = get(organization, 'councils.0.treeId');
  const { data: tree } = useTreeDetails({ treeId: isDev ? Number(treeId) : undefined, chainId });
  const existingHatIds = tree?.hats?.map((hat) => hat.id) || [];

  const eligibilityRequirements = form.watch('eligibilityRequirements');
  const councilName = form.watch('councilName');
  const councilDescription = form.watch('councilDescription');

  const councilDetails = useMemo(() => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : APP_URL;

    return [
      {
        label: 'Organization',
        descriptor: (
          <Link href={`${appUrl}/organizations/${slugify(organizationName)}`} className='text-sm' isExternal>
            {organizationName}
          </Link>
        ),
      },
      {
        label: 'Tree ID',
        descriptor: treeId ? (
          <Link
            href={hatLink({ chainId, hatId: hatIdDecimalToHex(treeIdToTopHatId(treeId)) })}
            className='text-sm'
            isExternal
          >
            {treeId}
          </Link>
        ) : (
          <p className='text-sm'>New</p>
        ),
      },
      { label: 'Name', descriptor: <p className='text-sm'>{councilName || '--'}</p> },
      { label: 'Description', descriptor: <p className='text-sm'>{councilDescription || '--'}</p> },
    ];
  }, [councilName, councilDescription, chainId, organizationName, treeId]);

  // TODO add eligibility addresses
  // TODO add threshold config
  const councilRequirements = useMemo(() => {
    if (!isDev) return [];
    return compact([
      {
        label: 'Selection',
        descriptor: (
          <div className='flex items-center gap-2'>
            <ModuleLink moduleAddress={moduleAddresses?.councilMemberAllowlist} chainId={chainId} />
            <p className='text-sm'>Yes</p>
          </div>
        ),
      },
      {
        label: 'Sign Agreement',
        descriptor: (
          <div className='flex items-center gap-2'>
            <ModuleLink
              moduleAddress={moduleAddresses?.agreementModule}
              existingModule={eligibilityRequirements?.agreement?.existingId}
              required={eligibilityRequirements?.agreement?.required}
              chainId={chainId}
            />
            <p className='text-sm'>{eligibilityRequirements?.agreement?.required ? 'Yes' : 'No'}</p>
          </div>
        ),
      },
      {
        label: 'Hold Tokens',
        descriptor: (
          <div className='flex items-center gap-2'>
            <ModuleLink
              moduleAddress={moduleAddresses?.erc20Module}
              existingModule={eligibilityRequirements?.erc20?.existingId}
              required={eligibilityRequirements?.erc20?.required}
              chainId={chainId}
            />
            <p className='text-sm'>{eligibilityRequirements?.erc20?.required ? 'Yes' : 'No'}</p>
          </div>
        ),
      },
      {
        label: 'Compliance',
        descriptor: (
          <div className='flex items-center gap-2'>
            <ModuleLink
              moduleAddress={moduleAddresses?.complianceAllowlist}
              existingModule={eligibilityRequirements?.compliance?.existingId}
              required={eligibilityRequirements?.compliance?.required}
              chainId={chainId}
            />
            <p className='text-sm'>{eligibilityRequirements?.compliance?.required ? 'Yes' : 'No'}</p>
          </div>
        ),
      },
      moduleAddresses?.eligibilityChain && {
        label: 'Eligibility Chain',
        descriptor: <ModuleLink moduleAddress={moduleAddresses?.eligibilityChain} chainId={chainId} />,
      },
    ]);
  }, [eligibilityRequirements, moduleAddresses, isDev, chainId]);

  if (!isDev) return null;

  return (
    <div className='mt-10 space-y-4'>
      <DevInfo title='Council Details' devInfos={councilDetails} />
      <DevInfo title='Requirements' devInfos={councilRequirements} />

      <Accordion type='single' collapsible>
        <AccordionItem value='hats'>
          <AccordionTrigger>Hat IDs</AccordionTrigger>
          <AccordionContent>
            {hatIds &&
              map(keys(hatIds), (hatKey) => (
                <div className='flex items-center gap-2' key={hatKey}>
                  <p>{hatKey}</p>

                  <HatValue
                    hatKey={hatKey}
                    chainId={chainId}
                    hatId={hatIds[hatKey]}
                    existingHatIds={existingHatIds}
                    hatsToCreate={hatsToCreate}
                  />
                </div>
              ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SimulationDetails chainId={chainId} />
    </div>
  );
};

export { CreateFormDevDetails };
