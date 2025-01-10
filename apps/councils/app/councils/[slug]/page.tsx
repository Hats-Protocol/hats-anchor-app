import { redirect } from 'next/navigation';
import { parseCouncilSlug } from 'utils';

const CouncilPage = ({ params: { slug } }: { params: { slug: string } }) => {
  const { chainId, address } = parseCouncilSlug(slug);
  if (!chainId || !address) return redirect('/councils');

  return redirect(`/councils/${chainId}:${address}/transactions`);
};

export default CouncilPage;
