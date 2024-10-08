'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { get, includes, map, toLower, toNumber } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsCheckCircleFill, BsCheckSquareFill } from 'react-icons/bs';
import { fetchIpfs } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const AgreementContent = dynamic(() =>
  import('molecules').then((mod) => mod.AgreementContent),
);

const handleFetchIpfs: any = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: any) => {
      console.log('res', res);
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      console.error(err);
      return null;
    });
};

const AgreementButton = () => {
  const {
    selectedHat,
    chainId,
    isClaimableFor,
    isEligible: isReadyToClaim,
    setIsEligible: setIsReadyToClaim,
  } = useEligibility();
  const { address } = useAccount();

  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const isWearing = useMemo(
    () => includes(map(wearerHats, 'id'), toLower(address)),
    [wearerHats, address],
  );
  const hasSupply = useMemo(
    () =>
      toNumber(selectedHat?.maxSupply) - toNumber(selectedHat?.currentSupply) >
      0,
    [selectedHat],
  );

  let buttonTooltip = '';
  if (!isReadyToClaim) {
    buttonTooltip = 'Review the hat details and conditions to claim.';
  } else if (!hasSupply) {
    buttonTooltip =
      'No hats left to claim. If this hat is mutable an admin could increase the supply.';
  } else if (!isClaimableFor) {
    buttonTooltip =
      'Please allow any account to claim this Hat on behalf of eligible users.';
  }

  const localClaimable =
    !isClaimableFor && selectedHat?.id !== CONFIG.agreementV0.communityHatId;

  return (
    <Tooltip label={buttonTooltip} placement='top'>
      <Button
        variant='filled'
        background={isReadyToClaim ? 'green.600' : 'blue.500'}
        size='sm'
        color='white'
        onClick={() => {
          setIsReadyToClaim(true);
        }}
        _hover={{
          background: isReadyToClaim ? 'green.700' : 'blue.600',
        }}
        isDisabled={localClaimable || !hasSupply || isWearing}
        leftIcon={
          <Icon as={isReadyToClaim ? BsCheckSquareFill : BsCheckCircleFill} />
        }
        py={4}
      >
        {isReadyToClaim ? 'Accepted' : 'Accept Agreement'}
      </Button>
    </Tooltip>
  );
};

// SUPPORTS v0 and v1
export const AgreementClaims = () => {
  const { moduleParameters } = useEligibility();

  const { agreement } = useAgreementClaim({
    moduleParameters,
  });

  const { data: agreementV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });

  return (
    <Stack spacing={4} w='100%' display={{ base: 'none', md: 'flex' }}>
      <Box
        py={5}
        px={10}
        flex='1'
        backgroundColor='white'
        border='1px solid #cbcbcb'
        minH='500px'
      >
        <Flex justify='space-between' mb={8} gap={10}>
          <Heading>Sign the agreement to claim your Hat</Heading>

          <Flex minW='175px' justify='end'>
            <AgreementButton />
          </Flex>
        </Flex>

        <AgreementContent agreement={agreement || agreementV0} />
      </Box>

      <Flex>
        <AgreementButton />
      </Flex>
    </Stack>
  );
};
