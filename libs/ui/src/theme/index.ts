import { extendTheme } from '@chakra-ui/react';

import Button from './components/Button';
import Card from './components/Card';
import FormLabel from './components/FormLabel';
import Heading from './components/Heading';
import Input from './components/Input';
import NumberInput from './components/NumberInput';
import RadioBox from './components/RadioBox';
import Text from './components/Text';
import Textarea from './components/Textarea';

const theme = extendTheme({
  colors: {
    // INFORMATIVE
    'Informative-Human': '#B83280',
    'Informative-Code': '#2C7A7B',
    // FUNCTIONAL
    'Functional-Success': '#25855A',
    'Functional-Error': '#C53030',
    'Functional-LinkPrimary': '#2B6CB0',
    'Functional-LinkSecondary': '#718096',
  },
  components: {
    Button,
    Card,
    FormLabel,
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
