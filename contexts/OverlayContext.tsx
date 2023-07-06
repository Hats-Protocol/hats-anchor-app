import { waitForTransaction } from '@wagmi/core';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { TransactionReceipt } from 'viem';

import useToast from '@/hooks/useToast';

const defaults = {
  createTree: false,
  newWearer: false,
  editModule: false,
  createHat: false,
  hatDetails: false,
  hatImage: false,
  hatSupply: false,
};

export const OverlayContext = createContext<{
  modals?: object;
  setModals?: (m: any) => void;
  closeModals?: () => void;
  commandPallet?: boolean;
  setCommandPallet?: (m: boolean) => void;
  handlePendingTx: ({
    hash,
    toastData,
    redirect = null,
    clearModals = true,
    sendToast = true,
  }: {
    hash: `0x${string}`;
    toastData: object;
    redirect?: string | null;
    clearModals?: boolean;
    sendToast?: boolean;
  }) => Promise<TransactionReceipt>;
}>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setModals: (m: object) => console.log('setModals() not implemented'),
  closeModals: () => console.log('clearModals() not implemented'),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handlePendingTx({ hash, toastData, redirect, clearModals, sendToast }) {
    throw new Error('handlePendingTx() not implemented');
  },
});

export const OverlayContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [modals, setModals] = useState(defaults);
  const [commandPallet, setCommandPallet] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const showModal = (m: any) => {
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
     * @param {string} redirect
     * @param {boolean} clearModals
     * @param {boolean} sendToast
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
    const handlePendingTx = async ({
      hash,
      toastData,
      redirect = null,
      clearModals = true,
      sendToast = true,
    }: {
      hash: `0x${string}`;
      toastData: object;
      redirect?: string | null;
      clearModals?: boolean;
      sendToast?: boolean;
    }): Promise<TransactionReceipt> => {
      const data = await waitForTransaction({ hash });

      if (data) {
        if (sendToast) {
          toast.success({
            title: _.get(toastData, 'title', 'Transaction successful'),
            description: _.get(toastData, 'description'),
          });
        }

        if (clearModals) {
          setModals(defaults);
        }

        if (redirect) {
          router.push(redirect);
        }
      } else {
        // TODO handle error
      }

      return Promise.resolve(data);
    };

    return {
      modals,
      setModals: showModal,
      closeModals,
      commandPallet,
      setCommandPallet,
      handlePendingTx,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modals, commandPallet, toast]);

  return (
    <OverlayContext.Provider value={returnValue}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
