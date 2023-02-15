import { Link } from '@chakra-ui/react';
import { explorerUrl } from '../lib/general';

const AddressLink = ({ chainId, address }) => (
  <Link href={`${explorerUrl(chainId)}/address/${address}`}>{address}</Link>
);

export default AddressLink;
