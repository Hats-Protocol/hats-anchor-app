'use client';

import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { useTreeDetails } from 'hats-hooks';
import { compact, get, includes, map } from 'lodash';
import { DevInfo } from 'molecules';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Link } from 'ui';

import { ModuleLink } from './module-link';
import { SimulationDetails } from './simulation-details';

const CreateFormDevDetails = () => {
  const { form, hatIds, moduleAddresses, organization } = useCouncilForm();

  const chainId = form.watch('chain')?.value ? Number(form.watch('chain')?.value) : 11155111;
  const organizationName =
    typeof form.watch('organizationName') === 'object'
      ? (form.watch('organizationName') as { value: string; label: string })?.value
      : (form.watch('organizationName') as string);
  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';
  const treeId = get(organization, 'councils.0.treeId');
  const { data: tree } = useTreeDetails({ treeId: isDev ? Number(treeId) : undefined, chainId });
  const existingHatIds = tree?.hats?.map((hat) => hat.id);

  const eligibilityRequirements = form.watch('eligibilityRequirements');
  const councilName = form.watch('councilName');
  const councilDescription = form.watch('councilDescription');

  const councilDetails = useMemo(() => {
    return [
      { label: 'Organization', descriptor: <p className='text-sm'>{organization?.name || organizationName}</p> },
      { label: 'Tree ID', descriptor: <p className='text-sm'>{treeId || 'New'}</p> },
      { label: 'Name', descriptor: <p className='text-sm'>{councilName || '--'}</p> },
      { label: 'Description', descriptor: <p className='text-sm'>{councilDescription || '--'}</p> },
    ];
  }, [councilName, councilDescription, organization?.name, organizationName, treeId]);

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
              map(Object.entries(hatIds), ([key, value]) => (
                <div className='flex items-center gap-2' key={key}>
                  <p>{key}</p>
                  {includes(existingHatIds, hatIdDecimalToHex(value)) ? (
                    <Link href={`https://app.hatsprotocol.xyz/trees/${hatIdDecimalToHex(value)}`} isExternal>
                      {hatIdDecimalToIp(value)}
                    </Link>
                  ) : (
                    <p className='text-green-700'>{hatIdDecimalToIp(value)} New</p>
                  )}
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
