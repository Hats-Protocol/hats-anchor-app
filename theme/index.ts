import { extendTheme } from '@chakra-ui/react';

import RadioBox from '@/components/atoms/RadioBox';

const theme = extendTheme({
  colors: {},
  components: {
    RadioBox,
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'white',
            border: '1px',
            borderColor: 'gray.200',
          },
        },
      },
    },
    Textarea: {
      variants: {
        filled: {
          bg: 'white',
          border: '1px',
          borderColor: 'gray.200',
        },
      },
    },
  },
  fonts: {},
});

export default theme;
