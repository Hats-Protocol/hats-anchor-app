'use client';

import { CONFIG, ELIGIBILITY_MODULES } from '@hatsprotocol/config';
import { useQuery } from '@tanstack/react-query';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { get } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import { AgreementContent } from 'molecules';
import { useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Link } from 'ui';
import { eligibilityRuleToModuleDetails, fetchIpfs, hatLink } from 'utils';

import { ClaimsHelperButtons } from './claims-helper-buttons';

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

export const BottomMoreMenu = () => {
  const { selectedHat, chainId, activeRule } = useEligibility();
  // TODO use last rule to complete rather than active rule
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);
  const { isMobile } = useMediaStyles();
  const link = hatLink({ hatId: selectedHat?.id, chainId });

  const hasAgreement =
    selectedHat?.id === CONFIG.agreementV0.communityHatId || moduleDetails?.name === ELIGIBILITY_MODULES.agreement; // TODO match on implementation address/module key

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
      // newWindow.print();
      // newWindow.close();
    };
  }, [agreement, agreementV0]);

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className='block md:hidden' asChild>
          <Button variant='outline' className='flex'>
            <p>More</p>
            <BsThreeDotsVertical className='ml-1 size-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <Link href={link} isExternal>
            <DropdownMenuItem className='text-black/80 hover:bg-black/10'>View full role</DropdownMenuItem>
          </Link>

          {hasAgreement && (
            <DropdownMenuItem className='cursor-pointer' onClick={handleDownload}>
              Download Agreement
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <ClaimsHelperButtons />;
};
