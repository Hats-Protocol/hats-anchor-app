import reactHooksPlugin from 'eslint-plugin-react-hooks';

import baseConfig from '../../eslint.config.mjs';

export default [...baseConfig, reactHooksPlugin.configs['recommended-latest']];
