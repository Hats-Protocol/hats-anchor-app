import { Link } from '@chakra-ui/react';
import { useEnsName } from 'wagmi';

import { ZERO_ADDRESS } from '@/constants';
import { formatAddress } from '@/lib/general';
import { explorerUrl } from '@/lib/web3';

const AddressLink = ({
  chainId,
  address,
  fullAddress = false,
}: {
  chainId: number;
  address: `0x${string}`;
  fullAddress?: boolean;
}) => {
  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    enabled: address !== ZERO_ADDRESS,
  });

  return (
    <Link href={`${explorerUrl(chainId)}/address/${address}`}>
      {fullAddress ? address : ensName || formatAddress(address)}
    </Link>
  );
};

export default AddressLink;
