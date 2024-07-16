'use client';

import { Box, Flex, Icon, Text, Tooltip } from '@chakra-ui/react';
import { useClipboard, useSafeDetails } from 'hooks';
import {
  get,
  includes,
  map,
  pick,
  reject,
  size,
  toLower,
  toNumber,
} from 'lodash';
import dynamic from 'next/dynamic';
import { BsInfoCircle } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import { AppHat, HSGConfig, SupportedChains } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

const InlineHatCard = dynamic(() =>
  import('molecules').then((mod) => mod.InlineHatCard),
);
const CodeIcon = dynamic(() => import('icons').then((m) => m.CodeIcon));

// TODO handle MHSG

interface SignatureThresholdProps {
  hsgConfig: HSGConfig;
  activeOwners: Hex[];
}

const SignatureThreshold = ({
  hsgConfig,
  activeOwners,
}: SignatureThresholdProps) => {
  const { minThreshold, targetThreshold } = pick(hsgConfig, [
    'minThreshold',
    'targetThreshold',
  ]);

  if (size(activeOwners) < toNumber(minThreshold)) {
    return <div>{hsgConfig.minThreshold}</div>;
  }
  if (size(activeOwners) >= toNumber(targetThreshold)) {
    return <div>{hsgConfig.targetThreshold}</div>;
  }

  return (
    <div className='flex gap-2'>
      <div className='flex gap-1 items-center'>
        <div>{size(activeOwners)}</div>

        <div className='flex gap-1'>
          <div>({minThreshold}</div>
          <Icon as={FiArrowRight} />
          <div>{targetThreshold})</div>
        </div>
      </div>

      <Tooltip
        label={`Between ${minThreshold} and ${targetThreshold} signers, all will be required to execute transactions`}
        placement='left'
        hasArrow
      >
        <Box h={4}>
          <Icon as={BsInfoCircle} boxSize={4} />
        </Box>
      </Tooltip>
    </div>
  );
};

const HSGDetails = ({ selectedHat, hsgConfig, chainId }: HSGDetailsProps) => {
  const { minThreshold, maxSigners } = pick(hsgConfig, [
    'minThreshold',
    'maxSigners',
  ]);
  const { data: safeOwners } = useSafeDetails({
    safeAddress: get(hsgConfig, 'safe'),
    chainId,
  });
  const { onCopy } = useClipboard(get(hsgConfig, 'safe') || '', {
    toastData: { title: 'Safe address copied', status: 'info' },
  });
  const activeOwners = reject(
    safeOwners,
    (owner: Hex) =>
      !includes(
        map(selectedHat?.wearers, (w) => toLower(w.id)),
        toLower(owner),
      ),
  );
  const ownerHatId = get(hsgConfig, 'ownerHat.id');

  if (!hsgConfig || !chainId || !selectedHat?.id) return null;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between'>
        <div>Signers</div>

        <InlineHatCard hatId={selectedHat.id} chainId={chainId} />
      </div>

      <div className='flex justify-between'>
        <div>Signature Threshold</div>

        <SignatureThreshold hsgConfig={hsgConfig} activeOwners={activeOwners} />
      </div>

      {size(activeOwners) < toNumber(minThreshold) && (
        <div className='flex justify-between'>
          <div>Current Signers</div>

          <div>{size(activeOwners)}</div>
        </div>
      )}

      <div className='flex justify-between'>
        <div>Max Signers</div>

        <div>{maxSigners}</div>
      </div>

      {ownerHatId && (
        <div className='flex justify-between'>
          <div>Owner</div>

          <InlineHatCard hatId={ownerHatId} chainId={chainId} />
        </div>
      )}

      <div className='flex justify-between'>
        <div>Safe Address</div>

        <Flex
          gap={1}
          color='Informative-Code'
          alignItems='center'
          _hover={{ cursor: 'pointer' }}
          onClick={onCopy}
        >
          <Text>{formatAddress(hsgConfig?.safe)}</Text>
          <Icon as={CodeIcon} />
        </Flex>
      </div>
    </div>
  );
};

interface HSGDetailsProps {
  hsgConfig: HSGConfig;
  selectedHat: AppHat | undefined;
  chainId: SupportedChains | undefined;
}

export default HSGDetails;
