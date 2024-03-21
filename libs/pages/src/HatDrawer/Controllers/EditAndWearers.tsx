import { Flex, HStack, Icon, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatAdminWearers } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { explorerUrl } from 'utils';
import { Hex } from 'viem';

const CodeIcon = dynamic(() => import('icons').then((i) => i.CodeIcon));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));
const ChakraNextLink = dynamic(() =>
  import('ui').then((i) => i.ChakraNextLink),
);

const AdminWearers = () => {
  const { treeToDisplay } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();

  const { adminCount } = useHatAdminWearers(
    selectedHat,
    treeToDisplay,
    chainId,
  );

  return (
    <HStack spacing='2px'>
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

const Claimable = ({
  address,
  chainId,
  claimFor,
}: {
  address: Hex;
  chainId: number;
  claimFor: boolean;
}) => {
  return (
    <ChakraNextLink href={`${explorerUrl(chainId)}/address/${address}`}>
      <HStack color='blue.500' spacing={1}>
        <Text>{claimFor ? 'Free Claim' : 'Self Claim'}</Text>
        <Icon as={CodeIcon} />
      </HStack>
    </ChakraNextLink>
  );
};

const EditAndWearers = () => {
  const { selectedHat, chainId } = useSelectedHat();

  // TODO move to selected hat context
  const isClaimable = useMemo(
    () =>
      selectedHat
        ? {
            by: !_.isEmpty(selectedHat?.claimableBy),
            for: !_.isEmpty(selectedHat?.claimableForBy),
          }
        : undefined,
    [selectedHat],
  );
  const claimableAddress = _.get(
    _.first(_.get(selectedHat, 'claimableBy')),
    'id',
  ) as Hex | undefined;
  const claimableForAddress = _.get(
    _.first(_.get(selectedHat, 'claimableForBy')),
    'id',
  ) as Hex | undefined;

  if (!selectedHat.mutable) {
    return (
      <Stack spacing='2px'>
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
    <Stack spacing='2px'>
      <Skeleton isLoaded={!!isClaimable}>
        <Flex justify='space-between' py={1}>
          <Text>
            Admins can edit this Hat
            {!isClaimable.for ? ' and choose Wearers' : ''}
          </Text>

          <AdminWearers />
        </Flex>
      </Skeleton>
      <Skeleton isLoaded={!!isClaimable}>
        {(isClaimable.for || isClaimable.by) &&
          (isClaimable.for ? (
            <Flex justify='space-between' py={1}>
              <Text>Anyone can add eligible addresses as Wearers</Text>

              <Claimable
                address={claimableForAddress}
                chainId={chainId}
                claimFor={isClaimable.for}
              />
            </Flex>
          ) : (
            <Flex justify='space-between' py={1}>
              <Text>Eligible addresses can claim a Hat</Text>

              <Claimable
                address={claimableAddress}
                chainId={chainId}
                claimFor={isClaimable.for}
              />
            </Flex>
          ))}
      </Skeleton>
    </Stack>
  );
};

export default EditAndWearers;
