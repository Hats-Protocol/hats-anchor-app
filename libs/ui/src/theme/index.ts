import { extendTheme } from '@chakra-ui/react';

import Button from './components/Button';
import Card from './components/Card';
import Heading from './components/Heading';
import Input from './components/Input';
import NumberInput from './components/NumberInput';
import RadioBox from './components/RadioBox';
import Text from './components/Text';
import Textarea from './components/Textarea';

const theme = extendTheme({
  colors: {},
  components: {
    Button,
    Card,
    Heading,
    Input,
    NumberInput,
    RadioBox,
    Text,
    Textarea,
  },
  global: {
    body: {
      fontFamily: 'Inter',
    },
  },
});

export default theme;
