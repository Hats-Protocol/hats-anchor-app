'use client';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatAdminWearers, useHatDetails, useHatWearers } from 'hats-hooks';
import { getControllerNameAndLink } from 'hats-utils';
import { useContractData } from 'hooks';
import { filter, first, get, includes, map, reject, size } from 'lodash';
import dynamic from 'next/dynamic';
import { startTransition, useEffect, useRef, useState } from 'react';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { ChakraNextLink } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';

const CodeIcon = dynamic(() => import('icons').then((i) => i.CodeIcon));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));
const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));
const GroupIcon = dynamic(() => import('icons').then((i) => i.Group));

const AdminHatRow = ({ hatId }: { hatId: Hex }) => {
  const { chainId } = useTreeForm();

  const { data: hat, details } = useHatDetails({ hatId, chainId });
  const { data: wearers } = useHatWearers({ hat: hat || undefined, chainId });
  const actualWearers = filter(wearers, (w: HatWearer) =>
    includes(map(get(hat, 'wearers'), 'id'), w.id),
  ) as HatWearer[];

  const contractWearers = filter(actualWearers, 'isContract');
  const safeWearers = filter(contractWearers, (w: HatWearer) =>
    w?.contractName?.includes('GnosisSafeProxy'),
  );
  const wearerCount = {
    code: size(contractWearers) - size(safeWearers) || 0,
    groups: size(safeWearers) || 0,
    human: size(reject(actualWearers, 'isContract')) || 0,
  };
  if (!chainId || !hat || size(actualWearers) === 0) return null;

  return (
    <div className='flex justify-between py-1'>
      <div className='flex gap-2 items-center'>
        <Icon as={HatIcon} />
        <Text>
          {hatIdDecimalToIp(hatIdHexToDecimal(hatId))} {details?.name}
        </Text>
      </div>

      <div>
        <WearerBreakdown
          wearers={actualWearers}
          wearerCount={wearerCount}
          chainId={chainId}
        />
      </div>
    </div>
  );
};

