import { ModuleTabs } from 'modules-ui';
import React from 'react';
import { Card } from 'ui';

const Modules = () => (
  <div className='flex flex-col items-center pt-[100px] gap-6'>
    <h2>Modules by Chain</h2>
    <Card className='max-w-[600px]'>
      <ModuleTabs />
    </Card>
  </div>
);

export default Modules;
