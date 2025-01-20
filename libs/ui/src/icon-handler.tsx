import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { AuthorityInfo } from 'types';

const Key = dynamic(() => import('icons').then((i) => i.Key));

const IconHandler = ({
  icon,
  authorityEnforcement,
  imageUrl,
  isExpanded,
}: {
  icon: ReactNode | undefined;
  authorityEnforcement: Partial<AuthorityInfo>;
  imageUrl: string | undefined;
  isExpanded: boolean;
}) => {
  if (icon) {
    const IconComponent = icon as any;
    return <IconComponent className='z-[5] h-[14px] w-[14px] text-slate-800' />;
  }

  if (authorityEnforcement?.icon) {
    const IconComponent = authorityEnforcement?.icon as any;
    return <IconComponent className='z-[5] h-[14px] w-[14px] text-slate-800' />;
  }

  if (imageUrl || authorityEnforcement.imageUri) {
    // already handling ipfs url
    return (
      <img
        src={imageUrl || authorityEnforcement.imageUri}
        className='z-[5] h-[18px] w-[18px] rounded-full border border-slate-300'
        alt='authority enforcement type'
      />
    );
  }

  return <Key className='z-[5] h-[14px] w-[14px] text-slate-800' />;
};

export { IconHandler };
