import { StyleFunctionProps } from '@chakra-ui/react';

const Button = {
  baseStyles: {},
  variants: {
    filled: (props: StyleFunctionProps) => ({
      background: props.background || props.bg || 'Functional-LinkPrimary',
      color: 'white',
      _hover: {},
    }),
    whiteFilled: (props: StyleFunctionProps) => ({
      background: props.background || props.bg || 'white',
      color: props.color || 'gray.700',
      border: props.border || '1px solid',
      borderColor: 'gray.300',
    }),
    primary: (props: StyleFunctionProps) => ({
      background: props.background || props.bg || 'blue.500',
      color: props.color || 'white',
      _hover: {
        background: props.hoverBackground || props.hoverBg || 'blue.700',
      },
    }),
    ghostBg: (props: StyleFunctionProps) => ({
      background: 'blackAlpha.50',
      color: props.color || props.colorScheme || 'gray.700',
      _hover: {
        background: props.hoverBackground || props.hoverBg || 'blackAlpha.200',
      },
    }),
    outline: (props: StyleFunctionProps) => ({
      color: props.color || 'gray.700',
      borderColor: props.borderColor || 'gray.300',
    }),
    outlineMatch: (props: StyleFunctionProps) => ({
      color: props.color || props.colorScheme || 'gray.700',
      border: props.border || '1px solid',
      borderColor: props.borderColor || props.colorScheme || 'gray.700',
      _hover: {
        background: props.background || props.bg || 'blackAlpha.100',
        color: props.color || props.colorScheme || 'gray.700',
        borderColor: props.borderColor || props.colorScheme || 'gray.700',
      },
    }),
    text: (props: StyleFunctionProps) => ({
      // Using important here to override media query styles
      height: 'auto!',
      minHeight: '0!',
      padding: '0!',
      border: 'none',
      color: props.color || props.colorScheme,
      fontWeight: 'normal',
    })
  },
};

export default Button;
