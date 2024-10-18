'use client';

import { Box, HStack, Stack, Text, Tooltip } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { compact, concat, get, isEmpty, map, sortBy } from 'lodash';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { Hex } from 'viem';

import Input from './Input';

export const MultiHatsSelect = ({
  name,
  label,
  subLabel,
  hatOptions,
  options,
  placeholder,
  info,
  localForm,
  allowMultiple = false,
  includeCustomOption = true,
}: {
  name: string;
  label: string;
  subLabel?: string;
  hatOptions: AppHat[] | undefined;
  options?: RegisterOptions;
  placeholder?: string;
  info?: string;
  localForm: UseFormReturn;
  allowMultiple?: boolean;
  includeCustomOption?: boolean;
}) => {
  const { watch, setValue } = localForm;

  const useCustomHat = watch(name)?.value === 'custom';

  if (!hatOptions || isEmpty(hatOptions)) return null;

  const localHatOptions = compact(
    concat(
      includeCustomOption ? { label: 'Custom', value: 'custom' } : [],
      map(sortBy(hatOptions, 'id'), (h: AppHat) => {
        const detailsName = get(h, 'detailsObject.data.name');
        return {
          label: `${idToIp(h.id as Hex)} ${detailsName}`,
          value: h.id,
        };
      }),
    ),
  );

  return (
    <Stack>
      {label && (
        <HStack>
          <Text mb={0} fontSize='sm' textTransform='uppercase'>
            {label}
          </Text>

          {info && (
            <Tooltip shouldWrapChildren label={info}>
              <FaRegQuestionCircle />
            </Tooltip>
          )}
        </HStack>
      )}
      {typeof subLabel !== 'string' ? (
        subLabel
      ) : (
        <Text size='sm' mt={0} color='blackAlpha.700'>
          {subLabel}
        </Text>
      )}
      <Select
        name={name}
        value={watch(name)}
        options={localHatOptions}
        placeholder={
          placeholder || (allowMultiple ? 'Choose hats' : 'Choose a hat')
        }
        onChange={(e) => {
          setValue(name, e);
        }}
        isMulti={allowMultiple}
      />

      {useCustomHat && (
        <Box pt={2}>
          <Input
            name={`${name}-custom`}
            label='Custom Hat'
            placeholder='0x0000012300010001000...'
            localForm={localForm}
          />
        </Box>
      )}
    </Stack>
  );
};
