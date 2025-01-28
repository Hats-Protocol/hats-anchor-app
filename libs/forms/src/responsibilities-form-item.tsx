'use client';

import { useHatForm } from 'contexts';
import { pick } from 'lodash';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'ui';

interface ResponsibilitiesFormItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formName: string;
  index: number;
  remove: (index: number) => void;
  setIndex: (index: number) => void;
  onOpen: () => void;
}

const ResponsibilitiesFormItem = ({ index, formName, remove, setIndex, onOpen }: ResponsibilitiesFormItemProps) => {
  const { localForm } = useHatForm();
  const { getValues } = pick(localForm, ['getValues']);
  const { label } = getValues?.(`${formName}.${index}`) ?? {};

  if (!localForm) return null;

  return (
    <div className='border-blackAlpha-300 border-b pb-2'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex flex-1'>
          <p className='text-sm font-light'>{label || 'New Responsibility'}</p>
        </div>

        <Button
          onClick={() => {
            onOpen();
            setIndex(index);
          }}
          aria-label='Edit'
        >
          <FaRegEdit />
        </Button>

        <Button onClick={() => remove(index)} aria-label='Remove'>
          <FaRegTrashAlt />
        </Button>
      </div>
    </div>
  );
};

export { ResponsibilitiesFormItem };
