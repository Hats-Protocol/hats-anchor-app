import { ArgumentTsType, solidityToTypescriptType, verify } from '@hatsprotocol/modules-sdk';
import {
  compact,
  first,
  get,
  includes,
  isInteger,
  isNaN,
  isNumber,
  isObject,
  isString,
  keys,
  map,
  toNumber,
  toString,
} from 'lodash';
import { isAddress } from 'viem';

const convertToBigInt = (input: unknown) => {
  // directly convert, if string (but make sure it's not a decimal or will crash)
  const localString = toString(input);
  if (localString && !localString?.includes('.')) {
    return BigInt(input as string);
  }
  // handle numbers
  const numberCheck = toNumber(input);
  if (isNaN(numberCheck)) {
    return 'Invalid input: Not a valid number';
  }

  if (!isInteger(numberCheck)) {
    return 'Invalid input: Decimal numbers are not accepted';
  }

  return BigInt(numberCheck);
};

export const transformInput = (input: unknown, solidityType: string): unknown => {
  if (input === undefined || input === null) {
    if (solidityType.includes('[]')) {
      return [];
    }

    return undefined;
  }
  if (solidityType === 'address') {
    return isAddress(String(input)) ? String(input) : '';
  }
  const tsType = solidityToTypescriptType(solidityType);
  // handles react-select objects
  const inputIsSelectObject = includes(keys(input), 'label') && includes(keys(input), 'value');
  const localInput = inputIsSelectObject ? get(input, 'value') : input;

  switch (tsType) {
    case 'number':
      return Number(localInput);
    case 'bigint':
      if (typeof localInput === 'bigint') {
        return localInput;
      }
      if (isObject(localInput)) {
        const numberFromObject = Math.floor(toNumber(localInput) / 1000);
        return convertToBigInt(numberFromObject);
      }
      if (isString(localInput) || isNumber(localInput)) {
        return convertToBigInt(localInput);
      }
      return BigInt(0);

    case 'string':
      return String(localInput);
    case 'boolean':
      if (typeof localInput === 'string') {
        return localInput.toLowerCase() === 'yes';
      }
      return Boolean(localInput);
    case 'number[]':
      return String(localInput).split(',').map(Number);
    case 'bigint[]':
      return String(localInput)
        .split(',')
        .map((num) => convertToBigInt(num.trim()));
    case 'string[]':
      if (solidityType === 'address[]') {
        if (isObject(first(localInput as any[]))) {
          return compact(map(localInput as any[], (obj) => (isAddress(obj.address) ? obj.address : undefined)));
        }
        return Array.isArray(localInput) ? compact(localInput) : [];
      }
      return String(localInput).split(',');
    case 'boolean[]':
      return String(localInput)
        .split(',')
        .map((str) => str.toLowerCase() === 'yes');
    default:
      throw new Error(`Invalid Solidity type: ${solidityType}`);
  }
};

export const parsedSeconds = (value: bigint | undefined) => {
  if (!value) return undefined;
  if (typeof value === 'bigint') return new Date(Number(value) * 1000);

  return new Date();
};

export const transformAndVerify = (input: unknown, solidityType: string): string | boolean => {
  const transformedInput = transformInput(input, solidityType);

  if (verify(transformedInput, solidityType)) {
    return true;
  }

  // TODO [low] pass a more specific error message for types
  return typeof transformedInput === 'string' && transformedInput !== ''
    ? transformedInput
    : 'This is not a valid input!';
};

const defaultValuesMapping = {
  number: 0,
  bigint: BigInt(0),
  string: '',
  boolean: false,
  'number[]': [],
  'bigint[]': [],
  'string[]': [],
  'boolean[]': [],
  unknown: null,
};

export const getDefaultValue = (type: ArgumentTsType) => defaultValuesMapping[type];
