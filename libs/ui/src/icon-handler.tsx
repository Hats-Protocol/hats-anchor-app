import { Icon, Image } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { AuthorityInfo } from 'types';

const Key = dynamic(() => import('icons').then((i) => i.Key));

// TODO [high] tricky component to remove chakra dependency

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
    return <Icon as={icon as any} boxSize='14px' color='blackAlpha.800' zIndex={5} />;
  }

  if (authorityEnforcement?.icon) {
    return (
      <Icon
        as={authorityEnforcement?.icon as any}
        boxSize='14px'
        color={isExpanded ? 'blackAlpha.900' : 'blackAlpha.800'}
        zIndex={5}
      />
    );
  }

  if (imageUrl || authorityEnforcement.imageUri) {
    // already handling ipfs url
    return (
      <Image
        src={imageUrl || authorityEnforcement.imageUri}
        boxSize='18px'
        border='1px solid'
        borderColor='blackAlpha.300'
        borderRadius='full'
        alt='authority image'
        zIndex={5}
      />
    );
  }

  return <Icon as={Key} boxSize='14px' color='blackAlpha.700' zIndex={5} />;
};

export { IconHandler };
