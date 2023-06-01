import { Link } from '@chakra-ui/react';
import { useEnsName } from 'wagmi';

import { ZERO_ADDRESS } from '@/constants';
import { explorerUrl, formatAddress } from '@/lib/general';

const AddressLink = ({ chainId, address, fullAddress = false }) => {
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
