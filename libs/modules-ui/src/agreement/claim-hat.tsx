'use client';

import {
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEligibility, useOverlay } from 'contexts';
import { useWearerDetails, useWearersEligibilityStatus } from 'hats-hooks';
import { useWaitForSubgraph } from 'hooks';
import { find, get, includes, map, toLower } from 'lodash';
import {
  useAgreementClaim,
  useHatClaimBy,
  useMultiClaimsHatterCheck,
} from 'modules-hooks';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { Dispatch, SetStateAction } from 'react';
import ReactDOMServer from 'react-dom/server';
import { BsDownload, BsPen, BsTelegram } from 'react-icons/bs';
import { Authority } from 'types';
import { fetchWearerDetails, hatLink } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import AgreementContent from './agreement-content';
import { Conditions } from './conditions';

const NetworkSwitcher = dynamic(() =>
  import('molecules').then((mod) => mod.NetworkSwitcher),
);
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const ConnectWallet = dynamic(() =>
  import('molecules').then((mod) => mod.ConnectWallet),
);

const ClaimHat = ({
  agreement,
  isReviewed,
  setIsReviewed,
  hasSupply,
}: {
  agreement: string;
  isReviewed: boolean;
  setIsReviewed: Dispatch<SetStateAction<boolean>>;
  hasSupply: boolean;
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

  const telegramAuthority = find(
    get(selectedHatDetails, 'authorities'),
    (a: Authority) => includes(a.link, 'telegram') || includes(a.link, 't.me'),
  );

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isWearing = includes(map(wearer, 'id'), selectedHat?.id);
  const { data: eligibilityStatus } = useWearersEligibilityStatus({
    selectedHat: selectedHat || undefined,
    wearerIds: [toLower(address) as Hex],
    chainId,
  });
  const isEligible = includes(
    get(eligibilityStatus, 'eligibleWearers'),
    toLower(address),
  );

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
    wearer: address as Hex,
    handlePendingTx,
  });

  const { instanceAddress, currentHatIsClaimable } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats: selectedHat ? [selectedHat] : [],
  });

  // TODO maybe check `isEligible` here instead
  const waitForClaim = useWaitForSubgraph({
    fetchHelper: () => fetchWearerDetails(address, chainId),
    checkResult: (result) => {
      const hasClaimed = includes(
        map(get(result, 'currentHats'), 'id'),
        selectedHat?.id,
      );
      return hasClaimed;
    },
  });

  const { signAndClaim, signAgreement } = useAgreementClaim({
    moduleParameters,
    moduleDetails,
    chainId,
    controllerAddress,
    mchAddress: instanceAddress,
    onSuccessfulSign: async () => {
      await waitForClaim();
      queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
    },
  });

  let claimTooltipText = '';
  if (!hatterIsAdmin) claimTooltipText = 'Claims Hatter is not an admin';
  if (!currentHatIsClaimable?.for)
    claimTooltipText = 'Hat is only claimable by eligible wearers';
  if (!address) claimTooltipText = 'Connect your wallet to claim this hat';
  if (!isReviewed)
    claimTooltipText = 'You must sign the agreement to claim this hat';

  if (!hasSupply) {
    // TODO text is assuming > 1 wearers is max supply. handle 0 or 1 wearers
    return (
      <Stack w='40%' alignItems='center' gap={12}>
        <Heading size='md'>No remaining supply!</Heading>
        <Text maxW='80%' textAlign='center'>
          {selectedHatDetails?.name} already has {selectedHat?.maxSupply}{' '}
          wearers.
        </Text>
        <ChakraNextLink
          href={hatLink({ chainId, hatId: selectedHat?.id })}
          isExternal
        >
          <Button variant='outlineMatch' colorScheme='blue.500'>
            View Hat
          </Button>
        </ChakraNextLink>
      </Stack>
    );
  }

  if (isEligible && isWearing) {
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
                href={get(telegramAuthority, 'link', '#')}
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

  if (!address) {
    return (
      <Stack w='40%' justifyContent='center' alignItems='left'>
        <Conditions isReviewed={isReviewed} setIsReviewed={setIsReviewed} />
        <Stack w='full' justifyContent='center' gap={3}>
          <ConnectWallet />
        </Stack>
      </Stack>
    );
  }

  if (chainId !== currentNetworkId) {
    return (
      <Stack w='40%' justifyContent='center' alignItems='left'>
        <Conditions isReviewed={isReviewed} setIsReviewed={setIsReviewed} />
        <Stack w='full' justifyContent='center' gap={3}>
          <NetworkSwitcher chainId={chainId} colorScheme='blue.500' />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack w='40%' justifyContent='center' alignItems='left'>
      <Conditions isReviewed={isReviewed} setIsReviewed={setIsReviewed} />
      <Stack w='full' justifyContent='center' gap={3}>
        <Tooltip label={claimTooltipText} placement='top'>
          <Button
            isDisabled={
              !isReviewed ||
              !hatterIsAdmin ||
              !currentHatIsClaimable?.for ||
              (isWearing && isEligible)
            }
            colorScheme='blue'
            leftIcon={<BsPen />}
            onClick={isWearing ? signAgreement : signAndClaim}
          >
            Claim with Signature
          </Button>
        </Tooltip>
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
