import { ReactNode } from 'react';

const TreesLayout = ({ children }: { children: ReactNode }) => (
  <div className='max-h-screen w-screen overflow-hidden'>{children}</div>
);

export default TreesLayout;
