import { map } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { Button, ButtonGroup, ButtonProps } from 'ui';

const ControlledRadioBox = ({ options, selectedOption, setSelectedOption, size }: ControlledRadioBoxProps) => {
  return (
    <ButtonGroup>
      {map(options, (option) => (
        <Button
          key={option}
          variant={option === selectedOption ? 'default' : 'outline-blue'}
          size={size || ('md' as ButtonProps['size'])}
          onClick={() => setSelectedOption(option)}
        >
          {option}
        </Button>
      ))}
    </ButtonGroup>
  );
};

interface ControlledRadioBoxProps {
  options: string[];
  selectedOption: string;
  setSelectedOption: Dispatch<SetStateAction<string>>;
  size?: ButtonProps['size'] | null | undefined;
}

export { ControlledRadioBox, type ControlledRadioBoxProps };
