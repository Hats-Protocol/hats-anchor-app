'use client';

import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { useTreeDetails } from 'hats-hooks';
import { useOrganization } from 'hooks';
import { compact, get, includes, map } from 'lodash';
import { DevInfo } from 'molecules';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, BaseTextarea, Link } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { UseSimulateContractReturnType } from 'wagmi';

const ModuleLink = ({ moduleAddress, chainId }: { moduleAddress: string; chainId: number }) => {
  if (!moduleAddress) return null;
  return (
    <Link href={`${explorerUrl(chainId)}/address/${moduleAddress}`} className='text-sm' isExternal>
      {formatAddress(moduleAddress)}
    </Link>
  );
};

const SimulateStatus = ({
  simulate,
}: {
  simulate: UseSimulateContractReturnType<any, any, any, any, any, any> | undefined;
}) => {
  if (!simulate?.fetchStatus || (simulate?.fetchStatus === 'idle' && simulate?.status === 'pending')) {
    return <p className='text-sm'>N/A</p>;
  }
  return <p className='text-sm'>{simulate?.data ? 'Yes' : 'No'}</p>;
};

const CreateFormDevDetails = () => {
  const { form, simulateCouncil, simulateHats, simulateModules, simulateHsg, hatIds, moduleAddresses } =
    useCouncilForm();

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
  const councilRequirements = useMemo(() => {
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
            <ModuleLink moduleAddress={moduleAddresses?.agreementModule} chainId={chainId} />
            <p className='text-sm'>{eligibilityRequirements?.agreement?.required ? 'Yes' : 'No'}</p>
          </div>
        ),
      },
      {
        label: 'Hold Tokens',
        descriptor: (
          <div className='flex items-center gap-2'>
            <ModuleLink moduleAddress={moduleAddresses?.erc20Module} chainId={chainId} />
            <p className='text-sm'>{eligibilityRequirements?.erc20?.required ? 'Yes' : 'No'}</p>
          </div>
        ),
      },
      {
        label: 'Compliance',
        descriptor: (
          <div className='flex items-center gap-2'>
            <ModuleLink moduleAddress={moduleAddresses?.complianceAllowlist} chainId={chainId} />
            <p className='text-sm'>{eligibilityRequirements?.compliance?.required ? 'Yes' : 'No'}</p>
          </div>
        ),
      },
      moduleAddresses?.eligibilityChain && {
        label: 'Eligibility Chain',
        descriptor: <ModuleLink moduleAddress={moduleAddresses?.eligibilityChain} chainId={chainId} />,
      },
    ]);
  }, [eligibilityRequirements, moduleAddresses, chainId]);

  // TODO fetch predicted Safe/HSG address

  const councilSimulateInfo = useMemo(() => {
    return compact([
      { label: 'Simulate Council', descriptor: <SimulateStatus simulate={simulateCouncil} /> },
      simulateCouncil?.error && {
        label: 'Simulate Council Error',
        descriptor: <BaseTextarea className='h-32 w-3/4 text-sm' value={simulateCouncil?.error?.message} />,
      },
      {
        label: 'Simulate Hats',
        descriptor: <SimulateStatus simulate={simulateHats} />,
      },
      simulateHats?.error && {
        label: 'Simulate Hats Error',
        descriptor: <BaseTextarea className='h-32 w-3/4 text-sm' value={simulateHats?.error?.message} />,
      },
      {
        label: 'Simulate Modules',
        descriptor: <SimulateStatus simulate={simulateModules} />,
      },
      simulateModules?.error && {
        label: 'Simulate Modules Error',
        descriptor: <BaseTextarea className='h-32 w-3/4 text-sm' value={simulateModules?.error?.message} />,
      },
      {
        label: 'Simulate HSG',
        descriptor: <SimulateStatus simulate={simulateHsg} />,
      },
      simulateHsg?.error && {
        label: 'Simulate HSG Error',
        descriptor: <BaseTextarea className='h-32 w-3/4 text-sm' value={simulateHsg?.error?.message} />,
      },
    ]);
  }, [simulateCouncil, simulateHats, simulateModules, simulateHsg]);

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

      <DevInfo title='Simulations' devInfos={councilSimulateInfo} />
    </div>
  );
};

export { CreateFormDevDetails };
