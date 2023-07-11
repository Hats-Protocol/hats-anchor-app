import { Icon, Link } from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { explorerUrl } from '@/lib/web3';

const TransactionLink = ({ chainId, tx }: { chainId: number; tx: string }) => {
  return (
    <Link isExternal href={`${explorerUrl(chainId)}/tx/${tx}`}>
      <Icon as={FaExternalLinkAlt} />
    </Link>
  );
};

export default TransactionLink;
