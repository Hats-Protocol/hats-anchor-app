import { SelectedHatContextProvider, TreeFormContextProvider } from 'contexts';
import { HatDrawer } from 'pages';

const HatDetails = () => (
  <TreeFormContextProvider>
    <SelectedHatContextProvider>
      <HatDrawer />
    </SelectedHatContextProvider>
  </TreeFormContextProvider>
);

export default HatDetails;
