import { isEmpty, map, size, subtract } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { AllowlistProfile } from 'types';
import { Button, Card } from 'ui';
import { formatAddress } from 'utils';

// currently doesn't require a Form handler/context

const RemoveForm = ({
  updateList,
  setUpdateList,
  setUpdating,
  handleRemoveWearers,
  isLoading,
}: {
  updateList: AllowlistProfile[];
  setUpdateList: Dispatch<SetStateAction<AllowlistProfile[]>>;
  setUpdating: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  handleRemoveWearers: () => void;
}) => {
  return (
    <div className='w-full px-4 md:px-10'>
      <div className='flex flex-col gap-4'>
        <h3 className='text-md'>Addresses selected for removal</h3>
        <Card className='border border-gray-200'>
          <div className='m-2 mx-4'>
            {isEmpty(updateList) ? (
              <p className='text-gray-500'>Select an address to remove</p>
            ) : (
              <p>
                {map(
                  updateList,
                  (profile, index) =>
                    `${profile.ensName || formatAddress(profile.id)}${
                      index < subtract(size(updateList), 1) ? ', ' : ''
                    }`,
                )}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className='flex w-full justify-between'>
        <Button
          variant='outline-blue'
          size='sm'
          onClick={() => {
            setUpdateList([]);
            setUpdating(false);
          }}
        >
          Cancel
        </Button>

        <Button
          variant='destructive'
          size='sm'
          // isLoading={isLoading}
          disabled={isEmpty(updateList) || isLoading}
          onClick={handleRemoveWearers}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export { RemoveForm };
