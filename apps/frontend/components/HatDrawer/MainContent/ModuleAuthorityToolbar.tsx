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
import { Authority } from 'hats-types';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEllipsisV } from 'react-icons/fa';

import { useOverlay } from '../../../contexts/OverlayContext';
import Modal from '../../atoms/Modal';
import ModuleArgsInputs from '../../ModuleArgsInputs';

const ModuleAuthorityToolbar = ({
  moduleAuthority,
  onFunctionCall,
}: {
  moduleAuthority: Authority;
  onFunctionCall: any;
}) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const primaryFunction = moduleAuthority.functions.find(
    (func) => func.primary,
  );
  const otherFunctions = moduleAuthority.functions.filter(
    (func) => !func.primary,
  );

  const [selectedFunction, setSelectedFunction] = useState(null);
  const formMethods = useForm({
    mode: 'onChange',
  });

  const handleFunctionCall = (func) => {
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ [`functionCall-${moduleAuthority.label}`]: true });
    } else {
      onFunctionCall(moduleAuthority.instanceAddress, func.label, []);
    }
  };

  const handleSubmit = (data) => {
    const args = Object.values(data);
    onFunctionCall(moduleAuthority.instanceAddress, selectedFunction, args);
    setModals?.({ functionCall: false });
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
        href={moduleAuthority.instanceAddress}
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
        name={`functionCall-${moduleAuthority.label}`}
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
          >
            Call Function
          </Button>
        </ModalFooter>
      </Modal>
    </HStack>
  );
};

export default ModuleAuthorityToolbar;
