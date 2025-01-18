import { Button, ButtonGroup, ButtonProps } from '@chakra-ui/react';
import { map } from 'lodash';
import { Dispatch, SetStateAction } from 'react';

export const ControlledRadioBox = ({
  options,
  selectedOption,
  setSelectedOption,
  size,
}: {
  options: string[];
  selectedOption: string;
  setSelectedOption: Dispatch<SetStateAction<string>>;
  size?: ButtonProps['size'];
}) => {
  return (
    <ButtonGroup isAttached>
      {map(options, (option) => (
        <Button
          key={option}
          variant={option === selectedOption ? 'filled' : 'outlineMatch'}
          size={size || 'md'}
          colorScheme='blue.500'
          onClick={() => setSelectedOption(option)}
        >
          {option}
        </Button>
      ))}
    </ButtonGroup>
  );
};
