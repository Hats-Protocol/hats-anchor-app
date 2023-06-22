/* eslint-disable no-shadow */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Icon,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
} from '@chakra-ui/react';
import { FiChevronsRight } from 'react-icons/fi';
import {
  FaCopy,
  FaDoorOpen,
  FaEdit,
  FaEllipsisV,
  FaLock,
  FaPowerOff,
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleUp,
} from 'react-icons/fa';

import { idToPrettyId, prettyIdToId, prettyIdToIp } from '@/lib/hats';
import CONFIG from '@/constants';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useToast from '@/hooks/useToast';
import useHatStatusUpdate from '@/hooks/useHatStatusUpdate';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import { useAccount } from 'wagmi';
import HatWearerStatusForm from '@/forms/HatWearerStatusForm';
import Modal from '@/components/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import MainContent from './HatDrawer/MainContent';

const SelectedHatDrawer = ({
  selectedHatId,
  setSelectedHatId,
  chainId,
  hatsData,
  onClose,
}: SelectedHatDrawerProps) => {
  const localOverlay = useOverlay();
  const { address } = useAccount();
  const toast = useToast();
  const [hatData, setHatData] = useState<any>({});
  const [hierarchyHatData, setHierarchyHatData] = useState<any>({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activeStatus, setActiveStatus] = useState('Inactive');
  const [mutableStatus, setMutableStatus] = useState('Immutable');
  const [changeStatusWearer, setChangeStatusWearer] = useState('');

  useEffect(() => {
    if (selectedHatId) {
      const data = hatsData[prettyIdToId(selectedHatId)];

      if (data) {
        setHatData(data);
        const { id, status, mutable, details } = data;

        setName(
          // eslint-disable-next-line no-nested-ternary
          details?.type === '1.0'
            ? details?.data?.name
            : typeof details === 'string'
            ? details
            : prettyIdToIp(idToPrettyId(id)),
        );
        setDescription(
          details?.type === '1.0' ? details?.data?.description : '',
        );
        setActiveStatus(status ? 'Active' : 'Inactive');
        setMutableStatus(mutable ? 'Mutable' : 'Immutable');
      }

      const hierarchyData = hatsData[prettyIdToId(selectedHatId)];
      setHierarchyHatData(hierarchyData);
    }
  }, [selectedHatId, hatsData]);

  const {
    writeAsync: updateImmutability,
    isLoading: isLoadingUpdateImmutability,
  } = useHatMakeImmutable({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatData,
  });

  const { writeAsync: deactivateHat, isLoading: isLoadingDeactivateHat } =
    useHatStatusUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData.id,
      status: 'Inactive',
    });

  const { data: isEligible, isLoading: isLoadingCheckEligibility } =
    useHatCheckEligibility({
      wearer: address || '',
      chainId,
      hatId: hatData.id,
    });

  if (!hatData) return null;

  return (
    <Box
      w='full'
      transition='width 0.5s' // Add transition
      bg='whiteAlpha.900'
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

        {/* Top Menu */}
        <Flex
          w='100%'
          borderBottom='1px solid'
          borderColor='gray.200'
          h='75px'
          bg='whiteAlpha.900'
          align='center'
          justify='space-between'
          px={4}
          position='absolute'
          top={0}
          zIndex={16}
        >
          <Button variant='outline' onClick={onClose}>
            <HStack>
              <Icon as={FiChevronsRight} />
              <Text>Collapse</Text>
            </HStack>
          </Button>
          <HStack>
            <Button
              variant='outline'
              background='cyan.100'
              color='cyan.700'
              borderColor='cyan.700'
            >
              <HStack>
                <Icon as={FaEdit} />
                <Text>Edit Hat</Text>
              </HStack>
            </Button>
            <Menu>
              <MenuButton as={Button} variant='outline'>
                <HStack>
                  <Icon as={FaEllipsisV} />
                  <Text>More</Text>
                </HStack>
              </MenuButton>
              <MenuList gap={5}>
                <MenuItem
                  gap={2}
                  onClick={() => updateImmutability?.()}
                  isDisabled={
                    mutableStatus === 'Immutable' ||
                    !updateImmutability ||
                    isLoadingUpdateImmutability
                  }
                >
                  <FaLock />
                  Make immutable
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() => deactivateHat?.()}
                  isDisabled={
                    address?.toLowerCase() !== hatData?.toggle ||
                    isLoadingDeactivateHat ||
                    !hatData?.status
                  }
                >
                  <FaPowerOff />
                  Deactivate Hat
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() =>
                    toast.info({
                      title: isEligible ? 'Eligible' : 'Not Eligible',
                    })
                  }
                  isDisabled={isLoadingCheckEligibility}
                >
                  <FaDoorOpen />
                  Test Eligibility
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() => {
                    navigator.clipboard.writeText(hatData?.id);
                    toast.info({
                      title: 'Successfully copied Hat id to clipboard',
                    });
                  }}
                >
                  <FaCopy />
                  Copy Hat ID
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() => {
                    navigator.clipboard.writeText(CONFIG.hatsAddress);
                    toast.info({
                      title: 'Successfully copied contract id to clipboard',
                    });
                  }}
                >
                  <FaCopy />
                  Copy Contract ID
                </MenuItem>
                {/* <MenuItem gap={2}>
                  <FaDanger />
                  Report this hat
                </MenuItem> */}
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Main Content */}
        <MainContent
          chainId={chainId}
          hatData={hatData}
          isEligible={!!isEligible}
          name={name}
          description={description}
          mutableStatus={mutableStatus}
          activeStatus={activeStatus}
          setChangeStatusWearer={setChangeStatusWearer}
        />

        {/* Bottom Menu */}
        <Box w='100%' position='absolute' bottom={0} zIndex={14}>
          <Flex
            justify='space-between'
            p={4}
            borderTop='1px solid'
            borderColor='gray.200'
          >
            {hierarchyHatData?.leftSibling ? (
              <Button
                variant='outline'
                onClick={() => setSelectedHatId(hierarchyHatData?.leftSibling)}
                gap={1}
              >
                <FaRegArrowAltCircleLeft />
                {prettyIdToIp(hierarchyHatData?.leftSibling)}
              </Button>
            ) : (
              <Box w={16} />
            )}

            <HStack>
              {hierarchyHatData?.parentId ? (
                <Button
                  variant='outline'
                  onClick={() => setSelectedHatId(hierarchyHatData?.parentId)}
                  gap={1}
                >
                  <FaRegArrowAltCircleUp />
                  {prettyIdToIp(hierarchyHatData?.parentId)}
                </Button>
              ) : (
                <Box w={16} />
              )}

              {hierarchyHatData?.firstChild ? (
                <Button
                  variant='outline'
                  onClick={() => setSelectedHatId(hierarchyHatData?.firstChild)}
                  gap={1}
                >
                  {prettyIdToIp(hierarchyHatData?.firstChild)}
                  <FaRegArrowAltCircleDown />
                </Button>
              ) : (
                <Box w={16} />
              )}
            </HStack>

            {hierarchyHatData?.rightSibling ? (
              <Button
                variant='outline'
                onClick={() => setSelectedHatId(hierarchyHatData?.rightSibling)}
                gap={1}
              >
                {prettyIdToIp(hierarchyHatData?.rightSibling)}
                <FaRegArrowAltCircleRight />
              </Button>
            ) : (
              <Box w={16} />
            )}
          </Flex>
        </Box>
      </Box>

      <Modal
        name='hatWearerStatus'
        title='Remove a Wearer by revoking their Hat token'
        localOverlay={localOverlay}
        size='3xl'
      >
        <HatWearerStatusForm
          hatData={hatData}
          chainId={chainId}
          wearer={changeStatusWearer}
          eligibility='Not Eligible'
        />
      </Modal>
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
}
