'use client';

import { CONFIG, ELIGIBILITY_MODULES } from '@hatsprotocol/config';
import { useQuery } from '@tanstack/react-query';
import { useEligibility } from 'contexts';
import { get } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import { BsDownload } from 'react-icons/bs';
import { FiExternalLink } from 'react-icons/fi';
import { Button, cn, Link, Skeleton } from 'ui';
import { eligibilityRuleToModuleDetails, fetchIpfs, hatLink } from 'utils';

const AgreementContent = dynamic(() => import('molecules').then((mod) => mod.AgreementContent));

const handleFetchIpfs = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: unknown) => {
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
    });
};

export const ClaimsHelperButtons = ({ stackVertically = false }: ClaimsHelperButtonsProps) => {
  const { selectedHat, chainId, activeRule, isHatDetailsLoading, isEligibilityRulesLoading } = useEligibility();
  const link = hatLink({ hatId: selectedHat?.id, chainId });
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);
  // TODO use last rule to complete rather than active rule

  const hasAgreement =
    selectedHat?.id === CONFIG.agreementV0.communityHatId || moduleDetails?.name === ELIGIBILITY_MODULES.agreement;

  const { agreement } = useAgreementClaim({
    moduleParameters: moduleDetails?.liveParameters,
  });

  const { data: agreementV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });

  const handleDownload = useCallback(() => {
    const newWindow = window.open('', '_blank');
    const markdownContent = <AgreementContent agreement={agreement || agreementV0} />;
    const htmlString = ReactDOMServer.renderToStaticMarkup(markdownContent);

    if (!newWindow) return;

    newWindow.document.write(htmlString);
    newWindow.document.close();

    newWindow.onload = () => {
      newWindow.focus();
      newWindow.print();
      newWindow.close();
    };
  }, [agreement, agreementV0]);

  if (!isHatDetailsLoading && !isEligibilityRulesLoading) {
    return <Skeleton />;
  }

  return (
    <div className={cn('flex flex-row', stackVertically && 'flex-col')}>
      <Link href={link} isExternal>
        <Button variant='outline' className='hidden md:flex'>
          View full role
          <FiExternalLink className='ml-1 size-4' />
        </Button>
      </Link>

      {hasAgreement && (
        <Button onClick={handleDownload} variant='outline'>
          <BsDownload className='size-4' />
          Download agreement
        </Button>
      )}
    </div>
  );
};

interface ClaimsHelperButtonsProps {
  stackVertically?: boolean;
}
