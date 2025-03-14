import { ORDERED_CHAINS } from '@hatsprotocol/config';
import { ModuleChainClaim } from 'modules-ui';
import { redirect } from 'next/navigation';
import { SupportedChains } from 'types';
import { Alert, AlertDescription, AlertTitle } from 'ui';
import { parseCouncilSlug } from 'utils';
import { getAddress, type Hex, isAddress } from 'viem';

import { CouncilsDevInfo } from '../../../../components/councils-dev-info';
import { ManagePage } from '../../../../components/manage-page';
import { MembersPage } from '../../../../components/members-page';
// import { SafeAssetsPage } from '../../../../components/safe-assets-page';

//TODO: Add 'transactions' and 'assets' pages back in when they are done -- we have tickets for these
//TODO: Refine the ErrorPage UI -- we can also add a global error page at some point
const VALID_PAGES = ['join', 'manage', 'members', 'dev'];

interface ErrorPageProps {
  title: string;
  description: string;
}

const ErrorPage = ({ title, description }: ErrorPageProps) => {
  return (
    <div className='p-20'>
      <Alert variant='default' className='mx-auto max-w-lg'>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
};

const CouncilDetails = async ({ params }: { params: Promise<{ slug: string; page: string }> }) => {
  const { slug, page } = await params;
  const { chainId, address } = parseCouncilSlug(slug);

  // validate chain ID
  const isValidChain = chainId && ORDERED_CHAINS.includes(chainId as SupportedChains);
  if (!isValidChain) {
    return (
      <ErrorPage
        title='Invalid Chain'
        description='The specified chain is not supported. Please check that you are using a supported network.'
      />
    );
  }

  // validate and convert address
  let validatedAddress: Hex;
  try {
    if (!address || !isAddress(address)) {
      return (
        <ErrorPage
          title='Invalid Address'
          description='The specified address is not valid. Please check that you are using a valid Ethereum address.'
        />
      );
    }
    // ensure we have a properly formatted hex address
    validatedAddress = getAddress(address) as `0x${string}`;
  } catch (error) {
    return (
      <ErrorPage
        title='Invalid Address'
        description='The specified address is not valid. Please check that you are using a valid Ethereum address.'
      />
    );
  }

  if (!VALID_PAGES.includes(page)) {
    // redirect invalid pages to members instead of using the default page
    redirect(`/councils/${slug}/members`);
  }

  if (page === 'join') {
    return <ModuleChainClaim chainId={chainId || undefined} address={validatedAddress} />;
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
