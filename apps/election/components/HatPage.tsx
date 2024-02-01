import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Suspender } from 'app-components';
import { chainsMap } from 'app-utils';
import { isTopHat } from 'hats-utils';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import React from 'react';
import { prettyIdToId } from 'shared-utils';

import { useEligibility } from '../contexts/EligibilityContext';
import Layout from './Layout';

const Election = dynamic(() => import('./Election'), {
  loading: () => <Suspender />,
});

const HatPage = () => {
  const { chainId, treeId, selectedHat, selectedHatDetails } = useEligibility();

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = '';
  const prettyId = prettyIdToId(treeId);
  if (_.isFinite(_.toNumber(prettyId))) {
    title = `Tree #${hatIdDecimalToIp(BigInt(prettyId))} on ${chain.name}`;
  } else {
    title = 'Invalid Tree ID';
  }
  if (selectedHat) {
    if (selectedHatDetails) {
      title = `${selectedHatDetails.name} on ${chain.name}`;
    } else {
      title = `${isTopHat(selectedHat) ? 'Top ' : ''}Hat #${hatIdDecimalToIp(
        BigInt(_.get(selectedHat, 'id')),
      )} on ${chain.name}`;
    }
  }

  return (
    <Layout hatData={selectedHat}>
      <NextSeo title={title} />
      <Election />
    </Layout>
  );
};

export default HatPage;
