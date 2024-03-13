/* eslint-disable no-nested-ternary */
import {
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useEligibility, useOverlay } from 'contexts';
import {
  useAgreementEligibility,
  useHatClaimBy,
  useWearerDetails,
} from 'hats-hooks';
import _ from 'lodash';
import NextLink from 'next/link';
import ReactDOMServer from 'react-dom/server';
import { BsDownload, BsPen, BsTelegram } from 'react-icons/bs';
import { useAccount, useChainId } from 'wagmi';

import AgreementContent from './AgreementContent';
import Conditions from './Conditions';

// TODO get hatId from URL params
const communityMemberHat = '1.2.1';

// get authority link from hat details/authorities
const TELEGRAM_KEY = 'VFBDI1RFTCNDT01NIy0xMDAxODUxMjg4MjQy';
const TELEGRAM_LINK = `https://telegram.me/collablandbot?start=${TELEGRAM_KEY}`;
const HATS_APP_LINK = `${CONFIG.url}/trees/10/1?hatId=${communityMemberHat}`;

const ClaimHat = ({
  agreement,
  isSigned,
  setIsSigned,
}: {
  agreement: string;
  isSigned: boolean;
  setIsSigned: (signed: boolean) => void;
}) => {
  const { address } = useAccount();
  const { handlePendingTx } = useOverlay();
  const currentNetworkId = useChainId();

  const {
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
    selectedHat,
  } = useEligibility();

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

  const { hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
    handlePendingTx,
  });

  const { signAndClaim } = useAgreementEligibility({
    moduleParameters,
    moduleDetails,
    chainId,
    controllerAddress,
    onSuccessfulSign: () => {
      setIsSigned?.(true);
    },
  });

  return (
    <Stack w='40%' justifyContent='center' alignItems='left'>
      <Conditions isSigned={isSigned} setIsSigned={setIsSigned} />
      <Stack w='full' justifyContent='center' gap={3}>
        <Tooltip
          label={
            !address
              ? 'Connect your wallet to get started'
              : chainId !== currentNetworkId
              ? 'Switch to the correct network'
              : !isClaimable
              ? 'You are not eligible to claim this hat'
              : !hatterIsAdmin
              ? 'You are not an admin'
              : isWearing
              ? 'You are already wearing this hat'
              : ''
          }
          placement='top'
        >
          <Button
            isDisabled={
              !hatterIsAdmin ||
              chainId !== currentNetworkId ||
              !isClaimable ||
              isWearing
            }
            colorScheme='blue'
            leftIcon={<BsPen />}
            onClick={signAndClaim}
          >
            Claim with Signature
          </Button>
        </Tooltip>

        {isWearing && (
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
