import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useOverlay, useTreeForm } from 'contexts';
import { HatExport } from 'hats-types';
import {
  checkMissingParents,
  checkMissingSiblings,
  flattenHatData,
  prepareDraftHats,
} from 'hats-utils';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { FileError, useDropzone } from 'react-dropzone';
import { BsBoxArrowInUpRight } from 'react-icons/bs';
import { DropZone } from 'ui';

interface validateTreeImportProps {
  file: File;
  treeId?: string;
  chainId?: number;
}

// we might need it at some point
const validateTreeImport = ({
  file,
  treeId,
  chainId,
}: validateTreeImportProps): FileError | null => {
  if (!treeId || !chainId) return null;
  const fileName = file.name;
  const splitFileName = _.split(fileName, '-');
  let fileTreeId = _.nth(splitFileName, 3);
  if (fileTreeId?.includes(' ')) {
    fileTreeId = _.first(_.split(fileTreeId, ' '));
  }
  if (fileTreeId?.includes('.')) {
    fileTreeId = _.first(_.split(fileTreeId, '.'));
  }
  return null;
};

const ImportTreeForm = () => {
  const { setModals } = useOverlay();
  const { treeId, chainId, importHats, onchainHats, onchainTree } =
    useTreeForm();

  const [validImport, setValidImport] = useState(true);
  const [treeFile, setTreeFile] = useState<File | undefined>();
  const [fileReader, setFileReader] = useState<FileReader | undefined>();
  const [importErrorMessage, setImportErrorMessage] = useState('');

  useEffect(() => {
    setFileReader(new FileReader());
  }, []);

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: { 'application/json': ['.json'] },
    onFileDialogOpen: () => {
      setValidImport(true);
      setTreeFile(undefined);
    },
    onDragEnter: () => {
      setValidImport(true);
      setTreeFile(undefined);
    },
    onDropAccepted: (files) => {
      setValidImport(true);
      setTreeFile(files[0]);
    },
    onDropRejected: () => {
      setValidImport(false);
    },
    validator: (file) => validateTreeImport({ file, treeId, chainId }),
  });

  const handleImport = () => {
    if (!treeFile || !fileReader) return;
    fileReader.onload = function readFile(e: ProgressEvent<FileReader>) {
      const fileContents = e.target?.result;
      const treeFromJson = JSON.parse(fileContents as string);
      const importedTree = flattenHatData(treeFromJson);
      if (!onchainTree) return;
      const onchainTreeData = flattenHatData(onchainTree);
      const draftHats = prepareDraftHats(
        // TODO prepareDraftHats is expecting HatExport[], flattenHatData returns FormData[]
        importedTree as unknown as HatExport[],
        onchainTreeData,
        treeId,
      );

      const missingParents = checkMissingParents(draftHats, onchainHats);
      if (missingParents) {
        setValidImport(false);
        setImportErrorMessage(
          'Missing parents in the tree! Please check the file to ensure all hats have valid parents.',
        );
        return;
      }

      const missingSiblings = checkMissingSiblings(draftHats, onchainHats);
      if (missingSiblings.hasMissing) {
        setValidImport(false);
        setImportErrorMessage(
          `Missing siblings in the tree! The following siblings are missing: ${missingSiblings.missingSiblings.join(
            ', ',
          )}`,
        );
        return;
      }

      importHats?.(draftHats);
      setModals?.({});
    };
    fileReader.readAsText(treeFile);
  };

  const handleCancel = () => {
    setValidImport(true);
    setTreeFile(undefined);
    setModals?.({});
  };

  return (
    <Stack spacing={8}>
      <Text>Upload a Draft Hat Tree to continue editing or deployment</Text>
      <Text>
        Any local changes in your workspace will be overwritten and cannot be
        restored. Make sure to export these changes before importing.
      </Text>
      <Stack>
        <Heading fontSize='xs'>UPLOAD JSON FILE</Heading>
        <Text>
          Add a JSON file exported by you or someone else in your organization
        </Text>
        <Stack spacing={1}>
          <DropZone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isFullWidth
          />
          {!validImport ? (
            <Text size='sm' color='red.500' maxW='70%'>
              <b>Error:</b>{' '}
              {_.get(_.first(fileRejections), 'errors[0].message') ||
                importErrorMessage}
            </Text>
          ) : (
            treeFile && (
              <Text size='sm' variant='gray'>
                {_.get(treeFile, 'name')}
              </Text>
            )
          )}
        </Stack>
        <Flex justify='flex-end'>
          <HStack>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              onClick={handleImport}
              bgColor='blue.500'
              color='white'
              isDisabled={!treeFile || !validImport}
              leftIcon={<Icon as={BsBoxArrowInUpRight} color='white' />}
            >
              Import
            </Button>
          </HStack>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default ImportTreeForm;
