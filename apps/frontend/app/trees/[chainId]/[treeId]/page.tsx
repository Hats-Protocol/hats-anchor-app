import { TreeFormContextProvider } from 'contexts';
import { TreePage, TreePageMobile } from 'pages';

const TreeDetails = ({
  params,
}: {
  params: { chainId: string; treeId: string };
}) => {
  return (
    <TreeFormContextProvider>
      <div className='hidden md:block'>
        <TreePage params={params} />
      </div>
      <div className='md:hidden'>
        <TreePageMobile exists />
      </div>
    </TreeFormContextProvider>
  );
};

export default TreeDetails;
