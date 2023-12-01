/* eslint-disable no-nested-ternary */
import {
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Slide,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import React, { useEffect, useState } from 'react';
import { BsArrowRight } from 'react-icons/bs';

import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { chainsMap } from '@/lib/chains';
import { isTopHat, prettyIdToId } from '@/lib/hats';

import ChakraNextLink from './atoms/ChakraNextLink';
import Suspender from './atoms/Suspender';
import Layout from './Layout';

const EventHistory = dynamic(() => import('./EventHistory'), {
  loading: () => <Suspender />,
});
const HatDrawer = dynamic(() => import('./HatDrawer'), {
  loading: () => <Suspender />,
});
const OrgChart = dynamic(() => import('./OrgChart'), {
  loading: () => <Suspender />,
});
const TreeDrawer = dynamic(() => import('./TreeDrawer'), {
  loading: () => <Suspender />,
});
const TreeMenu = dynamic(() => import('./TreeMenu'), {
  loading: () => <Suspender />,
});
const Modal = dynamic(() => import('./atoms/Modal'), {
  loading: () => <Suspender />,
});

const TreePage = ({ exists = true }: { exists: boolean }) => {
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();
  const localOverlay = useOverlay();
  const {
    chainId,
    treeId,
    selectedHat,
    selectedHatDetails,
    treeToDisplay,
    editMode,
    topHat,
    topHatDetails,
    hatDisclosure,
    treeDisclosure,
  } = useTreeForm();

  const {
    onOpen: onOpenHatDrawer,
    onClose: onCloseHatDrawer,
    isOpen: isOpenHatDrawer,
  } = _.pick(hatDisclosure, ['onOpen', 'onClose', 'isOpen']);

  const { onOpen: onOpenTreeDrawer, isOpen: isOpenTreeDrawer } = _.pick(
    treeDisclosure,
    ['onOpen', 'onClose', 'isOpen'],
  );

  const returnToList = () => {
    onOpenTreeDrawer?.();
    onCloseHatDrawer?.();
  };

  useEffect(() => {
    const routerHatId = _.get(router, 'query.hatId');
    if (initialLoad && !routerHatId && selectedHat && !editMode) {
      onOpenHatDrawer?.();
      setInitialLoad(false);
    }
  }, [selectedHat, router, onOpenHatDrawer, editMode, initialLoad]);

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = '';
  const prettyId = prettyIdToId(treeId);
  if (_.isFinite(_.toNumber(prettyId))) {
    title = `Tree #${hatIdDecimalToIp(BigInt(prettyId))} on ${chain.name}`;
  } else {
    title = 'Invalid Tree ID';
  }
  if (!selectedHat && topHatDetails) {
    title = `${topHatDetails.name} on ${chain.name}`;
  } else if (selectedHat) {
    if (selectedHatDetails) {
      title = `${selectedHatDetails.name} on ${chain.name}`;
    } else {
      title = `${isTopHat(selectedHat) ? 'Top ' : ''}Hat #${hatIdDecimalToIp(
        BigInt(_.get(selectedHat, 'id')),
      )} on ${chain.name}`;
    }
  }

  return (
    <>
      <NextSeo title={title} />
      <Slide
        direction='right'
        in={!!treeToDisplay && !!isOpenHatDrawer}
        style={{ zIndex: 1000, maxWidth: '43%', width: '650px' }}
      >
        <HatDrawer returnToList={returnToList} />
      </Slide>

      <Slide
        direction='right'
        in={!!isOpenTreeDrawer}
        style={{ zIndex: 1000, maxWidth: '43%', width: '650px' }}
      >
        <TreeDrawer />
      </Slide>

      <Layout editMode={editMode} hatData={topHat}>
        {exists ? (
          <>
            <TreeMenu treeDisclosure={treeDisclosure} />
            {_.isEmpty(treeToDisplay) ? (
              <Flex justify='center' align='center' w='full' h='full'>
                <Spinner />
              </Flex>
            ) : (
              <OrgChart />
            )}
          </>
        ) : (
          <Flex justify='center' align='center' w='full' h='full' pt={20}>
            <Stack spacing={8} align='center'>
              <Heading size='md'>Tree not found!</Heading>
              <Image src='/no-hats.jpg' alt='No hats found' h='600px' />
              <Flex>
                <ChakraNextLink href='/'>
                  <Button
                    variant='outline'
                    rightIcon={<Icon as={BsArrowRight} />}
                  >
                    🧢 Head home
                  </Button>
                </ChakraNextLink>
              </Flex>
            </Stack>
          </Flex>
        )}
      </Layout>

      <Modal
        name='events'
        title='Events'
        size='2xl'
        localOverlay={localOverlay}
      >
        <EventHistory type='tree' />
      </Modal>
    </>
  );
};

export default TreePage;
