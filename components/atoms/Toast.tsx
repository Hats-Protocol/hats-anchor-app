import {
  AlertStatus as ChakraAlertStatus,
  Box,
  ColorProps,
  // CreateToastFnReturn,
  Flex,
  Heading,
  HStack,
  Icon,
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
  // toast?: CreateToastFnReturn;
  closeToast?: () => void;
  isClosable?: boolean;
};

export type ToastProps = ChakraToastProps & CustomToastProps;

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
    bgImage: '',
    displayBorder: 'block',
  },
  error: {
    bg: 'red.500',
    bgImage: '',
    displayBorder: 'none',
  },
  info: {
    bg: 'blue.500',
    bgImage: 'whiteAlpha.700',
    displayBorder: 'block',
  },
  warning: {
    bg: 'blue.500',
    bgImage: 'whiteAlpha.700',
    displayBorder: 'block',
  },
  loading: {
    bg: 'blue.500',
    bgImage: 'whiteAlpha.700',
    displayBorder: 'block',
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
      borderRadius='sm'
      padding={2}
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
        <Box>
          <Heading size='md' color='white'>
            {title}
          </Heading>
          {description && (
            <Text size='sm' color='white'>
              {description}
            </Text>
          )}
        </Box>
      </HStack>
      {isClosable && (
        <Flex
          marginLeft={8}
          onClick={closeToast}
          justifyContent='baseline'
          _hover={{ cursor: 'pointer' }}
        >
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
        bgImage={bgValues[status].bgImage}
        filter='blur(10px)'
        position='absolute'
        zIndex={-1}
      />
    </Flex>
  );
};
export default Toast;