const AdminWearersPanel = () => {
  const { treeToDisplay } = useTreeForm();
  const {
    selectedHat,
    chainId,
    isClaimable,
    hatLoading: selectedHatLoading,
  } = useSelectedHat();
  const [expandedBackground, setExpandedBackground] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const {
    data: admins,
    adminCount,
    adminHats,
    isLoading: adminWearersLoading,
  } = useHatAdminWearers(selectedHat, treeToDisplay, chainId);

  if (size(adminHats) === 0 || selectedHatLoading || adminWearersLoading) {
    return (
      <Skeleton
        h='1.5rem'
        w='full'
        mx={{ base: 4, md: 0 }}
        my={2}
        isLoaded={!selectedHatLoading && !adminWearersLoading}
      />
    );
  }

  if (size(admins) === 1) {
    return (
      <Flex justify='space-between' py={1} px={{ base: 4, md: 0 }}>
        <Text>
          <span className='hidden md:inline'>Admins can edit this Hat</span>
          <span className='inline md:hidden'>Can edit Hat</span>
          {!isClaimable?.for ? ' and choose Wearers' : ''}
        </Text>

        <WearerBreakdown
          wearers={admins}
          wearerCount={adminCount}
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
        boxShadow={
          expandedBackground
            ? '0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)'
            : undefined
        }
        borderRadius={
          expandedBackground ? { base: 'none', md: 'md' } : { base: 'none' }
        }
      >
        {({ isExpanded }: { isExpanded: boolean }) => {
          if (isMounted.current && isExpanded !== expandedBackground) {
            startTransition(() => setExpandedBackground(isExpanded));
          }

          return (
            <>
              <AccordionButton
                p={0}
                border={isExpanded ? '1px solid' : undefined}
                borderBottom={!isExpanded ? '1px solid' : undefined}
                _hover={{
                  background: !isExpanded ? 'white' : undefined,
                  borderRadius: !isExpanded ? 'md' : undefined,
                  borderColor: !isExpanded && 'blue.300',
                }}
                background={
                  isExpanded
                    ? 'linear-gradient(180deg, #FFF 0%, #FFF 60.01%, #EBF8FF 100%)'
                    : undefined
                }
                borderTopRadius={isExpanded ? 'md' : undefined}
                borderColor={isExpanded ? 'gray.100' : 'transparent'}
                borderBottomColor={isExpanded ? 'gray.400' : 'transparent'}
              >
                <Flex justify='space-between' py={2} px={4} width='100%'>
                  <Text>
                    Admins can edit this Hat
                    {!isClaimable?.for ? ' and choose Wearers' : ''}
                  </Text>

                  <WearerBreakdown
                    wearers={admins}
                    wearerCount={adminCount}
                    chainId={chainId}
                  />
                </Flex>
              </AccordionButton>

              <AccordionPanel
                p={0}
                overflow='visible'
                borderBottomRadius='lg'
                pb={1}
                bg='white'
                border='gray'
              >
                <Stack px={4}>
                  {map(adminHats, (adminHat: AppHat) => (
                    <AdminHatRow key={adminHat.id} hatId={adminHat.id} />
                  ))}
                </Stack>
              </AccordionPanel>
            </>
          );
        }}
      </AccordionItem>
    </Accordion>
  );
};

const WearerBreakdown = ({
  wearers,
  wearerCount,
  chainId,
}: {
  wearers: HatWearer[] | undefined;
  wearerCount: { code: number; groups: number; human: number };
  chainId: SupportedChains | undefined;
}) => {
  const wearer = first(wearers);
  const { data: contractData } = useContractData({
    // TODO handle contract data further up
    address: wearer?.id,
    chainId,
  });

  if (!wearers) return null;
  const { name, link, icon } = getControllerNameAndLink({
    extendedController: { ...wearer, ...contractData },
    chainId,
  });

  if (size(wearers) === 1) {
    return (
      <ChakraNextLink href={link}>
        <HStack
          color={
            wearer?.isContract && !name.includes('Safe')
              ? 'Informative-Code'
              : 'Informative-Human'
          }
          spacing={1}
        >
          <Text>{name || formatAddress(wearer?.id)}</Text>
          <Icon
            as={icon ?? (wearer?.isContract ? CodeIcon : WearerIcon)}
            boxSize={4}
          />
        </HStack>
      </ChakraNextLink>
    );
  }

  return (
    <HStack spacing='2px'>
      {wearerCount.code > 0 && (
        <HStack color='Informative-Code' spacing='1px'>
          <Text>{wearerCount.code}×</Text>
          <Icon as={CodeIcon} boxSize={4} />
        </HStack>
      )}
      {wearerCount.groups > 0 && (
        <HStack color='Informative-Human' spacing='1px'>
          <Text>{wearerCount.groups}×</Text>
          <Icon as={GroupIcon} boxSize={4} />
        </HStack>
      )}
      {wearerCount.human > 0 && (
        <HStack color='Informative-Human' spacing='1px'>
          <Text>{wearerCount.human}×</Text>
          <Icon as={WearerIcon} boxSize={4} />
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
        <Text>{claimFor ? 'Free Claim' : 'Self Claim'}</Text>
        <Icon as={CodeIcon} boxSize={4} />
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

  const claimableAddress = get(first(get(selectedHat, 'claimableBy')), 'id') as
    | Hex
    | undefined;
  const claimableForAddress = get(
    first(get(selectedHat, 'claimableForBy')),
    'id',
  ) as Hex | undefined;

  const canAddWearers = useBreakpointValue({
    base: 'Anyone can add eligible Wearers',
    md: 'Anyone can add eligible addresses as Wearers',
  });

  if (!selectedHat?.mutable) {
    return (
      <Stack py={1} px={{ base: 4, md: 0 }}>
        <Flex justify='space-between'>
          <Text>This Hat cannot be edited</Text>

          <HStack>
            <Text display={{ base: 'none', md: 'block' }}>Immutable</Text>
            <Icon as={IoEllipsisVerticalSharp} />
          </HStack>
        </Flex>

        <Flex justify='space-between'>
          <Text>Admins can add Wearers</Text>

          <WearerBreakdown
            wearers={admins}
            wearerCount={adminCount}
            chainId={chainId}
          />
        </Flex>
      </Stack>
    );
  }

  return (
    <Stack spacing={0}>
      <AdminWearersPanel />

      {(isClaimable?.for || isClaimable?.by) &&
        (isClaimable?.for ? (
          <Flex justify='space-between' py={2} px={{ base: 4, md: 0 }}>
            <Text>{canAddWearers}</Text>

            <Claimable
              address={claimableForAddress}
              chainId={chainId}
              claimFor={isClaimable.for}
            />
          </Flex>
        ) : (
          <Flex justify='space-between' py={2} px={{ base: 4, md: 0 }}>
            <Text>Eligible addresses can claim a Hat</Text>

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
