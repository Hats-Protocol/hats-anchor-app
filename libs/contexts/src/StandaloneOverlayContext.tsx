import { useLocalStorage, useToast } from 'hooks';
import {
  ClaimsModals,
  HatRecord,
  StandaloneOverlayContextProps,
} from 'hats-types';
import _ from 'lodash';
import { useRouter } from 'next/router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Hex, TransactionReceipt } from 'viem';
import { waitForTransaction } from 'wagmi/actions';

const defaults: ClaimsModals = {
  newWearer: false,
  editModule: false,
  createHat: false,
  hatDetails: false,
  hatImage: false,
  hatSupply: false,
  'functionCall-module': false,
};

const MAX_TREES = 3;

export const StandaloneOverlayContext =
  createContext<StandaloneOverlayContextProps>({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setModals: undefined,
    closeModals: undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handlePendingTx: undefined,
    commandPalette: false,
    setCommandPalette: () => {},
    recentlyVisitedHats: undefined,
    updateRecentlyVisitedHats: () => {},
  });

export const StandaloneOverlayContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [modals, setModals] = useState<Partial<ClaimsModals>>(defaults);
  const [commandPalette, setCommandPalette] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const [recentlyVisitedHats, setRecentlyVisitedHats] = useLocalStorage<
    { hatId: Hex; chainId: number }[] | undefined
  >('recently-visited-hats', undefined);

  const updateRecentlyVisitedHats = useCallback(
    ({ hatId, chainId: cId }: HatRecord) => {
      if (!hatId || !cId) return;
      const hatIdDecimal = hatId;

      const localRecentHats = _.compact(
        _.concat([{ hatId: hatIdDecimal, chainId: cId }], recentlyVisitedHats),
      );

      const uniqueHats = _.uniqWith(
        localRecentHats,
        (treeA, treeB) =>
          treeA.hatId === treeB.hatId && treeA.chainId === treeB.chainId,
      );

      if (!_.isEqual(uniqueHats, recentlyVisitedHats)) {
        const updatedRecentHats = _.slice(uniqueHats, 0, MAX_TREES);
        setRecentlyVisitedHats(updatedRecentHats);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recentlyVisitedHats],
  );

  const closeModals = () => {
    setModals(defaults);
  };

  /**
   * @param {hex} hash
   * @param {object} toastData
   * @param {string} toastData.title
   * @param {string} toastData.description
   * @param {string} onSuccess
   * @param {string} redirect
   * @param {boolean} clearModals
   * @param {boolean} sendToast
   * @returns {Promise<void>}
   * @example
   * handlePendingTx({
   *  hash: '0x123',
   *  toastData: {
   *   title: 'Transaction successful',
   *   description: 'Your hat was created successfully',
   *  },
   * });
   * */
  const handlePendingTx = async ({
    hash,
    toastData,
    redirect = null,
    clearModals = true,
    sendToast = true,
    onSuccess,
  }: {
    hash: Hex;
    txChainId?: number | undefined;
    txDescription: string;
    toastData: object | undefined;
    redirect?: string | null;
    clearModals?: boolean;
    sendToast?: boolean;
    onSuccess?: (data?: TransactionReceipt) => void;
  }): Promise<TransactionReceipt | undefined> => {
    const data = await waitForTransaction({ hash });

    if (!data) {
      return Promise.resolve(undefined);
    }

    if (sendToast && toastData) {
      toast.success({
        title: _.get(toastData, 'title', 'Transaction successful'),
        description: _.get(toastData, 'description'),
      });
    }

    if (onSuccess) {
      onSuccess(data);
    }

    if (clearModals) {
      setModals(defaults);
    }

    if (redirect) {
      router.push(redirect);
    }

    return Promise.resolve(data);
  };

  const returnValue = useMemo(
    () => ({
      modals,
      closeModals,
      setModals,
      commandPalette,
      setCommandPalette,
      recentlyVisitedHats,
      updateRecentlyVisitedHats,
      handlePendingTx,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modals, commandPalette, toast],
  );

  return (
    <StandaloneOverlayContext.Provider value={returnValue}>
      {children}
    </StandaloneOverlayContext.Provider>
  );
};

export const useStandaloneOverlay = () => useContext(StandaloneOverlayContext);
