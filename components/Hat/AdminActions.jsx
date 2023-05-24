import React, { useState } from 'react';
import { Button, HStack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useOverlay } from '../../contexts/OverlayContext';
import {
  isTopHat,
  prettyIdToId,
  prettyIdToIp,
  isMutableNotTopHat,
} from '../../lib/hats';
import useHatMakeImmutable from '../../hooks/useHatMakeImmutable';
import HatLinkRequestApproveForm from '../../forms/HatLinkRequestApproveForm';
import Modal from '../Modal';
import HatSupplyForm from '../../forms/HatSupplyForm';
import HatRelinkForm from '../../forms/HatRelinkForm';
import HatUnlinkForm from '../../forms/HatUnlinkForm';
import useTreeDetails from '../../hooks/useTreeDetails';

const AdminActions = ({
  linkRequestFromTree,
  hatData,
  hatsAddress,
  chainId,
  linkedToHat,
  parentOfTrees,
}) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const showSupplyAndImmutableButtons = isMutableNotTopHat(hatData);

  const [topHatDomain, setTopHatDomain] = useState('');

  const { data: parentTreeData } = useTreeDetails({
    treeId: linkedToHat?.tree?.id,
    chainId,
    hatId: prettyIdToId(linkedToHat?.prettyId),
  });

  const parentTreeHats = _.filter(
    _.map(_.get(parentTreeData, 'hats'), 'prettyId'),
    (hat) => hat !== linkedToHat?.prettyId,
  );

  const { writeAsync: updateImmutability, isLoading } = useHatMakeImmutable({
    hatsAddress,
    chainId,
    hatData,
  });

  const handleMakeImmutable = () => {
    updateImmutability?.();
  };

  const handleOpenLinkRequestApproveModal = (id) => {
    setTopHatDomain(id);
    setModals({ linkResponse: true });
  };

  const anyActionsAvailable =
    showSupplyAndImmutableButtons ||
    parentOfTrees?.length ||
    linkRequestFromTree?.length ||
    (isTopHat(hatData) && linkedToHat);

  return (
    <>
      {anyActionsAvailable ? (
        <HStack
          // justifyContent='space-between'
          flexWrap='wrap'
          spacing={1}
          gap={1}
        >
          {showSupplyAndImmutableButtons && (
            <>
              <Button
                variant='outline'
                onClick={() => setModals({ hatSupply: true })}
              >
                Adjust Max Supply
              </Button>
              <Button
                variant='outline'
                onClick={handleMakeImmutable}
                isDisabled={isLoading}
              >
                Make Immutable
              </Button>
            </>
          )}
          {linkRequestFromTree?.map((linkRequest) => (
            <Button
              variant='outline'
              onClick={() => handleOpenLinkRequestApproveModal(linkRequest.id)}
              key={linkRequest.id}
            >
              Link Request to {prettyIdToIp(linkRequest.id)}
            </Button>
          ))}
          {parentOfTrees?.length && (
            <Button
              variant='outline'
              onClick={() => setModals({ unlinkTree: true })}
            >
              Unlink Tree
            </Button>
          )}
          {isTopHat(hatData) && linkedToHat && (
            <Button
              variant='outline'
              onClick={() => setModals({ relinkHat: true })}
            >
              Relink Hat
            </Button>
          )}
        </HStack>
      ) : (
        <HStack>
          <Text>No actions available</Text>
        </HStack>
      )}

      <Modal
        name='linkResponse'
        title='Approve Link Request'
        localOverlay={localOverlay}
      >
        <HatLinkRequestApproveForm
          topHatDomain={topHatDomain}
          hatData={hatData}
          chainId={chainId}
        />
      </Modal>
      <Modal
        name='hatSupply'
        title='Edit Max Supply'
        localOverlay={localOverlay}
      >
        <HatSupplyForm hatData={hatData} chainId={chainId} />
      </Modal>
      <Modal
        name='relinkHat'
        title='Relink Top Hat'
        localOverlay={localOverlay}
      >
        <HatRelinkForm
          parentTreeHats={parentTreeHats}
          hatData={hatData}
          chainId={chainId}
        />
      </Modal>
      <Modal
        name='unlinkTree'
        title='Unlink Top Hat From Tree'
        localOverlay={localOverlay}
      >
        <HatUnlinkForm parentOfTrees={parentOfTrees} chainId={chainId} />
      </Modal>
    </>
  );
};

export default AdminActions;
