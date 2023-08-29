/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Hex } from 'viem';

import { FALLBACK_ADDRESS, MUTABILITY, TRIGGER_OPTIONS } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { decimalId, getDefaultAdminId } from '@/lib/hats';
import { handleDetailsPin } from '@/lib/ipfs';
import { createHatsClient } from '@/lib/web3';
import { hasDetailsChanged } from './useMulticallManyHats';

type useMulticallCallDataProps = {
  isExpanded: boolean;
};

interface CallData {
  functionName: string;
  callData: Hex;
}

const useMulticallCallData = ({ isExpanded }: useMulticallCallDataProps) => {
  const { chainId, treeId, storedData, onchainHats } = useTreeForm();
  const hatsClient = createHatsClient(chainId);

  const computeMulticallData = async () => {
    if (!chainId || !treeId || !hatsClient || !storedData) return undefined;
    const calls = [] as CallData[];

    for (const hat of storedData) {
      const {
        maxSupply,
        eligibility,
        toggle,
        mutable,
        imageUrl,
        isEligibilityManual,
        isToggleManual,
        revocationsCriteria,
        deactivationsCriteria,
        name,
        description,
        guilds,
        responsibilities,
        authorities,
        wearers,
        id: hatId,
      } = hat;
      if (!hatId) continue;

      const detailsData = {
        name: name || '',
        description: description || '',
        guilds: guilds || [],
        responsibilities: _.reject(responsibilities, ['label', '']),
        authorities: _.reject(authorities, ['label', '']),
        eligibility: {
          manual: isEligibilityManual === TRIGGER_OPTIONS.MANUALLY,
          criteria: _.reject(revocationsCriteria, ['label', '']) || [],
        },
        toggle: {
          manual: isToggleManual === TRIGGER_OPTIONS.MANUALLY,
          criteria: _.reject(deactivationsCriteria, ['label', '']) || [],
        },
      };

      if (!_.includes(_.map(onchainHats, 'id'), hatId)) {
        // eslint-disable-next-line no-await-in-loop
        const details = await handleDetailsPin({
          chainId,
          hatId,
          newDetails: detailsData,
        });

        const newHatData = hatsClient?.createHatCallData({
          admin: BigInt(getDefaultAdminId(hatId)),
          details,
          maxSupply: _.toNumber(maxSupply) || 1,
          eligibility: eligibility || FALLBACK_ADDRESS,
          toggle: toggle || FALLBACK_ADDRESS,
          mutable: mutable === MUTABILITY.IMMUTABLE ? false : true,
          imageURI: imageUrl,
        });
        if (newHatData) {
          calls.push(newHatData);
        }

        if (_.eq(_.size(wearers), 1)) {
          const wearerAddress = _.get(_.first(wearers), 'address');
          if (wearerAddress) {
            const mintHatWearersData = hatsClient.mintHatCallData({
              hatId: decimalId(hatId) as unknown as bigint,
              wearer: wearerAddress,
            });

            if (mintHatWearersData) {
              calls.push(mintHatWearersData);
            }
          }
        } else {
          const batchMintHatWearersData = hatsClient.batchMintHatsCallData({
            hatIds: Array(_.size(wearers)).fill(
              decimalId(hatId),
            ) as unknown as bigint[],
            wearers: _.map(wearers, 'address'),
          });

          if (batchMintHatWearersData) {
            calls.push(batchMintHatWearersData);
          }
        }

        continue;
      }

      if (
        hasDetailsChanged({
          name,
          description,
          guilds,
          responsibilities,
          authorities,
          isEligibilityManual,
          revocationsCriteria,
          isToggleManual,
          deactivationsCriteria,
        })
      ) {
        const existingDetails = _.get(
          _.find(onchainHats, ['id', hatId]),
          'detailsObject.data',
        );

        // eslint-disable-next-line no-await-in-loop
        const newCid = await handleDetailsPin({
          chainId,
          hatId,
          newDetails: detailsData,
          existingDetails,
        });

        const changeHatDetailsData = hatsClient?.changeHatDetailsCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newDetails: newCid,
        });

        if (changeHatDetailsData) {
          calls.push(changeHatDetailsData);
        }
      }

      if (imageUrl) {
        const changeHatImageURIData = hatsClient?.changeHatImageURICallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newImageURI: imageUrl,
        });

        if (changeHatImageURIData) {
          calls.push(changeHatImageURIData);
        }
      }

      if (maxSupply) {
        const changeHatMaxSupplyData = hatsClient?.changeHatMaxSupplyCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newMaxSupply: parseInt(maxSupply, 10),
        });

        if (changeHatMaxSupplyData) {
          calls.push(changeHatMaxSupplyData);
        }
      }

      if (wearers) {
        if (_.eq(_.size(wearers), 1)) {
          const wearerAddress = _.get(_.first(wearers), 'address');
          if (wearerAddress) {
            const mintHatWearersData = hatsClient?.mintHatCallData({
              hatId: decimalId(hatId) as unknown as bigint,
              wearer: wearerAddress,
            });

            if (mintHatWearersData) {
              calls.push(mintHatWearersData);
            }
          }
        } else {
          const batchMintHatWearersData = hatsClient?.batchMintHatsCallData({
            hatIds: Array(_.size(wearers)).fill(
              decimalId(hatId),
            ) as unknown as bigint[],
            wearers: _.map(wearers, 'address'),
          });

          if (batchMintHatWearersData) {
            calls.push(batchMintHatWearersData);
          }
        }
      }

      if (eligibility) {
        const changeHatEligibilityData =
          hatsClient?.changeHatEligibilityCallData({
            hatId: decimalId(hatId) as unknown as bigint,
            newEligibility: eligibility,
          });

        if (changeHatEligibilityData) {
          calls.push(changeHatEligibilityData);
        }
      }

      if (toggle) {
        const changeHatToggleData = hatsClient?.changeHatToggleCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newToggle: toggle,
        });

        if (changeHatToggleData) {
          calls.push(changeHatToggleData);
        }
      }

      if (mutable) {
        const makeHatImmutableData = hatsClient?.makeHatImmutableCallData({
          hatId: decimalId(hatId) as unknown as bigint,
        });

        if (makeHatImmutableData) {
          calls.push(makeHatImmutableData);
        }
      }
    }

    return Promise.resolve(
      hatsClient?.multicallCallData(_.map(calls, 'callData')),
    );
  };

  const { data, isLoading } = useQuery({
    queryKey: ['multicallData', { treeId, chainId }, storedData],
    queryFn: computeMulticallData,
    enabled:
      !!treeId && !!chainId && !!hatsClient && !!storedData && isExpanded,
  });

  return { data, isLoading };
};

export default useMulticallCallData;
