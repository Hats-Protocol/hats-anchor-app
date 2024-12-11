import { Text } from '@chakra-ui/react';
import { HatWearer } from 'types';
import { formatAddress } from 'utils';
import { useEnsName } from 'wagmi';

export const ManagerAvatar = ({
  manager,
}: {
  manager: HatWearer | undefined;
}) => {
  const { data: ensName } = useEnsName({
    address: manager?.id,
    chainId: 1,
  });

  if (!manager) return null;

  return (
    <div className='flex gap-2'>
      {ensName ? <div>{ensName}</div> : null}

      <Text fontFamily='jbMono' color='gray.500'>
        {formatAddress(manager.id)}
      </Text>
    </div>
  );
};
