import {
  Flex,
  Icon,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { BsKey, BsListUl } from 'react-icons/bs';
import { FaCopy } from 'react-icons/fa';

import Accordion from '@/components/atoms/Accordion';
import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import CONFIG, { FORM_FIELDS, MODULE_TYPES } from '@/utils/constants';
import { useHatForm } from '@/contexts/HatFormContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import AuthoritiesForm from '@/forms/AuthoritiesForm';
import HatBasicsForm from '@/forms/HatBasicsForm';
import HatManagementForm from '@/forms/HatManagementForm';
import HatWearerForm from '@/forms/HatWearerForm';
import ResponsibilitiesForm from '@/forms/ResponsibilitiesForm';
import useToast from '@/hooks/useToast';
import { isMutableNotTopHat, isTopHat, isTopHatOrMutable } from '@/lib/hats';

const EditMode = () => {
  const { selectedHat, isDraft, treeToDisplay } = useTreeForm();
  const { getDirtyFieldsForAccordion, localForm } = useHatForm();
  const toast = useToast();

  const { onCopy } = useClipboard(selectedHat?.id || '');

  const copyHatId = () => {
    onCopy();
    toast.success({ title: 'Copied Hat ID to clipboard' });
  };

  const name = _.get(
    _.find(treeToDisplay, ['id', selectedHat?.id]),
    'displayName',
  );

  if (!selectedHat || !localForm) return null;

  return (
    <Stack
      w='100%'
      overflow='scroll'
      height='calc(100% - 150px)'
      position='relative'
      p={10}
      spacing={10}
    >
      <Stack>
        <Flex justify='space-between' align='center'>
          <Text fontSize={32} fontWeight='medium'>
            {name ||
              (isDraft
                ? `Add hat ${hatIdDecimalToIp(
                    BigInt(selectedHat?.id),
                  )} to this tree`
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
          dirtyFieldsList={getDirtyFieldsForAccordion(
            FORM_FIELDS.responsibilities,
          )}
        >
          <Stack spacing={4} w='100%'>
            <ResponsibilitiesForm
              formName='responsibilities'
              title='RESPONSIBILITIES'
              label='Responsibility'
              subtitle={
                <Text>
                  Tasks and responsibilities associated with this hat. More
                  details in the{' '}
                  <ChakraNextLink
                    href={CONFIG.docsLinks.authorities}
                    isExternal
                    decoration
                  >
                    docs
                  </ChakraNextLink>
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
          title='Powers'
          subtitle='Permissions and rights that are controlled by wearers of this hat.'
          dirtyFieldsList={getDirtyFieldsForAccordion(FORM_FIELDS.powers)}
        >
          <Stack spacing={4} w='100%'>
            <AuthoritiesForm
              formName='authorities'
              title='PERMISSIONS'
              subtitle={
                <Text>
                  Actions this hat enables its wearer to take. More details in
                  the{' '}
                  <ChakraNextLink
                    href={CONFIG.docsLinks.authorities}
                    isExternal
                    decoration
                  >
                    docs
                  </ChakraNextLink>
                  .
                </Text>
              }
              label='Permission'
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
              title={MODULE_TYPES.eligibility}
              formName='revocationsCriteria'
              radioBoxConfig={{
                name: 'isEligibilityManual',
                label: 'Hat Revocation',
                subLabel: 'How should revocation from wearers be handled?',
              }}
              inputConfig={{
                label: 'ACCOUNTABILITY',
                description: [
                  <Text key='manual'>
                    The address of the person or group that can manually revoke
                    this hat from specific wearers. More details in the{' '}
                    <ChakraNextLink
                      href={CONFIG.docsLinks.eligibility}
                      isExternal
                      decoration
                    >
                      docs
                    </ChakraNextLink>
                    .
                  </Text>,
                  <Text key='automatic'>
                    The address of the smart contract containing the logic about
                    when a wearer should have this hat. More details in the{' '}
                    <ChakraNextLink
                      href={CONFIG.docsLinks.eligibility}
                      isExternal
                      decoration
                    >
                      docs
                    </ChakraNextLink>
                    .
                  </Text>,
                ],
              }}
              criteriaConfig={{
                label: 'ACCOUNTABILITY REQUIREMENTS',
                description:
                  'A written description of the logic in the Accountability Contract',
              }}
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
              title={MODULE_TYPES.toggle}
              formName='deactivationsCriteria'
              radioBoxConfig={{
                name: 'isToggleManual',
                label: 'Hat Deactivation',
                subLabel:
                  'How should hat deactivation and reactivation be handled?',
              }}
              inputConfig={{
                label: 'DEACTIVATOR',
                description: [
                  <Text key='manual'>
                    The address of the person or group that can manually
                    deactivate and reactive this hat. More details in the{' '}
                    <ChakraNextLink
                      href={CONFIG.docsLinks.toggle}
                      isExternal
                      decoration
                    >
                      docs
                    </ChakraNextLink>
                    .
                  </Text>,
                  <Text key='automatic'>
                    The address of the smart contract containing the logic about
                    when this hat should be active. More details in the{' '}
                    <ChakraNextLink
                      href={CONFIG.docsLinks.toggle}
                      isExternal
                      decoration
                    >
                      docs
                    </ChakraNextLink>
                    .
                  </Text>,
                ],
              }}
              criteriaConfig={{
                label: 'ACTIVATION REQUIREMENTS',
                description:
                  'List any criteria that should be considered in the process of deactivating or reactivating this hat',
              }}
            />
          </Stack>
        </Accordion>
      )}
    </Stack>
  );
};

export default EditMode;

// interface EditModeProps {
//   setUnsavedData: Dispatch<SetStateAction<Partial<FormData> | undefined>>;
//   unsavedData: Partial<FormData> | undefined;
//   setIsLoading: (isLoading: boolean) => void;
// }
