const Input = {
  variants: {
    filled: {
      field: {
        bg: 'white',
        border: '1px',
        borderColor: 'gray.200',
        _focus: {
          bg: 'white',
        }
      },
    },
  },
  defaultProps: {
    variant: 'outline',
  },
};

export default Input;
