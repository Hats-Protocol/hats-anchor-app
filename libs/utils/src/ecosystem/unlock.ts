import { has } from 'lodash';

export interface Duration {
  noun: string;
  adjective: string;
}

export const REFERRAL_ADDRESS = '0x58c8854a8e51bdce9f00726b966905fe2719b4d9';

export const DURATIONS: Record<number, Duration> = {
  7: {
    noun: 'week',
    adjective: 'weekly',
  },
  14: {
    noun: 'every other week',
    adjective: 'twice monthly',
  },
  30: {
    noun: 'month',
    adjective: 'monthly',
  },
  31: {
    noun: 'month',
    adjective: 'monthly',
  },
  90: {
    noun: 'quarter',
    adjective: 'quarterly',
  },
  365: {
    noun: 'year',
    adjective: 'yearly',
  },
};

export const getDuration = (duration: number | undefined): Duration => {
  if (duration && has(DURATIONS, duration)) {
    return DURATIONS[duration];
  }

  return {
    noun: `${duration} days`,
    adjective: `${duration} days`,
  };
};
