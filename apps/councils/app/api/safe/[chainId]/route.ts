import { isEmpty } from 'lodash';
import { reject } from 'lodash';
import { NextRequest } from 'next/server';
import { fetchSafesInfo } from 'utils';
import { Hex, isAddress } from 'viem';

export const GET = async (request: NextRequest, { params }: { params: Promise<{ chainId: string }> }) => {
  const { chainId } = await params;
  const safes = request.nextUrl.searchParams.get('safes');

  if (!safes || !chainId) {
    return new Response('Invalid address or chainId', { status: 400 });
  }

  const safesList = reject(safes.split(',') as Hex[], (safe) => isEmpty(safe) || !isAddress(safe));

  return fetchSafesInfo({ safes: safesList, chainId: Number(chainId) })
    .then((safe) => {
      return new Response(JSON.stringify(safe));
    })
    .catch((error: Error) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching safes info', error);
      return new Response('Error fetching safes info', { status: 500 });
    });
};
