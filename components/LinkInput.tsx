import { Button, HStack, Input as ChakraInput, Stack } from '@chakra-ui/react';

import { validateURL } from '@/lib/general';

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
    <Stack>
      <ChakraInput
        value={inputLink}
        onChange={(e) => {
          setInputLink(e.target.value);
          setIsLinkValid(validateURL(e.target.value));
        }}
        placeholder='https://example.com'
      />
      <HStack justifyContent='end'>
        <Button
          colorScheme='blue'
          mr={3}
          onClick={handleSave}
          isDisabled={!isLinkValid}
        >
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
      </HStack>
    </Stack>
  );
};

export default LinkInput;
