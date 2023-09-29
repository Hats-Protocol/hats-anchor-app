import { Button, Flex, Icon, Tooltip } from '@chakra-ui/react';
import _ from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';
import { Hex } from 'viem';
import { useChainId } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useDeployModule from '@/hooks/useDeployModule';
import { FormData, ModuleDetails } from '@/types';

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
  const { chainId, setStoredData, storedData, selectedHat } = useTreeForm();

  const handleSuccess = (hatId?: Hex, claimsHatterAddress?: Hex) => {
    if (selectedModuleDetails) {
      updateModuleAddress(selectedModuleDetails.implementationAddress);
    }

    if (claimsHatterAddress) {
      const updatedHats = _.map(storedData, (hat: Partial<FormData>) => {
        if (hat.id === hatId) return { ...hat, claimsHatterAddress };
        if (hat.id === selectedHat?.id)
          return {
            ...hat,
            isEligibilityManual: 'Automatically',
            eligibility: selectedModuleDetails?.implementationAddress as Hex,
          };

        return hat;
      });

      if (!_.find(updatedHats, ['id', hatId])) {
        updatedHats.push({ id: hatId, claimsHatterAddress });
      }
      if (!_.find(updatedHats, ['id', selectedHat?.id])) {
        updatedHats.push({
          id: selectedHat?.id,
          isEligibilityManual: 'Automatically',
          eligibility: selectedModuleDetails?.implementationAddress as Hex,
        });
      }

      setStoredData?.(updatedHats);
    }

    onCloseModuleDrawer();
  };

  const { deployModule, isLoading } = useDeployModule({
    localForm,
    selectedModuleDetails,
    onSuccessCallback: handleSuccess,
  });

  const { watch } = localForm;
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
            deployModule();
          }}
        >
          Deploy & Return
        </Button>
      </Tooltip>
    </Flex>
  );
};

export default TopMenu;
