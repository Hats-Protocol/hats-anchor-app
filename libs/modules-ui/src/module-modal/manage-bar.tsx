import { useConnectModal } from '@rainbow-me/rainbowkit';
import { find, map, some } from 'lodash';
import { ReactNode, useMemo } from 'react';
import { Button } from 'ui';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

interface Section {
  label: string;
  value: boolean;
  hasRole: boolean;
  section: ReactNode;
}

interface ManageButton {
  label: string;
  onClick: () => void;
  colorScheme?: string;
  hasRole?: boolean;
  section?: string;
}

interface ManageBarProps {
  sections: Section[];
  buttons: ManageButton[];
  chainId: number | undefined;
}

const ManageBarWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className='absolute bottom-0 min-h-[100px] w-full rounded-br-xl border-b border-t border-black/20 bg-white/90 py-4 md:py-10'>
      <div className='flex w-full items-center justify-center'>
        <div className='flex gap-4'>{children}</div>
      </div>
    </div>
  );
};

export const ManageBar = ({ sections, buttons, chainId }: ManageBarProps) => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const activeSection = useMemo(() => {
    return find(sections, (s) => s.value);
  }, [sections]);
  const hasAnyRole = useMemo(() => {
    return some(sections, ({ hasRole }) => hasRole) || some(buttons, ({ hasRole }) => hasRole);
  }, [sections, buttons]);

  if (activeSection) {
    return (
      <div className='absolute bottom-0 min-h-[100px] w-full border-b border-t border-black/20 bg-white/90 py-4 md:py-10'>
        {activeSection.section}
      </div>
    );
  }

  if (!address) {
    return (
      <ManageBarWrapper>
        <Button variant='outline-blue' size='sm' onClick={openConnectModal}>
          Connect Wallet
        </Button>
      </ManageBarWrapper>
    );
  }

  if (!hasAnyRole) return null;

  if (chainId !== currentChainId) {
    return (
      <ManageBarWrapper>
        <Button
          variant='outline-blue'
          size='sm'
          onClick={() => {
            if (!chainId) return;
            switchChain({ chainId });
          }}
        >
          Switch Network
        </Button>
      </ManageBarWrapper>
    );
  }

  return (
    <ManageBarWrapper>
      {map(buttons, ({ onClick, label, colorScheme }) => (
        <Button
          variant='outline-blue'
          // colorScheme={colorScheme || 'blue.500'}
          size='sm'
          onClick={onClick}
          key={label}
        >
          {label}
        </Button>
      ))}
    </ManageBarWrapper>
  );
};
