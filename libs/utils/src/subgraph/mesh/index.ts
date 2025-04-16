import { first, keys, map } from 'lodash';

export * from './fetch';
export * from './invalidation';
export * from './queries';

export const stripSuffix = ({
  object,
  keyFn,
  mapFn,
}: {
  object: Record<string, unknown[]>;
  keyFn?: (key: string) => string;
  mapFn?: (unknown: unknown) => unknown;
}) => {
  const returnObj: Record<string, unknown[]> = {};
  for (const key of keys(object)) {
    const newKey = keyFn ? keyFn(key) : first(key.split('_'));
    const newValue = mapFn ? map(object[key], mapFn) : object[key];
    if (!newKey) continue;
    returnObj[newKey] = newValue as unknown[];
  }
  return returnObj;
};
