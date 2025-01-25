'use client';

import { chainsList } from '@hatsprotocol/config';
import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useTreeDetails } from 'hats-hooks';
import { concat, filter, get, isEmpty, map, range, toNumber, values } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { AppHat } from 'types';
import { BaseCheckbox, BaseInput, Button } from 'ui';
import { createHatsClient, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { Form, FormControl, FormLabel, Input, NumberInput, Select } from './components';

export const DeactivationForm = () => {
  const localForm = useForm();
  const { handleSubmit, watch, setValue } = localForm;
  const { address } = useAccount();
  const [multicallCallData, setMulticallCallData] = useState<Hex | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allCalls, setAllCalls] = useState<any[]>([]);

  const hasSelectedHats = !isEmpty(filter(Object.keys(watch()), (key) => key.startsWith('hat-')));
  const { data: treeDetails } = useTreeDetails({
    chainId: watch('chainId'),
    treeId: watch('treeId'),
  });

  const topHatWearer = get(treeDetails, 'hats[0].wearers[0].id');

  const onSubmit = async (data: any) => {
    const hatsClient = await createHatsClient(toNumber(watch('chainId')));

    // get the hat ids
    const hats = Object.keys(data).filter((key) => key.startsWith('hat-'));
    const rawHatIds = hats.map((hat) => hat.replace('hat-', ''));
    const hatIds = filter(rawHatIds, (id: Hex) => get(data, `hat-${id}`));

    if (!hatsClient || !(topHatWearer && !watch('wearer'))) return;

    const setToggleCalls = map(hatIds, (hatId: Hex) => {
      return hatsClient?.changeHatToggleCallData({
        hatId: BigInt(hatId),
        newToggle: topHatWearer,
      });
    });
    const deactivateCalls = map(hatIds, (hatId: Hex) => {
      return hatsClient?.setHatStatusCallData({
        hatId: BigInt(hatId),
        newStatus: false,
      });
    });
    const resetToggleCalls = map(hatIds, (hatId: Hex) => {
      return hatsClient?.changeHatToggleCallData({
        hatId: BigInt(hatId),
        newToggle: FALLBACK_ADDRESS,
      });
    });

    const allCalls: Hex[] = concat(
      map(setToggleCalls, (call: { callData: Hex }) => call.callData),
      map(deactivateCalls, (call: { callData: Hex }) => call.callData),
      map(resetToggleCalls, (call: { callData: Hex }) => call.callData),
    ) as unknown as Hex[];

    setMulticallCallData(get(hatsClient.multicallCallData(allCalls), 'callData'));
    setAllCalls(concat(setToggleCalls, deactivateCalls, resetToggleCalls));
  };

  const onSendTx = async () => {
    const hatsClient = await createHatsClient(toNumber(watch('chainId')));

    if (!hatsClient || isEmpty(allCalls)) return;

    const result = await hatsClient
      .multicall({
        account: address as Hex,
        calls: allCalls,
      })
      .catch((e) => {
        console.log('error', e);
      });
    console.log('result', result);
  };

  useEffect(() => {
    setValue('useTopHatWearer', true);
  }, []);

  const notTopHatWearerOrWearer = watch('wearer') !== address && topHatWearer !== address;

  return (
    <div>
      <Form {...localForm}>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='flex items-center gap-2'>
            <Select localForm={localForm} name='chainId' label='Network'>
              {map(values(chainsList), (chain) => (
                <option value={chain.id} key={chain.id}>
                  {chain.name}
                </option>
              ))}
            </Select>

            <NumberInput localForm={localForm} name='treeId' label='Tree' />
          </div>

          <div className='flex flex-col gap-2'>
            <div>
              <FormControl className='flex items-center gap-2'>
                <BaseCheckbox
                  name='useTopHatWearer'
                  checked={watch('useTopHatWearer')}
                  onChange={() => setValue('useTopHatWearer', !watch('useTopHatWearer'))}
                />
                <FormLabel className='mb-0'>
                  Use Top Hat Wearer {topHatWearer && `(${formatAddress(topHatWearer)})`}
                </FormLabel>
              </FormControl>
            </div>

            {!watch('useTopHatWearer') && (
              <Input
                name='wearer'
                label='Admin Wearer'
                placeholder='0x...'
                tooltip='Can be any address technically, ideally the address that will execute this transaction'
                localForm={localForm}
              />
            )}
          </div>

          <p className='text-sm text-gray-500'>Hats below inactive Hats are generally hidden</p>

          {treeDetails ? (
            <div className='flex flex-col justify-center gap-2'>
              {map(get(treeDetails, 'hats', []), (hat: AppHat) => {
                let hatName = get(hat, 'details');
                if (get(hat, 'detailsMetadata') !== '') {
                  hatName = get(JSON.parse(get(hat, 'detailsMetadata') as string), 'data.name');
                }

                return (
                  <div className='flex items-center gap-2 px-2' key={hat.id}>
                    {map(range(0, get(hat, 'levelAtLocalTree')), () => '-')}
                    <BaseCheckbox
                      value={hat.id}
                      name={`hat-${hat.id}`}
                      onChange={() => {
                        setValue(`hat-${hat.id}`, !watch(`hat-${hat.id}`));
                      }}
                    />
                    <div>
                      {get(hat, 'status') === true ? (
                        <FiCheckCircle className='text-green-500' />
                      ) : (
                        <FiXCircle className='text-red-500' />
                      )}
                    </div>
                    <p>{hatName}</p>
                    <p>({hatIdDecimalToIp(hatIdHexToDecimal(get(hat, 'id')))})</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className='text-blue-500'>Input tree details above to continue</p>
          )}

          <div className='flex justify-end'>
            <Button type='submit' disabled={!hasSelectedHats}>
              Submit
            </Button>
          </div>

          {multicallCallData && (
            <div className='flex flex-col gap-2'>
              <p>Hats Contract</p>
              <BaseInput value={HATS_V1} readOnly />
              <p>Contract Function</p>
              <BaseInput value={'multicall'} readOnly />
              <p>Multicall Call Data</p>
              <BaseInput value={multicallCallData} readOnly />

              <div className='flex justify-end'>
                <Button onClick={onSendTx} disabled={notTopHatWearerOrWearer}>
                  Send Transaction
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};
