'use client';

import { Button, Flex, Heading, HStack, Stack } from '@chakra-ui/react';
import { Modal, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { HatLinkRequestApproveForm } from 'forms';
import _ from 'lodash';
import posthog from 'posthog-js';
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

  const enableLinking = posthog.isFeatureEnabled('linking');

  if (
    !_.some(
      linkRequestFromTree,
      (linkRequest) => linkRequest?.requestedLinkToHat?.id === selectedHat?.id,
    ) ||
    !enableLinking
  )
    return null;

  return (
    <>
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
      </Stack>

      <Modal name='linkResponse' title='Approve Link Request'>
        <HatLinkRequestApproveForm topHatDomain={linkFrom} newAdmin={linkTo} />
      </Modal>
    </>
  );
};

export default LinkRequests;
