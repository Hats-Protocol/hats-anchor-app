import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Box, Image } from '@chakra-ui/react';
import { useAccount } from 'wagmi';

import { isAdmin } from '@/lib/hats';
import { useOverlay } from '@/contexts/OverlayContext';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import useHatGuilds from '@/hooks/useGuilds';
import useWearerDetails from '@/hooks/useWearerDetails';
import { HierarchyObject } from '@/types';

import MainContent from './HatDrawer/MainContent';
import TopMenu from './HatDrawer/TopMenu';
import BottomMenu from './HatDrawer/BottomMenu';
import EditMode from './HatDrawer/EditMode';
import { Authority } from '@/forms/AuthorityDetailsForm';
import { Responsibility } from '@/forms/ResponsibilityDetailsForm';

const SelectedHatDrawer = ({
  selectedHatId,
  setSelectedHatId,
  chainId,
  hatsData,
  onClose,
  hierarchyData,
  editMode,
  setEditMode,
}: SelectedHatDrawerProps) => {
  const localOverlay = useOverlay();
  const { address } = useAccount();
  const [hatData, setHatData] = useState<any>({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [guilds, setGuilds] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>(
    [],
  );
  const [activeStatus, setActiveStatus] = useState('Inactive');
  const [mutableStatus, setMutableStatus] = useState('Immutable');
  const { setModals } = localOverlay;

  const { hatRoles } = useHatGuilds({
    guildNames: guilds,
    hatId: hatData.id,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
  });
  const currentWearerHats = _.map(wearer, 'prettyId');
  const isAdminUser = isAdmin(currentWearerHats, selectedHatId);

  useEffect(() => {
    if (selectedHatId) {
      const data = _.find(hatsData, ['prettyId', selectedHatId]);

      if (data) {
        setHatData(data);
        const { status, mutable, details, detailsObject } = data;

        let detailName = details;
        if (detailsObject?.type === '1.0') {
          detailName = detailsObject?.data?.name;
        }
        setName(detailName);
        if (detailsObject?.type === '1.0') {
          console.log('detailsObject?.data', detailsObject?.data);
          setDescription(detailsObject?.data?.description);
          setGuilds(detailsObject?.data?.guilds);
          setAuthorities(detailsObject?.data?.authorities);
          setResponsibilities(detailsObject?.data?.responsibilities);
        }

        setActiveStatus(status ? 'Active' : 'Inactive');
        setMutableStatus(mutable ? 'Mutable' : 'Immutable');
      }
    }
  }, [selectedHatId, hatsData]);

  const { data: isEligible } = useHatCheckEligibility({
    wearer: address || '',
    chainId,
    hatId: hatData.id,
  });

  if (!hatData) return null;

  return (
    <Box
      w='full'
      transition='width 0.5s' // Add transition
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      display={selectedHatId ? 'block' : 'none'}
      right={0}
      zIndex={12}
    >
      <Box w='100%' h='100%' position='relative' zIndex={14}>
        {/* Hat Image */}
        <Image
          src='/icon.jpeg'
          alt='hat image'
          position='absolute'
          w='100px'
          h='100px'
          border='2px solid'
          borderRadius='md'
          top='110px'
          left={-81}
          zIndex={16}
        />

        <TopMenu
          chainId={chainId}
          onClose={onClose}
          mutableStatus={mutableStatus}
          hatData={hatData}
          editMode={editMode}
          setEditMode={setEditMode}
          isAdminUser={isAdminUser}
          localOverlay={localOverlay}
        />

        {!editMode && (
          <MainContent
            chainId={chainId}
            hatData={hatData}
            isEligible={!!isEligible}
            name={name}
            description={description}
            responsibilities={responsibilities}
            authorities={authorities}
            hatRoles={hatRoles}
            mutableStatus={mutableStatus}
            activeStatus={activeStatus}
            setModals={setModals}
            localOverlay={localOverlay}
            isAdminUser={isAdminUser}
          />
        )}

        {editMode && (
          <EditMode
            chainId={chainId}
            hatData={hatData}
            name={name}
            description={description}
            imageUrl={hatData?.imageUri}
            guilds={guilds}
            authorities={authorities}
            responsibilities={responsibilities}
          />
        )}

        <BottomMenu
          selectedHatId={selectedHatId}
          setSelectedHatId={setSelectedHatId}
          hierarchyData={hierarchyData}
        />
      </Box>
    </Box>
  );
};

export default SelectedHatDrawer;

interface SelectedHatDrawerProps {
  selectedHatId?: string;
  setSelectedHatId: (id: string) => void;
  chainId: number;
  hatsData: any;
  onClose: () => void;
  hierarchyData: HierarchyObject[];
  editMode: boolean;
  setEditMode: (value: boolean) => void;
}
