import { Button, Flex, Heading, HStack, Stack } from '@chakra-ui/react';
import { Modal, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { HatLinkRequestApproveForm } from 'forms';
import _ from 'lodash';
import { useState } from 'react';
import { prettyIdToIp } from 'shared';

// TODO RQ hook this

const LinkRequests = () => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { linkRequestFromTree } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const [linkFrom, setLinkFrom] = useState('');
  const [linkTo, setLinkTo] = useState('');

  const handleOpenLinkRequestApproveModal = (from: string, to: string) => {
    setLinkFrom(from);
    setLinkTo(to);
    setModals?.({ linkResponse: true });
  };

  if (
    !_.some(
      linkRequestFromTree,
      (linkRequest) => linkRequest?.requestedLinkToHat?.id === selectedHat?.id,
    )
  )
    return null;

  return (
    <Stack wrap='wrap' px={16}>
      <Heading size='md' variant={{ base: 'medium', md: 'default' }}>
        Link Requests
      </Heading>
      <Flex justifyContent='space-between'>
        <HStack>
          {linkRequestFromTree?.map((linkRequest) => (
            <Button
              variant='outlineMatch'
              size='sm'
              colorScheme='blue.500'
              onClick={() => {
                if (!linkRequest.id || !linkRequest.requestedLinkToHat?.id)
                  return;

                handleOpenLinkRequestApproveModal(
                  linkRequest.id,
                  linkRequest.requestedLinkToHat.id,
                );
              }}
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
  );
};

export default LinkRequests;
