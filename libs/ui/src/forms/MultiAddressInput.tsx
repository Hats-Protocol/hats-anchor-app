import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input as ChakraInput,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { CONFIG, HATS_ABI } from '@hatsprotocol/constants';
import { useSelectedHat } from 'contexts';
import { useToast } from 'hooks';
import _ from 'lodash';
import Papa from 'papaparse';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
import { FaRegTrashAlt, FaUpload } from 'react-icons/fa';
import { AppHat, FormWearer, HatWearer } from 'types';
import { viemPublicClient } from 'utils';
import { Hex, isAddress } from 'viem';

import { DropZone } from '../atoms';
import AddressInput from './AddressInput';

// TODO add upload input/dropzone here

const defaultFieldOptions = {
  shouldDirty: false,
  shouldValidate: false,
  shouldTouch: false,
};

interface MultiAddressInputProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  label?: string;
  subLabel?: string;
  placeholder?: string;
  holdOnAdd?: boolean;
  overrideMaxSupply?: boolean;
}

const MultiAddressInput = ({
  name,
  localForm,
  label,
  subLabel,
  placeholder,
  holdOnAdd,
  overrideMaxSupply,
}: MultiAddressInputProps) => {
  const { setValue, watch, control, setError, formState, clearErrors } = _.pick(
    localForm,
    ['setValue', 'watch', 'control', 'setError', 'formState', 'clearErrors'],
  );
  const currentWearerList = useRef([] as Hex[]);
  const { errors } = _.pick(formState, ['errors']);
  const currentInput = watch?.(`${name}-currentAddress-input`) as Hex | string;
  const currentResolvedAddress = watch?.(`${name}-currentAddress`);
  const currentResolvedName = watch?.(`${name}-currentAddress-name`);
  const currentMaxSupply = watch?.('maxSupply');
  const isCancelled = useRef(false);
  const { selectedHat, chainId } = useSelectedHat();
  const { isOpen: collapseIsOpen, onToggle: toggleCollapse } = useDisclosure();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });
  const toast = useToast();

  const currentSupply = useMemo(
    () => _.toNumber(_.get(selectedHat, 'currentSupply')),
    [selectedHat],
  );
  const maxSupply = useMemo(
    () =>
      _.toNumber(currentMaxSupply) ||
      _.toNumber(_.get(selectedHat, 'maxSupply')),
    [selectedHat, currentMaxSupply],
  );
  const currentWearerIds = useMemo(
    () =>
      _.map(_.get(selectedHat, 'wearers'), (h: AppHat) =>
        _.toLower(h.id),
      ) as unknown as Hex[],
    [selectedHat],
  ); // TODO handle more than N wearers

  currentWearerList.current = _.map(fields, ({ address }: { address: Hex }) =>
    _.toLower(address),
  ) as unknown as Hex[];
  const wouldExceedMaxSupply = overrideMaxSupply
    ? false
    : _.size(currentWearerList.current) + 1 + currentSupply > maxSupply;

  // use callback to ensure `append` function is only called once
  const updateWearerList = useCallback(
    ({ address, ens }: { address: Hex; ens?: string }) => {
      if (isCancelled.current) return;
      if (ens) {
        append({ address, ens: ens || '' });
      } else {
        append({ address: currentInput, ens: '' });
      }
      setValue?.(
        `${name}-currentAddress-input`,
        undefined,
        defaultFieldOptions,
      );
      setValue(`${name}-currentAddress`, undefined, defaultFieldOptions);
      clearErrors?.(`${name}-currentAddress`);
      isCancelled.current = true;
    },
    [append, clearErrors, currentInput, name, setValue],
  );

  useEffect(() => {
    const checkAddressEligibility = async () => {
      if (!isAddress(currentInput) && !currentResolvedAddress) return;

      const localAddress = (_.toLower(currentResolvedAddress) ||
        _.toLower(currentInput)) as Hex;

      // check if address is already in current wearer list
      if (_.includes(currentWearerList.current, localAddress)) {
        // TODO message and type not getting attached when currentInput is an address
        setError?.(`${name}-currentAddress`, {
          type: 'custom',
          message: 'Address already added',
        });
        return;
      }

      // check if address is already in the local wearer list
      const isInWearerList = _.includes(
        currentWearerIds,
        _.toLower(localAddress),
      );
      if (isInWearerList) {
        setError?.(`${name}-currentAddress`, {
          type: 'custom',
          message: 'Address already wearing this hat',
        });
        return;
      }

      if (chainId && selectedHat) {
        // check eligibility and standing of potential wearer
        const viemClient = viemPublicClient(chainId);

        const promises = [
          viemClient.readContract({
            address: CONFIG.hatsAddress,
            abi: CONFIG.hatsAbi,
            chainId,
            functionName: 'isInGoodStanding',
            args: [localAddress, selectedHat?.id],
          }),
          viemClient.readContract({
            address: CONFIG.hatsAddress,
            abi: CONFIG.hatsAbi,
            chainId,
            functionName: 'isEligible',
            args: [localAddress, selectedHat?.id],
          }),
        ];
        const result = await Promise.all(promises);
        const [isInGoodStanding, isEligible] = result;

        // set error if not in good standing
        if (_.isBoolean(isInGoodStanding) && !isInGoodStanding) {
          setError?.(`${name}-currentAddress`, {
            type: 'custom',
            message: 'Wearer is not in good standing',
          });
          return;
        }

        // set error if ineligible
        if (_.isBoolean(isEligible) && !isEligible) {
          setError?.(`${name}-currentAddress`, {
            type: 'custom',
            message: 'Wearer is not eligible',
          });
          return;
        }
      }

      if (holdOnAdd) {
        // don't add to list if used in standalone form(s)
        setValue?.(`${name}-currentAddress`, localAddress);
        isCancelled.current = true;
        return;
      }

      if (_.endsWith(currentInput, '.eth')) {
        // add to list if ENS resolved
        updateWearerList({ address: localAddress, ens: currentInput });
        return;
      }

      // fallback to address only (inject ENS, if available)
      updateWearerList({
        address: localAddress,
        ens: currentResolvedName || '',
      });
    };

    if (
      (!isAddress(currentInput) && !_.endsWith(currentInput, '.eth')) ||
      errors?.[`${name}-currentAddress`] ||
      !currentWearerList ||
      !currentWearerIds ||
      _.isNaN(currentSupply) ||
      _.isNaN(maxSupply)
    ) {
      isCancelled.current = false;

      return;
      // return undefined;
    }

    checkAddressEligibility();

    // ! giving an issue with appending to wearer list
    // return () => {
    //   isCancelled.current = true;
    // };

    // intentionally omitting 'setError', 'setValue', and 'updateWearerList' from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentInput,
    currentSupply,
    chainId,
    selectedHat,
    currentResolvedAddress,
    currentResolvedName,
    currentWearerIds,
    maxSupply,
    holdOnAdd,
    name,
  ]);

  useEffect(() => {
    // clear error after input change
    if (errors?.[`${name}-currentAddress`]) {
      clearErrors?.(`${name}-currentAddress`);
      isCancelled.current = false;
    }
    if (currentResolvedAddress) {
      setValue?.(`${name}-currentAddress`, undefined);
      isCancelled.current = false;
    }
    // intentionally omitting 'errors' and 'setError' from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, currentInput]);

  const handleAddWearer = () => {
    if (!currentResolvedAddress && !isAddress(currentInput)) return;
    if (isAddress(currentInput)) {
      append({ address: currentInput, ens: '' });
    } else {
      append({ address: currentResolvedAddress, ens: currentInput });
    }
    setValue?.(`${name}-currentAddress-input`, undefined);
    setValue?.(`${name}-currentAddress`, undefined);
  };

  const handleRemoveWearer = (index: number) => {
    remove(index);
    setValue?.(`${name}-currentAddress-input`, undefined);
    setValue?.(`${name}-currentAddress`, undefined);
  };

  const handleWearerImport = useCallback(
    async (results: { data: unknown[] }) => {
      const csvAddresses = _.take(
        _.differenceWith(
          _.filter(_.flatten(results.data), isAddress),
          currentWearerIds,
          (csvAddress: unknown, wearer: unknown) =>
            csvAddress === _.get(wearer as HatWearer, 'address'),
        ),
        _.toNumber(maxSupply) -
          _.size(currentWearerList) -
          _.size(currentWearerIds),
      );
      const publicClient = viemPublicClient(chainId);
      // TODO update to use multicall
      const promises = _.map(csvAddresses, (a: Hex) =>
        publicClient.readContract({
          abi: HATS_ABI,
          address: CONFIG.hatsAddress,
          functionName: 'isEligible',
          args: [a, selectedHat?.id],
        }),
      );
      const eligibilityOfAddresses = await Promise.all(promises);
      const eligibleAddresses = _.filter(
        csvAddresses,
        (v: Hex, i: number) => eligibilityOfAddresses[i],
      );
      const ineligibleWearersCount = _.size(
        _.filter(eligibilityOfAddresses, (v: boolean) => !v),
      );
      const newWearers = _.map(eligibleAddresses, (address: unknown) => ({
        address,
        ens: '',
      }));
      if (ineligibleWearersCount > 0) {
        toast.info({
          title: `${ineligibleWearersCount} wearer${
            ineligibleWearersCount > 1 ? 's' : ''
          } ${
            ineligibleWearersCount > 1 ? 'were' : 'was'
          } not eligible to be added`,
          description:
            'Check the eligibility module to determine eligible wearers',
        });
      }

      setValue?.('wearers', [...currentWearerList.current, ...newWearers]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, currentWearerList.current, selectedHat],
  );

  // TODO handle csv upload component
  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      accept: { 'text/csv': ['.csv'] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onDrop: (droppedFiles: any) => {
        const file = droppedFiles[0];
        if (!file) return;
        Papa.parse(file, {
          complete: (data: { data: unknown[] }) => handleWearerImport(data),
          error: (error: Error) => {
            // eslint-disable-next-line no-console
            console.error('Error parsing CSV file: ', error);
          },
        });
      },
    });

  if (!localForm) return null;

  return (
    <VStack borderRadius={8} alignItems='start' spacing={3} w='full'>
      {label && (
        <FormLabel mb={0}>
          <HStack>
            <Text size='sm' textTransform='uppercase'>
              {label}
            </Text>
          </HStack>
        </FormLabel>
      )}
      {_.map(fields, ({ address, ens }: FormWearer, index: number) => (
        <Box key={address} w='full'>
          <Flex w='full' justifyContent='space-between'>
            <Stack spacing='2px' w='full'>
              <InputGroup flexGrow={1}>
                <InputLeftElement>
                  <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />
                </InputLeftElement>

                <ChakraInput
                  value={address}
                  bg='whiteAlpha.600'
                  readOnly
                  w='calc(100% - 2rem)'
                />
              </InputGroup>
              {ens && (
                <Text size='sm' color='blackAlpha.600'>
                  {ens}
                </Text>
              )}
            </Stack>
            <IconButton
              type='button'
              onClick={() => handleRemoveWearer(index)}
              icon={<FaRegTrashAlt />}
              aria-label='Remove'
              bg='transparent'
              border='1px solid #d6d6d6'
              w={10}
            />
          </Flex>
        </Box>
      ))}
      <AddressInput
        name={`${name}-currentAddress`}
        localForm={localForm}
        placeholder={placeholder}
        subLabel={subLabel}
        isDisabled={wouldExceedMaxSupply}
        chainId={chainId}
      />
      {selectedHat && chainId && (
        <>
          <HStack>
            {holdOnAdd && (
              <Tooltip label={undefined} shouldWrapChildren>
                <Button
                  isDisabled={
                    !!errors?.[`${name}-currentAddress`] ||
                    !currentResolvedAddress ||
                    _.includes(
                      currentWearerList.current,
                      _.toLower(currentResolvedAddress),
                    )
                  }
                  onClick={handleAddWearer}
                  aria-label='Add Another Wallet'
                  variant='outlineMatch'
                  colorScheme='gray.500'
                >
                  <HStack>
                    <Icon as={BsPersonBadge} w={4} h={4} />
                    <Text>Add Another Wallet</Text>
                  </HStack>
                </Button>
              </Tooltip>
            )}

            <Button
              aria-label='Toggle CSV Input'
              onClick={toggleCollapse}
              variant='outlineMatch'
              colorScheme='blue.500'
              leftIcon={<Icon as={FaUpload} w={3} h={3} />}
            >
              <Text>Upload CSV</Text>
            </Button>
          </HStack>

          <Collapse in={collapseIsOpen}>
            <FormControl id='csvFile'>
              <Text
                size='sm'
                textTransform='uppercase'
                fontWeight='medium'
                mt={4}
              >
                Upload CSV
              </Text>
              <Text size='md' mt={1} variant='light' mb={4}>
                The CSV file must only contain Ethereum addresses, one per line.
                ENS is currently not supported. Any additional data will be
                ignored.
              </Text>
              <DropZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                isFullWidth
              />
            </FormControl>
          </Collapse>
        </>
      )}
    </VStack>
  );
};

export default MultiAddressInput;
