'use client';

import { Modal, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { HatLinkRequestApproveForm } from 'forms';
import { some } from 'lodash';
import { useState } from 'react';
import { prettyIdToIp } from 'shared';
import { Button } from 'ui';

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

  const enableLinking = false;

  if (
    !some(linkRequestFromTree, (linkRequest) => linkRequest?.requestedLinkToHat?.id === selectedHat?.id) ||
    !enableLinking
  )
    return null;

  return (
    <>
      <div className='space-y-1 px-16'>
        <h2 className='text-lg font-medium'>Link Requests</h2>
        <div className='flex justify-between'>
          <div className='flex flex-wrap'>
            {linkRequestFromTree?.map((linkRequest) => (
              <Button
                variant='outline-blue'
                size='sm'
                onClick={() => {
                  if (!linkRequest.id || !linkRequest.requestedLinkToHat?.id) return;

                  handleOpenLinkRequestApproveModal(linkRequest.id, linkRequest.requestedLinkToHat.id);
                }}
                key={linkRequest.id}
              >
                Link Request to {prettyIdToIp(linkRequest.id)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Modal name='linkResponse' title='Approve Link Request'>
        <HatLinkRequestApproveForm topHatDomain={linkFrom} newAdmin={linkTo} />
      </Modal>
    </>
  );
};

export { LinkRequests };
