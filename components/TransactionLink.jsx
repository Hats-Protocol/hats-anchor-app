import { Icon, Link } from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { explorerUrl } from '../lib/general';

const TransactionLink = ({ chainId, tx }) => {
  return (
    <Link isExternal href={`${explorerUrl(chainId)}/tx/${tx}`}>
      <Icon as={FaExternalLinkAlt} />
    </Link>
  );
};

export default TransactionLink;
