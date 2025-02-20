import { ModuleChainClaim } from 'modules-ui';
import { parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { CouncilsDevInfo } from '../../../../components/councils-dev-info';
import { ManagePage } from '../../../../components/manage-page';
import { MembersPage } from '../../../../components/members-page';
import { SafeAssetsPage } from '../../../../components/safe-assets-page';

const CouncilDetails = async ({ params }: { params: Promise<{ slug: string; page: string }> }) => {
  const { slug, page } = await params;
  // TODO identifier could be ID in database, slug or chainId/hsg
  const { chainId, address } = parseCouncilSlug(slug);

  if (page === 'transactions') {
    return <div>Transactions</div>;
  }

  if (page === 'join') {
    return <ModuleChainClaim chainId={chainId || undefined} address={address as Hex} />;
  }

  if (page === 'manage') {
    return <ManagePage slug={slug} />;
  }

  if (page === 'members') {
    return <MembersPage slug={slug} />;
  }

  if (page === 'dev') {
    return <CouncilsDevInfo slug={slug} />;
  }

  if (!address) return null;

  // Default is assets
  return <SafeAssetsPage chainId={chainId ?? 11155111} hsg={address as Hex} />;
};

export default CouncilDetails;
