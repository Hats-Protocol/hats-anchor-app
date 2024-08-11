'use client';

import { useQuery } from '@tanstack/react-query';
import { useManyHatsDetails } from 'hats-hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { fetchElectionData } from 'utils';
import { useAccount } from 'wagmi';

const useAncillaryElection = ({
  id,
  chainId,
}: {
  id?: string;
  chainId: SupportedChains;
}) => {
  const { address } = useAccount();

  const { data, error, isLoading } = useQuery({
    queryKey: ['electionData', id, chainId],
    queryFn: () => fetchElectionData(id || 'none', chainId),
    enabled: !!id && !!chainId,
  });

  const adminHatId = _.get(data, 'adminHat[0].id');
  const ballotBoxHatId = _.get(data, 'ballotBoxHat.id');

  const hatsDetails = useManyHatsDetails({
    hats: [
      { id: adminHatId, chainId },
      { id: ballotBoxHatId, chainId },
    ],
    initialHats: [
      { id: adminHatId, chainId },
      { id: ballotBoxHatId, chainId },
    ],
  });

  const isWearingAdminHat = useMemo(
    () =>
      _.some(_.get(hatsDetails, 'data[0].wearers'), {
        id: address?.toLocaleLowerCase(),
      }),
    [hatsDetails, address],
  );

  const isWearingBallotBoxHat = useMemo(
    () =>
      _.some(_.get(hatsDetails, 'data[1].wearers'), {
        id: address?.toLocaleLowerCase(),
      }),
    [hatsDetails, address],
  );

  const userRoles: any[] = [];
  if (isWearingAdminHat) userRoles.push('electionsAdmin');
  if (isWearingBallotBoxHat) userRoles.push('electionsBallotBox');

  return {
    data: {
      ...(data || {}),
      userRoles,
    },
    error,
    isLoading,
  };
};

export default useAncillaryElection;
