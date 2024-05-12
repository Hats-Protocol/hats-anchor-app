import useToast from './useToast';

const useWaitForSubgraph = ({
  fetchHelper,
  checkResult,
  sendToast = false,
  interval = 1000,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchHelper: () => Promise<any> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkResult: (value: any) => boolean;
  sendToast?: boolean;
  interval?: number;
}) => {
  const toast = useToast();
  const waitForResult = async () =>
    new Promise((resolve, reject) => {
      const checkResultHandler = async () => {
        try {
          const result = await fetchHelper();

          if (result && checkResult(result)) {
            clearInterval(intervalId);
            setTimeout(() => {
              toast.success({
                title: 'Subgraph updated!',
              });
              resolve(result);
            }, 5000);
          }
        } catch (e) {
          toast.error({
            title: 'Error',
            description: 'An error occurred while waiting for subgraph',
          });
          clearInterval(intervalId);
          reject(e);
        }
      };

      if (sendToast) {
        toast.info({
          title: 'Waiting for subgraph...',
        });
      }

      const intervalId = setInterval(checkResultHandler, interval);
      checkResultHandler();

      setTimeout(() => {
        clearInterval(intervalId);
        resolve(null);
      }, 20000);
    });

  return waitForResult;
};

export default useWaitForSubgraph;
