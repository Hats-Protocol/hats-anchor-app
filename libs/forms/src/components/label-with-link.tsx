'use client';

import { Modal, useOverlay } from 'contexts';
import { UseFormReturn } from 'react-hook-form';
import { BsLink45Deg } from 'react-icons/bs';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'ui';

import { Input } from './input';
import { LinkInput } from './link-input';

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
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <Input name={labelName} localForm={localForm} placeholder='Label' />
        <Button className='text-normal text-muted-foreground px-8' onClick={handleEdit}>
          <BsLink45Deg />
          {linkValue ? 'Edit' : 'Add'} a Link
        </Button>
        <Button onClick={handleRemoveItem} aria-label='Remove'>
          <FaRegTrashAlt />
        </Button>
        <Modal name={`editLabel-${title}`} title={`Edit ${title.toLowerCase()} Link`}>
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
      </div>

      {linkValue && <p className='text-muted-foreground text-sm'>{linkValue}</p>}
    </div>
  );
};

export { LabelWithLink, type LabelWithLinkProps };
