import { Box, Image } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useReducer, useState } from 'react';
import { useAccount } from 'wagmi';

import { MUTABILITY, STATUS } from '@/constants';
import useHatGuilds from '@/hooks/useGuilds';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import useLocalStorage from '@/hooks/useLocalStorage';
import useToast from '@/hooks/useToast';
import useWearerDetails from '@/hooks/useWearerDetails';
import { generateLocalStorageKey } from '@/lib/general';
import { isAdmin, isTopHat } from '@/lib/hats';
import { FormData, IHat } from '@/types';

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
  editMode,
  linkRequestFromTree,
  returnToList,
}: SelectedHatDrawerProps) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
  const localStorageKey = generateLocalStorageKey(chainId, hatData?.treeId);
  const [storedData, setStoredData] = useLocalStorage<any[]>(
    localStorageKey,
    [],
  );

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

  useEffect(() => {
    if (selectedHatId) {
      const data = _.find(hatsData, { id: selectedHatId });
      dispatch({ type: 'SET_HAT_DATA', payload: data });

      if (data?.detailsObject?.data) {
        const {
          name: localName,
          description,
          guilds,
          authorities,
          responsibilities,
          eligibility,
          toggle,
        } = data.detailsObject.data;
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
  }, [hatData, selectedHatId, hatsData]);

  const { data: isEligible } = useHatCheckEligibility({
    wearer: address || '',
    chainId,
    hatId: hatData?.id,
  });

  const [unsavedData, setUnsavedData] = useState<FormData | null>(null);

  const handleSave = (sendToast: boolean = true) => {
    if (unsavedData) {
      const updatedHats = storedData.map((hat: FormData) =>
        hat.id === hatData.id ? { id: hatData.id, ...unsavedData } : hat,
      );

      if (!updatedHats.find((hat: FormData) => hat.id === hatData.id)) {
        updatedHats.push({ id: hatData.id, ...unsavedData });
      }

      setStoredData(updatedHats);

      setUnsavedData(null);

      if (sendToast) {
        toast.success({
          title: 'Saved',
          description: 'Your changes have been saved.',
        });
      }
    }
  };

  if (!hatData) return null;

  return (
    <Box
      w='full'
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
          mutableStatus={mutableStatus}
          hatData={hatData}
          editMode={editMode}
          isAdminUser={isAdminUser}
          wearerTopHats={wearerTopHats}
          onSave={handleSave}
          returnToList={returnToList}
          isLoading={isLoading}
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
          />
        )}

        {editMode && (
          <EditMode
            chainId={chainId}
            hatData={hatData}
            hatDetails={hatDetails}
            updateUnsavedData={setUnsavedData}
            unsavedData={unsavedData}
            treeId={hatData?.treeId}
            setIsLoading={setIsLoading}
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
  editMode: boolean;
  returnToList: () => void;
}
