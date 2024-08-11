'use client';

import _ from 'lodash';
import { EffectCallback, useEffect, useRef } from 'react';

function deepCompareEquals(a: unknown, b: unknown) {
  return _.isEqual(a, b);
}

// hooks
function useDeepCompareMemoize(value: unknown) {
  const ref = useRef<unknown>();
  // it can be done by using useMemo as well
  // but useRef is rather cleaner and easier

  if (!deepCompareEquals(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

function useDeepCompareEffect(
  callback: EffectCallback,
  dependencies: unknown[],
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

export default useDeepCompareEffect;
