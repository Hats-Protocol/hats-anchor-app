import posthog from 'posthog-js';

import { CouncilListPage } from '../components/council-list-page';
import { CouncilListPageOrgs } from '../components/councils-list-page-orgs';

const Home = () => {
  const isOrgs = posthog.isFeatureEnabled('orgs') || process.env.NODE_ENV !== 'production';

  if (isOrgs) {
    return <CouncilListPageOrgs />;
  }

  return <CouncilListPage />;
};

export default Home;
