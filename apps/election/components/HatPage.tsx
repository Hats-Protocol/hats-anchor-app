import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { chainsMap } from 'app-utils';
import { isTopHat } from 'hats-utils';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import React from 'react';
import { prettyIdToId } from 'shared-utils';

import { useTreeForm } from '../contexts/EligibilityContext';
import Suspender from './atoms/Suspender';
import Layout from './Layout';

const HatDrawer = dynamic(() => import('./HatDrawer'), {
  loading: () => <Suspender />,
});

const HatPage = () => {
  const {
    chainId,
    treeId,
    selectedHat,
    selectedHatDetails,
    topHat,
    topHatDetails,
  } = useTreeForm();

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
    <Layout hatData={topHat}>
      <NextSeo title={title} />
      <HatDrawer />
    </Layout>
  );
};

export default HatPage;
