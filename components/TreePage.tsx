import { Flex, Slide, Spinner } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import React, { Suspense, useEffect, useState } from 'react';

import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useTransactions from '@/hooks/useTransactions';
import { isTopHat, prettyIdToId } from '@/lib/hats';
import { chainsMap } from '@/lib/web3';
import { Transaction } from '@/types';

import Suspender from './atoms/Suspender';
import Layout from './Layout';

const EventHistory = dynamic(() => import('./EventHistory'));
const HatDrawer = dynamic(() => import('./HatDrawer'));
const OrgChart = dynamic(() => import('./OrgChart'), {
  loading: () => <Suspender />,
});
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
    selectedHatDetails,
    treeToDisplay,
    editMode,
    topHat,
    topHatDetails,
    hatDisclosure,
    treeDisclosure,
  } = useTreeForm();
  const { transactions, clearCompletedTransactions } = useTransactions();

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

  // might need tweaking.this is to clear any pending transactions after a refresh
  // could make a timeout of 10 seconds or something
  useEffect(() => {
    _.forEach(transactions, (tx: Transaction) => {
      if (tx.status === 'completed') {
        clearCompletedTransactions();
      }
    });
  }, []);

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = `Tree #${hatIdDecimalToIp(
    BigInt(prettyIdToId(treeId) || '0'),
  )} on ${chain.name}`;
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
        <Suspense fallback={<Suspender />}>
          <HatDrawer returnToList={returnToList} />
        </Suspense>
      </Slide>

      <Slide
        direction='right'
        in={!!isOpenTreeDrawer}
        style={{ zIndex: 1000, maxWidth: '43%', width: '650px' }}
      >
        <Suspense fallback={<Suspender />}>
          <TreeDrawer />
        </Suspense>
      </Slide>

      <Layout editMode={editMode} hatData={topHat}>
        <TreeMenu treeDisclosure={treeDisclosure} />
        {!_.isEmpty(treeToDisplay) ? (
          <OrgChart />
        ) : (
          <Flex justify='center' align='center' w='full' h='full'>
            <Spinner />
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
