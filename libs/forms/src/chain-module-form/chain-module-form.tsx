'use client';

import { compact, get, map, size } from 'lodash';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { FiExternalLink } from 'react-icons/fi';
import { Button } from 'ui';
import { chainsMap, createHatsModulesClient, explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId, useWalletClient } from 'wagmi';

import { Input, RadioBox } from '../components';
import { ModuleDetailsForm } from './module-details-form';

const DEFAULT_VALUES = {
  modules: [{ address: '' }],
  chainType: 'and',
  hatId: '',
};

export const ChainModuleForm = () => {
  const localForm = useForm();
  const [newInstance, setNewInstance] = useState<Hex | undefined>();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { handleSubmit, control, reset } = localForm;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'modules',
  });

  const onSubmit = async (values: any) => {
    console.log(values);
    const isAnd = values.chainType === 'and';
    const numClauses = isAnd ? 1 : size(values.modules);
    const clausesLengths = isAnd ? [size(values.modules)] : Array.from({ length: numClauses }, () => 1);

    const hatsModulesClient = await createHatsModulesClient(chainId, walletClient);
    if (!hatsModulesClient) {
      throw new Error('Failed to create Hats Modules client');
    }

    const modules = compact(map(get(values, 'modules'), 'address'));

    const createInstanceResult = await hatsModulesClient.createEligibilitiesChain({
      account: address as string,
      hatId: BigInt(values.hatId),
      numClauses,
      clausesLengths,
      modules,
      saltNonce: 0n,
    });

    setNewInstance(get(createInstanceResult, 'newInstance'));
  };

  const appendModule = () => {
    append({ address: undefined });
  };

  const removeModule = (index: number) => {
    remove(index);
  };

  useEffect(() => {
    reset(DEFAULT_VALUES, { keepDefaultValues: false });
    setNewInstance(undefined);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <div className='flex flex-col gap-4'>
        <h2 className='text-2xl font-bold'>Deploy Module Chain</h2>
      </div>

      <Input name='hatId' placeholder='0x...' label='Hat ID' options={{ required: true }} localForm={localForm} />

      <RadioBox
        name='chainType'
        localForm={localForm}
        options={[
          { label: 'OR', value: 'or' },
          { label: 'AND', value: 'and' },
        ]}
      />

      <div className='flex flex-col gap-6'>
        {map(fields, (field, index) => {
          return (
            <ModuleDetailsForm
              localForm={localForm}
              removeModule={removeModule}
              field={field}
              index={index}
              key={field.id}
            />
          );
        })}
      </div>

      <div className='flex justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Button
            onClick={() => {
              reset(DEFAULT_VALUES, { keepDefaultValues: false });
              setNewInstance(undefined);
            }}
            variant='outline'
          >
            Clear
          </Button>

          {newInstance && (
            <div>
              <Link
                href={`${explorerUrl(chainId)}/address/${newInstance}`}
                target='_blank'
                className='flex items-center gap-1 text-blue-400'
              >
                <span>{formatAddress(newInstance)}</span>

                <FiExternalLink className='h-4 w-4' />
              </Link>
            </div>
          )}
        </div>

        <div className='flex gap-4'>
          <Button onClick={() => appendModule()} variant='outline'>
            Add Module
          </Button>

          <Button type='submit'>Deploy on {chainsMap(chainId)?.name}</Button>
        </div>
      </div>
    </form>
  );
};
