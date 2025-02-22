import { isEmpty } from 'lodash';
import { reject } from 'lodash';
import { NextRequest } from 'next/server';
import { fetchSafesInfo } from 'utils';
import { Hex, isAddress } from 'viem';

export const GET = async (request: NextRequest, { params }: { params: Promise<{ chainId: string }> }) => {
  const { chainId } = await params;
  const safes = request.nextUrl.searchParams.get('safes');
  console.log('safes', safes);

  if (!safes || !chainId) {
    return new Response('Invalid address or chainId', { status: 400 });
  }

  const safesList = reject(safes.split(',') as Hex[], (safe) => isEmpty(safe) || !isAddress(safe));
  console.log('safesList', safesList);

  const safe = await fetchSafesInfo({ safes: safesList, chainId: Number(chainId) });
  return new Response(JSON.stringify(safe));
};
