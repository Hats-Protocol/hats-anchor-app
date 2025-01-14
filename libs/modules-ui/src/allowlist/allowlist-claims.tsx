'use client';

import { Box, Button, HStack, Icon, Skeleton, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { find, get, includes, map, toLower } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { ModuleDetails } from 'types';
import { explorerUrl, formatAddress } from 'utils';
import { useAccount } from 'wagmi';

// TODO hardcode
const selectionModule = '0x8250a44405C4068430D3B3737721D47bB614E7D2';
const criteriaModule = '0x03aB59ff1Ab959F2663C38408dD2578D149e4cd5';

const ChakraNextLink = dynamic(() => import('ui').then((mod) => mod.ChakraNextLink));
const DevInfo = dynamic(() => import('ui').then((mod) => mod.DevInfo));
const ManagerAvatar = dynamic(() => import('ui').then((mod) => mod.ManagerAvatar));

const ALLOWLIST_COPY = {
  compliance: {
    heading: 'Pass Compliance Checks',
    subheading: "Contact the Compliance Manager to confirm you're compliant",
    admin: 'Compliance Manager',
    adminLabel: 'Conducts compliance checks on Council Members',
    allowed: 'Compliant',
    notAllowed: 'Not compliant',
  },
  selection: {
    heading: 'Be appointed to the council',
    subheading: 'Contact the Council Managers to be appointed',
    admin: 'Council Manager',
    adminLabel: 'Manages the council',
    allowed: 'Selected',
    notAllowed: 'Not selected',
  },
  allowlist: {
    heading: 'Be added to the allowlist',
    subheading: 'Contact the allowlist manager to be added',
    admin: 'Allowlist Manager',
    adminLabel: 'Manages the allowlist',
    allowed: 'Allowed',
    notAllowed: 'Not allowed',
  },
};

export const AllowlistClaims = ({ activeModule }: { activeModule: ModuleDetails }) => {
  const { chainId, isEligibilityRulesLoading } = useEligibility();
  const { data: allowlist, isLoading: isAllowlistLoading } = useAllowlist({
    id: activeModule.instanceAddress,
    chainId,
  });

  const ownerHatId = get(find(get(activeModule, 'liveParameters'), { label: 'Owner Hat' }), 'value') as
    | bigint
    | undefined;

  const { data: ownerHatDetails } = useHatDetails({
    hatId: ownerHatId ? hatIdDecimalToHex(ownerHatId) : undefined,
    chainId,
  });

  const { address } = useAccount();

  const devInfo = useMemo(() => {
    return [
      {
        label: 'Module Address',
        descriptor: (
          <ChakraNextLink href={`${explorerUrl(chainId)}/address/${activeModule.instanceAddress}`} isExternal>
            {formatAddress(activeModule.instanceAddress)}
          </ChakraNextLink>
        ),
      },
    ];
  }, [activeModule.instanceAddress, chainId]);

  const isInAllowlist = includes(map(allowlist, 'address'), toLower(address));
  const isDev = true;

  if (isEligibilityRulesLoading || isAllowlistLoading) {
    return <Skeleton w='full' h='500px' />;
  }
  let copy = ALLOWLIST_COPY.allowlist;

  if (activeModule.instanceAddress === selectionModule) {
    copy = ALLOWLIST_COPY.selection;
  } else if (activeModule.instanceAddress === criteriaModule) {
    copy = ALLOWLIST_COPY.compliance;
  }

  return (
    <Stack>
      <Box py={5} px={10} flex='1' backgroundColor='white' border='1px solid #cbcbcb' minH='500px'>
        <div className='flex items-center justify-between'>
          <h3 className='text-2xl font-bold'>{copy.heading}</h3>

          {isInAllowlist ? (
            <HStack>
              <Text color='green.500'>{copy.allowed}</Text>
              <Icon as={BsCheckSquareFill} color='green.500' />
            </HStack>
          ) : (
            <Button variant='link'>
              <HStack>
                <Text color='red.500'>{copy.notAllowed}</Text>
                <Icon as={BsFillXOctagonFill} color='red' />
              </HStack>
            </Button>
          )}
        </div>

        <div className='flex flex-col gap-4 pt-10'>
          <h4 className='text-xl font-bold'>{copy.subheading}</h4>

          <div className='flex flex-col gap-1'>
            <Text fontWeight='bold'>{copy.admin}</Text>

            <Text fontSize='sm'>{copy.adminLabel}</Text>
          </div>

          {map(get(ownerHatDetails, 'wearers'), (wearer) => (
            <ManagerAvatar manager={wearer} key={wearer.id} />
          ))}
        </div>
      </Box>

      {isDev && (
        <div className='max-w-[300px]'>
          <DevInfo devInfos={devInfo} />
        </div>
      )}
    </Stack>
  );
};
