'use client';

import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useHatForm } from 'contexts';
import { pick } from 'lodash';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { Button, Link, Tooltip } from 'ui';
import { getHostnameFromURL } from 'utils';

const NON_EDIT_AUTHORITIES = [AUTHORITY_TYPES.hsg, AUTHORITY_TYPES.modules, AUTHORITY_TYPES.account];

const AuthoritiesFormItem = ({ index, formName, remove, setIndex, onOpen }: AuthoritiesFormItemProps) => {
  const { localForm } = useHatForm();
  const { getValues } = pick(localForm, ['getValues']);
  const { gate, type, label, link } = getValues?.(`${formName}.${index}`) ?? {};
  const isGate = type === AUTHORITY_TYPES.gate || type === 'token'; // originally set as 'token'/ gate is more general
  const hostname = getHostnameFromURL(gate);
  const isNonEditAuthority = NON_EDIT_AUTHORITIES.includes(type);

  if (!localForm) return null;

  return (
    <div className='border-blackAlpha-300 border-b pb-2'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex flex-1 flex-col gap-1'>
          <p className='text-sm font-light'>{label || 'New Authority'}</p>
          {isGate && ( // TODO handle when combined with social overrides
            <div>
              <Link
                // TODO this override is only necessary because snapshot gate should be equal to the link, probably?
                href={hostname === 'snapshot.org' ? link : gate}
                isExternal
                className='text-xs text-blue-500'
              >
                {hostname}
              </Link>
            </div>
          )}
        </div>

        <Tooltip label={isNonEditAuthority ? 'Cannot edit this authority' : ''}>
          <Button
            onClick={() => {
              if (isNonEditAuthority) return;
              onOpen();
              setIndex(index);
            }}
            disabled={isNonEditAuthority}
            aria-label='Edit'
            variant='ghost'
          >
            <FaRegEdit />
          </Button>
        </Tooltip>

        <Tooltip label={isNonEditAuthority ? 'Cannot remove this authority' : ''}>
          <Button
            onClick={() => {
              if (isNonEditAuthority) return;
              remove(index);
            }}
            aria-label='Remove'
            variant='ghost'
            disabled={isGate || isNonEditAuthority}
          >
            <FaRegTrashAlt />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

interface AuthoritiesFormItemProps {
  formName: string;
  index: number;
  remove: (index: number) => void;
  setIndex: (index: number) => void;
  onOpen: () => void;
}

export { AuthoritiesFormItem, type AuthoritiesFormItemProps };
