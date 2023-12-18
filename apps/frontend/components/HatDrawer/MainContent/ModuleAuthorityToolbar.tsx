import {
  Button,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  ModalFooter,
} from '@chakra-ui/react';
import { useCallModuleFunction } from 'hats-hooks';
import { Authority } from 'hats-types';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEllipsisV } from 'react-icons/fa';

import { useOverlay } from '../../../contexts/OverlayContext';
import { useTreeForm } from '../../../contexts/TreeFormContext';
import Modal from '../../atoms/Modal';
import ModuleArgsInputs from '../../ModuleArgsInputs';

const ModuleAuthorityToolbar = ({ authority }: { authority: Authority }) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId } = useTreeForm(); // Make sure you have chainId from the context or props

  const primaryFunction = authority.functions.find((func) => func.primary);
  const otherFunctions = authority.functions.filter((func) => !func.primary);

  const { mutate: callModuleFunction, isLoading } = useCallModuleFunction({
    chainId,
  });

  const [selectedFunction, setSelectedFunction] = useState(null);
  const formMethods = useForm({ mode: 'onChange' });
  const { formState } = formMethods;

  const handleFunctionCall = (func) => {
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ [`functionCall-${authority.label}`]: true });
    } else {
      callModuleFunction({
        moduleId: authority.moduleAddress,
        instance: authority.instanceAddress,
        func,
        args: [],
      });
    }
  };

  const handleSubmit = (data) => {
    const args = Object.values(data);
    callModuleFunction({
      moduleId: authority.moduleAddress,
      instance: authority.instanceAddress,
      func: selectedFunction,
      args,
    });
    setModals?.({ [`functionCall-${authority.label}`]: false });
  };

  return (
    <HStack>
      {primaryFunction && (
        <Button
          colorScheme='blue'
          onClick={() => handleFunctionCall(primaryFunction)}
        >
          {primaryFunction.label}
        </Button>
      )}
      <Button
        as='a'
        href={authority.instanceAddress}
        target='_blank'
        colorScheme='gray'
      >
        View Instance
      </Button>
      <Menu>
        <MenuButton as={IconButton} icon={<FaEllipsisV />} />
        <MenuList>
          {otherFunctions.map((func) => (
            <MenuItem key={func.label} onClick={() => handleFunctionCall(func)}>
              {func.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Modal
        name={`functionCall-${authority.label}`}
        title={selectedFunction?.label}
        localOverlay={localOverlay}
      >
        <ModuleArgsInputs
          selectedModuleArgs={selectedFunction?.args}
          localForm={formMethods}
        />
        <ModalFooter px={0}>
          <Button
            colorScheme='blue'
            onClick={formMethods.handleSubmit(handleSubmit)}
            isDisabled={!formState.isValid}
            isLoading={isLoading}
          >
            Call Function
          </Button>
        </ModalFooter>
      </Modal>
    </HStack>
  );
};

export default ModuleAuthorityToolbar;
