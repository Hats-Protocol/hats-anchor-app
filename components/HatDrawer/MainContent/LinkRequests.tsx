import { Button, Flex, Heading, HStack, Stack } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useState } from 'react';

import Modal from '@/components/atoms/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import HatLinkRequestApproveForm from '@/forms/HatLinkRequestApproveForm';

const LinkRequests = ({
  linkRequestFromTree,
}: {
  linkRequestFromTree: any[];
}) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { selectedHat } = useTreeForm();

  const [linkFrom, setLinkFrom] = useState('');
  const [linkTo, setLinkTo] = useState('');

  const handleOpenLinkRequestApproveModal = (from: string, to: string) => {
    setLinkFrom(from);
    setLinkTo(to);
    setModals?.({ linkResponse: true });
  };

  return linkRequestFromTree?.some(
    (linkRequest) => linkRequest.requestedLinkToHat?.id === selectedHat?.id,
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
                  linkRequest.requestedLinkToHat.id,
                )
              }
              key={linkRequest.id}
            >
              Link Request to {hatIdDecimalToIp(BigInt(linkRequest.id))}
            </Button>
          ))}
        </HStack>
      </Flex>

      <Modal
        name='linkResponse'
        title='Approve Link Request'
        localOverlay={localOverlay}
      >
        <HatLinkRequestApproveForm topHatDomain={linkFrom} newAdmin={linkTo} />
      </Modal>
    </Stack>
  ) : null;
};

export default LinkRequests;
