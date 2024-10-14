'use client';

import { Button, HStack, Icon, Skeleton } from '@chakra-ui/react';
import { CONFIG, ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { useEligibility } from 'contexts';
import { get } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import { AgreementContent } from 'molecules';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import { BsDownload } from 'react-icons/bs';
import { FiExternalLink } from 'react-icons/fi';
import { fetchIpfs, hatLink } from 'utils';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

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

export const ClaimsHelperButtons = ({
  stackVertically = false,
}: ClaimsHelperButtonsProps) => {
  const {
    selectedHat,
    chainId,
    moduleDetails,
    moduleParameters,
    isHatDetailsLoading,
    isModuleDetailsLoading,
  } = useEligibility();
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

  return (
    <Skeleton isLoaded={!isHatDetailsLoading && !isModuleDetailsLoading}>
      <HStack flexDir={stackVertically ? 'column' : 'row'}>
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
    </Skeleton>
  );
};

interface ClaimsHelperButtonsProps {
  stackVertically?: boolean;
}
