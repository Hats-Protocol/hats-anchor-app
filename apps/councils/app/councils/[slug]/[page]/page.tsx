import { ModuleChainClaim } from 'modules-ui';
import { redirect } from 'next/navigation';
import { parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { CouncilsDevInfo } from '../../../../components/councils-dev-info';
import { ManagePage } from '../../../../components/manage-page';
import { MembersPage } from '../../../../components/members-page';
// import { SafeAssetsPage } from '../../../../components/safe-assets-page';

const VALID_PAGES = ['transactions', 'join', 'manage', 'members', 'dev', 'assets'];

const CouncilDetails = async ({ params }: { params: Promise<{ slug: string; page: string }> }) => {
  const { slug, page } = await params;
  const { chainId, address } = parseCouncilSlug(slug);

  if (!VALID_PAGES.includes(page)) {
    // Redirect invalid pages to members instead of using the default page
    redirect(`/councils/${slug}/members`);
  }

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

  // this should never be reached due to the VALID_PAGES check above, but incase it does we handle it here with a redirect
  redirect(`/councils/${slug}/members`);
};

export default CouncilDetails;
