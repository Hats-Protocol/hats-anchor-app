'use client';

import dynamic from 'next/dynamic';

const SlimModuleDetails = dynamic(() =>
  import('modules-ui').then((mod) => mod.SlimModuleDetails),
);

const KnownModule = () => {
  return <SlimModuleDetails type='eligibility' />;
};

export default KnownModule;
