import { redirect } from 'next/navigation';
import { parseCouncilSlug } from 'utils';

// Canonical Slug is `chainName:hsg` with support for `chainId` and `safe` as well
const CouncilPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const { chainId, address } = parseCouncilSlug(slug);
  if (!chainId || !address) return redirect('/councils');

  // TODO handle chain name in slug, prefer name in canonical url
  return redirect(`/councils/${chainId}:${address}/members`); // TODO return to transactions when relevant
};

export default CouncilPage;
