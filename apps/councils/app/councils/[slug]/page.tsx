import { ORDERED_CHAINS } from '@hatsprotocol/config';
import { redirect } from 'next/navigation';
import { SupportedChains } from 'types';
import { parseCouncilSlug } from 'utils';
import { isAddress } from 'viem';

// Canonical Slug is `chainName:hsg` with support for `chainId` and `safe` as well
const CouncilPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const { chainId, address } = parseCouncilSlug(slug);

  // check for valid chain id that we support:
  const isValidChain = chainId && ORDERED_CHAINS.includes(chainId as SupportedChains);

  // check for valid address format:
  const isValidAddress = address && isAddress(address);

  // if either chain or address is invalid, redirect to councils page with error in searchParams
  if (!isValidChain || !isValidAddress) {
    const searchParams = new URLSearchParams();
    if (!isValidChain) searchParams.append('error', 'invalid_chain');
    if (!isValidAddress) searchParams.append('error', 'invalid_address');
    return redirect(`/councils?${searchParams.toString()}`);
  }

  // TODO handle chain name in slug, prefer name in canonical url
  // if both are valid redirect to council members page
  return redirect(`/councils/${chainId}:${address}/members`); // TODO return to transactions when relevant
};

export default CouncilPage;
