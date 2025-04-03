'use client';

import { CONFIG } from '@hatsprotocol/config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { useAllWearers } from 'hats-hooks';
import { HatIcon } from 'icons';
import { get, some, toLower } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import { AgreementContent } from 'molecules';
import { AppHat, CurrentEligibility, ModuleDetails, SupportedChains } from 'types';
import { Button, cn, DialogTitle, VisuallyHidden } from 'ui';
import { fetchIpfs, logger } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const handleFetchIpfs = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: unknown) => {
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
    });
};

export const AgreementContentModal = ({
  moduleDetails,
  chainId,
  onlyModule = false,
  selectedHat,
  currentEligibility,
  isReadyToClaim: aggregateIsReadyToClaim,
  setIsReadyToClaim,
}: {
  moduleDetails: ModuleDetails;
  chainId: SupportedChains;
  onlyModule?: boolean;
  selectedHat?: AppHat;
  currentEligibility: CurrentEligibility | undefined;
  isReadyToClaim: { [key: string]: boolean } | undefined;
  setIsReadyToClaim: ((address: Hex) => void) | undefined;
}) => {
  const { setModals } = useOverlay();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { agreement, signAgreement } = useAgreementClaim({
    moduleDetails,
    moduleParameters: moduleDetails?.liveParameters,
    chainId,
    onSuccessfulSign: () => {
      queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });
      setModals?.({});
    },
  });

  const { wearers } = useAllWearers({
    selectedHat,
    chainId,
  });

  const isWearing = some(wearers, { id: toLower(address as Hex) });
  const moduleEligibility = moduleDetails?.instanceAddress
    ? get(currentEligibility, moduleDetails.instanceAddress)
    : undefined;
  const isEligible = moduleEligibility?.eligible && moduleEligibility?.goodStanding;

  const { data: agreementV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });

  // const handleDownload = () => {
  //   console.log('download');

  //   // TODO download agreement
  // };

  const readyToClaim = moduleDetails.instanceAddress ? aggregateIsReadyToClaim?.[moduleDetails.instanceAddress] : false;

  const handleReviewed = () => {
    // OR LAST MODULE TO COMPLETE
    if (onlyModule) {
      setIsReadyToClaim?.(moduleDetails.instanceAddress as Hex);
      setModals?.({});
    } else {
      signAgreement();
    }

    // TODO reviewed agreement
  };
  logger.debug('agreement content modal', { agreement: !!agreement || !!agreementV0, isWearing, isEligible });

  return (
    <Modal name={`${moduleDetails?.instanceAddress}-agreementManagerClaims`}>
      <VisuallyHidden>
        <DialogTitle>Sign the Agreement</DialogTitle>
      </VisuallyHidden>
      <div className='flex flex-col gap-4 pt-10 md:pt-0'>
        <div>
          <h3 className='text-lg font-bold'>Sign the Agreement</h3>
        </div>

        <div className='max-h-[70vh] overflow-y-scroll'>
          <div>
            <AgreementContent agreement={agreement || agreementV0} />
          </div>
        </div>

        <div className='flex justify-end gap-4'>
          {/* <Button
            variant='link'
            className='text-blue-500'
            onClick={handleDownload}
            disabled={!agreement}
          >
            Download agreement
          </Button> */}

          <Button
            onClick={handleReviewed}
            disabled={(!agreement && !agreementV0) || isWearing || isEligible || readyToClaim}
            variant={readyToClaim ? 'outline-green' : 'default'}
          >
            <HatIcon className={cn('mr-1 h-4 w-4 text-white', readyToClaim && 'text-success')} />
            {onlyModule ? 'Reviewed' : 'Sign Agreement'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
