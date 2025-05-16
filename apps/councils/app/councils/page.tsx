import { Suspense } from 'react';

import { CouncilListPageOrgs } from '../../components/councils-list-page-orgs';

export default function CouncilsPage() {
  return (
    <Suspense>
      <CouncilListPageOrgs />
    </Suspense>
  );
}
