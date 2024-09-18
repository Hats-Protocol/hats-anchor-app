import '@fontsource-variable/inter';

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
  breakpoints: {
    base: '0em',
    xs: '24em', // Added 384px to catch high DPI mobile devices
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
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
  fonts: {
    inter: 'Inter Variable',
    body: "'Inter Variable', sans-serif",
    heading: "'Inter Variable', sans-serif",
  },
  global: {
    body: {
      fontFamily: "'Inter Variable', sans-serif",
    },
  },
});

export default theme;
