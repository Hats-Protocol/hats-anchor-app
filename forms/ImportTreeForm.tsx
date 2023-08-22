import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import React, { useState } from 'react';
import { FileError, useDropzone } from 'react-dropzone';
import { BsBoxArrowInUpRight } from 'react-icons/bs';

import DropZone from '@/components/atoms/DropZone';
import { useOverlay } from '@/contexts/OverlayContext';

const reader = new FileReader();

const validateTreeImport = (
  file: File,
  treeId: string,
  chainId: number,
): FileError | null => {
  const fileName = file.name;
  const splitFileName = _.split(fileName, '-');
  const fileChainId = _.toNumber(_.nth(splitFileName, 1));
  let fileTreeId = _.nth(splitFileName, 3);
  if (fileTreeId?.includes(' ')) {
    fileTreeId = _.first(_.split(fileTreeId, ' '));
  }
  if (fileTreeId?.includes('.')) {
    fileTreeId = _.first(_.split(fileTreeId, '.'));
  }
  const fileTreeIdNum = _.toNumber(fileTreeId);
  if (fileChainId !== chainId) {
    return {
      code: 'chain-mismatch',
      message: "File doesn't match current Tree's chain",
    };
  }
  if (fileTreeIdNum !== treeIdHexToDecimal(treeId)) {
    return {
      code: 'tree-mismatch',
      message: "File doesn't match current Tree's ID",
    };
  }
  return null;
};

const ImportTreeForm = ({
  treeId,
  chainId,
  setStoredDataString,
}: ImportTreeFormProps) => {
  const { setModals } = useOverlay();
  const [validImport, setValidImport] = useState(true);
  const [treeFile, setTreeFile] = useState<File | undefined>();

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
    validator: (file) => validateTreeImport(file, treeId, chainId),
  });

  const handleImport = () => {
    if (!treeFile) return;
    reader.onload = function readFile(e: ProgressEvent<FileReader>) {
      const contents = e.target?.result;
      setStoredDataString(contents as string);
      setModals?.({});
    };
    reader.readAsText(treeFile);
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

interface ImportTreeFormProps {
  treeId: string;
  chainId: number;
  setStoredDataString: (v: string) => void;
}
