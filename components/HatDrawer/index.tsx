import { Box, Image } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useReducer } from 'react';
import { useAccount } from 'wagmi';

import { MUTABILITY, STATUS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import useHatGuilds from '@/hooks/useGuilds';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import useWearerDetails from '@/hooks/useWearerDetails';
import { isAdmin, isTopHat } from '@/lib/hats';
import { IHat } from '@/types';

import BottomMenu from './BottomMenu';
import EditMode from './EditMode';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const initialState = {
  hatData: undefined,
  hatDetails: {
    name: '',
    description: '',
    guilds: [],
    authorities: [],
    eligibility: {
      manual: true,
      criteria: [],
    },
    toggle: {
      manual: true,
      criteria: [],
    },
    responsibilities: [],
  },
  isCurrentWearer: false,
  wearerTopHats: [],
  isAdminUser: false,
  activeStatus: STATUS.INACTIVE,
  mutableStatus: MUTABILITY.IMMUTABLE,
};

function reducer(
  state: typeof initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: { type: string; payload: any },
) {
  switch (action.type) {
    case 'SET_HAT_DATA':
      return { ...state, hatData: action.payload };
    case 'SET_HAT_DETAILS':
      return {
        ...state,
        hatDetails: { ...state.hatDetails, ...action.payload },
      };
    case 'SET_IS_CURRENT_WEARER':
      return { ...state, isCurrentWearer: action.payload };
    case 'SET_WEARER_TOP_HATS':
      return { ...state, wearerTopHats: action.payload };
    case 'SET_IS_ADMIN_USER':
      return { ...state, isAdminUser: action.payload };
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
    isCurrentWearer,
    wearerTopHats,
    isAdminUser,
    activeStatus,
    mutableStatus,
    hatDetails,
  } = state;
  // console.log(hatData);

  const { hatRoles } = useHatGuilds({
    guildNames: hatDetails?.guilds,
    hatId: hatData?.id,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  useEffect(() => {
    if (wearer) {
      const currentWearerHats = _.map(wearer, 'id');
      dispatch({
        type: 'SET_IS_CURRENT_WEARER',
        payload: _.includes(currentWearerHats, selectedHatId),
      });
      const topHats = _.map(
        _.filter(
          wearer,
          (hat: IHat) => isTopHat(hat) && hat?.id !== hatData?.id,
        ),
        'id',
      );

      dispatch({ type: 'SET_WEARER_TOP_HATS', payload: topHats });
      dispatch({
        type: 'SET_IS_ADMIN_USER',
        payload: isAdmin(currentWearerHats, selectedHatId),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wearer, chainId]);

  const { data: hatDetailsObject } = useHatDetailsField(hatData?.details);

  useEffect(() => {
    if (selectedHatId) {
      const data = _.find(hatsData, { id: selectedHatId });
      dispatch({ type: 'SET_HAT_DATA', payload: data });

      if (hatDetailsObject) {
        const {
          name: localName,
          description,
          guilds,
          authorities,
          responsibilities,
          eligibility,
          toggle,
        } = hatDetailsObject;
        const details = {
          name: localName,
          description,
          guilds,
          authorities,
          responsibilities,
          eligibility,
          toggle,
        };
        dispatch({ type: 'SET_HAT_DETAILS', payload: details });
      }

      dispatch({
        type: 'SET_ACTIVE_STATUS',
        payload: hatData?.status ? STATUS.ACTIVE : STATUS.INACTIVE,
      });
      dispatch({
        type: 'SET_MUTABLE_STATUS',
        payload: hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
      });
    }
  }, [hatData, selectedHatId, hatsData, hatDetailsObject]);

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
            hatDetails={hatDetails}
            isEligible={!!isEligible}
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
            hatDetails={hatDetails}
            setEditMode={setEditMode}
          />
        )}

        {_.isEmpty(hatsData) && (
          <BottomMenu
            hatsData={hatsData}
            selectedHatId={selectedHatId}
            setSelectedHatId={setSelectedHatId}
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
  hatsData: IHat[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkRequestFromTree: any;
  onClose: () => void;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
}
