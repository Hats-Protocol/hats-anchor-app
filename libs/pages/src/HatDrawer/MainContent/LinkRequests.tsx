import { Button, Flex, Heading, HStack, Stack } from '@chakra-ui/react';
import { Modal, useOverlay, useTreeForm } from 'contexts';
import { HatLinkRequestApproveForm } from 'forms';
import { useState } from 'react';
import { prettyIdToIp } from 'shared';

// TODO RQ hook this

const LinkRequests = () => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { selectedHat, linkRequestFromTree } = useTreeForm();

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
      <Heading size='sm' variant='medium' textTransform='uppercase'>
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
        <HatLinkRequestApproveForm topHatDomain={linkFrom} newAdmin={linkTo} />
      </Modal>
    </Stack>
  ) : null;
};

export default LinkRequests;
