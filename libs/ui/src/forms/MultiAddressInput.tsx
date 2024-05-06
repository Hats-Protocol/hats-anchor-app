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
import { useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
import { FaRegTrashAlt, FaUpload } from 'react-icons/fa';
import { AppHat, FormWearer, HatWearer } from 'types';
import { viemPublicClient } from 'utils';
import { Hex, isAddress } from 'viem';
import { fetchEnsAddress } from 'wagmi/actions';

import { DropZone } from '../atoms';
import AddressInput from './AddressInput';

// TODO add upload input/dropzone here

interface MultiAddressInputProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  label?: string;
  subLabel?: string;
  placeholder?: string;
  holdOnAdd?: boolean;
}

const MultiAddressInput = ({
  name,
  localForm,
  label,
  subLabel,
  placeholder,
  holdOnAdd,
}: MultiAddressInputProps) => {
  const { setValue, watch, control, setError, formState } = _.pick(localForm, [
    'setValue',
    'watch',
    'control',
    'setError',
    'formState',
  ]);
  const { errors } = _.pick(formState, ['errors']);
  const currentInput = watch?.(`${name}-currentAddress`) as Hex | string;
  const currentResolvedAddress = watch?.(`${name}-currentAddress-resolved`);

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
    () => _.toNumber(_.get(selectedHat, 'maxSupply')),
    [selectedHat],
  );
  const currentWearerIds = useMemo(
    () =>
      _.map(_.get(selectedHat, 'wearers'), (h: AppHat) =>
        _.toLower(h.id),
      ) as unknown as Hex[],
    [selectedHat],
  ); // TODO handle more than 100 wearers

  const currentWearerList = _.map(fields, ({ address }: { address: Hex }) =>
    _.toLower(address),
  ) as unknown as Hex[];
  const wouldExceedMaxSupply =
    _.size(currentWearerList) + 1 + currentSupply > maxSupply;

  useEffect(() => {
    const checkAddressEligibility = async () => {
      let ensAddress;
      if (_.endsWith(currentInput, '.eth')) {
        ensAddress = (await fetchEnsAddress({
          chainId: 1,
          name: currentInput,
        })) as string;
      }

      if (!isAddress(currentInput) && !ensAddress) return;
      const localAddress = _.toLower(ensAddress) || _.toLower(currentInput);

      // check additional eligibility criteria, skip if not hat provided (module form)
      if (_.includes(currentWearerList, localAddress)) {
        // TODO message and type not getting attached when currentInput is an address
        setError?.(`${name}-currentAddress`, {
          type: 'custom',
          message: 'Address already added',
        });
        return;
      }

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

        if (_.isBoolean(isInGoodStanding) && !isInGoodStanding) {
          setError?.(`${name}-currentAddress`, {
            type: 'custom',
            message: 'Wearer is not in good standing',
          });
          return;
        }

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
        setValue?.(`${name}-currentAddress-resolved`, localAddress);
        return;
      }

      if (isAddress(currentInput)) {
        append({ address: currentInput, ens: '' });
        setValue?.(`${name}-currentAddress`, undefined);
        setError?.(`${name}-currentAddress`, {});
        return;
      }

      append({ address: ensAddress, ens: currentInput });
      setValue?.(`${name}-currentAddress`, undefined);
      setError?.(`${name}-currentAddress`, {});
    };

    // TODO can we set an error after input, if invalid? but not mess with the validation errors
    if (!isAddress(currentInput) && !_.endsWith(currentInput, '.eth')) return;
    if (errors?.[`${name}-currentAddress`] || currentResolvedAddress) return;
    checkAddressEligibility();

    // intentionally omitting 'append' and 'setValue' from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentInput,
    currentWearerList,
    currentSupply,
    currentWearerIds,
    maxSupply,
    holdOnAdd,
    name,
  ]);

  useEffect(() => {
    // clear error after input change
    if (errors?.[`${name}-currentAddress`]) {
      setError?.(`${name}-currentAddress`, {});
    }
    if (currentResolvedAddress) {
      setValue?.(`${name}-currentAddress-resolved`, undefined);
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
    setValue?.(`${name}-currentAddress`, undefined);
    setValue?.(`${name}-currentAddress-resolved`, undefined);
  };

  const handleRemoveWearer = (index: number) => {
    remove(index);
    setValue?.(`${name}-currentAddress`, undefined);
    setValue?.(`${name}-currentAddress-resolved`, undefined);
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

      setValue?.('wearers', [...currentWearerList, ...newWearers]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, currentWearerList, selectedHat],
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
                  value={ens || address}
                  bg='whiteAlpha.600'
                  readOnly
                  w='calc(100% - 2rem)'
                />
              </InputGroup>
              {ens && (
                <Text size='sm' color='blackAlpha.600'>
                  {address}
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
        showResolvedAddress={!!currentResolvedAddress}
        resolvedAddress={currentResolvedAddress}
        placeholder={placeholder}
        subLabel={subLabel}
        isDisabled={wouldExceedMaxSupply}
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
                      currentWearerList,
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
