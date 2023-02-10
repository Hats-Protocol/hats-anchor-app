/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Box,
  useRadio,
  useRadioGroup,
  HStack,
  VStack,
  useStyleConfig,
} from '@chakra-ui/react';

const RadioCard = ({ children, variant, ...props }) => {
  const styles = useStyleConfig('RadioBox', { variant });
  const { getInputProps, getCheckboxProps } = useRadio({ ...props });

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as='label'>
      <input {...input} />
      <Box {...checkbox} __css={styles}>
        {children}
      </Box>
    </Box>
  );
};

const ControlledRadioBox = ({ name, value, updateRadio, options, stack }) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    value,
    onChange: (e) => {
      updateRadio(e);
    },
  });

  const Options = () =>
    options.map((v) => {
      const radio = getRadioProps({ value: v });
      return (
        <RadioCard key={v} {...radio}>
          {v}
        </RadioCard>
      );
    });

  const group = getRootProps();

  return stack === 'vertical' ? (
    <VStack {...group} alignItems='inherit'>
      <Options />
    </VStack>
  ) : (
    <HStack {...group}>
      <Options />
    </HStack>
  );
};

export default ControlledRadioBox;
