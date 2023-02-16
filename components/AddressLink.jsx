import { Link } from '@chakra-ui/react';
import { explorerUrl, formatAddress } from '../lib/general';

const AddressLink = ({ chainId, address, fullAddress = false }) => (
  <Link href={`${explorerUrl(chainId)}/address/${address}`}>
    {fullAddress ? address : formatAddress(address)}
  </Link>
);

export default AddressLink;
