'use client';

import { CONFIG } from '@hatsprotocol/config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { useAllWearers } from 'hats-hooks';
import { get, some, toLower } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { AppHat, CurrentEligibility, ModuleDetails, SupportedChains } from 'types';
import { Button } from 'ui';
import { fetchIpfs } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));
const AgreementContent = dynamic(() => import('molecules').then((mod) => mod.AgreementContent));

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
}: {
  moduleDetails: ModuleDetails;
  chainId: SupportedChains;
  onlyModule?: boolean;
  selectedHat?: AppHat;
  currentEligibility: CurrentEligibility | undefined;
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
  console.log('wearers', wearers, selectedHat);

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

  const handleReviewed = () => {
    // OR LAST MODULE TO COMPLETE
    if (onlyModule) {
      setModals?.({});
    } else {
      signAgreement();
    }

    // TODO reviewed agreement
  };

  return (
    <Modal name={`${moduleDetails?.instanceAddress}-agreementManagerClaims`}>
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

          <Button onClick={handleReviewed} disabled={!(agreement && !agreementV0) || isWearing || isEligible}>
            <HatIcon className='mr-1 h-4 w-4 text-white' />
            {onlyModule ? 'Reviewed' : 'Sign Agreement'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
