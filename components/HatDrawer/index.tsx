import { Box, Image } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useReducer } from 'react';
import { useAccount } from 'wagmi';

import { MUTABILITY, STATUS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import useHatGuilds from '@/hooks/useGuilds';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import useWearerDetails from '@/hooks/useWearerDetails';
import { isAdmin, isTopHat } from '@/lib/hats';
import { HierarchyObject, IHat } from '@/types';

import BottomMenu from './BottomMenu';
import EditMode from './EditMode';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const initialState = {
  hatData: undefined,
  name: '',
  description: '',
  guilds: [],
  authorities: [],
  isCurrentWearer: false,
  wearerTopHats: [],
  isAdminUser: false,
  responsibilities: [],
  activeStatus: STATUS.INACTIVE,
  mutableStatus: MUTABILITY.IMMUTABLE,
};

function reducer(state: any, action: { type: any; payload: any }) {
  switch (action.type) {
    case 'SET_HAT_DATA':
      return { ...state, hatData: action.payload };
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_GUILDS':
      return { ...state, guilds: action.payload };
    case 'SET_AUTHORITIES':
      return { ...state, authorities: action.payload };
    case 'SET_IS_CURRENT_WEARER':
      return { ...state, isCurrentWearer: action.payload };
    case 'SET_WEARER_TOP_HATS':
      return { ...state, wearerTopHats: action.payload };
    case 'SET_IS_ADMIN_USER':
      return { ...state, isAdminUser: action.payload };
    case 'SET_RESPONSIBILITIES':
      return { ...state, responsibilities: action.payload };
    case 'SET_ACTIVE_STATUS':
      return { ...state, activeStatus: action.payload };
    case 'SET_MUTABLE_STATUS':
      return { ...state, mutableStatus: action.payload };
    default:
      throw new Error();
  }
}

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
  const { setModals } = localOverlay;

  const { address } = useAccount();
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    hatData,
    name,
    description,
    guilds,
    authorities,
    isCurrentWearer,
    wearerTopHats,
    isAdminUser,
    responsibilities,
    activeStatus,
    mutableStatus,
  } = state;

  const { hatRoles } = useHatGuilds({
    guildNames: guilds,
    hatId: hatData?.id,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  useEffect(() => {
    if (wearer) {
      const currentWearerHats = _.map(wearer, 'prettyId');
      dispatch({
        type: 'SET_IS_CURRENT_WEARER',
        payload: _.includes(currentWearerHats, selectedHatId),
      });
      const topHats = _.map(
        _.filter(
          wearer,
          (hat: IHat) => isTopHat(hat) && hat?.prettyId !== hatData?.prettyId,
        ),
        'prettyId',
      );

      dispatch({ type: 'SET_WEARER_TOP_HATS', payload: topHats });
      dispatch({
        type: 'SET_IS_ADMIN_USER',
        payload: isAdmin(currentWearerHats, selectedHatId, true),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wearer, chainId]);

  useEffect(() => {
    if (selectedHatId) {
      const data = _.find(hatsData, ['prettyId', selectedHatId]);

      if (data) {
        dispatch({ type: 'SET_HAT_DATA', payload: data });
        const { status, mutable, details, detailsObject } = data;

        let detailName = details;
        if (detailsObject?.type === '1.0') {
          detailName = detailsObject?.data?.name;
        }
        dispatch({ type: 'SET_NAME', payload: detailName });

        if (detailsObject?.type === '1.0') {
          dispatch({
            type: 'SET_DESCRIPTION',
            payload: detailsObject?.data?.description,
          });
          dispatch({
            type: 'SET_GUILDS',
            payload: detailsObject?.data?.guilds,
          });
          dispatch({
            type: 'SET_AUTHORITIES',
            payload: detailsObject?.data?.authorities,
          });
          dispatch({
            type: 'SET_RESPONSIBILITIES',
            payload: detailsObject?.data?.responsibilities,
          });
        }

        dispatch({
          type: 'SET_ACTIVE_STATUS',
          payload: status ? STATUS.ACTIVE : STATUS.INACTIVE,
        });
        dispatch({
          type: 'SET_MUTABLE_STATUS',
          payload: mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
        });
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
          loading='lazy'
          src={hatData?.imageUrl ? hatData?.imageUrl : '/icon.jpeg'}
          alt='hat image'
          position='absolute'
          background='white'
          w='100px'
          h='100px'
          border='3px solid'
          borderColor='gray.700'
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
            isAdminUser={isAdminUser}
          />
        )}

        {hatsData?.length > 1 && (
          <BottomMenu
            selectedHatId={selectedHatId}
            setSelectedHatId={setSelectedHatId}
            hierarchyData={hierarchyData}
          />
        )}
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
