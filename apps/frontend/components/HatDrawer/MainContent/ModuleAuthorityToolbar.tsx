import {
  Button,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  ModalFooter,
} from '@chakra-ui/react';
import { useContractData } from 'app-hooks';
import { useCallModuleFunction, useModuleDetails } from 'hats-hooks';
import { Authority, HatWearer, SupportedChains } from 'hats-types';
import { getControllerNameAndLink } from 'hats-utils';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEllipsisV } from 'react-icons/fa';
import { FiExternalLink, FiPlusSquare } from 'react-icons/fi';
import { useAccount } from 'wagmi';

import { useOverlay } from '../../../contexts/OverlayContext';
import { useTreeForm } from '../../../contexts/TreeFormContext';
import Modal from '../../atoms/Modal';
import ModuleArgsInputs from '../../ModuleArgsInputs';

const ModuleAuthorityToolbar = ({ authority }: { authority: Authority }) => {
  const localOverlay = useOverlay();
  const { address } = useAccount();
  const { setModals } = localOverlay;
  const { chainId, selectedHat, wearersAndControllers } = useTreeForm();
  const [selectedFunction, setSelectedFunction] = useState(null);
  const formMethods = useForm({ mode: 'onChange' });
  const { formState } = formMethods;

  const primaryFunction = authority.functions.find((func) => func.primary);
  const otherFunctions = authority.functions.filter((func) => !func.primary);

  const { mutate: callModuleFunction, isLoading } = useCallModuleFunction({
    chainId,
  });

  const isWearer = useMemo(
    () =>
      _.includes(
        _.map(selectedHat?.wearers, 'id'),
        address.toLocaleLowerCase(),
      ),
    [selectedHat, address],
  );

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

  const extendedController: HatWearer = _.find(wearersAndControllers, {
    id: authority.instanceAddress,
  });

  const { details: moduleDetails } = useModuleDetails({
    address: authority.moduleAddress,
    chainId,
  });

  const { data: contractData } = useContractData({
    chainId,
    address: authority.instanceAddress,
  });

  const { controllerLink } = getControllerNameAndLink({
    extendedController,
    moduleDetails,
    contractData,
    chainId: chainId as SupportedChains,
  });

  return (
    <HStack>
      {primaryFunction && (
        <Button
          colorScheme='blue'
          isDisabled={!isWearer}
          onClick={() => handleFunctionCall(primaryFunction)}
          rightIcon={<FiPlusSquare />}
        >
          {primaryFunction.label}
        </Button>
      )}
      <Button
        as='a'
        href={`${controllerLink}#writeContract`}
        target='_blank'
        colorScheme='blue.500'
        rightIcon={<FiExternalLink />}
        variant='outline'
        color='blue.500'
      >
        Go to Module
      </Button>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<Icon as={FaEllipsisV} w={2} color='blue.500' />}
          borderColor='blue.500'
          variant='outline'
        />
        <MenuList>
          {otherFunctions.map((func) => (
            <MenuItem
              key={func.label}
              onClick={() => handleFunctionCall(func)}
              isDisabled={!isWearer}
            >
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
