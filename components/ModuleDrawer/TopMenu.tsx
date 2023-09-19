import { Button, Flex, Icon, Tooltip } from '@chakra-ui/react';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';
import { useChainId } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useDeployModule from '@/hooks/useDeployModule';
import { ModuleDetails } from '@/types';

const TopMenu = ({
  localForm,
  onCloseModuleDrawer,
  selectedModuleDetails,
}: {
  localForm: any;
  onCloseModuleDrawer: () => void;
  selectedModuleDetails?: ModuleDetails;
}) => {
  const currentNetworkId = useChainId();
  const { chainId } = useTreeForm();

  const { deployModule } = useDeployModule({
    localForm,
    selectedModuleDetails,
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
