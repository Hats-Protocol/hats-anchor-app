import { TreeFormContextProvider } from 'contexts';
import { TreePage } from 'pages';

const TreeDetails = () => {
  console.log('tree page');

  return (
    <TreeFormContextProvider>
      <TreePage />
    </TreeFormContextProvider>
  );
};

export default TreeDetails;
