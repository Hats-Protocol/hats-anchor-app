import { extendTheme } from '@chakra-ui/react';

import RadioBox from '@/components/atoms/RadioBox';

const theme = extendTheme({
  colors: {},
  components: {
    RadioBox,
  },
  fonts: {},
  shadows: {
    card: '0px 2px 4px -1px rgba(0, 0, 0, 0.06), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)',
  },
});

export default theme;
