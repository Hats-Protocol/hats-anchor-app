// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { join } = require('path');

const postcssConfig = {
  plugins: {
    tailwindcss: {
      // config: join(__dirname, 'tailwind.config.ts'),
    },
    autoprefixer: {},
  },
};

export default postcssConfig;
