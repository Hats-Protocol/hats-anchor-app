/* eslint-disable no-shadow */
import React, { useEffect, useState } from 'react';
import { Box, Flex, HStack, Button, Image } from '@chakra-ui/react';
import {
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleUp,
} from 'react-icons/fa';
import { useAccount } from 'wagmi';

import { idToPrettyId, prettyIdToId, prettyIdToIp } from '@/lib/hats';
import HatWearerStatusForm from '@/forms/HatWearerStatusForm';
import Modal from '@/components/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';

import MainContent from './HatDrawer/MainContent';
import TopMenu from './HatDrawer/TopMenu';

const SelectedHatDrawer = ({
  selectedHatId,
  setSelectedHatId,
  chainId,
  hatsData,
  onClose,
}: SelectedHatDrawerProps) => {
  const localOverlay = useOverlay();
  const { address } = useAccount();
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
        <TopMenu
          chainId={chainId}
          onClose={onClose}
          mutableStatus={mutableStatus}
          hatData={hatData}
          isEligible={!!isEligible}
          isLoadingCheckEligibility={isLoadingCheckEligibility}
        />

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
