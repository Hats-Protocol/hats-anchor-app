// import { CouncilsContextProvider } from 'contexts';
// import { compact, concat, find, get, last, map, toLower } from 'lodash';
// import { getCouncilData, getHatsDetails } from 'utils';
import { parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import ManagePage from '../../../../components/manage-page';
import MembersPage from '../../../../components/members-page';
import SafeAssetsPage from '../../../../components/safe-assets-page';

const CouncilDetails = async ({
  params: { slug, page },
}: {
  params: { slug: string; page: string };
}) => {
  // TODO identifier could be ID in database, slug or chainId/hsg
  const { chainId, address } = parseCouncilSlug(slug);

  if (page === 'transactions') {
    return <div>Transactions</div>;
  }

  if (page === 'manage') {
    return <ManagePage slug={slug} />;
  }

  if (page === 'members') {
    return <MembersPage slug={slug} />;
  }

  if (page === 'dev') {
    return <div>Dev</div>;
  }

  if (!address) return null;

  // Default is assets
  return <SafeAssetsPage chainId={chainId ?? 11155111} hsg={address as Hex} />;
};

export default CouncilDetails;
