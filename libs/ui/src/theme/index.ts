import { extendTheme } from '@chakra-ui/react';

import Button from './components/Button';
import Heading from './components/Heading';
import Input from './components/Input';
import RadioBox from './components/RadioBox';
import Text from './components/Text';
import Textarea from './components/Textarea';

const theme = extendTheme({
  colors: {},
  components: {
    Button,
    Heading,
    Input,
    RadioBox,
    Text,
    Textarea,
  },
  fonts: {},
});

export default theme;
