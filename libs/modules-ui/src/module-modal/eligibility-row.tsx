import { Checkbox, Flex, HStack, Icon, Image, Text } from '@chakra-ui/react';
import { get, includes, map, toLower } from 'lodash';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import { AllowlistProfile, HatWearer } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useEnsAvatar } from 'wagmi';

const WearerIcon = dynamic(() => import('icons').then((mod) => mod.WearerIcon));

const AddressProfile = ({
  eligibilityAccount,
  ensAvatar,
  isCurrentUser,
  color,
}: {
  eligibilityAccount: AllowlistProfile;
  ensAvatar: string | undefined;
  isCurrentUser: boolean;
  color: string;
}) => (
  <HStack color={color} bg={isCurrentUser ? 'green.100' : 'transparent'}>
    {ensAvatar ? (
      <Image
        w={{ base: '11px', md: 3 }}
        h={{ base: '14px', md: 4 }}
        ml='2px'
        mr={{ base: '1px', md: 1 }} // sometimes only ml? oh when the current user isn't a wearer in the list?
        src={ensAvatar}
        borderRadius='2px'
        objectFit='cover'
      />
    ) : (
      <Icon as={WearerIcon} boxSize={{ base: '14px', md: 4 }} />
    )}
    <Text size='sm'>
      {eligibilityAccount.ensName || formatAddress(eligibilityAccount.id)}
    </Text>
  </HStack>
);

export const EligibilityRow = ({
  eligibilityAccount,
  wearers,
  updating,
  updateList,
  handleAdd,
  handleRemove,
}: {
  eligibilityAccount: AllowlistProfile;
  wearers: HatWearer[] | undefined;
  updating?: boolean;
  updateList?: AllowlistProfile[] | undefined;
  handleAdd?: (account: Hex) => void;
  handleRemove?: (address: Hex) => void;
}) => {
  const { address } = useAccount();
  const { data: ensAvatar } = useEnsAvatar({
    name: get(eligibilityAccount, 'ensName') || undefined,
    chainId: 1,
  });
  const isWearer = includes(map(wearers, 'id'), eligibilityAccount.id);
  const isCurrentUser = toLower(address) === toLower(eligibilityAccount.id);

  let color = 'Informative-Human';
  if (isCurrentUser) color = 'green.800';
  if (eligibilityAccount.isContract) color = 'Informative-Code';
  const isChecked = includes(map(updateList, 'id'), eligibilityAccount.id);

  const handleRemoveToggle = useCallback(() => {
    if (isChecked) {
      handleRemove?.(eligibilityAccount.id);
    } else {
      handleAdd?.(eligibilityAccount.id);
    }
  }, [isChecked, handleAdd, handleRemove, eligibilityAccount.id]);

  return (
    <Flex justify='space-between'>
      {updating ? (
        <Checkbox isChecked={isChecked} onChange={handleRemoveToggle}>
          <AddressProfile
            eligibilityAccount={eligibilityAccount}
            ensAvatar={ensAvatar || undefined}
            isCurrentUser={isCurrentUser}
            color={color}
          />
        </Checkbox>
      ) : (
        <AddressProfile
          eligibilityAccount={eligibilityAccount}
          ensAvatar={ensAvatar || undefined}
          isCurrentUser={isCurrentUser}
          color={color}
        />
      )}

      <HStack spacing={1} color={isWearer ? 'Informative-Human' : 'gray.500'}>
        <Text size='sm'>{isWearer ? 'Wearer' : 'Unclaimed'}</Text>
      </HStack>
    </Flex>
  );
};
