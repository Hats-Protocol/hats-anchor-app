import { Button, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { Modal, useOverlay } from 'contexts';
import { UseFormReturn } from 'react-hook-form';
import { BsLink45Deg } from 'react-icons/bs';
import { FaRegTrashAlt } from 'react-icons/fa';

import { Input, LinkInput } from '../forms';

interface LabelWithLinkProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  title: string;
  handleRemoveItem: () => void;
  handleEdit: () => void;
  handleSave: () => void;
  inputLink: string;
  setInputLink: (inputLink: string) => void;
  isLinkValid: boolean;
  setIsLinkValid: (isLinkValid: boolean) => void;
  labelName: string;
  linkName: string;
}

const LabelWithLink = ({
  localForm,
  title,
  handleRemoveItem,
  handleEdit,
  handleSave,
  inputLink,
  setInputLink,
  isLinkValid,
  setIsLinkValid,
  labelName,
  linkName,
}: LabelWithLinkProps) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { watch } = localForm;
  const linkValue = watch(linkName);

  return (
    <Stack>
      <HStack alignItems='center' justifyContent='space-between'>
        <Input name={labelName} localForm={localForm} placeholder='Label' />
        <Button
          leftIcon={<BsLink45Deg />}
          onClick={handleEdit}
          px={8}
          variant='outline'
          fontWeight='normal'
          colorScheme='blackAlpha.300'
        >
          {linkValue ? 'Edit' : 'Add'} a Link
        </Button>
        <IconButton
          onClick={handleRemoveItem}
          icon={<FaRegTrashAlt />}
          aria-label='Remove'
          variant='ghost'
          borderColor='blackAlpha.300'
        />
        <Modal
          name={`editLabel-${title}`}
          title={`Edit ${title.toLowerCase()} Link`}
          localOverlay={localOverlay}
        >
          <LinkInput
            inputLink={inputLink}
            setInputLink={setInputLink}
            isLinkValid={isLinkValid}
            setIsLinkValid={setIsLinkValid}
            handleSave={handleSave}
            title={title}
            setModals={setModals}
          />
        </Modal>
      </HStack>

      {linkValue && (
        <Text size='sm' variant='gray'>
          {linkValue}
        </Text>
      )}
    </Stack>
  );
};

export default LabelWithLink;
