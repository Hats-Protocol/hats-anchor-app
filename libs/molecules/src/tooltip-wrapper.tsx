import { ReactNode } from 'react';
import { Tooltip } from 'ui';

// TooltipWrapper component
const TooltipWrapper = ({
  children,
  label,
  isSameChain = true,
  isConnected = true,
}: {
  children: ReactNode;
  label: string;
  isSameChain?: boolean;
  isConnected?: boolean;
}) => {
  if (!isConnected) {
    return <Tooltip label='Please connect your wallet'>{children}</Tooltip>;
  }
  if (!isSameChain) {
    return <Tooltip label='Please connect to the correct chain'>{children}</Tooltip>;
  }

  return <Tooltip label={label}>{children}</Tooltip>;
};

export { TooltipWrapper };
