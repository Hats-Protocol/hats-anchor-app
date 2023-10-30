import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { FileError, useDropzone } from 'react-dropzone';
import { BsBoxArrowInUpRight } from 'react-icons/bs';

import DropZone from '@/components/atoms/DropZone';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { flattenHatData, prepareDraftHats } from '@/lib/hats';

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
  const { treeId, chainId, importHats, treeToDisplay } = useTreeForm();

  const [validImport, setValidImport] = useState(true);
  const [treeFile, setTreeFile] = useState<File | undefined>();
  const [fileReader, setFileReader] = useState<FileReader | undefined>();

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
      const onchainTree = flattenHatData(treeToDisplay as any[]);
      const draftHats = prepareDraftHats(importedTree, onchainTree, treeId);
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
            <Text fontSize='sm' color='red'>
              Error: {_.get(_.first(fileRejections), 'errors[0].message')}
            </Text>
          ) : (
            treeFile && (
              <Text fontSize='sm' color='gray.700'>
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
