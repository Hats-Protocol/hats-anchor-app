import { TreeFormContextProvider } from 'contexts';
import { TreePage } from 'pages';

const TreeDetails = () => (
  <TreeFormContextProvider>
    <TreePage />
  </TreeFormContextProvider>
);

export default TreeDetails;
