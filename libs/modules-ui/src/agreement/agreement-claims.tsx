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
import { get, includes, map, toNumber } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsCheckCircleFill, BsCheckSquare } from 'react-icons/bs';
import { ModuleDetails } from 'types';
import { fetchIpfs } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const AgreementContent = dynamic(() =>
  import('molecules').then((mod) => mod.AgreementContent),
);

const handleFetchIpfs: any = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: any) => {
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
    });
};

const AgreementButton = ({ activeModule }: { activeModule: ModuleDetails }) => {
  const {
    selectedHat,
    chainId,
    isClaimableFor,
    isReadyToClaim: aggregateReadyToClaim,
    setIsReadyToClaim,
  } = useEligibility();
  const { address } = useAccount();

  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const isWearing = useMemo(
    () => includes(map(wearerHats, 'id'), selectedHat?.id),
    [wearerHats, selectedHat?.id],
  );
  const hasSupply = useMemo(
    () =>
      toNumber(selectedHat?.maxSupply) - toNumber(selectedHat?.currentSupply) >
      0,
    [selectedHat],
  );

  let buttonTooltip = '';
  if (isWearing) {
    buttonTooltip = 'You are wearing this hat.';
  } else if (!hasSupply) {
    buttonTooltip =
      'No hats left to claim. If this hat is mutable an admin could increase the supply.';
  } else if (
    !isClaimableFor &&
    selectedHat?.id !== CONFIG.agreementV0.communityHatId
  ) {
    buttonTooltip =
      'Please allow any account to claim this Hat on behalf of eligible users.';
  }
  // else if (!isReadyToClaim) {
  //   buttonTooltip = 'Review the hat details and conditions to claim.';
  // }

  const moduleAddress = activeModule?.instanceAddress;
  if (!moduleAddress) return null;

  const localClaimable =
    !isClaimableFor && selectedHat?.id !== CONFIG.agreementV0.communityHatId;
  const isReadyToClaim = !!get(aggregateReadyToClaim, moduleAddress);

  return (
    <Tooltip label={buttonTooltip} placement='top'>
      <Button
        variant={isReadyToClaim ? 'outlineMatch' : 'filled'}
        background={isReadyToClaim ? 'transparent' : 'blue.500'}
        colorScheme={isReadyToClaim ? 'green.500' : 'white'}
        size='sm'
        onClick={() => {
          setIsReadyToClaim(moduleAddress);
        }}
        _hover={{
          background: isReadyToClaim ? 'transparent' : 'blue.600',
        }}
        isDisabled={localClaimable || !hasSupply || isWearing || isReadyToClaim}
        leftIcon={
          <Icon as={isReadyToClaim ? BsCheckSquare : BsCheckCircleFill} />
        }
        py={4}
      >
        {isReadyToClaim ? 'Accepted' : 'Accept Agreement'}
      </Button>
    </Tooltip>
  );
};

// SUPPORTS v0 and v1
export const AgreementClaims = ({
  activeModule,
}: {
  activeModule: ModuleDetails;
}) => {
  const { selectedHatDetails } = useEligibility();

  const { agreement } = useAgreementClaim({
    moduleParameters: activeModule?.liveParameters,
  });

  const { data: agreementV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });
  const onlyHat = false;

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
          <Heading>
            Sign the agreement
            {onlyHat
              ? ` to claim the ${get(selectedHatDetails, 'name')}{' '}
            {capitalize(CONFIG.TERMS.hat)}}`
              : ''}
          </Heading>

          <Flex minW='175px' justify='end'>
            <AgreementButton activeModule={activeModule} />
          </Flex>
        </Flex>

        <AgreementContent agreement={agreement || agreementV0} />
      </Box>

      <Flex>
        <AgreementButton activeModule={activeModule} />
      </Flex>
    </Stack>
  );
};
