'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLayoutEffect, useRef } from 'react';

const isBrowser = typeof window !== `undefined`;

function getScrollPosition({
  element,
  useWindow,
}: {
  element?: any;
  useWindow?: any;
}) {
  if (!isBrowser) return { x: 0, y: 0 };

  const target = element ? element.current : document.body;
  const position = target.getBoundingClientRect();

  return useWindow
    ? { x: window.scrollX, y: window.scrollY }
    : { x: position.left, y: position.top };
}

type Position = { x: number; y: number };

const useScrollPosition = (
  effect: ({
    prevPos,
    currPos,
  }: {
    prevPos: Position;
    currPos: Position;
  }) => void,
  deps: unknown[],
  element?: any,
  useWindow?: any,
  wait?: number,
) => {
  const position = useRef(getScrollPosition({ element, useWindow }));

  let throttleTimeout: NodeJS.Timeout | null = null;

  const callBack = () => {
    const currPos = getScrollPosition({ element, useWindow });
    effect({ prevPos: position.current, currPos });
    position.current = currPos;
    throttleTimeout = null;
  };

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (wait) {
        if (throttleTimeout === null) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          throttleTimeout = setTimeout(callBack, wait);
        }
      } else {
        callBack();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, deps);
};

export default useScrollPosition;
