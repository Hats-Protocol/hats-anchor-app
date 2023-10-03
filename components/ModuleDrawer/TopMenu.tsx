import { Button, Flex, Icon, Tooltip } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';
import { useChainId } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useModuleDeploy from '@/hooks/useModuleDeploy';
import { ModuleDetails } from '@/types';

const TopMenu = ({
  localForm,
  updateModuleAddress,
  onCloseModuleDrawer,
  selectedModuleDetails,
}: {
  localForm: UseFormReturn<any>;
  updateModuleAddress: (value: string) => void;
  onCloseModuleDrawer: () => void;
  selectedModuleDetails?: ModuleDetails;
}) => {
  const currentNetworkId = useChainId();
  const { chainId } = useTreeForm();

  const { watch, getValues } = localForm;
  const values = getValues();

  const { deploy, isLoading } = useModuleDeploy({
    values,
    selectedModuleDetails,
    onCloseModuleDrawer,
    updateModuleAddress,
    deploymentType:
      values.moduleType && values.isPermissionlesslyClaimable === 'Yes'
        ? 'withClaimsHatter'
        : 'single',
  });

  const moduleType = watch('moduleType');

  const isChainCorrect = currentNetworkId === chainId;
  const isButtonDisabled =
    !localForm?.formState.isValid || !moduleType || !isChainCorrect;

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
          onClick={() => {
            deploy();
          }}
        >
          Deploy & Return
        </Button>
      </Tooltip>
    </Flex>
  );
};

export default TopMenu;
