'use client';

import { Flex, HStack, Image, Text } from '@chakra-ui/react';
import { useHatDetails } from 'hats-hooks';
import { useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { get } from 'lodash';
import { useParams, usePathname } from 'next/navigation';
import { SupportedChains } from 'types';
import { Link } from 'ui';
import { logger, parseCouncilSlug } from 'utils';

import Login from './login';

export const Navbar = () => {
  const pathname = usePathname();
  const { slug } = useParams<{ slug: string }>();
  const { chainId, address } = parseCouncilSlug(slug);
  const isJoinLink = pathname.includes('join');

  const { data: councilDetails } = useCouncilDetails({
    chainId: chainId as SupportedChains,
    address,
  });
  const { data: offchainDetails } = useOffchainCouncilDetails({
    chainId: chainId as SupportedChains,
    hsg: address,
  });
  const { details } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: get(councilDetails, 'signerHats[0].id'),
  });
  logger.debug('nav', { offchainDetails, details });

  return (
    <Flex w='100%' justify='space-between' align='center' zIndex={10} px={2} minH='56px'>
      <HStack spacing={4}>
        <Link href='/'>
          <Image src='/hats.png' boxSize={10} alt='Hats Logo' />
        </Link>

        {isJoinLink ? (
          <Text size='lg' fontWeight='bold'>
            Join {offchainDetails?.creationForm.councilName || details?.name}
          </Text>
        ) : null}
      </HStack>

      <Login />
    </Flex>
  );
};
