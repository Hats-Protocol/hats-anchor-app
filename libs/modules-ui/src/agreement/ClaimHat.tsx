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
// import { fetchWearerDetails } from '@/gql/helpers';
import { CONFIG } from '@hatsprotocol/constants';
// import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
// import useAgreementClaimsHatterContractWrite from '@/hooks/useAgreementClaimsHatterContractWrite';
import { useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import ReactDOMServer from 'react-dom/server';
import { BsDownload, BsPen, BsTelegram } from 'react-icons/bs';
import { Hex } from 'viem';
import { useAccount, useNetwork } from 'wagmi';

import AgreementContent from './AgreementContent';
// import Hat from './Hat';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

// TODO get hatId from URL params
const communityMemberHat = '1.2.1';

// get authority link from hat details/authorities
const TELEGRAM_KEY = 'VFBDI1RFTCNDT01NIy0xMDAxODUxMjg4MjQy';
const TELEGRAM_LINK = `https://telegram.me/collablandbot?start=${TELEGRAM_KEY}`;
const HATS_APP_LINK = `${CONFIG.url}/trees/10/1?hatId=${communityMemberHat}`;

async function waitForClaim(address: Hex, chainId: number) {
  // return new Promise((resolve) => {
  //   const checkWearer = async () => {
  //     try {
  //       const wearer = await fetchWearerDetails(address, chainId);
  //       const hasClaimed = _.includes(
  //         _.map(_.get(wearer, 'currentHats'), 'id'),
  //         CONFIG.communityMemberHat,
  //       );
  //       if (hasClaimed) {
  //         clearInterval(intervalId);
  //         resolve(wearer);
  //       }
  //       // eslint-disable-next-line no-console
  //       console.log('waiting for claim');
  //     } catch (e) {
  //       // eslint-disable-next-line no-console
  //       console.log(e);
  //     }
  //   };
  //   const intervalId = setInterval(checkWearer, 1000);
  //   checkWearer(); // Check immediately
  //   setTimeout(() => {
  //     clearInterval(intervalId);
  //     resolve(null); // Resolve with null or handle the timeout case
  //   }, 20000);
  // });
}

const ClaimHat = ({ agreement }: { agreement: string }) => {
  // const hatId = hatIdDecimalToHex(hatIdIpToDecimal(communityMemberHat)); // TODO handle IP from URL params
  const { address } = useAccount();
  const { chain } = useNetwork();
  const queryClient = useQueryClient();
  const chainId = chain?.id;

  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const wearing = !!_.find(wearerDetails, ['id', communityMemberHat]);

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

  // const {
  //   writeAsync: claimHat,
  //   prepareError,
  //   isLoading: isClaiming,
  // } = useAgreementClaimsHatterContractWrite({
  //   functionName: 'claimHatWithAgreement',
  //   address: AGREEMENT_CLAIMS_HATTER_ADDRESS,
  //   chainId,
  //   enabled: Boolean(hatId) && !wearerLoading && !wearing,
  //   onSuccessToastData: {
  //     title: 'Hat Claimed',
  //     description: 'Claimed with signature',
  //   },
  // });

  const handleClaim = async () => {
    // eslint-disable-next-line no-console
    // if (!claimHat) console.log('no claim hat fn');
    // await claimHat?.();

    if (!address || !chainId) {
      // eslint-disable-next-line no-console
      console.log('missing address or chain id');
      return;
    }
    // trigger refetch if hasClaimed
    await waitForClaim(address, chainId);

    queryClient.invalidateQueries(['wearerDetails']);
    queryClient.invalidateQueries(['hatDetails']);
  };

  return (
    <Stack
      w={{
        base: '50%',
        lg: '30%',
      }}
      justifyContent='center'
      alignItems='left'
      px={{
        base: 0,
        xl: 10,
      }}
    >
      <Heading fontSize={24} fontWeight='medium' color='blackAlpha.800'>
        Join the Hats Community!{' '}
      </Heading>
      <Text fontSize='md' color='blackAlpha.700'>
        Sign to claim your Community Member Hat
      </Text>
      <Flex w='full' justifyContent='center' py={4}>
        {/* <NextLink href={HATS_APP_LINK} passHref target='_blank'>
          <HatCreateCard
            name='test'
            supply={10}
            nextChild='1.1'
            image='/icon.jpeg'
          />
        </NextLink> */}
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
            {/* <ChakraNextLink
              href={`https://ipfs.io/ipfs/${AGREEMENT_IPFS_HASH}`}
              isExternal
              decoration
            >
              pinned to IPFS here
            </ChakraNextLink> */}
            )
          </ListItem>
          <ListItem>
            Once you’ve executed the transaction, go to the Hats App to view
            your new hat and see the platforms you can now access to participate
            in the Hats community
          </ListItem>
          <ListItem>
            Start by joining the{' '}
            <ChakraNextLink href={TELEGRAM_LINK} isExternal decoration>
              Hats Community Telegram group here
            </ChakraNextLink>
            . Welcome to the community!
          </ListItem>
        </OrderedList>
      </Box>
      <Flex w='full' justifyContent='center'>
        {!wearing && (
          <Tooltip
            label={
              // eslint-disable-next-line no-nested-ternary
              !address
                ? 'Connect your wallet to get started'
                : chainId !== 10
                ? 'Please switch to Optimism'
                : ''
            }
            placement='top'
          >
            <Button
              // isDisabled={!claimHat || !chainId || !!prepareError}
              // isLoading={isClaiming}
              colorScheme='blue'
              leftIcon={<BsPen />}
              onClick={handleClaim}
            >
              Claim with Signature
            </Button>
          </Tooltip>
        )}

        {wearing && (
          <Stack align='center'>
            <Heading size='md' fontWeight={500}>
              Claimed!
            </Heading>
            <HStack>
              <NextLink href={HATS_APP_LINK} passHref target='_blank'>
                <Button colorScheme='blue.500' variant='outlineMatch'>
                  View in Hats
                </Button>
              </NextLink>
              <NextLink href={TELEGRAM_LINK} passHref target='_blank'>
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
