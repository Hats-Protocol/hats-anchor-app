import {
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import { useEligibility, useOverlay } from 'contexts';
import {
  useAgreementEligibility,
  useHatClaimBy,
  useMultiClaimsHatterCheck,
  useWearerDetails,
} from 'hats-hooks';
import { useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import ReactDOMServer from 'react-dom/server';
import { BsDownload, BsPen, BsTelegram } from 'react-icons/bs';
import { Authority } from 'types';
import { fetchWearerDetails, hatLink } from 'utils';
import { useAccount, useChainId, useQueryClient } from 'wagmi';

import AgreementContent from './AgreementContent';
import Conditions from './Conditions';

const NetworkSwitcher = dynamic(() =>
  import('ui').then((mod) => mod.NetworkSwitcher),
);

const ClaimHat = ({
  agreement,
  isReviewed,
  setIsReviewed,
}: {
  agreement: string;
  isReviewed: boolean;
  setIsReviewed: (signed: boolean) => void;
}) => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { handlePendingTx } = useOverlay();
  const currentNetworkId = useChainId();

  const {
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
    selectedHat,
    selectedHatDetails,
  } = useEligibility();

  const telegramAuthority = _.find(
    _.get(selectedHatDetails, 'authorities'),
    (a: Authority) =>
      _.includes(a.link, 'telegram') || _.includes(a.link, 't.me'),
  );

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isWearing = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  const printDocumentAsPDF = () => {
    const newWindow = window.open('', '_blank');
    const markdownContent = <AgreementContent agreement={agreement} />;
    const htmlString = ReactDOMServer.renderToStaticMarkup(markdownContent);

    if (!newWindow) return;

    newWindow.document.write(htmlString);
    newWindow.document.close();

    newWindow.onload = () => {
      newWindow.focus();
      newWindow.print();
      newWindow.close();
    };
  };

  const { hatterIsAdmin } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
    handlePendingTx,
  });

  const { instanceAddress, currentHatIsClaimable } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats: selectedHat ? [selectedHat] : [],
  });

  const waitForClaim = useWaitForSubgraph({
    fetchHelper: () => fetchWearerDetails(address, chainId),
    checkResult: (result) => {
      const hasClaimed = _.includes(
        _.map(_.get(result, 'currentHats'), 'id'),
        selectedHat?.id,
      );
      return hasClaimed;
    },
  });

  const { signAndClaim } = useAgreementEligibility({
    moduleParameters,
    moduleDetails,
    chainId,
    controllerAddress,
    mchAddress: instanceAddress,
    onSuccessfulSign: async () => {
      await waitForClaim();
      queryClient.invalidateQueries(['wearerDetails']);
      queryClient.invalidateQueries(['hatDetails']);
    },
  });

  let claimTooltipText = '';
  if (!hatterIsAdmin) claimTooltipText = 'Claims Hatter is not an admin';
  if (!currentHatIsClaimable?.for)
    claimTooltipText = 'Hat is only claimable by eligible wearers';
  if (!address) claimTooltipText = 'Connect your wallet to claim this hat';
  if (!isReviewed)
    claimTooltipText = 'You must sign the agreement to claim this hat';

  // TODO hat cannot be claimed if max supply is reached

  if (isWearing) {
    return (
      <Stack w='40%' justifyContent='center' alignItems='left'>
        <Conditions isReviewed setIsReviewed={() => undefined} />
        <Stack align='center'>
          <Heading size='md' fontWeight={500}>
            Claimed!
          </Heading>
          <HStack>
            <NextLink
              href={hatLink({ chainId, hatId: selectedHat?.id })}
              passHref
              target='_blank'
            >
              <Button
                colorScheme='blue.500'
                variant={telegramAuthority ? 'outlineMatch' : 'primary'}
              >
                View in Hats
              </Button>
            </NextLink>
            {telegramAuthority && (
              <NextLink
                href={_.get(telegramAuthority, 'link', '#')}
                passHref
                target='_blank'
              >
                <Button colorScheme='blue' leftIcon={<BsTelegram />}>
                  Join the chat
                </Button>
              </NextLink>
            )}
          </HStack>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack w='40%' justifyContent='center' alignItems='left'>
      <Conditions isReviewed={isReviewed} setIsReviewed={setIsReviewed} />
      <Stack w='full' justifyContent='center' gap={3}>
        {chainId !== currentNetworkId ? (
          <NetworkSwitcher chainId={chainId} colorScheme='blue.500' />
        ) : (
          <Tooltip label={claimTooltipText} placement='top'>
            <Button
              isDisabled={
                !isReviewed ||
                !hatterIsAdmin ||
                !currentHatIsClaimable?.for ||
                isWearing
              }
              colorScheme='blue'
              leftIcon={<BsPen />}
              onClick={signAndClaim}
            >
              Claim with Signature
            </Button>
          </Tooltip>
        )}
      </Stack>

      <Flex w='full' justifyContent='center'>
        <Button
          colorScheme='blue'
          leftIcon={<BsDownload />}
          onClick={printDocumentAsPDF}
          variant='ghost'
        >
          Download Agreement
        </Button>
      </Flex>
    </Stack>
  );
};

export default ClaimHat;
