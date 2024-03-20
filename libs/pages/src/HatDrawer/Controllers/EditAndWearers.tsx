import { Flex, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatAdminWearers } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';

const CodeIcon = dynamic(() => import('icons').then((i) => i.CodeIcon));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));

const AdminWearers = () => {
  const { treeToDisplay } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();

  const { adminCount } = useHatAdminWearers(
    selectedHat,
    treeToDisplay,
    chainId,
  );

  return (
    <HStack spacing={1}>
      {adminCount.code > 0 && (
        <HStack color='Informative-Code' spacing='1px'>
          <Text>{adminCount.code}x</Text>

          <Icon as={CodeIcon} />
        </HStack>
      )}
      {adminCount.human > 0 && (
        <HStack color='Informative-Human' spacing='1px'>
          <Text>{adminCount.human}x</Text>
          <Icon as={WearerIcon} />
        </HStack>
      )}
    </HStack>
  );
};

const Claimable = ({ claimFor }: { claimFor: boolean }) => {
  return (
    <HStack color='blue.500' spacing={1}>
      <Text>{claimFor ? 'Free Claim' : 'Self Claim'}</Text>
      <Icon as={CodeIcon} />
    </HStack>
  );
};

const EditAndWearers = () => {
  const { selectedHat } = useSelectedHat();
  console.log('selectedHat', selectedHat);

  // TODO move to selected hat context
  const isClaimable = useMemo(
    () => ({
      by: !_.isEmpty(selectedHat?.claimableBy),
      for: !_.isEmpty(selectedHat?.claimableForBy),
    }),
    [selectedHat],
  );

  if (!selectedHat.mutable) {
    return (
      <Stack spacing={0}>
        <Flex justify='space-between' py={1}>
          <Text>This Hat cannot be edited</Text>
          <HStack>
            <Text display={{ base: 'none', md: 'block' }}>Immutable</Text>
            <Icon as={IoEllipsisVerticalSharp} />
          </HStack>
        </Flex>

        <Flex justify='space-between' py={1}>
          <Text>Admins can add Wearers</Text>
          <AdminWearers />
        </Flex>
      </Stack>
    );
  }

  return (
    <Stack spacing={0}>
      <Flex justify='space-between' py={1}>
        <Text>
          Admins can edit this Hat
          {!isClaimable.for ? ' and choose Wearers' : ''}
        </Text>
        <AdminWearers />
      </Flex>
      {isClaimable &&
        (isClaimable.for ? (
          <Flex justify='space-between' py={1}>
            <Text>Anyone can add eligible addresses as Wearers</Text>
            <Claimable claimFor={isClaimable.for} />
          </Flex>
        ) : (
          <Flex justify='space-between' py={1}>
            <Text>Eligible addresses can claim a Hat</Text>
            <Claimable claimFor={isClaimable.for} />
          </Flex>
        ))}
    </Stack>
  );
};

export default EditAndWearers;
