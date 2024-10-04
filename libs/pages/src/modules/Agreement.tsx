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
import { useEligibility } from 'contexts';
import { includes, map, toLower, toNumber } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsCheckCircleFill, BsCheckSquareFill } from 'react-icons/bs';
import { useAccount } from 'wagmi';

const AgreementContent = dynamic(() =>
  import('modules-ui').then((mod) => mod.AgreementContent),
);

const AgreementButton = () => {
  const {
    selectedHat,
    isClaimableFor,
    isEligible: isReadyToClaim,
    setIsEligible: setIsReadyToClaim,
  } = useEligibility();
  const { address } = useAccount();

  const isWearing = useMemo(
    () => includes(map(selectedHat?.wearers, 'id'), toLower(address)),
    [selectedHat, address],
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

  return (
    <Tooltip label={buttonTooltip} placement='top'>
      <Button
        variant='filled'
        background={isReadyToClaim ? 'green.600' : 'blue.500'}
        size='sm'
        color='white'
        onClick={() => {
          setIsReadyToClaim(true);
          console.log('clicked reviewed');
        }}
        _hover={{
          background: isReadyToClaim ? 'green.700' : 'blue.600',
        }}
        isDisabled={!isClaimableFor || !hasSupply || isWearing}
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

const Agreement = () => {
  const { moduleParameters } = useEligibility();
  const { agreement } = useAgreementClaim({
    moduleParameters,
  });

  return (
    <Stack spacing={4} w='100%' display={{ base: 'none', md: 'flex' }} pl={8}>
      <Box
        py={5}
        px={10}
        flex='1'
        backgroundColor='white'
        border='1px solid #cbcbcb'
        minH='500px'
      >
        <Flex justifyContent='space-between' mb={8} gap={10}>
          <Heading>Sign the agreement to claim your Hat</Heading>

          <Box minW='175px'>
            <AgreementButton />
          </Box>
        </Flex>

        <AgreementContent agreement={agreement} />
      </Box>

      <Flex>
        <AgreementButton />
      </Flex>
    </Stack>
  );
};

export default Agreement;
