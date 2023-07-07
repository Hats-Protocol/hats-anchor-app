import { Box, Image } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { MUTABILITY, STATUS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { Authority } from '@/forms/AuthorityDetailsForm';
import { Responsibility } from '@/forms/ResponsibilityDetailsForm';
import useHatGuilds from '@/hooks/useGuilds';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import useWearerDetails from '@/hooks/useWearerDetails';
import { isAdmin, isTopHat } from '@/lib/hats';
import { HierarchyObject, IHat } from '@/types';

import BottomMenu from './HatDrawer/BottomMenu';
import EditMode from './HatDrawer/EditMode';
import MainContent from './HatDrawer/MainContent';
import TopMenu from './HatDrawer/TopMenu';

const SelectedHatDrawer = ({
  selectedHatId,
  setSelectedHatId,
  chainId,
  hatsData,
  onClose,
  hierarchyData,
  editMode,
  setEditMode,
  linkRequestFromTree,
}: SelectedHatDrawerProps) => {
  const localOverlay = useOverlay();
  const { address } = useAccount();
  const [hatData, setHatData] = useState<IHat | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [guilds, setGuilds] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [isCurrentWearer, setIsCurrentWearer] = useState(false);
  const [wearerTopHats, setWearerTopHats] = useState<string[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>(
    [],
  );
  const [activeStatus, setActiveStatus] = useState(STATUS.INACTIVE);
  const [mutableStatus, setMutableStatus] = useState(MUTABILITY.IMMUTABLE);
  const { setModals } = localOverlay;

  const { hatRoles } = useHatGuilds({
    guildNames: guilds,
    hatId: hatData?.id,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
  });

  useEffect(() => {
    if (wearer) {
      const currentWearerHats = _.map(
        _.filter(wearer, { chainId }),
        'prettyId',
      );
      setIsCurrentWearer(_.includes(currentWearerHats, selectedHatId));
      const topHats = _.map(
        _.filter(
          wearer,
          (hat: IHat) => isTopHat(hat) && hat?.prettyId !== hatData?.prettyId,
        ),
        'prettyId',
      );

      setWearerTopHats(topHats);
      setIsAdminUser(isAdmin(currentWearerHats, selectedHatId));
    }
  }, [wearer, chainId]);

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
          setDescription(detailsObject?.data?.description);
          setGuilds(detailsObject?.data?.guilds);
          setAuthorities(detailsObject?.data?.authorities);
          setResponsibilities(detailsObject?.data?.responsibilities);
        }

        setActiveStatus(status ? STATUS.ACTIVE : STATUS.INACTIVE);
        setMutableStatus(mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE);
      }
    }
  }, [selectedHatId, hatsData]);

  const { data: isEligible } = useHatCheckEligibility({
    wearer: address || '',
    chainId,
    hatId: hatData?.id,
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
          src={hatData?.imageUrl ? hatData?.imageUrl : '/icon.jpeg'}
          alt='hat image'
          position='absolute'
          background='white'
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
          isCurrentWearer={isCurrentWearer}
          localOverlay={localOverlay}
          wearerTopHats={wearerTopHats}
          setSelectedHatId={setSelectedHatId}
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
            isAdminUser={isAdminUser}
            isCurrentWearer={isCurrentWearer}
            linkRequestFromTree={linkRequestFromTree}
            setModals={setModals}
            localOverlay={localOverlay}
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
  setSelectedHatId: (id?: string) => void;
  chainId: number;
  hatsData: IHat[];
  linkRequestFromTree: any;
  onClose: () => void;
  hierarchyData: HierarchyObject[];
  editMode: boolean;
  setEditMode: (value: boolean) => void;
}
