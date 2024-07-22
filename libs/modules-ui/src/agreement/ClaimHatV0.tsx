'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  ListItem,
  OrderedList,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { CONFIG, TOASTS } from '@hatsprotocol/constants';
import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useWearerDetails } from 'hats-hooks';
import {
  useAgreementClaimsHatterContractWrite,
  useMediaStyles,
  useWaitForSubgraph,
} from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import ReactDOMServer from 'react-dom/server';
import { BsDownload, BsPen, BsTelegram } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { fetchWearerDetails, hatLink } from 'utils';
import { useAccount, useChainId } from 'wagmi';

import AgreementContent from './AgreementContent';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const NetworkSwitcher = dynamic(() =>
  import('molecules').then((mod) => mod.NetworkSwitcher),
);
const HatCreateCard = dynamic(() =>
  import('molecules').then((mod) => mod.HatCreateCard),
);

const ClaimHat = ({ agreement }: { agreement: string }) => {
  const hatId = hatIdDecimalToHex(
    hatIdIpToDecimal(CONFIG.agreementV0.communityHatId),
  ); // TODO handle IP from URL params
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { isMobile } = useMediaStyles();

  const { data: wearerDetails, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const wearing = !!_.find(wearerDetails, ['id', hatId]);

  const waitForClaim = useWaitForSubgraph({
    fetchHelper: () => fetchWearerDetails(address, chainId),
    checkResult: (result) => {
      const hasClaimed = _.includes(
        _.map(_.get(result, 'currentHats'), 'id'),
        hatId,
      );
      return hasClaimed;
    },
  });

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

  const {
    writeAsync: claimHat,
    prepareError,
    isLoading: isClaiming,
  } = useAgreementClaimsHatterContractWrite({
    functionName: 'claimHatWithAgreement',
    address: CONFIG.agreementV0.hatterAddress,
    chainId,
    enabled: Boolean(hatId) && !wearerLoading && !wearing,
    onSuccessToastData: TOASTS.claimHatWithAgreement,
  });

  const handleClaim = async () => {
    // eslint-disable-next-line no-console
    if (!claimHat) console.log('no claim hat fn');
    await claimHat?.();

    if (!address || !chainId) {
      // eslint-disable-next-line no-console
      console.log('missing address or chain id');
      return;
    }
    // trigger refetch if hasClaimed
    await waitForClaim();

    queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
    queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
  };

  return (
    <Stack
      w={{
        base: '90%',
        lg: '30%',
      }}
      justifyContent='center'
      alignItems='left'
      px={{
        base: 0,
        '2xl': 10,
      }}
      mx={{ base: 'auto', md: 0 }}
    >
      <Heading fontSize={24} fontWeight='medium' color='blackAlpha.800'>
        Join the Hats Community!{' '}
      </Heading>
      <Text fontSize='md' color='blackAlpha.700'>
        Sign the agreement to claim your Community Member Hat
      </Text>
      <Flex w='full' justifyContent='center' py={4}>
        <NextLink
          href={hatLink({ chainId, hatId, isMobile })}
          passHref
          target='_blank'
        >
          <HatCreateCard id={hatId} chainId={chainId as SupportedChains} />
        </NextLink>
      </Flex>

      <Box mb={5}>
        <Heading size='md' mb={2} fontWeight='medium'>
          Instructions
        </Heading>
        <OrderedList color='blackAlpha.700' spacing={2}>
          <ListItem>
            Connect your wallet and claim this hat via the button below to
            verify that you have signed the Hats Community Agreements and Code
            of Conduct (
            <ChakraNextLink
              href={`https://ipfs.io/ipfs/${CONFIG.agreementV0.ipfsHash}`}
              isExternal
              decoration
            >
              pinned to IPFS here
            </ChakraNextLink>
            )
          </ListItem>
          <ListItem>
            Once you’ve executed the transaction, go to the Hats App to view
            your new hat and see the platforms you can now access to participate
            in the Hats community
          </ListItem>
          <ListItem>
            Start by joining the{' '}
            <ChakraNextLink
              href={CONFIG.agreementV0.telegramLink}
              isExternal
              decoration
            >
              Hats Community Telegram group here
            </ChakraNextLink>
            . Welcome to the community!
          </ListItem>
        </OrderedList>
      </Box>
      <Flex w='full' justifyContent='center'>
        {!wearing &&
          (chainId === 10 ? (
            <Tooltip
              label={
                // eslint-disable-next-line no-nested-ternary
                !address ? 'Connect your wallet to get started' : ''
              }
              placement='top'
            >
              <Button
                isDisabled={!claimHat || !chainId || !!prepareError}
                isLoading={isClaiming}
                colorScheme='blue'
                leftIcon={<BsPen />}
                onClick={handleClaim}
              >
                Claim with Signature
              </Button>
            </Tooltip>
          ) : (
            <NetworkSwitcher chainId={10} colorScheme='blue.500' />
          ))}

        {wearing && (
          <Stack align='center'>
            <Heading size='md' fontWeight={500}>
              Claimed!
            </Heading>
            <HStack>
              <NextLink
                href={CONFIG.agreementV0.hatsAppLink}
                passHref
                target='_blank'
              >
                <Button colorScheme='blue.500' variant='outlineMatch'>
                  View in Hats
                </Button>
              </NextLink>
              <NextLink
                href={CONFIG.agreementV0.telegramLink}
                passHref
                target='_blank'
              >
                <Button colorScheme='blue' leftIcon={<BsTelegram />}>
                  Join the chat
                </Button>
              </NextLink>
            </HStack>
          </Stack>
        )}
      </Flex>

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
