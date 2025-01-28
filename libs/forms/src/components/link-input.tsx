'use client';

import { Button } from 'ui';
import { validateURL } from 'utils';

interface LinkInputProps {
  inputLink: string;
  setInputLink: (inputLink: string) => void;
  isLinkValid: boolean;
  setIsLinkValid: (isLinkValid: boolean) => void;
  handleSave: () => void;
  title: string;
  setModals?: (modals: any) => void;
}

const LinkInput = ({
  inputLink,
  setInputLink,
  isLinkValid,
  setIsLinkValid,
  handleSave,
  title,
  setModals,
}: LinkInputProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <input
        value={inputLink}
        onChange={(e) => {
          setInputLink(e.target.value);
          setIsLinkValid(validateURL(e.target.value));
        }}
        placeholder='https://example.com'
      />

      <div className='flex justify-end gap-3'>
        <Button onClick={handleSave} disabled={!isLinkValid}>
          Ok
        </Button>

        <Button
          variant='ghost'
          onClick={() =>
            setModals?.({
              [`editLabel-${title}`]: false,
            })
          }
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export { LinkInput, type LinkInputProps };
