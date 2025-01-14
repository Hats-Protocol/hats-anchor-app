'use client';

import {
  AlertStatus as ChakraAlertStatus,
  Box,
  ColorProps,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  ToastProps as ChakraToastProps,
} from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { AiFillAlert, AiFillWarning, AiTwotoneCrown } from 'react-icons/ai';
import { BsBellFill } from 'react-icons/bs';
import { RiCloseFill, RiRocket2Fill } from 'react-icons/ri';

type CustomToastProps = {
  status: ChakraAlertStatus;
  title: string | ReactNode;
  description?: string | ReactNode;
  icon?: IconType;
  iconName?: string;
  iconColor?: string;
  closeToast?: () => void;
  isClosable?: boolean;
};

// ! different ToastProps from useToast is confusing, keeping local for now
type ToastProps = ChakraToastProps & CustomToastProps;

const icons: {
  [name: string]: { icon: IconType; color: ColorProps['color'] };
} = {
  crown: { icon: AiTwotoneCrown, color: 'whiteAlpha.700' },
  warning: { icon: AiFillWarning, color: 'whiteAlpha.700' },
  alert: { icon: AiFillAlert, color: 'whiteAlpha.800' },
  bell: { icon: BsBellFill, color: 'blackAlpha.700' },
  rocket: { icon: RiRocket2Fill, color: 'whiteAlpha.800' },
};

const bgValues = {
  success: {
    bg: 'green.500',
    imageBg: '',
    displayBorder: 'none',
  },
  error: {
    bg: 'red.500',
    imageBg: '',
    displayBorder: 'none',
  },
  info: {
    bg: 'blue.500',
    imageBg: 'whiteAlpha.700',
    displayBorder: 'none',
  },
  warning: {
    bg: 'blue.500',
    imageBg: 'whiteAlpha.700',
    displayBorder: 'none',
  },
  loading: {
    bg: 'blue.500',
    imageBg: 'whiteAlpha.700',
    displayBorder: 'none',
  },
};

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  status = 'success',
  icon,
  iconName,
  iconColor,
  closeToast,
  isClosable,
}: ToastProps) => {
  return (
    <Flex
      bg={bgValues[status].bg}
      position='relative'
      borderRadius='md'
      justify='space-between'
      minW='350px'
      padding={4}
    >
      <HStack spacing={3}>
        {iconName ? (
          <Icon
            as={icons[iconName].icon}
            color={iconColor || icons[iconName].color || 'whiteAlpha.800'}
            width='35px'
            height='35px'
          />
        ) : (
          icon && <Icon as={icon} width='35px' height='35px' />
        )}
        <Stack spacing={1}>
          <Heading size='lg' color='white'>
            {title}
          </Heading>
          {description && (
            <Text color='white' noOfLines={2}>
              {description}
            </Text>
          )}
        </Stack>
      </HStack>
      {isClosable && (
        <Flex marginLeft={8} onClick={closeToast} justifyContent='baseline' _hover={{ cursor: 'pointer' }}>
          <Icon
            as={RiCloseFill}
            onClick={closeToast}
            color='whiteAlpha.800'
            w='25px'
            h='25px'
            _hover={{ cursor: 'pointer' }}
          />
        </Flex>
      )}

      <Box
        display={bgValues[status].displayBorder}
        top='-2px'
        left='-2px'
        width='104%'
        height='104%'
        bgColor={bgValues[status].imageBg}
        filter='blur(10px)'
        position='absolute'
        zIndex={-1}
      />
    </Flex>
  );
};
export default Toast;
