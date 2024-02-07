import { textSizes } from './Text';

const Heading = {
  baseStyle: {},
  variants: {
    default: {
      fontWeight: 'bold',
    },
    medium: {
      fontWeight: 'medium',
    },
    lightMedium: {
      color: 'blackAlpha.800',
      fontWeight: 'medium',
    },
    mono: {
      fontFamily: 'mono',
    },
  },
  sizes: textSizes,
  defaultProps: {
    size: 'xl',
    variant: 'default',
  },
};

export default Heading;
