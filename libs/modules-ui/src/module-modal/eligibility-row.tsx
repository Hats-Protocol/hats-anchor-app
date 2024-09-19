import { Checkbox, Flex, HStack, Icon, Image, Text } from '@chakra-ui/react';
import { get, includes, map } from 'lodash';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import { AllowlistProfile, HatWearer } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar } from 'wagmi';

const WearerIcon = dynamic(() => import('icons').then((mod) => mod.WearerIcon));

export const EligibilityRow = ({
  eligibilityAccount,
  wearers,
  removing,
  removeList,
  handleAdd,
  handleRemove,
}: {
  eligibilityAccount: AllowlistProfile;
  wearers: HatWearer[] | undefined;
  removing: boolean;
  removeList: AllowlistProfile[] | undefined;
  handleAdd: (account: Hex) => void;
  handleRemove: (address: Hex) => void;
}) => {
  const { data: ensAvatar } = useEnsAvatar({
    name: get(eligibilityAccount, 'ensName') || undefined,
    chainId: 1,
  });
  const isWearer = includes(map(wearers, 'id'), eligibilityAccount.id);

  let color = 'Informative-Human';
  if (eligibilityAccount.isContract) color = 'Informative-Code';
  const isChecked = includes(map(removeList, 'id'), eligibilityAccount.id);

  const handleRemoveToggle = useCallback(() => {
    if (isChecked) {
      handleRemove(eligibilityAccount.id);
    } else {
      handleAdd(eligibilityAccount.id);
    }
  }, [isChecked, handleAdd, handleRemove, eligibilityAccount.id]);

  const AddressProfile = () => (
    <HStack color={color}>
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

  return (
    <Flex justify='space-between'>
      {removing ? (
        <Checkbox isChecked={isChecked} onChange={handleRemoveToggle}>
          <AddressProfile />
        </Checkbox>
      ) : (
        <AddressProfile />
      )}

      <HStack spacing={1} color={isWearer ? 'Informative-Human' : 'gray.500'}>
        <Text size='sm'>{isWearer ? 'Wearer' : 'Unclaimed'}</Text>
      </HStack>
    </Flex>
  );
};
