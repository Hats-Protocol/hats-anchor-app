import {
  Box,
  Button,
  FormControl,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFieldArray } from 'react-hook-form';
import {
  FaChartBar,
  FaHouseUser,
  FaImage,
  FaParagraph,
  FaPlus,
  FaRegEdit,
  FaTrash,
} from 'react-icons/fa';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import RadioBox from '@/components/atoms/RadioBox';
import Textarea from '@/components/atoms/Textarea';
import FormRowWrapper from '@/components/FormRowWrapper';
import { MUTABILITY } from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { isMutable, isTopHat } from '@/lib/hats';

const MUTABILITY_OPTIONS = [
  { value: MUTABILITY.MUTABLE, label: 'Editable' },
  {
    value: MUTABILITY.IMMUTABLE,
    label: 'Not Editable (cannot be reversed)',
  },
];

const HatBasicsForm = ({
  localForm,
  hatData,
  chainId,
  setNewImageURI,
}: {
  localForm: any;
  hatData: any;
  chainId: number;
  setNewImageURI: (uri: string) => void;
}) => {
  const [image, setImage] = useState<any>();
  const { formState } = localForm;

  const { watch, control } = localForm;

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'guilds',
  });

  const guilds = useDebounce(watch('guilds'));

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (a) => {
      setImage(
        Object.assign(a[0], {
          preview: URL.createObjectURL(a[0]),
        }),
      );
    },
  });

  const { data: imagePinData } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: true,
    metadata: { name: `image_${_.toString(chainId)}_tophat` },
  });

  useEffect(() => {
    const hatImageURI =
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';
    setNewImageURI(hatImageURI);
  }, [imagePinData, formState?.values?.imageUrl, setNewImageURI]);

  return (
    <form>
      <FormControl>
        <Stack spacing={4}>
          <FormRowWrapper>
            <Image src='/icons/hat.svg' alt='Hat' />
            <Input
              localForm={localForm}
              name='name'
              label='Hat Name'
              placeholder='Hat name'
            />
          </FormRowWrapper>
          <FormRowWrapper>
            <FaParagraph />
            <Textarea
              localForm={localForm}
              name='description'
              label='Description'
              placeholder='Add a brief description (or a link to one) for this hat'
            />
          </FormRowWrapper>

          <FormRowWrapper>
            <FaImage />
            <Box w='100%'>
              <Text fontSize='sm' fontWeight='medium' mb={2}>
                {' '}
                IMAGE
              </Text>
              <DropZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isFocused={isFocused}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                isFullWidth
                image={image}
              />
            </Box>
          </FormRowWrapper>
          {isTopHat(hatData) && (
            <FormRowWrapper>
              <FaHouseUser />
              <Stack w='full'>
                <Text fontSize='sm'>GUILDS</Text>
                {fields.map((field, index) => (
                  <HStack key={field.id}>
                    <Input
                      name={`guilds.${index}`}
                      localForm={localForm}
                      placeholder='Guild name (e.g. hats-protocol)'
                      isDisabled={index !== fields.length - 1}
                    />
                    <IconButton
                      type='button'
                      onClick={() => remove(index)}
                      icon={<FaTrash />}
                      aria-label='Remove'
                      height={9}
                      w={16}
                    />
                  </HStack>
                ))}
                <Box mb={2}>
                  <Button
                    onClick={() => append('')}
                    isDisabled={guilds?.some((item: string) => item === '')}
                    gap={2}
                  >
                    <FaPlus />
                    Add {guilds?.length ? 'another' : 'a'} Guild
                  </Button>
                </Box>
              </Stack>
            </FormRowWrapper>
          )}

          <FormRowWrapper>
            <FaChartBar />
            <Input
              name='maxSupply'
              label='MAX WEARERS'
              placeholder='10'
              isDisabled={!isMutable(hatData)}
              localForm={localForm}
            />
          </FormRowWrapper>

          <FormRowWrapper>
            <FaRegEdit />
            <Box>
              <RadioBox
                name='mutable'
                label='EDITABLE'
                isDisabled={!isMutable(hatData)}
                subLabel='Should it be possible for an admin to make changes to this Hat?'
                localForm={localForm}
                options={MUTABILITY_OPTIONS}
                tooltip='Choose whether the Hat should be editable or not'
              />
              {localForm.watch('mutable') === MUTABILITY.IMMUTABLE && (
                <Text color='red.500' mt={3}>
                  Beware: This will make the Hat immutable. No one can ever
                  change it. This can not be undone.
                </Text>
              )}
            </Box>
          </FormRowWrapper>
        </Stack>
      </FormControl>
    </form>
  );
};

export default HatBasicsForm;
