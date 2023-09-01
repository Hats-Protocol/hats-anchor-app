import {
  Drawer,
  DrawerBody,
  DrawerContent,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import React, { Suspense, useEffect, useState } from 'react';

import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { decimalId, isTopHat, prettyIdToId } from '@/lib/hats';
import { chainsMap } from '@/lib/web3';

import Suspender from './atoms/Suspender';
import Layout from './Layout';

const EventHistory = dynamic(() => import('./EventHistory'));
const HatDrawer = dynamic(() => import('./HatDrawer'));
const OrgChart = dynamic(() => import('./OrgChart'));
const TreeDrawer = dynamic(() => import('./TreeDrawer'));
const TreeMenu = dynamic(() => import('./TreeMenu'));

const Modal = dynamic(() => import('./atoms/Modal'));

const TreePage = () => {
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();
  const localOverlay = useOverlay();
  const {
    chainId,
    treeId,
    selectedHat,
    orgChartTree,
    setSelectedHatId,
    editMode,
    topHat,
    hatDisclosure,
    treeDisclosure,
  } = useTreeForm();

  const {
    onOpen: onOpenHatDrawer,
    onClose: onCloseHatDrawer,
    isOpen: isOpenHatDrawer,
  } = _.pick(hatDisclosure, ['onOpen', 'onClose', 'isOpen']);

  const {
    onOpen: onOpenTreeDrawer,
    onClose: onCloseTreeDrawer,
    isOpen: isOpenTreeDrawer,
  } = _.pick(treeDisclosure, ['onOpen', 'onClose', 'isOpen']);

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

  let title = `Tree #${hatIdDecimalToIp(
    BigInt(prettyIdToId(treeId) || '0'),
  )} on ${chain.name}`;
  if (selectedHat) {
    title = `${isTopHat(selectedHat) ? 'Top ' : ''}Hat #${hatIdDecimalToIp(
      BigInt(_.get(selectedHat, 'id')),
    )} on ${chain.name}`;
  }

  return (
    <>
      <NextSeo
        title={title}
        description={`Tree #${decimalId(treeId)} on ${chain?.name}`}
      />
      <Drawer
        placement='right'
        onClose={() => {
          onCloseHatDrawer?.();
          setSelectedHatId?.(undefined);
        }}
        isOpen={!!orgChartTree && !!isOpenHatDrawer}
      >
        <DrawerContent
          background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
          maxW='43%'
          width='650px'
        >
          <DrawerBody pt={0}>
            <Suspense fallback={<Suspender />}>
              <HatDrawer returnToList={returnToList} />
            </Suspense>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer
        placement='right'
        onClose={() => {
          onCloseTreeDrawer?.();
        }}
        isOpen={!!isOpenTreeDrawer}
      >
        <DrawerContent
          background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
          maxW='43%'
          width='650px'
        >
          <DrawerBody pt={0}>
            <Suspense fallback={<Suspender />}>
              <TreeDrawer />
            </Suspense>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Layout editMode={editMode} hatData={topHat}>
        <TreeMenu treeDisclosure={treeDisclosure} />
        {!_.isEmpty(orgChartTree) ? (
          <Suspense fallback={<Suspender />}>
            <OrgChart />
          </Suspense>
        ) : (
          <Flex justify='center' align='center' w='full' h='full'>
            <Spinner />
          </Flex>
        )}
      </Layout>

      <Suspense fallback={<Suspender />}>
        <Modal
          name='events'
          title='Events'
          size='2xl'
          localOverlay={localOverlay}
        >
          <EventHistory type='tree' />
        </Modal>
      </Suspense>
    </>
  );
};

export default TreePage;
