import { Flex, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import dynamic from 'next/dynamic';
import { Hex } from 'viem';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const AboutAgreement = ({
  eligibilityHat,
  ownerHat,
  judgeHat,
}: {
  eligibilityHat: Hex | undefined;
  ownerHat: Hex | undefined;
  judgeHat: Hex | undefined;
}) => {
  if (!eligibilityHat || !ownerHat || !judgeHat) return null;

  return (
    <Stack>
      <Heading size='sm'>About this Allowlist</Heading>

      <Flex justify='space-between'>
        <Text size='sm'>Eligibility Rule for this Hat</Text>

        <HStack spacing={1}>
          <Text size='sm'>
            {hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHat))}
          </Text>
          <Icon as={HatIcon} boxSize={4} />
        </HStack>
      </Flex>
      <Flex justify='space-between'>
        <Text size='sm'>Owner edits the allowlist</Text>

        <HStack spacing={1}>
          <Text size='sm'>{hatIdDecimalToIp(hatIdHexToDecimal(ownerHat))}</Text>
          <Icon as={HatIcon} boxSize={4} />
        </HStack>
      </Flex>

      <Flex justify='space-between'>
        <Text size='sm'>Judge determines wearer standing</Text>

        <HStack spacing={1}>
          <Text size='sm'>{hatIdDecimalToIp(hatIdHexToDecimal(judgeHat))}</Text>
          <Icon as={HatIcon} boxSize={4} />
        </HStack>
      </Flex>
    </Stack>
  );
};

export default AboutAgreement;
