'use client';

import { Flex, HStack, Icon, IconButton, Slide, Stack, Text, Tooltip } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/config';
import { CONTROLLER_TYPES, FORM_FIELDS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { AuthoritiesListForm, HatBasicsForm, HatManagementForm, HatWearerForm, ResponsibilitiesForm } from 'forms';
import { isMutableNotTopHat, isTopHat, isTopHatOrMutable } from 'hats-utils';
import { useClipboard } from 'hooks';
import _ from 'lodash';
import posthog from 'posthog-js';
import { useState } from 'react';
import { BsKey, BsListUl } from 'react-icons/bs';
import { FaCopy } from 'react-icons/fa';
import { Accordion, Link } from 'ui';
import { ipfsUrl } from 'utils';

import { ModuleDrawer } from '../module-drawer';

const EditMode = () => {
  const { drawers, setDrawers } = useOverlay();
  const { treeToDisplay } = useTreeForm();
  const { selectedHat, isDraft } = useSelectedHat();
  const { getDirtyFieldsForAccordion, handleSave: onSave } = useHatForm();
  const [isStandaloneHatterDeploy, setIsStandAloneHatterDeploy] = useState(false);

  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '', {
    toastData: { title: 'Copied Hat ID to clipboard' },
  });

  const name = _.get(_.find(treeToDisplay, ['id', selectedHat?.id]), 'displayName');

  if (!selectedHat) return null;

  const openModuleDrawer = (type: string) => {
    onSave(false);
    setDrawers?.({ [_.toLower(type) || 'eligibility']: true });
  };

  return (
    <>
      <Stack w='100%' overflow='scroll' height='calc(100% - 150px)' position='relative' p={10} spacing={10}>
        <Stack>
          <Flex justify='space-between' align='center'>
            <Text size='3xl' variant='medium'>
              {name ||
                (isDraft
                  ? `Add hat ${hatIdDecimalToIp(BigInt(selectedHat?.id))} to this tree`
                  : selectedHat?.detailsObject?.data?.name ||
                    selectedHat?.details ||
                    (selectedHat && hatIdDecimalToIp(BigInt(selectedHat?.id))))}
            </Text>
            <Tooltip label='Copy Hat ID' placement='left' hasArrow>
              <IconButton
                onClick={copyHatId}
                icon={<Icon as={FaCopy} color='blue.500' />}
                aria-label='Copy Hat ID'
                variant='outline'
                colorScheme='blue.500'
                size='sm'
              />
            </Tooltip>
          </Flex>
          <Text>All changes are local until you deploy to chain.</Text>
        </Stack>

        {isTopHatOrMutable(selectedHat) && (
          <Accordion
            title='Hat Basics'
            subtitle='The fundamentals of the hat, including name, image, and description.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.basics)}
            open
          >
            <Stack spacing={4} w='100%'>
              <HatBasicsForm />
            </Stack>
          </Accordion>
        )}

        {!isTopHat(selectedHat) && (
          <Accordion
            title='Wearers'
            subtitle='Individual, multisig, DAO, or contract addresses that hold this token.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.wearer)}
          >
            <Stack spacing={4} w='100%'>
              <HatWearerForm />
            </Stack>
          </Accordion>
        )}

        {isTopHatOrMutable(selectedHat) && (
          <Accordion
            title='Responsibilities'
            subtitle='Specific work that wearers of this hat will be held accountable for.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.responsibilities)}
          >
            <Stack spacing={4} w='100%'>
              <ResponsibilitiesForm
                formName='responsibilities'
                title='RESPONSIBILITIES'
                label='Responsibility'
                subtitle={
                  <Text>
                    Tasks and responsibilities associated with this hat. More details in the{' '}
                    <Link href={CONFIG.docsLinks.authorities} className='underline' isExternal>
                      docs
                    </Link>
                    .
                  </Text>
                }
                Icon={BsListUl}
              />
            </Stack>
          </Accordion>
        )}

        {isTopHatOrMutable(selectedHat) && (
          <Accordion
            title='Authorities'
            subtitle='Authorities and rights that are controlled by wearers of this hat.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.powers)}
          >
            <Stack spacing={4} w='100%'>
              <AuthoritiesListForm
                formName='authorities'
                title='AUTHORITIES'
                subtitle={
                  <Text size='sm' variant='light'>
                    Actions this hat enables its wearer to take. More details in the{' '}
                    <Link href={CONFIG.docsLinks.authorities} className='underline' isExternal>
                      docs
                    </Link>
                    .
                  </Text>
                }
                label='Authority'
                Icon={BsKey}
              />
            </Stack>
          </Accordion>
        )}

        {isMutableNotTopHat(selectedHat) && (
          <Accordion
            title='Revocation & Eligibility'
            subtitle='The people or logic that determine when a wearer should have a hat.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.revocation)}
          >
            <Stack spacing={4} w='100%'>
              <HatManagementForm
                title={CONTROLLER_TYPES.eligibility}
                formName='revocationsCriteria'
                radioBoxConfig={{
                  name: 'isEligibilityManual',
                  label: 'Hat Revocation',
                  subLabel: 'How should revocation from wearers be handled?',
                }}
                inputConfig={{
                  label: 'ACCOUNTABILITY',
                  description: [
                    <Text key='manual' size='sm' variant='light'>
                      The address of the person or group that can manually revoke this hat from specific wearers. More
                      details in the{' '}
                      <Link href={CONFIG.docsLinks.eligibility} className='underline' isExternal>
                        docs
                      </Link>
                      .
                    </Text>,
                    <Text key='automatic' size='sm' variant='light'>
                      The address of the smart contract containing the logic about when a wearer should have this hat.
                      More details in the{' '}
                      <Link href={CONFIG.docsLinks.eligibility} className='underline' isExternal>
                        docs
                      </Link>
                      .
                    </Text>,
                  ],
                }}
                criteriaConfig={{
                  label: 'ACCOUNTABILITY REQUIREMENTS',
                  description: 'A written description of the logic in the Accountability Contract',
                }}
                onOpenModuleDrawer={() => openModuleDrawer(CONTROLLER_TYPES.eligibility)}
                setIsStandAloneHatterDeploy={setIsStandAloneHatterDeploy}
              />
            </Stack>
          </Accordion>
        )}

        {isMutableNotTopHat(selectedHat) && (
          <Accordion
            title='Deactivation & Reactivation'
            subtitle='The people and contracts that control this Hat.'
            dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.deactivation)}
          >
            <Stack spacing={4} w='100%'>
              <HatManagementForm
                title={CONTROLLER_TYPES.toggle}
                formName='deactivationsCriteria'
                radioBoxConfig={{
                  name: 'isToggleManual',
                  label: 'Hat Deactivation',
                  subLabel: 'How should hat deactivation and reactivation be handled?',
                }}
                inputConfig={{
                  label: 'DEACTIVATOR',
                  description: [
                    <Text fontSize='sm' variant='light' key='manual'>
                      The address of the person or group that can manually deactivate and reactive this hat. More
                      details in the{' '}
                      <Link href={CONFIG.docsLinks.toggle} className='underline' isExternal>
                        docs
                      </Link>
                      .
                    </Text>,
                    <Text fontSize='sm' variant='light' key='automatic'>
                      The address of the smart contract containing the logic about when this hat should be active. More
                      details in the{' '}
                      <Link href={CONFIG.docsLinks.toggle} className='underline' isExternal>
                        docs
                      </Link>
                      .
                    </Text>,
                  ],
                }}
                criteriaConfig={{
                  label: 'ACTIVATION REQUIREMENTS',
                  description:
                    'List any criteria that should be considered in the process of deactivating or reactivating this hat',
                }}
                onOpenModuleDrawer={() => openModuleDrawer(CONTROLLER_TYPES.toggle)}
                setIsStandAloneHatterDeploy={setIsStandAloneHatterDeploy}
              />
            </Stack>
          </Accordion>
        )}

        {posthog?.isFeatureEnabled('dev') && (
          <Stack>
            <HStack>
              <Text variant='medium'>Image URI:</Text>
              <Link href={ipfsUrl(selectedHat?.imageUri)} className='underline' isExternal>
                <Text maxW='350px' isTruncated>
                  {selectedHat?.imageUri !== '' ? selectedHat?.imageUri : 'Empty'}
                </Text>
              </Link>
            </HStack>
            <HStack>
              <Text variant='medium'>Details URI:</Text>
              <Link href={ipfsUrl(selectedHat?.details)} className='underline' isExternal>
                <Text maxW='350px' isTruncated>
                  {selectedHat?.details !== '' ? selectedHat?.details : 'Empty'}
                </Text>
              </Link>
            </HStack>
          </Stack>
        )}
      </Stack>

      <Slide direction='right' in={drawers?.eligibility || drawers?.toggle} style={{ zIndex: 1001, width: '100%' }}>
        {(drawers?.eligibility || drawers?.toggle) && (
          <ModuleDrawer
            onCloseModuleDrawer={() => setDrawers?.({})}
            isStandaloneHatterDeploy={isStandaloneHatterDeploy}
            title={drawers?.eligibility ? 'eligibility' : drawers?.toggle ? 'toggle' : undefined}
          />
        )}
      </Slide>
    </>
  );
};

export { EditMode };
