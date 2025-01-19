import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { FiCopy } from 'react-icons/fi';
import { HatsAccount1ofN, ModuleFunction, SupportedChains, UseCustomToastReturn } from 'types';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';

export const populateHatsAccountsAuthorities = ({
  details,
  hatId,
  chainId,
  predictedAddress,
  deployFn,
  toast,
}: {
  details?: HatsAccount1ofN[];
  hatId: Hex;
  chainId: SupportedChains | undefined;
  predictedAddress?: Hex | null;
  deployFn: () => void;
  toast: UseCustomToastReturn;
}) => {
  const undeployedWalletAuth = {
    label: `Control 1/N HatsAccount (${formatAddress(predictedAddress)})`,
    link: predictedAddress as string,
    description: `Wearers of this hat are able to take actions via the shared HatsAccount at [${formatAddress(
      predictedAddress,
    )}](${explorerUrl(
      chainId,
    )}/address/${predictedAddress}). This account has not yet been deployed and can be deployed permissionlessly.  
      Once deployed, any of the wearers of this hat can take full control of the assets associated with the shared account.  
      For more information about HatsAccount, see the Hats [documentation](https://github.com/Hats-Protocol/hats-account).`,
    type: AUTHORITY_TYPES.account,
    id: predictedAddress as string,
    instanceAddress: predictedAddress as Hex,
    functions: [
      {
        isCustom: true,
        label: 'Deploy',
        description: 'Deploy the HatsAccount authority',
        onClick: deployFn,
        primary: true,
      },
      {
        // TODO why is the "not a wearer" tooltip showing up here but not on the deployed version
        label: 'Copy Address',
        description: 'Copy the address of the HatsAccount',
        isCustom: true,
        onClick: () => {
          if (!predictedAddress) return;
          navigator.clipboard.writeText(predictedAddress); // ? HOOK WORKAROUND HERE
          toast.info({
            title: 'Successfully copied wearer address to clipboard',
          });
        },
        icon: FiCopy,
      },
    ] as ModuleFunction[],
    hatId,
    isDeployed: false,
  };

  if (!details || details.length === 0) {
    return [undeployedWalletAuth];
  }

  return details.map((wallet) => ({
    label: `Control over 1/N HatsAccount (${formatAddress(wallet.id)})`,
    link: wallet.accountOfHat?.id as string,
    description: `Wearers of this hat are able to take actions via the shared HatsAccount account at [${formatAddress(
      wallet.id,
    )}](${explorerUrl(chainId)}/address/${wallet.id}). 
    Any of the wearers of this hat can take full control of the assets associated with the shared account.  
    For more information about HatsAccount, see the Hats [documentation](https://github.com/Hats-Protocol/hats-account).`,
    type: AUTHORITY_TYPES.account,
    id: wallet.id as string,
    // functions: wallet.operations,
    functions: [
      {
        label: 'Copy Address',
        description: 'Copy the address of the HatsAccount',
        isCustom: true,
        onClick: () => {
          navigator.clipboard.writeText(wallet.id);
          toast.info({
            title: 'Successfully copied wearer address to clipboard',
          });
        },
        icon: FiCopy,
      },
    ] as unknown as ModuleFunction[],
    instanceAddress: wallet.id as Hex,
    hatId,
    isDeployed: true,
  }));
};
