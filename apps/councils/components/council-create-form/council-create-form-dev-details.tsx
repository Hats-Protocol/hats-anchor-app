'use client';

import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { useTreeDetails } from 'hats-hooks';
import { useOrganization } from 'hooks';
import { get, includes, map } from 'lodash';
import { DevInfo } from 'molecules';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Link } from 'ui';

const CreateFormDevDetails = () => {
  const { form, simulateCouncil, simulateHats, simulateModules, simulateHsg, hatIds } = useCouncilForm();

  const chainId = form.watch('chain')?.value ? Number(form.watch('chain')?.value) : 11155111;
  const organizationName =
    typeof form.watch('organizationName') === 'object'
      ? (form.watch('organizationName') as { value: string; label: string })?.value
      : (form.watch('organizationName') as string);
  const { data: organization } = useOrganization(organizationName);
  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';
  const treeId = get(organization, 'councils.0.treeId');
  const { data: tree } = useTreeDetails({ treeId: Number(treeId), chainId });
  const existingHatIds = tree?.hats?.map((hat) => hat.id);

  const requirements = form.watch('requirements');
  const councilName = form.watch('councilName');
  const councilDescription = form.watch('councilDescription');

  const councilDetails = useMemo(() => {
    return [
      { label: 'Organization', descriptor: <p className='text-sm'>{organization?.name || organizationName}</p> },
      { label: 'Tree ID', descriptor: <p className='text-sm'>{treeId}</p> },
      { label: 'Name', descriptor: <p className='text-sm'>{councilName || '--'}</p> },
      { label: 'Description', descriptor: <p className='text-sm'>{councilDescription || '--'}</p> },
    ];
  }, [councilName, councilDescription, organization?.name, organizationName, treeId]);

  // TODO add eligibility addresses
  const councilRequirements = useMemo(() => {
    return [
      { label: 'Compliance', descriptor: <p className='text-sm'>{requirements?.passCompliance ? 'Yes' : 'No'}</p> },
      { label: 'Hold Tokens', descriptor: <p className='text-sm'>{requirements?.holdTokens ? 'Yes' : 'No'}</p> },
      { label: 'Sign Agreement', descriptor: <p className='text-sm'>{requirements?.signAgreement ? 'Yes' : 'No'}</p> },
    ];
  }, [requirements]);

  // TODO fetch predicted Safe/HSG address

  const councilSimulateInfo = useMemo(() => {
    return [
      { label: 'Simulate Council', descriptor: <p className='text-sm'>{simulateCouncil ? 'Yes' : 'No'}</p> },
      { label: 'Simulate Hats', descriptor: <p className='text-sm'>{simulateHats ? 'Yes' : 'No'}</p> },
      { label: 'Simulate Modules', descriptor: <p className='text-sm'>{simulateModules ? 'Yes' : 'No'}</p> },
      { label: 'Simulate HSG', descriptor: <p className='text-sm'>{simulateHsg ? 'Yes' : 'No'}</p> },
    ];
  }, [simulateCouncil, simulateHats, simulateModules, simulateHsg]);

  if (!isDev) return null;

  return (
    <div className='mt-10 space-y-4'>
      <DevInfo title='Council Details' devInfos={councilDetails} />
      <DevInfo title='Requirements' devInfos={councilRequirements} />

      {hatIds && (
        <Accordion type='single' collapsible>
          <AccordionItem value='hats'>
            <AccordionTrigger>Hat IDs</AccordionTrigger>
            <AccordionContent>
              {map(Object.entries(hatIds), ([key, value]) => (
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
      )}

      <DevInfo title='Simulations' devInfos={councilSimulateInfo} />
    </div>
  );
};

export { CreateFormDevDetails };
