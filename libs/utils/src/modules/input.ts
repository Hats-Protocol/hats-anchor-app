import {
  ArgumentTsType,
  solidityToTypescriptType,
  verify,
} from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { isAddress } from 'viem';

const convertToBigInt = (input: unknown) => {
  // directly convert, if string (but make sure it's not a decimal or will crash)
  const localString = _.toString(input);
  if (localString && !localString?.includes('.')) {
    return BigInt(input as string);
  }
  // handle numbers
  const numberCheck = _.toNumber(input);
  if (_.isNaN(numberCheck)) {
    return 'Invalid input: Not a valid number';
  }

  if (!_.isInteger(numberCheck)) {
    return 'Invalid input: Decimal numbers are not accepted';
  }

  return BigInt(numberCheck);
};

export const transformInput = (
  input: unknown,
  solidityType: string,
): unknown => {
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

  switch (tsType) {
    case 'number':
      return Number(input);
    case 'bigint':
      if (typeof input === 'bigint') {
        return input;
      }
      if (_.isObject(input)) {
        const numberFromObject = Math.floor(_.toNumber(input) / 1000);
        return convertToBigInt(numberFromObject);
      }
      if (_.isString(input) || _.isNumber(input)) {
        return convertToBigInt(input);
      }
      return BigInt(0);

    case 'string':
      return String(input);
    case 'boolean':
      if (typeof input === 'string') {
        return input.toLowerCase() === 'yes';
      }
      return Boolean(input);
    case 'number[]':
      return String(input).split(',').map(Number);
    case 'bigint[]':
      return String(input)
        .split(',')
        .map((num) => convertToBigInt(num.trim()));
    case 'string[]':
      if (solidityType === 'address[]') {
        if (_.isObject(_.first(input as any[]))) {
          return _.compact(
            _.map(input as any[], (obj) =>
              isAddress(obj.address) ? obj.address : undefined,
            ),
          );
        }
        return Array.isArray(input) ? _.compact(input) : [];
      }
      return String(input).split(',');
    case 'boolean[]':
      return String(input)
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

export const transformAndVerify = (
  input: unknown,
  solidityType: string,
): string | boolean => {
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

export const getDefaultValue = (type: ArgumentTsType) =>
  defaultValuesMapping[type];
