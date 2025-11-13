import { SelectedHatContextProvider, TreeFormContextProvider } from 'contexts';
import dynamic from 'next/dynamic';
// import { SearchParamsProps } from 'types';

const HatDetailsChanges = dynamic(() => import('organisms').then((mod) => ({ default: mod.HatDetailsChanges })));

const HatDetails = () => (
  <TreeFormContextProvider>
    <SelectedHatContextProvider>
      <HatDetailsChanges />
    </SelectedHatContextProvider>
  </TreeFormContextProvider>
);

// interface HatDetailsProps extends SearchParamsProps {
//   params: { chainId: string; treeId: string; hatId: string };
// }

export default HatDetails;
