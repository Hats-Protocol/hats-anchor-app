const NumberInput = {
  variants: {
    filled: {
      field: {
        bg: 'white',
        border: '1px',
        borderColor: 'gray.200',
      },
    },
    outline: {
      field: {
        bg: 'white',
        _hover: {
          bg: 'whiteAlpha.700',
        },
      },
    },
  },
  defaultProps: {
    variant: 'outline',
  },
};

export default NumberInput;
