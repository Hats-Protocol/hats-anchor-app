import { TreeFormContextProvider } from 'contexts';
import { TreePage } from 'pages';

const TreeDetails = ({
  params,
}: {
  params: { chainId: string; treeId: string };
}) => {
  return (
    <TreeFormContextProvider>
      <TreePage params={params} />
    </TreeFormContextProvider>
  );
};

export default TreeDetails;
