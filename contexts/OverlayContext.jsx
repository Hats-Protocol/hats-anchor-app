import _ from 'lodash';
import React, { createContext, useState, useContext, useMemo } from 'react';
import { waitForTransaction } from '@wagmi/core';
import useToast from '../hooks/useToast';

const defaults = {
  createTree: false,
  newWearer: false,
  editModule: false,
  createHat: false,
  hatDetails: false,
  hatImage: false,
  hatSupply: false,
};

export const OverlayContext = createContext({});

export const OverlayContextProvider = ({ children }) => {
  const [modals, setModals] = useState(defaults);
  const [commandPallet, setCommandPallet] = useState(false);
  const toast = useToast();

  const showModal = (m) => {
    // This allows to show only one modal at a time.
    // In addition, this reset any true value for other modals.
    setModals({ ...defaults, ...m });
  };

  const closeModals = () => {
    setModals(defaults);
  };

  const returnValue = useMemo(() => {
    /**
     * @param {string} hash
     * @param {object} toastData
     * @param {string} toastData.title
     * @param {string} toastData.description
     * @returns {Promise<void>}
     * @example
     * handlePendingTx({
     *  hash: '0x123',
     *  toastData: {
     *    title: 'Transaction successful',
     *    description: 'Your hat was created successfully',
     *  },
     * });
     * */
    const handlePendingTx = async ({ hash, toastData }) => {
      console.log('hash', hash);
      console.log('toastData', toastData);
      const data = await waitForTransaction({ hash });

      console.log('data', data);
      if (data) {
        // toast
        toast.success({
          title: _.get(toastData, 'title', 'Transaction successful'),
          description: _.get(toastData, 'description'),
        });
      } else {
        /// error
      }
    };

    return {
      modals,
      setModals: showModal,
      closeModals,
      commandPallet,
      setCommandPallet,
      handlePendingTx,
    };
  }, [modals, commandPallet, toast]);

  return (
    <OverlayContext.Provider value={returnValue}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
