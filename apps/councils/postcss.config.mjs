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
