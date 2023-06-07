import { useCallback, useState, LegacyRef } from 'react';

const useContainerDimensions = (): [
  { width: any; height: any } | undefined,
  LegacyRef<HTMLDivElement>,
] => {
  const [dimensions, setDimensions] = useState<{ width: any; height: any }>();
  const containerRef: LegacyRef<HTMLDivElement> = useCallback(
    (containerElem: any) => {
      if (containerElem !== null) {
        const { width, height } = containerElem.getBoundingClientRect();
        setDimensions({ width, height });
      }
    },
    [],
  );

  return [dimensions, containerRef];
};

export default useContainerDimensions;
