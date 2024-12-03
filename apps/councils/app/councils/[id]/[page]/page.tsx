// import { CouncilsContextProvider } from 'contexts';
// import { compact, concat, find, get, last, map, toLower } from 'lodash';
// import { getCouncilData, getHatsDetails } from 'utils';
import { last } from 'lodash';
import { Hex } from 'viem';

import SafeAssetsPage from '../../../../components/safe-assets-page';

const CouncilDetails = async ({
  params: { id, page },
}: {
  params: { id: string; page: string };
}) => {
  // TODO identifier could be ID in database, slug or chainId/hsg
  const address = last(id?.split('%3A'));

  if (page === 'transactions') {
    return <div>Transactions</div>;
  }

  if (page === 'manage') {
    return <div>Manage</div>;
  }

  if (page === 'members') {
    return <div>Members</div>;
  }

  if (!address) return null;

  // Default is assets
  return <SafeAssetsPage chainId={11155111} hsg={address as Hex} />;
};

export default CouncilDetails;
