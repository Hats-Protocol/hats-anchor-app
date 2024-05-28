import {
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatAdminWearers } from 'hats-hooks';
import { getControllerNameAndLink } from 'hats-utils';
import { useContractData } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';

import { ChakraNextLink } from '../../atoms';

const CodeIcon = dynamic(() => import('icons').then((i) => i.CodeIcon));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));

const AdminWearers = () => {
  const { treeToDisplay } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();

  const { data: admins, adminCount } = useHatAdminWearers(
    selectedHat,
    treeToDisplay,
    chainId,
  );

  const admin = _.first(admins);

  const { data: contractData } = useContractData({
    address: admin?.id,
    chainId,
  });

  if (!admin) return null;
  const { name, link, icon } = getControllerNameAndLink({
    extendedController: { ...admin, ...contractData },
    chainId,
  });

  if (_.size(admins) === 1) {
    return (
      <ChakraNextLink href={link}>
        <HStack
          color={
            admin?.isContract && !name.includes('Safe')
              ? 'Informative-Code'
              : 'Informative-Human'
          }
          spacing={1}
        >
          <Text fontSize={{ base: 'sm', md: 'md' }}>
            {name || formatAddress(admin?.id)}
          </Text>
          <Icon
            as={icon ?? (admin?.isContract ? CodeIcon : WearerIcon)}
            boxSize={{ base: '14px', md: 4 }}
          />
        </HStack>
      </ChakraNextLink>
    );
  }

  return (
    <HStack spacing='2px'>
      {adminCount.code > 0 && (
        <HStack color='Informative-Code' spacing='1px'>
          <Text fontSize={{ base: 'sm', md: 'md' }}>{adminCount.code}×</Text>
          <Icon as={CodeIcon} boxSize={{ base: '14px', md: 4 }} />
        </HStack>
      )}
      {adminCount.human > 0 && (
        <HStack color='Informative-Human' spacing='1px'>
          <Text fontSize={{ base: 'sm', md: 'md' }}>{adminCount.human}×</Text>
          <Icon as={WearerIcon} boxSize={{ base: '14px', md: 4 }} />
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
  address: Hex | undefined;
  chainId: number | undefined;
  claimFor: boolean;
}) => {
  if (!address || !chainId) return null;

  return (
    <ChakraNextLink
      href={`${explorerUrl(chainId)}/address/${address}`}
      isExternal
    >
      <HStack color='blue.500' spacing={1}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          {claimFor ? 'Free Claim' : 'Self Claim'}
        </Text>
        <Icon as={CodeIcon} boxSize={{ base: '14px', md: 4 }} />
      </HStack>
    </ChakraNextLink>
  );
};

const EditAndWearers = () => {
  const { selectedHat, chainId, isClaimable } = useSelectedHat();

  const claimableAddress = _.get(
    _.first(_.get(selectedHat, 'claimableBy')),
    'id',
  ) as Hex | undefined;
  const claimableForAddress = _.get(
    _.first(_.get(selectedHat, 'claimableForBy')),
    'id',
  ) as Hex | undefined;

  const canAddWearers = useBreakpointValue({
    base: 'Anyone can add eligible Wearers',
    md: 'Anyone can add eligible addresses as Wearers',
  });

  if (!selectedHat?.mutable) {
    return (
      <Stack spacing='2px'>
        <Flex justify='space-between' py={1}>
          <Text fontSize={{ base: 'sm', md: 'md' }}>
            This Hat cannot be edited
          </Text>

          <HStack>
            <Text
              display={{ base: 'none', md: 'block' }}
              fontSize={{ base: 'sm', md: 'md' }}
            >
              Immutable
            </Text>
            <Icon as={IoEllipsisVerticalSharp} />
          </HStack>
        </Flex>

        <Flex justify='space-between' py={1}>
          <Text fontSize={{ base: 'sm', md: 'md' }}>
            Admins can add Wearers
          </Text>

          <AdminWearers />
        </Flex>
      </Stack>
    );
  }

  return (
    <Stack spacing='2px'>
      <Flex justify='space-between' py={1}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          Admins can edit this Hat
          {!isClaimable?.for ? ' and choose Wearers' : ''}
        </Text>

        <AdminWearers />
      </Flex>
      {(isClaimable?.for || isClaimable?.by) &&
        (isClaimable?.for ? (
          <Flex justify='space-between' py={1}>
            <Text fontSize={{ base: 'sm', md: 'md' }}>{canAddWearers}</Text>

            <Claimable
              address={claimableForAddress}
              chainId={chainId}
              claimFor={isClaimable.for}
            />
          </Flex>
        ) : (
          <Flex justify='space-between' py={1}>
            <Text fontSize={{ base: 'sm', md: 'md' }}>
              Eligible addresses can claim a Hat
            </Text>

            <Claimable
              address={claimableAddress}
              chainId={chainId}
              claimFor={isClaimable.for}
            />
          </Flex>
        ))}
    </Stack>
  );
};

export default EditAndWearers;
