'use client';

import { Button, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { CONFIG, ELIGIBILITY_MODULES } from '@hatsprotocol/config';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { get } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import { AgreementContent } from 'molecules';
import { useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Link } from 'ui';
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
      newWindow.print();
      newWindow.close();
    };
  }, [agreement, agreementV0]);

  if (isMobile) {
    return (
      <Menu>
        <MenuButton
          as={Button}
          variant='outline'
          rightIcon={<Icon as={BsThreeDotsVertical} boxSize={4} />}
          display={{ base: 'flex', md: 'none' }}
        >
          More
        </MenuButton>
        <MenuList>
          <Link href={link} isExternal>
            <MenuItem>View full role</MenuItem>
          </Link>

          {hasAgreement && <MenuItem onClick={handleDownload}>Download Agreement</MenuItem>}
        </MenuList>
      </Menu>
    );
  }

  return <ClaimsHelperButtons />;
};
