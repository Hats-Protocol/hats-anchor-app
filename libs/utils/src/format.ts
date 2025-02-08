import { CONFIG } from '@hatsprotocol/config';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { format } from 'date-fns';
import { eq, find, findIndex, get, map, round, size, toLower, toNumber, toString } from 'lodash';
import { formatUnits, Hex } from 'viem';

export const formatAddress = (address: string | null | undefined) =>
  address && typeof address === 'string' ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';

export const isSameAddress = (a?: string, b?: string) => {
  if (!a || !b) return false;
  return eq(toLower(a), toLower(b));
};

const dateFormatter = (date: Date | number) => format(date, 'yyyy-MM-dd HH:mm:ss');

export const shortDateFormatter = (date: Date | number) => format(date, 'yyyy-MM-dd');

const offsetString = (date: Date) => {
  const utcOffset = -date.getTimezoneOffset() / 60;
  return `UTC${utcOffset > 0 ? '+' : ''}${utcOffset}`;
};

export const formatDate = (date: Date | string | number | undefined, toUtc = false) => {
  if (!date) return '';
  if (toUtc)
    return `${dateFormatter(
      // calculate UTC time based on user's local timezone offset
      new Date(date).getTime() + new Date().getTimezoneOffset() * 60 * 1000,
    )} UTC`;
  if (typeof date === 'string' || typeof date === 'number')
    return `${dateFormatter(new Date(date))} ${offsetString(new Date(date))}`;
  return `${dateFormatter(date)} ${offsetString(date)}`;
};

export const containsUpperCase = (string: string) => /\p{Lu}/u.test(string);

export const validateURL = (textVal: string) => {
  const urlRegex =
    /^((http|https):\/\/)(www\.)?[a-zA-Z0-9\-.]+(\.[a-zA-Z]{2,})+(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;%=]*)?$/;
  return urlRegex.test(textVal);
};

export const hatLink = ({
  chainId,
  hatId,
  isMobile = false,
}: {
  chainId: number | undefined;
  hatId: Hex | undefined;
  isMobile?: boolean;
}) => {
  if (!chainId || !hatId) return '#';
  const treeId = hatIdToTreeId(BigInt(hatId));
  return `${CONFIG.APP_URL}/trees/${chainId}/${treeId}${isMobile ? '/' : '?hatId='}${hatIdDecimalToIp(BigInt(hatId))}`;
};

export const claimsLink = ({ chainId, hatId }: { chainId: number | undefined; hatId: Hex | undefined }) => {
  if (!chainId || !hatId) return '#';
  return `${CONFIG.CLAIMS_URL}/${chainId}/${hatIdDecimalToIp(BigInt(hatId))}`;
};

export const generateLocalStorageKey = (chainId: number | undefined, treeId: string | undefined) => {
  if (!chainId || !treeId) return 'not found';
  // const decimalTreeId = treeIdHexToDecimal(treeId);
  return `treeData-${chainId}-${treeId}`;
};

export async function hash(string: string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// turn e.g. checkHatWearerStatus -> Check Hat Wearer Status
export function formatFunctionName(functionName: string): string {
  return functionName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}

export function commify(value: number | string) {
  const match = toString(value).match(/^(-?)([0-9]*)(\.?)([0-9]*)$/);
  if (!match || (!match[2] && !match[4])) {
    throw new Error(`bad formatted number: ${JSON.stringify(value)}`);
  }

  const neg = match[1];
  const whole = BigInt(match[2] || 0).toLocaleString('en-us');
  // const frac = match[4] ? match[4].match(/^(.*?)0*$/)[1] : '0';

  return `${neg}${whole}`;
  // return `${neg}${whole}.${frac}`;
}

export function getHostnameFromURL(urlString?: string) {
  if (!urlString) return '';
  try {
    return new URL(urlString).hostname;
  } catch (error) {
    return '';
  }
}

export const formatScientificWhole = (amount: number): string => {
  if (toNumber(amount) > 999) {
    const rounds = [1_000_000_000, 1_000_000, 1_000];
    const formatString = [`bn`, `mm`, `k`];
    const amountRounded = map(rounds, (r: number) => round(toNumber(amount) / r, 0));
    const index = findIndex(amountRounded, (v: number) => v > 0);

    return `${amountRounded[index]}${formatString[index]}`;
  }
  return toString(amount);
};

const shortHandAbbreviations = [
  {
    value: 1_000_000_000,
    abbrev: 'b',
  },
  {
    value: 1_000_000,
    abbrev: 'm',
  },
  {
    value: 1_000,
    abbrev: 'k',
  },
];

export const formatRound = ({
  value,
  rounded = 2,
  shortHand = 5,
  startScientific = 9,
  dropDecimals = false,
}: {
  value: string | undefined;
  rounded?: number;
  shortHand?: number;
  startScientific?: number;
  dropDecimals?: boolean;
}) => {
  if (!value) return '-';
  const [whole, fraction] = value.split('.');
  const roundedFraction = fraction ? fraction.slice(0, rounded) : undefined;

  const scientificWhole = formatScientificWhole(toNumber(whole));
  const formattedWhole = commify(whole);

  if (!roundedFraction || roundedFraction === '00' || dropDecimals) {
    if (whole.length > startScientific) return scientificWhole;
    return formattedWhole;
  }

  if (whole.length > shortHand) {
    const shortHandAbbrev = find(shortHandAbbreviations, (s) => toNumber(whole) > s.value);
    const shortAbbrevLength = size(toString(get(shortHandAbbrev, 'value'))) - 1;
    return `${whole.slice(0, shortAbbrevLength)}${shortHandAbbrev?.abbrev}`;
  }

  if (whole.length > startScientific) {
    return `${scientificWhole}.${roundedFraction}`;
  }

  return `${formattedWhole}.${roundedFraction}`;
};

export const formatRoundedDecimals = ({
  value,
  decimals = 18,
  rounded = 2,
}: {
  value: bigint | undefined;
  decimals?: number;
  rounded?: number;
}): string => {
  if (value === BigInt(0)) return '0';
  if (!value || !decimals) return '-';
  const formattedValue = formatUnits(value, decimals);
  return formatRound({ value: formattedValue, rounded });
};

export const formatBalanceValue = ({
  price,
  balance,
  decimals,
  rounded,
  startScientific,
  dropDecimals,
}: {
  price: number;
  balance: bigint;
  decimals: number;
  rounded?: number;
  startScientific?: number;
  dropDecimals?: boolean;
}): string | null => {
  if (isNaN(toNumber(price)) || !balance || !decimals) return null;
  const balanceInUsd = toNumber(formatUnits(balance, decimals)) * toNumber(price);
  if (!balanceInUsd) return null;

  return formatRound({
    value: toString(balanceInUsd),
    rounded,
    startScientific,
    dropDecimals,
  });
};
