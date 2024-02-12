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
    primary: (props: StyleFunctionProps) => ({
      background: props.background || props.bg || 'blue.500',
      color: props.color || 'white',
      _hover: {
        background: props.hoverBackground || props.hoverBg || 'blue.700',
      },
    }),
    outline: (props: StyleFunctionProps) => ({
      color: props.color || 'gray.700',
      borderColor: props.borderColor || props.colorScheme || 'gray.700',
    }),
    outlineMatch: (props: StyleFunctionProps) => ({
      color: props.color || props.colorScheme || 'gray.700',
      border: props.border || '1px solid',
      borderColor: props.borderColor || props.colorScheme || 'gray.700',
      // TODO adjust these slightly on hover
      _hover: {
        background: props.background || props.bg || 'blackAlpha.100',
        color: props.color || props.colorScheme || 'gray.700',
        borderColor: props.borderColor || props.colorScheme || 'gray.700',
      },
    }),
  },
};

export default Button;
