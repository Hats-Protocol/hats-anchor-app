import { Button, Flex, Heading, HStack, Stack } from '@chakra-ui/react';
import { useState } from 'react';

import Modal from '@/components/atoms/Modal';
import HatLinkRequestApproveForm from '@/forms/HatLinkRequestApproveForm';
import { prettyIdToIp } from '@/lib/hats';

const LinkRequests = ({
  linkRequestFromTree,
  hatData,
  setModals,
  localOverlay,
  chainId,
}: {
  linkRequestFromTree: any[];
  hatData: any;
  setModals?: any;
  localOverlay?: any;
  chainId: number;
}) => {
  const [linkFrom, setLinkFrom] = useState('');
  const [linkTo, setLinkTo] = useState('');

  const handleOpenLinkRequestApproveModal = (from: string, to: string) => {
    setLinkFrom(from);
    setLinkTo(to);
    setModals?.({ linkResponse: true });
  };

  return linkRequestFromTree?.some(
    (linkRequest) =>
      linkRequest.requestedLinkToHat?.prettyId === hatData.prettyId,
  ) ? (
    <Stack wrap='wrap'>
      <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
        Link Requests
      </Heading>
      <Flex justifyContent='space-between'>
        <HStack>
          {linkRequestFromTree?.map((linkRequest) => (
            <Button
              variant='outline'
              onClick={() =>
                handleOpenLinkRequestApproveModal(
                  linkRequest.id,
                  linkRequest.requestedLinkToHat.prettyId,
                )
              }
              key={linkRequest.id}
            >
              Link Request to {prettyIdToIp(linkRequest.id)}
            </Button>
          ))}
        </HStack>
      </Flex>

      <Modal
        name='linkResponse'
        title='Approve Link Request'
        localOverlay={localOverlay}
      >
        <HatLinkRequestApproveForm
          topHatDomain={linkFrom}
          newAdmin={linkTo}
          hatData={hatData}
          chainId={chainId}
        />
      </Modal>
    </Stack>
  ) : null;
};

export default LinkRequests;
