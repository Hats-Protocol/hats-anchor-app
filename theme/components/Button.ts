import { StyleFunctionProps } from '@chakra-ui/react';

const Button = {
  baseStyles: {},
  variants: {
    filled: (props: StyleFunctionProps) => ({
      background: props.background || props.bg || 'whiteAlpha.900',
      color: props.color || props.colorScheme || 'gray.700',
      border: props.border || '1px solid',
      borderColor: props.borderColor || props.colorScheme || 'gray.700',
    }),
    outline: (props: StyleFunctionProps) => ({
      color: props.color || 'gray.700',
      borderColor: props.borderColor || props.colorScheme || 'gray.700',
    }),
  },
};

export default Button;
