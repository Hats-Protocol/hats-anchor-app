'use client';

import { MULTICALL3_ADDRESS, ZODIAC_MODULE_PROXY_FACTORY_ADDRESS } from '@hatsprotocol/constants';
import { HATS_MODULES_FACTORY_ADDRESS } from '@hatsprotocol/modules-sdk';
import { HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { Modal, useCouncilForm, useOverlay } from 'contexts';
import { useClipboard } from 'hooks';
import { CopyAddress } from 'icons';
import { find, map } from 'lodash';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, BaseInput, Button, MemberAvatar } from 'ui';
import { getAllWearers } from 'utils';
import { Hex } from 'viem';

const CallDataCopySection = ({
  address,
  addressLabel,
  calldata,
  hideMidline = false,
}: {
  address: Hex;
  addressLabel: string;
  calldata: Hex | undefined;
  hideMidline?: boolean;
}) => {
  const { onCopy: copyAddress } = useClipboard(address, {
    toastData: { title: `Copied ${addressLabel} address to clipboard` },
  });
  const { onCopy: copyCalldata } = useClipboard(calldata || '', {
    toastData: { title: `Copied calldata to clipboard` },
  });

  return (
    <div className='mb-4 space-y-4'>
      <div className='flex'>
        <div className='flex w-2/5 flex-col gap-2'>
          <h2>{addressLabel}</h2>
          <div>
            <Button variant='link' onClick={copyAddress}>
              <CopyAddress className='h-4 w-4' />
              Copy
            </Button>
          </div>
        </div>

        <div className='flex w-3/5 flex-col gap-2'>
          <h4 className='font-semibold'>Contract to call</h4>
          <BaseInput readOnly value={address} />
        </div>
      </div>

      {!hideMidline && <hr />}

      <div className='flex'>
        <div className='flex w-2/5 flex-col gap-2'>
          <h2>{addressLabel} Calldata</h2>
          <div>
            <Button variant='link' onClick={copyCalldata}>
              <CopyAddress className='h-4 w-4' />
              Copy
            </Button>
          </div>
        </div>

        <div className='flex w-3/5 flex-col gap-2'>
          <h4 className='font-semibold'>Calldata to send to the contract</h4>
          <BaseInput readOnly value={calldata} />
        </div>
      </div>
    </div>
  );
};

const DeployCouncilCalldata = ({ deployCouncilCalldata }: { deployCouncilCalldata: Hex }) => {
  return <CallDataCopySection address={MULTICALL3_ADDRESS} addressLabel='Council' calldata={deployCouncilCalldata} />;
};

const DeploySecondCouncilCalldata = ({
  deployHatsCalldata,
  deployMchCalldata,
  deployHsgCalldata,
  mchArgs,
}: {
  deployHatsCalldata: Hex | undefined;
  deployMchCalldata: Hex | undefined;
  deployHsgCalldata: Hex | undefined;
  mchArgs: { existingMch: Hex };
}) => {
  return (
    <Accordion type='single'>
      <AccordionItem value='hats'>
        <AccordionTrigger>1. Deploy Hats updates</AccordionTrigger>
        <AccordionContent>
          <CallDataCopySection address={HATS_V1} addressLabel='Hats' calldata={deployHatsCalldata} hideMidline />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='modules'>
        <AccordionTrigger>2. Deploy modules via Claims Hatter</AccordionTrigger>
        <AccordionContent>
          <CallDataCopySection
            address={mchArgs.existingMch}
            addressLabel='Claims Hatter'
            calldata={deployMchCalldata}
            hideMidline
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='hsg'>
        <AccordionTrigger>3. Deploy HSG & Safe</AccordionTrigger>
        <AccordionContent>
          <CallDataCopySection
            address={ZODIAC_MODULE_PROXY_FACTORY_ADDRESS}
            addressLabel='Zodiac Module Factory'
            calldata={deployHsgCalldata}
            hideMidline
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const CalldataModal = ({ topHatWearer }: { topHatWearer: Hex | undefined }) => {
  const { setModals } = useOverlay();
  const { form, deployCouncilCalldata, deployHatsCalldata, deployMchCalldata, deployHsgCalldata, mchArgs } =
    useCouncilForm();
  const formData = form.getValues();
  const allWearers = getAllWearers(formData);
  const creator = find(allWearers, { address: formData?.creator });
  const owner = find(allWearers, { address: topHatWearer });

  return (
    <Modal name='calldata' title='Deploying via Smart Contract' size='xl'>
      <div className='space-y-4'>
        <p>
          To deploy this council, the address that manages the council needs to send the following call data to Hats
          Protocol to write all your latest changes on chain in a single transaction.
        </p>

        <hr />

        <div className='flex'>
          <div className='w-2/5'>
            <h2>Deployers</h2>
          </div>

          <div className='w-3/5 space-y-4'>
            <h2>Who can deploy the council?</h2>

            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-2'>
                <h3>Organization Owner</h3>
                <MemberAvatar member={owner || creator} />
              </div>

              <div className='flex flex-col gap-2'>
                <h3>Organization Managers</h3>
                {map(formData?.admins, (admin) => (
                  <MemberAvatar key={admin.id} member={admin} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr />

        {deployCouncilCalldata ? (
          <DeployCouncilCalldata deployCouncilCalldata={deployCouncilCalldata} />
        ) : (
          <DeploySecondCouncilCalldata
            deployHatsCalldata={deployHatsCalldata}
            deployMchCalldata={deployMchCalldata}
            deployHsgCalldata={deployHsgCalldata}
            mchArgs={mchArgs}
          />
        )}
      </div>
      <div className='flex h-20 items-center justify-center'>
        <Button
          variant='outline-blue'
          rounded='full'
          onClick={() => {
            setModals?.({});
          }}
        >
          OK
        </Button>
      </div>
    </Modal>
  );
};

export default CalldataModal;
