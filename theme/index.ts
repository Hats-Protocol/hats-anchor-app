import { extendTheme } from '@chakra-ui/react';

import Button from './components/Button';
import RadioBox from './components/RadioBox';

const theme = extendTheme({
  colors: {},
  components: {
    RadioBox,
    Button,
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
