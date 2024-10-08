'use client';

import {
  Button,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { CONFIG, ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { get } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import { useCallback } from 'react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { BsDownload, BsThreeDotsVertical } from 'react-icons/bs';
import { FiExternalLink } from 'react-icons/fi';
import { ChakraNextLink } from 'ui';
import { fetchIpfs } from 'utils';
import { hatLink } from 'utils';

import { AgreementContent } from '../agreement-content';

const handleFetchIpfs: any = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: any) => {
      console.log('res', res);
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      console.error(err);
      return null;
    });
};

export const BottomMoreMenu = () => {
  const { selectedHat, chainId, moduleDetails, moduleParameters } =
    useEligibility();
  const { isMobile } = useMediaStyles();
  const link = hatLink({ hatId: selectedHat?.id, chainId });

  const hasAgreement =
    selectedHat?.id === CONFIG.agreementV0.communityHatId ||
    moduleDetails?.name === ELIGIBILITY_MODULES.agreement;

  const { agreement } = useAgreementClaim({ moduleParameters });

  const { data: agreementV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });

  const handleDownload = useCallback(() => {
    const newWindow = window.open('', '_blank');
    const markdownContent = (
      <AgreementContent agreement={agreement || agreementV0} />
    );
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
          <ChakraNextLink href={link} isExternal>
            <MenuItem>View full role</MenuItem>
          </ChakraNextLink>

          {hasAgreement && (
            <MenuItem onClick={handleDownload}>Download Agreement</MenuItem>
          )}
        </MenuList>
      </Menu>
    );
  }

  return (
    <HStack>
      <ChakraNextLink href={link} isExternal>
        <Button
          variant='outline'
          rightIcon={<Icon as={FiExternalLink} boxSize={4} />}
          display={{ base: 'none', md: 'flex' }}
        >
          View full role
        </Button>
      </ChakraNextLink>

      {hasAgreement && (
        <Button
          onClick={handleDownload}
          variant='outline'
          leftIcon={<Icon as={BsDownload} />}
        >
          Download agreement
        </Button>
      )}
    </HStack>
  );
};
