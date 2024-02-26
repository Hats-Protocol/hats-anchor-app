import { Button, Flex, HStack, Icon, Tooltip } from '@chakra-ui/react';
import { DEPLOYMENT_TYPES } from '@hatsprotocol/constants';
import { useOverlay, useTreeForm } from 'contexts';
import {
  useHatDetails,
  useModuleDeploy,
  useMultiClaimsHatterCheck,
} from 'hats-hooks';
import { ModuleDetails } from 'hats-types';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';
import { useChainId } from 'wagmi';

const NetworkSwitcher = dynamic(() =>
  import('ui').then((mod) => mod.NetworkSwitcher),
);

const TopMenu = ({
  localForm,
  onCloseModuleDrawer,
  selectedModuleDetails,
  isStandaloneHatterDeploy,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  onCloseModuleDrawer: () => void;
  selectedModuleDetails?: ModuleDetails;
  isStandaloneHatterDeploy?: boolean;
}) => {
  const currentNetworkId = useChainId();
  const {
    chainId,
    storedData,
    onchainHats,
    editMode,
    selectedHat,
    setStoredData,
  } = useTreeForm();
  const { instanceAddress } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    storedData,
    onchainHats,
    editMode,
  });
  const { handlePendingTx } = useOverlay();
  const { watch } = localForm;
  const moduleType = watch('moduleType');
  const isPermissionlesslyClaimable = watch('isPermissionlesslyClaimable');
  const adminHat = watch('adminHat');
  const incrementWearers = watch('incrementWearers');

  const { data: adminHatDetails } = useHatDetails({ hatId: adminHat, chainId });

  const deploymentType = useMemo(() => {
    if (isStandaloneHatterDeploy) {
      return DEPLOYMENT_TYPES.ONLY_CLAIMS_HATTER;
    }
    if (
      moduleType &&
      !instanceAddress &&
      isPermissionlesslyClaimable === 'Yes'
    ) {
      return DEPLOYMENT_TYPES.MODULE_AND_CLAIMS_HATTER;
    }
    return DEPLOYMENT_TYPES.ONLY_MODULE;
  }, [
    isStandaloneHatterDeploy,
    moduleType,
    isPermissionlesslyClaimable,
    instanceAddress,
  ]);

  const { deploy, isLoading } = useModuleDeploy({
    localForm,
    selectedHat,
    chainId,
    storedData,
    onchainHats,
    setStoredData,
    selectedModuleDetails,
    onCloseModuleDrawer,
    deploymentType,
    handlePendingTx,
  });

  const isChainCorrect = currentNetworkId === chainId;

  const cannotDeployWithoutIncrement = useMemo(() => {
    const storedSupply = _.get(
      _.find(storedData, ['id', adminHat]),
      'maxSupply',
    );
    const supplyExhausted =
      (storedSupply || adminHatDetails?.currentSupply) ===
      adminHatDetails?.maxSupply;
    return incrementWearers === 'No' && supplyExhausted;
  }, [
    adminHat,
    adminHatDetails?.currentSupply,
    adminHatDetails?.maxSupply,
    incrementWearers,
    storedData,
  ]);

  const requiresModuleTypeCheck = !(
    isStandaloneHatterDeploy && isPermissionlesslyClaimable === 'Yes'
  );

  const isButtonDisabled =
    !localForm?.formState.isValid ||
    !isChainCorrect ||
    (requiresModuleTypeCheck && !moduleType) ||
    cannotDeployWithoutIncrement;

  return (
    <Flex
      w='100%'
      borderBottom='1px solid'
      borderColor='gray.200'
      h='75px'
      bg='whiteAlpha.900'
      align='center'
      justify='space-between'
      px={4}
      position='absolute'
      top={0}
      zIndex={16}
    >
      <Button
        variant='outline'
        borderColor='gray.300'
        onClick={onCloseModuleDrawer}
        leftIcon={<Icon as={BsXSquare} />}
      >
        Cancel
      </Button>

      <HStack>
        {!isChainCorrect && <NetworkSwitcher />}
        <Tooltip
          label={!isChainCorrect ? 'Please switch to the correct network' : ''}
          isDisabled={isChainCorrect}
          hasArrow
          placement='top'
        >
          <Button
            leftIcon={<BsBoxArrowRight />}
            colorScheme='twitter'
            variant='solid'
            isDisabled={isButtonDisabled}
            isLoading={isLoading}
            onClick={() => deploy()}
          >
            Deploy & Return
          </Button>
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default TopMenu;
