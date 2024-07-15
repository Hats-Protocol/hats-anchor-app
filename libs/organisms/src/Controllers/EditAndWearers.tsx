'use client';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  FALLBACK_ADDRESS,
  hatIdDecimalToIp,
  hatIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatAdminWearers, useHatDetails, useHatWearers } from 'hats-hooks';
import { getControllerNameAndLink } from 'hats-utils';
import { useContractData } from 'hooks';
import _, { includes, map, reject, size } from 'lodash';
import dynamic from 'next/dynamic';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { ChakraNextLink } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { Hex, zeroAddress } from 'viem';

const CodeIcon = dynamic(() => import('icons').then((i) => i.CodeIcon));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));
const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const excludeAddresses = [FALLBACK_ADDRESS, zeroAddress];

const AdminHatRow = ({ hatId }: { hatId: Hex }) => {
  const { chainId } = useTreeForm();

  const { data: hat, details } = useHatDetails({ hatId, chainId });
  const { data: wearers } = useHatWearers({ hat: hat || undefined, chainId });
  const actualWearers = reject(wearers, (w: HatWearer) =>
    includes(excludeAddresses, w.id),
  );
  console.log({ hat, wearers, actualWearers });
  if (!chainId || !hat || size(actualWearers) === 0) return null;

  return (
    <div className='flex justify-between'>
      <div className='flex gap-2 items-center'>
        <Icon as={HatIcon} />
        <h2>
          {hatIdDecimalToIp(hatIdHexToDecimal(hatId))} {details?.name}
        </h2>
      </div>
    </div>
  );
};

const AdminWearersPanel = () => {
  const { treeToDisplay } = useTreeForm();
  const { selectedHat, chainId, isClaimable } = useSelectedHat();

  const {
    data: admins,
    adminCount,
    adminHats,
  } = useHatAdminWearers(selectedHat, treeToDisplay, chainId);
  console.log(adminHats);

  if (size(admins) === 1) {
    return (
      <Flex justify='space-between' py={1}>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          Admins can edit this Hat
          {!isClaimable?.for ? ' and choose Wearers' : ''}
        </Text>

        <AdminWearers
          admins={admins}
          adminCount={adminCount}
          chainId={chainId}
        />
      </Flex>
    );
  }

  // TODO move background gradient to theme

  return (
    <Accordion allowToggle>
      <AccordionItem
        border='none'
        w={{ base: '100%', md: 'calc(100% + 32px)' }}
        ml={{ md: -4 }}
      >
        <AccordionButton p={0}>
          <Flex
            justify='space-between'
            py={2}
            px={4}
            width='100%'
            background='linear-gradient(180deg, #FFF 0%, #FFF 60.01%, #EBF8FF 100%)'
            borderBottom='1px solid'
            borderColor='gray.400'
          >
            <Text fontSize={{ base: 'sm', md: 'md' }}>
              Admins can edit this Hat
              {!isClaimable?.for ? ' and choose Wearers' : ''}
            </Text>

            <AdminWearers
              admins={admins}
              adminCount={adminCount}
              chainId={chainId}
            />
          </Flex>
        </AccordionButton>
        <AccordionPanel p={0}>
          <Stack px={4}>
            {map(adminHats, (adminHat: AppHat) => (
              <AdminHatRow key={adminHat.id} hatId={adminHat.id} />
            ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

const AdminWearers = ({
  admins,
  adminCount,
  chainId,
}: {
  admins: HatWearer[] | undefined;
  adminCount: any;
  chainId: SupportedChains | undefined;
}) => {
  const admin = _.first(admins);
  const { data: contractData } = useContractData({
    // TODO handle contract data further up
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
  const { treeToDisplay } = useTreeForm();
  const { selectedHat, chainId, isClaimable } = useSelectedHat();

  const { data: admins, adminCount } = useHatAdminWearers(
    selectedHat,
    treeToDisplay,
    chainId,
  );

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

          <AdminWearers
            admins={admins}
            adminCount={adminCount}
            chainId={chainId}
          />
        </Flex>
      </Stack>
    );
  }

  return (
    <Stack spacing='2px'>
      <AdminWearersPanel />
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
