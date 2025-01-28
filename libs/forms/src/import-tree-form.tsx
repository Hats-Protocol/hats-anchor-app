'use client';

import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useTreeForm } from 'contexts';
import { checkMissingParents, checkMissingSiblings, flattenHatData, prepareDraftHats } from 'hats-utils';
import { first, get, nth, split } from 'lodash';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileError, useDropzone } from 'react-dropzone';
import { AiOutlineUpload } from 'react-icons/ai';
import { HatExport } from 'types';
import { Alert, Button, DropZone } from 'ui';

interface validateTreeImportProps {
  file: File;
  treeId?: number;
  chainId?: number;
}

// we might need it at some point
const validateTreeImport = ({ file, treeId, chainId }: validateTreeImportProps): FileError | null => {
  const localTreeId = treeId && treeIdDecimalToHex(treeId);
  if (!localTreeId || !chainId) return null;
  const fileName = file.name;
  const splitFileName = split(fileName, '-');
  let fileTreeId = nth(splitFileName, 3);
  if (fileTreeId?.includes(' ')) {
    fileTreeId = first(split(fileTreeId, ' '));
  }
  if (fileTreeId?.includes('.')) {
    fileTreeId = first(split(fileTreeId, '.'));
  }
  return null;
};

const ImportTreeForm = () => {
  const { setModals } = useOverlay();
  const { treeId, chainId, importHats, onchainHats, onchainTree } = useTreeForm();

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
      if (!onchainTree) return;

      const fileContents = e.target?.result;
      const treeFromJson = JSON.parse(fileContents as string);
      const importedTree = flattenHatData(treeFromJson);
      const onchainTreeData = flattenHatData(onchainTree);
      const draftHats = prepareDraftHats(
        // prepareDraftHats is expecting HatExport[], flattenHatData returns FormData[]
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
    <div className='space-y-8'>
      <p>Upload a Draft Hat Tree to continue editing or deployment</p>
      <p>
        Any local changes in your workspace will be overwritten and cannot be restored. Make sure to export these
        changes before importing.
      </p>

      <Alert className='bg-functional-link-primary text-white'>
        <AlertCircle />
        Wearers are not considered on import due to mechanistic eligibility. Upload new wearers separately.
      </Alert>

      <div className='space-y-2'>
        <p className='text-xs uppercase'>Upload JSON File</p>
        <p>Add a JSON file exported by you or someone else in your organization</p>
        <div className='space-y-1'>
          <DropZone getRootProps={getRootProps} getInputProps={getInputProps} isFullWidth />
          {!validImport ? (
            <p className='max-w-70% text-sm text-red-500'>
              <b>Error:</b> {get(first(fileRejections), 'errors[0].message') || importErrorMessage}
            </p>
          ) : (
            treeFile && <p className='text-sm text-gray-500'>{get(treeFile, 'name')}</p>
          )}
        </div>
        <div className='flex justify-end'>
          <div className='flex gap-2'>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              onClick={handleImport}
              className='bg-functional-link-primary text-white'
              disabled={!treeFile || !validImport}
            >
              <AiOutlineUpload className='text-white' />
              Import
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ImportTreeForm };
