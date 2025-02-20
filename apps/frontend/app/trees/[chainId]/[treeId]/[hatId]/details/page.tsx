import { SelectedHatContextProvider, TreeFormContextProvider } from 'contexts';
import { HatDetailsChanges } from 'organisms';
// import { SearchParamsProps } from 'types';

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
