'use client';

import {
  COUNCIL_DEPLOYED,
  COUNCIL_SETUP_COMPLETE,
  INITIAL_INVITE,
  NOTIFY_COMPLIANCE_MANAGER_AFTER_DEPLOY,
} from '@hatsprotocol/config';
import { hatIdDecimalToIp, hatIdHexToDecimal, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCouncilDetails, useOffchainCouncilDetails, useSafeDetails, useToast } from 'hooks';
import { compact, get, map, reduce, size, toNumber } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { DevInfo } from 'molecules';
import { posthog } from 'posthog-js';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, cn, Link, Skeleton, Switch } from 'ui';
import { explorerUrl, formatAddress, getCouncilsGraphqlClient, hatLink, parseCouncilSlug, UPDATE_COUNCIL } from 'utils';
import { getAddress, Hex } from 'viem';

import { EligibilityRulesDevInfo } from './eligibility-rules-dev-info';
import { MailForm } from './mail-form';

const MAIL_FORMS = [INITIAL_INVITE, NOTIFY_COMPLIANCE_MANAGER_AFTER_DEPLOY, COUNCIL_DEPLOYED, COUNCIL_SETUP_COMPLETE];

const CouncilsDevInfo = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);
  const { getAccessToken } = usePrivy();

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: councilDetails, isLoading: isCouncilDetailsLoading } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const { data: offchainCouncilDetails, isLoading: isOffchainCouncilDetailsLoading } = useOffchainCouncilDetails({
    hsg: councilDetails?.id ? (getAddress(councilDetails?.id) as Hex) : undefined,
    chainId: chainId ?? 11155111,
    enabled: !!councilDetails?.id && !!chainId,
  });
  // const isMulti = size(councilDetails?.signerHats) > 1;
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const ownerHat = get(councilDetails, 'ownerHat');
  const topHatId = primarySignerHat?.id
    ? (treeIdToTopHatId(hatIdToTreeId(BigInt(primarySignerHat.id))).toString() as Hex)
    : undefined; // TODO forgoing getting top hat details for now
  const eligibilityModule = get(primarySignerHat, 'eligibility') as Hex | undefined;
  const { data: eligibilityRules, isLoading: isEligibilityRulesLoading } = useEligibilityRules({
    chainId: chainId as SupportedChains,
    address: eligibilityModule,
  });
  const { data: safeSigners, isLoading: isSafeSignersLoading } = useSafeDetails({
    chainId: chainId as SupportedChains,
    safeAddress: councilDetails?.safe as Hex,
  });
  const totalWearers = reduce(map(councilDetails?.signerHats, 'wearers'), (acc, curr) => acc + size(curr), 0);
  const totalMaxSupply = reduce(map(councilDetails?.signerHats, 'maxSupply'), (acc, curr) => acc + toNumber(curr), 0);

  const { mutateAsync: updateIsPaid } = useMutation({
    mutationFn: async (checked: boolean) => {
      const accessToken = await getAccessToken();
      return getCouncilsGraphqlClient(accessToken ?? undefined)
        .request(UPDATE_COUNCIL, {
          id: offchainCouncilDetails?.id,
          deployed: checked,
        })
        .then(() => {
          toast({
            title: checked ? 'Council is now active' : 'Council is no longer active',
            description: 'Council updated successfully',
          });
        })
        .catch((error) => {
          toast({
            title: 'Error updating council',
            description: error.message,
          });
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offchainCouncilData'] });
    },
  });

  // TODO easy way to get MCH details?

  const hatInfo = useMemo(
    () =>
      compact([
        {
          label: size(councilDetails?.signerHats) > 1 ? 'Signer Hats' : 'Signer Hat',
          descriptor: (
            <div className='flex flex-col items-end gap-1'>
              {map(councilDetails?.signerHats, (hat) => (
                <Link
                  href={hatLink({ chainId: chainId as SupportedChains, hatId: hat.id })}
                  className='underline'
                  key={hat.id}
                >
                  {hatIdDecimalToIp(hatIdHexToDecimal(hat.id))}
                </Link>
              ))}
            </div>
          ),
        },
        {
          label: 'Total Wearers',
          descriptor: <div>{totalWearers}</div>,
        },
        {
          label: 'Safe Signers',
          descriptor: <div>{size(safeSigners)}</div>,
        },
        {
          label: 'Max Supply',
          descriptor: <div>{totalMaxSupply}</div>,
        },
      ]),
    [chainId, councilDetails?.signerHats, totalWearers, totalMaxSupply, safeSigners],
  );

  const hsgInfo = useMemo(
    () =>
      compact([
        {
          label: 'Safe Address',
          descriptor: (
            <Link href={`${explorerUrl(chainId || undefined)}/address/${councilDetails?.safe}`} className='underline'>
              {formatAddress(councilDetails?.safe)}
            </Link>
          ),
        },
        {
          label: 'HSG Address',
          descriptor: (
            <Link href={`${explorerUrl(chainId || undefined)}/address/${councilDetails?.id}`} className='underline'>
              {formatAddress(councilDetails?.id)}
            </Link>
          ),
        },
        {
          label: 'Threshold Type',
          descriptor: <div>{councilDetails?.thresholdType}</div>,
        },
        {
          label: 'Min Threshold',
          descriptor: <div>{councilDetails?.minThreshold}</div>,
        },
        {
          label: 'Target Threshold',
          descriptor: (
            <div>
              {councilDetails?.thresholdType === 'PROPORTIONAL'
                ? `${(Number(councilDetails?.targetThreshold) / 100).toFixed(0)}%`
                : councilDetails?.targetThreshold}
            </div>
          ),
        },
        ownerHat && {
          label: 'Owner Hat',
          descriptor: (
            <Link href={hatLink({ chainId: chainId as SupportedChains, hatId: ownerHat.id })} className='underline'>
              {hatIdDecimalToIp(hatIdHexToDecimal(ownerHat.id))}
            </Link>
          ),
        },
        topHatId && {
          label: 'Top Hat',
          descriptor: (
            <Link href={hatLink({ chainId: chainId as SupportedChains, hatId: topHatId })} className='underline'>
              {hatIdDecimalToIp(hatIdHexToDecimal(topHatId))}
            </Link>
          ),
        },
      ]),
    [councilDetails, chainId, ownerHat, topHatId],
  );

  const safeSignersInfo = useMemo(() => {
    return compact(
      map(safeSigners, (signer, i) => ({
        label: i === 0 ? `${size(safeSigners)} signer${size(safeSigners) === 1 ? '' : 's'}` : undefined,
        key: signer,
        descriptor: (
          <div>
            <Link href={`${explorerUrl(chainId || undefined)}/address/${signer}`} className='underline'>
              {formatAddress(signer)}
            </Link>
          </div>
        ),
      })),
    );
  }, [safeSigners, chainId]);

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  if (!chainId || !isDev) return null;

  if (
    typeof window === 'undefined' ||
    isCouncilDetailsLoading ||
    isOffchainCouncilDetailsLoading ||
    isEligibilityRulesLoading ||
    isSafeSignersLoading
  ) {
    return <Skeleton className='mx-auto h-[500px] w-1/2' />;
  }

  return (
    <div className='mx-auto flex w-full flex-col gap-4 px-4 md:w-1/2'>
      <DevInfo title='Hat Info' devInfos={hatInfo} />

      <DevInfo title='HSG Info' devInfos={hsgInfo} />

      <DevInfo title='Safe Signers' devInfos={safeSignersInfo} />

      {map(councilDetails?.signerHats, (hat) => (
        <EligibilityRulesDevInfo
          chainId={chainId}
          eligibilityRules={eligibilityRules || undefined}
          eligibilityAddress={hat.eligibility || undefined}
          hatId={hat.id}
          key={hat.id}
        />
      ))}

      <div className='flex items-center gap-2'>
        <Switch
          checked={offchainCouncilDetails?.deployed}
          onCheckedChange={updateIsPaid}
          className={cn('data-[state=checked]:bg-functional-success', 'data-[state=unchecked]:bg-destructive')}
          disabled={!offchainCouncilDetails}
        />
        <p className='hover:cursor-pointer' onClick={() => updateIsPaid(!offchainCouncilDetails?.deployed)}>
          {offchainCouncilDetails?.deployed ? 'Active' : 'Inactive'}
        </p>
      </div>

      <Accordion type='single' collapsible>
        <AccordionItem value='offchain-council-details'>
          <AccordionTrigger
            className={cn(
              'flex w-full items-center justify-between px-4 hover:no-underline',
              !offchainCouncilDetails && 'bg-blue-50',
            )}
          >
            <h3>Offchain Council Details</h3>
          </AccordionTrigger>
          <AccordionContent className='overflow-y-scroll bg-black/80 p-4'>
            <pre className='text-white'>{JSON.stringify(offchainCouncilDetails, null, 2)}</pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className='border-b border-black/20' />

      <div className='flex flex-col gap-4'>
        <h3 className='text-sm font-medium'>Mail Options</h3>
        {map(MAIL_FORMS, (mailForm) => (
          <MailForm
            key={mailForm.messageId}
            mailForm={mailForm}
            offchainCouncilDetails={offchainCouncilDetails || undefined}
            councilDetails={councilDetails || undefined}
          />
        ))}
      </div>
    </div>
  );
};

export { CouncilsDevInfo };
