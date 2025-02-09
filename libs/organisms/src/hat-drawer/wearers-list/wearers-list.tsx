'use client';

import { Modal, useSelectedHat, useTreeForm } from 'contexts';
import { HatClaimForForm as HatClaimForm, HatTransferForm, HatWearerForm, HatWearerStatusForm } from 'forms';
import { useWearerDetails, useWearersEligibilityStatus } from 'hats-hooks';
import { filterWearers, isTopHat, isWearingAdminHat, sortWearers } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import { filter, find, get, includes, isEmpty, map, pick, size, slice, toLower, toNumber, toString } from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ControllerData, HatWearer } from 'types';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Skeleton, Tooltip } from 'ui';
import { commify, formatScientificWhole } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { WearerButtons } from './wearer-buttons';
import { WearerRow } from './wearer-row';
import { FullWearersListModal } from './wearers-modal';

const RemovedWearer = dynamic(() => import('icons').then((i) => i.RemovedWearer));

const DEFAULT_WEARERS = {
  eligibleWearers: undefined,
  ineligibleWearers: undefined,
};

const WearersList = () => {
  const { isMobile } = useMediaStyles();
  const { address } = useAccount();
  const { editMode, orgChartWearers } = useTreeForm();
  const { selectedHat, chainId, hatLoading } = useSelectedHat();
  const [ineligibleWearersExpanded, setIneligibleWearersExpanded] = useState(false);
  const onToggleIneligibleWearers = () => setIneligibleWearersExpanded(!ineligibleWearersExpanded);

  const { data: wearersEligibility, isLoading: wearerEligibilityLoading } = useWearersEligibilityStatus({
    selectedHat,
    chainId,
    editMode,
  });
  const { eligibleWearers, ineligibleWearers } = useMemo(() => {
    if (wearerEligibilityLoading) return DEFAULT_WEARERS;
    const { eligibleWearers: eligibleWearerIds, ineligibleWearers: ineligibleWearerIds } = pick(wearersEligibility, [
      'eligibleWearers',
      'ineligibleWearers',
    ]);
    const localEligibleWearers = filter(orgChartWearers, (w: HatWearer) => includes(eligibleWearerIds, w?.id));
    const localIneligibleWearers = filter(orgChartWearers, (w: HatWearer) => includes(ineligibleWearerIds, w?.id));
    return {
      eligibleWearers: localEligibleWearers as HatWearer[],
      ineligibleWearers: localIneligibleWearers as HatWearer[],
    };
  }, [wearersEligibility, orgChartWearers, wearerEligibilityLoading]);

  const [changeStatusWearer, setChangeStatusWearer] = useState<Hex | undefined>();
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
  const [searchTerm] = useState('');
  const localForm = useForm({
    mode: 'onBlur',
  });

  const maxSupply = toNumber(get(selectedHat, 'maxSupply', 0));
  // const extendedWearers = extendWearers(
  //   _.get(selectedHat, 'wearers'),
  //   hatWearers,
  // );

  const filteredWearers = useMemo(() => {
    const sortedWearers = sortWearers({
      wearers: eligibleWearers,
      address: address as Hex,
    });
    return slice(filterWearers(searchTerm, sortedWearers), 0, 4) as HatWearer[];
  }, [searchTerm, eligibleWearers, address]);
  const loadingWearers = Array(4).fill({});

  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const currentUserIsAdmin = isWearingAdminHat(map(wearerDetails, 'id'), selectedHat?.id, !!isTopHat(selectedHat));
  const currentUserIsWearing = includes(map(wearerDetails, 'id'), selectedHat?.id);
  const currentWearerDetails = find(orgChartWearers, {
    id: toLower(address),
  }) as ControllerData;
  const currentUserInList = includes(map(filteredWearers, 'id'), toLower(address));
  const currentUserIsIneligible = includes(map(ineligibleWearers, 'id'), toLower(address));

  // TODO fetch additional details if wearer not found in orgChartWearers

  return (
    <>
      <div className='flex w-full flex-col gap-4 px-4 md:px-16'>
        <div className='flex w-full flex-col items-center justify-between gap-4'>
          <div className='flex w-full items-center gap-1'>
            <h2 className='text-md font-medium'>
              {get(selectedHat, 'currentSupply')}{' '}
              {toNumber(get(selectedHat, 'currentSupply')) === 1 ? 'Wearer' : 'Wearers'} of this Hat
            </h2>

            <Tooltip
              label={
                maxSupply && formatScientificWhole(maxSupply) !== toString(maxSupply) ? commify(maxSupply) : undefined
              }
            >
              <p className='text-sm text-black/50'>of {formatScientificWhole(maxSupply)} max</p>
            </Tooltip>
          </div>
          {/* TEMP HIDDEN SINCE FETCHING INCOMPLETE LIST OF WEARERS */}
          {/* {_.gt(_.size(extendedWearers), 4) && (
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <FaSearch />
              </InputLeftElement>
              <Input
                // add left icon inside of input field
                placeholder='Find by address (0x) or ens (.eth)'
                variant='filled'
                _focus={{
                  bg: 'white',
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          )} */}
          {/* Wearers list */}

          {currentUserIsWearing && !currentUserInList && !currentUserIsIneligible && (
            <WearerRow
              wearer={currentWearerDetails || { id: address as Hex }}
              setChangeStatusWearer={setChangeStatusWearer}
              setWearerToTransferFrom={setWearerToTransferFrom}
            />
          )}
          {map(!hatLoading ? filteredWearers : loadingWearers, (w: HatWearer, index: number) => {
            if (typeof w.id !== 'string') {
              return <Skeleton className='h-5 w-full' key={index} />;
            }
            return (
              <WearerRow
                wearer={w}
                currentUserIsAdmin={currentUserIsAdmin}
                setChangeStatusWearer={setChangeStatusWearer}
                setWearerToTransferFrom={setWearerToTransferFrom}
                key={index}
              />
            );
          })}
          {!hatLoading && isEmpty(filteredWearers) && (
            <div className='flex h-14 items-center'>
              <p>No wearers currently</p>
            </div>
          )}
        </div>

        {!isEmpty(ineligibleWearers) && (
          <Collapsible>
            <div className='space-y-4'>
              <CollapsibleTrigger asChild>
                <div className='flex w-full justify-between'>
                  <div className='text-functional-link-secondary flex items-center gap-1 text-sm'>
                    <RemovedWearer />
                    <p>{size(ineligibleWearers)} recently removed wearers</p>
                  </div>

                  <Button
                    size='xs'
                    variant='ghost'
                    className='text-functional-link-primary'
                    onClick={onToggleIneligibleWearers}
                  >
                    {ineligibleWearersExpanded ? 'Hide' : 'Review'}
                  </Button>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className='space-y-2'>
                  {map(ineligibleWearers, (w: HatWearer) => (
                    <WearerRow
                      wearer={w}
                      key={w.id}
                      isIneligible
                      currentUserIsAdmin={currentUserIsAdmin}
                      setChangeStatusWearer={setChangeStatusWearer}
                      setWearerToTransferFrom={setWearerToTransferFrom}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        <WearerButtons />
      </div>

      <FullWearersListModal
        setChangeStatusWearer={setChangeStatusWearer}
        setWearerToTransferFrom={setWearerToTransferFrom}
      />

      {!isMobile && (
        <>
          <Modal name='claimFor' title='Claim hat for wearer' size='2xl'>
            <HatClaimForm />
          </Modal>

          <Modal name='hatWearerStatus' title='Remove a Wearer by revoking their Hat token' size='3xl'>
            <HatWearerStatusForm wearer={changeStatusWearer} eligibility='Not Eligible' />
          </Modal>

          <Modal name='transferHat' title='Transfer Hat to New Address'>
            <HatTransferForm currentWearerAddress={wearerToTransferFrom} />
          </Modal>

          <Modal name='newWearer' title='Add a Wearer by minting a Hat token' size='lg'>
            <HatWearerForm localForm={localForm} />
          </Modal>
        </>
      )}
    </>
  );
};

export { WearersList };
