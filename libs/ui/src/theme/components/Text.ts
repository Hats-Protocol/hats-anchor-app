// rule of thumb -> 2xl = 24px, md = 16px (heading default, text default)
export const textSizes = {
  '6xl': {
    fontSize: '60px',
    lineHeight: '60px',
  },
  '5xl': {
    fontSize: '48px',
    lineHeight: '48px',
  },
  '4xl': {
    fontSize: '36px',
    lineHeight: '40px',
  },
  '3xl': {
    fontSize: '30px',
    lineHeight: '36px',
  },
  '2xl': {
    fontSize: '24px',
    lineHeight: '32px',
  },
  xl: {
    fontSize: '20px',
    lineHeight: '28px',
  },
  lg: {
    fontSize: '18px',
    lineHeight: '28px',
  },
  md: {
    fontSize: '16px',
    lineHeight: '24px',
  },
  sm: {
    fontSize: '14px',
    lineHeight: '20px',
  },
  xs: {
    fontSize: '12px',
    lineHeight: '16px',
  },
};

const Text = {
  baseStyle: {},
  sizes: textSizes,
  variants: {
    default: {},
    medium: {
      fontWeight: 'medium',
    },
    lightMedium: {
      color: 'blackAlpha.800',
      fontWeight: 'medium',
    },
    light: {
      color: 'blackAlpha.700',
    },
    gray: {
      color: 'gray.500',
    },
    mono: {
      fontFamily: 'mono',
    },
    cashtag: {
      display: 'inline-block',
      bg: 'blackAlpha.100',
      color: 'blackAlpha.700',
      fontWeight: 'medium',
      textDecoration: 'underline',
      px: 1,
    },
  },
  defaultProps: {
    size: 'md',
    variant: 'default',
  },
};

export default Text;
